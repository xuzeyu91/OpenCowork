import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Cpu,
  HardDrive,
  Loader2,
  Maximize2,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { ipcClient } from '@renderer/lib/ipc/ipc-client'
import { IPC } from '@renderer/lib/ipc/channels'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'

type StatusProcess = {
  memoryKb: number
  cpu: number
  command: string
}

type StatusDisk = {
  path: string
  usage: string
}

type StatusSnapshot = {
  ip: string
  uptime: string
  load: string
  cpuPercent: number
  memTotalKb: number
  memUsedKb: number
  swapTotalKb: number
  swapUsedKb: number
  rxTotal: number
  txTotal: number
  processes: StatusProcess[]
  disks: StatusDisk[]
}

type RatePoint = {
  rx: number
  tx: number
}

const ACTIVE_REFRESH_INTERVAL_MS = 4000

const STATUS_COMMAND = `bash -lc '
IP=$(hostname -I 2>/dev/null | awk '"'"'{print $1}'"'"')
[ -z "$IP" ] && IP=$(hostname 2>/dev/null)
UPTIME=$(uptime -p 2>/dev/null | sed '"'"'s/^up //'"'"')
LOAD=$(cat /proc/loadavg 2>/dev/null | awk '"'"'{print $1" "$2" "$3}'"'"')
if [ -z "$LOAD" ]; then
  LOAD=$(uptime 2>/dev/null | awk -F "load average: " '"'"'{print $2}'"'"')
fi
CPU=$(LC_ALL=C top -bn1 2>/dev/null | awk -F"[, ]+" '"'"'/Cpu\\(s\\)|%Cpu/ {for (i=1; i<=NF; i++) {if ($i == "id") {printf "%.1f", 100-$(i-1); exit}}}'"'"')
MEM_TOTAL=$(awk "/MemTotal/ {print \\$2}" /proc/meminfo 2>/dev/null)
MEM_AVAIL=$(awk "/MemAvailable/ {print \\$2}" /proc/meminfo 2>/dev/null)
[ -z "$MEM_AVAIL" ] && MEM_AVAIL=$(awk "/MemFree/ {print \\$2}" /proc/meminfo 2>/dev/null)
MEM_USED=$(( \${MEM_TOTAL:-0} - \${MEM_AVAIL:-0} ))
SWAP_TOTAL=$(awk "/SwapTotal/ {print \\$2}" /proc/meminfo 2>/dev/null)
SWAP_FREE=$(awk "/SwapFree/ {print \\$2}" /proc/meminfo 2>/dev/null)
SWAP_USED=$(( \${SWAP_TOTAL:-0} - \${SWAP_FREE:-0} ))
NET=$(awk -F "[: ]+" "NR>2 && \\$1 != \\"lo\\" {rx += \\$3; tx += \\$11} END {printf \\"%s %s\\", rx, tx}" /proc/net/dev 2>/dev/null)
RX=$(printf "%s" "$NET" | awk "{print \\$1}")
TX=$(printf "%s" "$NET" | awk "{print \\$2}")
echo "__META__"
printf "ip=%s\\nuptime=%s\\nload=%s\\ncpu=%s\\nmem_total=%s\\nmem_used=%s\\nswap_total=%s\\nswap_used=%s\\nrx_total=%s\\ntx_total=%s\\n" "$IP" "$UPTIME" "$LOAD" "$CPU" "\${MEM_TOTAL:-0}" "\${MEM_USED:-0}" "\${SWAP_TOTAL:-0}" "\${SWAP_USED:-0}" "\${RX:-0}" "\${TX:-0}"
echo "__PROC__"
ps -eo rss,pcpu,comm --sort=-rss 2>/dev/null | awk "NR>1 && count<4 {printf \\"%s\\\\t%s\\\\t%s\\\\n\\", \\$1, \\$2, \\$3; count++}"
echo "__DISK__"
df -hP -x tmpfs -x devtmpfs 2>/dev/null | awk "NR>1 {printf \\"%s\\\\t%s/%s\\\\n\\", \\$6, \\$3, \\$2}"
'`

function formatGigabytes(kb: number): string {
  return `${(kb / 1024 / 1024).toFixed(1)}G`
}

function formatThroughput(bytesPerSecond: number): string {
  if (bytesPerSecond <= 0) return '0B/s'
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  let value = bytesPerSecond
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)}${units[unitIndex]}`
}

function percentOf(total: number, used: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  return Math.max(0, Math.min(100, (used / total) * 100))
}

function parseSnapshot(stdout: string): StatusSnapshot {
  const sections = stdout.split('__PROC__')
  const metaAndDisks = sections[1]?.split('__DISK__') ?? []
  const metaText = sections[0]?.replace('__META__', '').trim() ?? ''
  const processText = metaAndDisks[0]?.trim() ?? ''
  const diskText = metaAndDisks[1]?.trim() ?? ''

  const meta = metaText.split('\n').reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split('=')
    if (key) acc[key.trim()] = rest.join('=').trim()
    return acc
  }, {})

  const processes = processText
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [memoryKb, cpu, command] = line.split('\t')
      return {
        memoryKb: Number(memoryKb || 0),
        cpu: Number(cpu || 0),
        command: command || ''
      }
    })

  const disks = diskText
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [path, usage] = line.split('\t')
      return { path: path || '/', usage: usage || '0/0' }
    })

  return {
    ip: meta.ip || '',
    uptime: meta.uptime || '',
    load: meta.load || '',
    cpuPercent: Number(meta.cpu || 0),
    memTotalKb: Number(meta.mem_total || 0),
    memUsedKb: Number(meta.mem_used || 0),
    swapTotalKb: Number(meta.swap_total || 0),
    swapUsedKb: Number(meta.swap_used || 0),
    rxTotal: Number(meta.rx_total || 0),
    txTotal: Number(meta.tx_total || 0),
    processes,
    disks
  }
}

// FinalShell-inspired monitoring palette — fixed (theme-independent) so the
// sidebar keeps the dense, blue-gray FinalShell look regardless of SSH theme.
const FS = {
  bg: '#0f141b',
  panel: '#161e27',
  inner: '#1b2531',
  track: '#243140',
  border: '#27333f',
  text: '#cbd5e0',
  textStrong: '#eef4fa',
  muted: '#7a8794',
  blue: '#3d8bf0',
  cyan: '#2bb6c4',
  green: '#46c98b',
  yellow: '#e3b341',
  orange: '#e08a4b',
  red: '#e5534b',
  headerBlue: '#2b557f',
  headerText: '#dbe7f5'
} as const

function loadColor(pct: number): string {
  if (pct >= 90) return FS.red
  if (pct >= 70) return FS.yellow
  return FS.green
}

function FsBar({
  label,
  value,
  detail,
  color
}: {
  label: string
  value: number
  detail: string
  color?: string
}): React.JSX.Element {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[0.7rem]">
        <span style={{ color: FS.muted }}>{label}</span>
        <span className="font-mono tabular-nums" style={{ color: FS.text }}>
          {detail}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px]" style={{ background: FS.track }}>
        <div
          className="h-full rounded-[3px] transition-all"
          style={{ width: `${Math.max(2, pct)}%`, background: color ?? loadColor(pct) }}
        />
      </div>
    </div>
  )
}

function FsSpark({
  points,
  color,
  max
}: {
  points: number[]
  color: string
  max?: number
}): React.JSX.Element {
  const slots = 24
  const visible = points.slice(-slots)
  const padded = [
    ...Array.from<number>({ length: Math.max(0, slots - visible.length) }).fill(0),
    ...visible
  ]
  const peak = Math.max(1, max ?? Math.max(...visible, 1))
  return (
    <div className="flex h-9 items-end gap-[2px]">
      {padded.map((v, index) => (
        <div
          key={`spark-${index}`}
          className="flex-1 rounded-[1px] transition-[height] duration-300 ease-out"
          style={{
            height: `${Math.max(4, (v / peak) * 100)}%`,
            background: v > 0 ? color : FS.track,
            opacity: v > 0 ? 1 : 0.5
          }}
        />
      ))}
    </div>
  )
}

export function SshTerminalStatusPanel({
  connectionId,
  connectionName,
  host,
  onClose,
  onExpandProcesses
}: {
  connectionId: string
  connectionName: string
  host: string
  onClose: () => void
  onExpandProcesses?: () => void
}): React.JSX.Element {
  const { t } = useTranslation('ssh')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null)
  const [rates, setRates] = useState<RatePoint[]>([])
  const [latencies, setLatencies] = useState<number[]>([])
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const previousTotals = useRef<{ at: number; rxTotal: number; txTotal: number } | null>(null)
  const hasLoadedRef = useRef(false)
  const refreshInFlightRef = useRef(false)
  const queuedRefreshRef = useRef(false)

  const refresh = useCallback(
    async (force = false): Promise<void> => {
      if (refreshInFlightRef.current) {
        if (force) queuedRefreshRef.current = true
        return
      }

      refreshInFlightRef.current = true

      try {
        if (!hasLoadedRef.current) setLoading(true)
        const startedAt = performance.now()
        const result = (await ipcClient.invoke(IPC.SSH_EXEC, {
          connectionId,
          command: STATUS_COMMAND,
          timeout: 20000
        })) as { stdout?: string; stderr?: string; exitCode?: number; error?: string }
        const roundTripMs = Math.round(performance.now() - startedAt)

        if (result.error) throw new Error(result.error)
        if (result.exitCode && result.exitCode !== 0 && result.stderr) {
          throw new Error(result.stderr)
        }

        setLatencies((current) => [...current.slice(-23), roundTripMs])

        const nextSnapshot = parseSnapshot(String(result.stdout ?? ''))
        const now = Date.now()
        const previous = previousTotals.current

        if (previous) {
          const seconds = Math.max(1, (now - previous.at) / 1000)
          const rx = Math.max(0, (nextSnapshot.rxTotal - previous.rxTotal) / seconds)
          const tx = Math.max(0, (nextSnapshot.txTotal - previous.txTotal) / seconds)
          setRates((current) => [...current.slice(-11), { rx, tx }])
        }

        previousTotals.current = {
          at: now,
          rxTotal: nextSnapshot.rxTotal,
          txTotal: nextSnapshot.txTotal
        }
        hasLoadedRef.current = true

        setSnapshot(nextSnapshot)
        setLastUpdatedAt(now)
        setError(null)
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : String(reason)
        setError(message)
      } finally {
        refreshInFlightRef.current = false
        setLoading(false)

        if (queuedRefreshRef.current) {
          queuedRefreshRef.current = false
          void refresh()
        }
      }
    },
    [connectionId]
  )

  useEffect(() => {
    void refresh(true)
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }, ACTIVE_REFRESH_INTERVAL_MS)

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void refresh(true)
      }
    }

    const handleWindowFocus = (): void => {
      void refresh(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [refresh])

  const memoryPercent = snapshot ? percentOf(snapshot.memTotalKb, snapshot.memUsedKb) : 0
  const swapPercent = snapshot ? percentOf(snapshot.swapTotalKb, snapshot.swapUsedKb) : 0
  const latestRates = rates[rates.length - 1] ?? { rx: 0, tx: 0 }
  const latestLatency = latencies[latencies.length - 1] ?? 0
  const rxPoints = rates.map((point) => point.rx)
  const txPoints = rates.map((point) => point.tx)
  const netMax = Math.max(1, ...rxPoints.slice(-24), ...txPoints.slice(-24))
  const ipText = snapshot?.ip || host
  const statusDotColor = error ? FS.red : snapshot ? FS.green : FS.muted
  const statusSubtitle =
    loading && !lastUpdatedAt
      ? t('workspace.terminalStatus.refreshing', { defaultValue: 'Refreshing…' })
      : lastUpdatedAt
        ? t('workspace.terminalStatus.updatedAt', {
            defaultValue: 'Updated {{time}}',
            time: new Date(lastUpdatedAt).toLocaleTimeString()
          })
        : host

  const sectionStyle = { borderColor: FS.border, background: FS.panel }
  const sectionTitleClass =
    'flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em]'

  const copyIp = (): void => {
    void navigator.clipboard?.writeText(ipText)
    toast.success(t('workspace.terminalStatus.copied', { defaultValue: 'Copied to clipboard' }))
  }

  return (
    <aside
      className="relative flex h-full w-[268px] shrink-0 flex-col border-l"
      style={{ borderColor: FS.border, background: FS.bg, color: FS.text }}
    >
      {/* Header — connection status, IP, actions */}
      <div
        className="flex items-center justify-between border-b px-3 py-2.5"
        style={{ borderColor: FS.border }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ background: statusDotColor }} />
          <div className="min-w-0">
            <div className="truncate text-[0.82rem] font-semibold" style={{ color: FS.textStrong }}>
              {connectionName}
            </div>
            <div className="truncate text-[0.68rem] font-mono" style={{ color: FS.muted }}>
              {ipText}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 rounded-[6px] hover:opacity-80"
            style={{ color: FS.muted }}
            onClick={copyIp}
            title={t('workspace.terminalStatus.copy', { defaultValue: 'Copy IP' })}
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 rounded-[6px] hover:opacity-80"
            style={{ color: FS.muted }}
            onClick={() => void refresh(true)}
            title={t('list.refresh')}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 rounded-[6px] hover:opacity-80"
            style={{ color: FS.muted }}
            onClick={onClose}
            title={t('workspace.close', { defaultValue: 'Close' })}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {error ? (
          <div
            className="rounded-[6px] border px-2.5 py-2 text-[0.72rem]"
            style={{ borderColor: FS.red, background: '#2a1517', color: FS.red }}
          >
            {error}
          </div>
        ) : null}

        {/* System info */}
        <section className="rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className={sectionTitleClass} style={{ color: FS.muted }}>
            <Server className="size-3.5" style={{ color: FS.blue }} />
            {t('workspace.terminalStatus.systemInfo', { defaultValue: 'System' })}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-[6px] px-2 py-1.5" style={{ background: FS.inner }}>
              <div
                className="text-[0.62rem] uppercase tracking-[0.1em]"
                style={{ color: FS.muted }}
              >
                {t('workspace.terminalStatus.uptime', { defaultValue: 'Uptime' })}
              </div>
              <div
                className="mt-0.5 truncate text-[0.78rem] font-medium"
                style={{ color: FS.text }}
              >
                {snapshot?.uptime || '--'}
              </div>
            </div>
            <div className="rounded-[6px] px-2 py-1.5" style={{ background: FS.inner }}>
              <div
                className="text-[0.62rem] uppercase tracking-[0.1em]"
                style={{ color: FS.muted }}
              >
                {t('workspace.terminalStatus.load', { defaultValue: 'Load' })}
              </div>
              <div className="mt-0.5 truncate text-[0.78rem] font-mono" style={{ color: FS.text }}>
                {snapshot?.load || '--'}
              </div>
            </div>
          </div>
        </section>

        {/* CPU / Memory / Swap bars */}
        <section className="space-y-2 rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className={sectionTitleClass} style={{ color: FS.muted }}>
            <Cpu className="size-3.5" style={{ color: FS.blue }} />
            {t('workspace.terminalStatus.resources', { defaultValue: 'Resources' })}
          </div>
          <FsBar
            label="CPU"
            value={snapshot?.cpuPercent ?? 0}
            detail={snapshot ? `${snapshot.cpuPercent.toFixed(1)}%` : '--'}
          />
          <FsBar
            label={t('workspace.terminalStatus.memory', { defaultValue: 'Memory' })}
            value={memoryPercent}
            detail={
              snapshot
                ? `${memoryPercent.toFixed(0)}%  ${formatGigabytes(snapshot.memUsedKb)}/${formatGigabytes(snapshot.memTotalKb)}`
                : '--'
            }
          />
          <FsBar
            label="Swap"
            value={swapPercent}
            detail={
              snapshot
                ? `${swapPercent.toFixed(0)}%  ${formatGigabytes(snapshot.swapUsedKb)}/${formatGigabytes(snapshot.swapTotalKb)}`
                : '--'
            }
          />
        </section>

        {/* Process mini table */}
        <section className="rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <div className={sectionTitleClass} style={{ color: FS.muted }}>
              <MemoryStick className="size-3.5" style={{ color: FS.blue }} />
              {t('workspace.terminalStatus.processes', { defaultValue: 'Processes' })}
            </div>
            {onExpandProcesses ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 rounded-[6px] hover:opacity-80"
                style={{ color: FS.muted }}
                onClick={onExpandProcesses}
                title={t('workspace.terminalStatus.expand', { defaultValue: 'Expand' })}
              >
                <Maximize2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
          <div className="mt-2 overflow-hidden rounded-[6px]">
            <div
              className="grid grid-cols-[54px_50px_1fr] gap-2 px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em]"
              style={{ background: FS.headerBlue, color: FS.headerText }}
            >
              <span>{t('workspace.terminalStatus.memory', { defaultValue: 'Mem' })}</span>
              <span>CPU</span>
              <span>{t('workspace.terminalStatus.command', { defaultValue: 'Command' })}</span>
            </div>
            <div>
              {(snapshot?.processes ?? []).map((process, index) => (
                <div
                  key={`${process.command}:${index}`}
                  className="grid grid-cols-[54px_50px_1fr] gap-2 px-2 py-1 text-[0.72rem] font-mono"
                  style={{ color: FS.text, background: index % 2 ? FS.inner : 'transparent' }}
                >
                  <span style={{ color: FS.orange }}>{(process.memoryKb / 1024).toFixed(0)}M</span>
                  <span style={{ color: FS.green }}>{process.cpu.toFixed(1)}</span>
                  <span className="truncate">{process.command}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Network throughput */}
        <section className="rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <div className={sectionTitleClass} style={{ color: FS.muted }}>
              <Network className="size-3.5" style={{ color: FS.blue }} />
              {t('workspace.terminalStatus.network', { defaultValue: 'Network' })}
            </div>
            <div className="flex items-center gap-2 text-[0.7rem] font-mono">
              <span className="flex items-center gap-0.5" style={{ color: FS.green }}>
                <ArrowDownRight className="size-3" />
                {formatThroughput(latestRates.rx)}
              </span>
              <span className="flex items-center gap-0.5" style={{ color: FS.orange }}>
                <ArrowUpRight className="size-3" />
                {formatThroughput(latestRates.tx)}
              </span>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <FsSpark points={rxPoints} color={FS.green} max={netMax} />
            <FsSpark points={txPoints} color={FS.orange} max={netMax} />
          </div>
        </section>

        {/* Latency */}
        <section className="rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <div className={sectionTitleClass} style={{ color: FS.muted }}>
              <Activity className="size-3.5" style={{ color: FS.blue }} />
              {t('workspace.terminalStatus.latency', { defaultValue: 'Latency' })}
            </div>
            <span className="text-[0.74rem] font-mono" style={{ color: FS.cyan }}>
              {latestLatency}ms
            </span>
          </div>
          <div className="mt-2">
            <FsSpark points={latencies} color={FS.cyan} />
          </div>
        </section>

        {/* Disk usage */}
        <section className="rounded-[8px] border p-2.5" style={sectionStyle}>
          <div className={sectionTitleClass} style={{ color: FS.muted }}>
            <HardDrive className="size-3.5" style={{ color: FS.blue }} />
            {t('workspace.terminalStatus.disks', { defaultValue: 'Disks' })}
          </div>
          <div className="mt-2 space-y-0.5">
            {(snapshot?.disks ?? []).map((disk) => (
              <div
                key={disk.path}
                className="flex items-center justify-between gap-2 px-1 text-[0.72rem] font-mono"
                style={{ color: FS.text }}
              >
                <span className="truncate" style={{ color: FS.muted }}>
                  {disk.path}
                </span>
                <span>{disk.usage}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="px-1 pt-1 text-center text-[0.62rem]" style={{ color: FS.muted }}>
          {statusSubtitle}
        </div>
      </div>

      {loading && !lastUpdatedAt ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ background: `${FS.bg}cc` }}
        >
          <Loader2 className="size-5 animate-spin" style={{ color: FS.text }} />
        </div>
      ) : null}
    </aside>
  )
}
