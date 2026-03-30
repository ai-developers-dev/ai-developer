import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/portal/projects')({
  component: PortalProjectsPage,
})

const stageColors: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700 border-blue-200',
  proposal: 'bg-amber-50 text-amber-700 border-amber-200',
  contracted: 'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
  review: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

function PortalProjectsPage() {
  const projects = useQuery(api.projects.getByClientEmail)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
        <p className="text-muted-foreground">Track the progress of your projects.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!projects || projects.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.service}</p>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge className={stageColors[project.stage] || ''}>
                      {project.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  {(project.startDate || project.dueDate) && (
                    <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                      {project.startDate && <span>Started: {project.startDate}</span>}
                      {project.dueDate && <span>Due: {project.dueDate}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
