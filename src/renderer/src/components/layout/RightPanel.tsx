import { ListChecks, FileOutput, Database, Sparkles, FolderTree, Users } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'

import { Separator } from '@renderer/components/ui/separator'

import { useUIStore, type RightPanelTab } from '@renderer/stores/ui-store'

import { useAgentStore } from '@renderer/stores/agent-store'

import { useTaskStore } from '@renderer/stores/task-store'

import { StepsPanel } from '@renderer/components/cowork/StepsPanel'

import { ArtifactsPanel } from '@renderer/components/cowork/ArtifactsPanel'

import { ContextPanel } from '@renderer/components/cowork/ContextPanel'

import { SkillsPanel } from '@renderer/components/cowork/SkillsPanel'

import { FileTreePanel } from '@renderer/components/cowork/FileTreePanel'

import { TeamPanel } from '@renderer/components/cowork/TeamPanel'

import { useTeamStore } from '@renderer/stores/team-store'

import { useSettingsStore } from '@renderer/stores/settings-store'

import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'



const ALL_FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'Delete'])



const tabDefs: { value: RightPanelTab; labelKey: string; icon: React.ReactNode }[] = [

  { value: 'steps', labelKey: 'steps', icon: <ListChecks className="size-4" /> },

  { value: 'team', labelKey: 'team', icon: <Users className="size-4" /> },

  { value: 'files', labelKey: 'files', icon: <FolderTree className="size-4" /> },

  { value: 'artifacts', labelKey: 'artifacts', icon: <FileOutput className="size-4" /> },

  { value: 'context', labelKey: 'context', icon: <Database className="size-4" /> },

  { value: 'skills', labelKey: 'skills', icon: <Sparkles className="size-4" /> },

]



export function RightPanel({ compact = false }: { compact?: boolean }): React.JSX.Element {

  const { t } = useTranslation('layout')
  const tab = useUIStore((s) => s.rightPanelTab)

  const setTab = useUIStore((s) => s.setRightPanelTab)

  const executedToolCalls = useAgentStore((s) => s.executedToolCalls)

  const todos = useTaskStore((s) => s.todos)

  const activeTeam = useTeamStore((s) => s.activeTeam)

  const teamToolsEnabled = useSettingsStore((s) => s.teamToolsEnabled)

  const visibleTabs = teamToolsEnabled ? tabDefs : tabDefs.filter((t) => t.value !== 'team')



  const badgeCounts: Partial<Record<RightPanelTab, number>> = {

    steps: todos.length,

    team: activeTeam ? activeTeam.members.length : 0,

    artifacts: executedToolCalls.filter((tc) => ALL_FILE_TOOLS.has(tc.name)).length,

  }



  return (

    <aside className={cn('flex shrink-0 flex-col border-l bg-background/50 backdrop-blur-sm transition-all duration-200', compact ? 'w-64' : 'w-96')}>

      {/* Tab Bar */}

      <div className="flex h-10 min-w-0 items-center gap-0.5 overflow-x-auto px-2">

        {visibleTabs.map((tDef) => {

          const count = badgeCounts[tDef.value] ?? 0

          return (

            <Button

              key={tDef.value}

              variant={tab === tDef.value ? 'secondary' : 'ghost'}

              size="sm"

              className={cn(

                'h-6 shrink-0 gap-1.5 rounded-md px-2 text-xs transition-all duration-200',

                tab === tDef.value

                  ? 'bg-muted shadow-sm ring-1 ring-border/50'

                  : 'text-muted-foreground hover:text-foreground'

              )}

              onClick={() => setTab(tDef.value)}

            >

              {tDef.icon}

              <span className="hidden lg:inline">{t(`rightPanel.${tDef.labelKey}`)}</span>

              {count > 0 && tab !== tDef.value && (

                <span className="flex size-4 items-center justify-center rounded-full bg-muted-foreground/10 text-[9px] font-medium text-muted-foreground">

                  {count}

                </span>

              )}

            </Button>

          )

        })}

      </div>

      <Separator />



      {/* Panel Content */}

      <div className="flex-1 overflow-auto p-3">

        {tab === 'steps' && <StepsPanel />}

        {tab === 'team' && <TeamPanel />}

        {tab === 'files' && <FileTreePanel />}

        {tab === 'artifacts' && <ArtifactsPanel />}

        {tab === 'context' && <ContextPanel />}

        {tab === 'skills' && <SkillsPanel />}

      </div>

    </aside>

  )

}

