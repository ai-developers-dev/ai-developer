import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/dashboard/projects')({
  component: ProjectsPage,
})

const stages = [
  { key: 'lead', label: 'Lead', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'review', label: 'Review', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { key: 'contracted', label: 'Contracted', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { key: 'completed', label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
] as const

function ProjectsPage() {
  const projects = useQuery(api.projects.list, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects Pipeline</h1>
        <p className="text-muted-foreground">Manage your projects across stages.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageProjects =
            projects?.filter((p) => p.stage === stage.key) ?? []

          return (
            <div key={stage.key} className="min-w-[220px] flex-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-medium">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stageProjects.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {stageProjects.map((project) => (
                  <Link
                    key={project._id}
                    to="/dashboard/projects/$id"
                    params={{ id: project._id }}
                    className="block rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm mb-1 line-clamp-1">
                      {project.title}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {project.client?.name || 'Unknown client'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {project.service}
                      </span>
                      {project.budget && (
                        <span className="text-xs font-medium">
                          ${project.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {project.proposals.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>
                          {project.proposals.length} proposal{project.proposals.length !== 1 ? 's' : ''}
                          {' \u00b7 '}
                          ${project.proposals.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}

                {stageProjects.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed">
                    No projects
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
