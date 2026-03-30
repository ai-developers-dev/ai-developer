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
import { FolderKanban, FileText } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/')({
  component: PortalDashboard,
})

const stageColors: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700 border-blue-200',
  proposal: 'bg-amber-50 text-amber-700 border-amber-200',
  contracted: 'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
  review: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
}

function PortalDashboard() {
  const currentUser = useQuery(api.users.getCurrent)
  const projects = useQuery(api.projects.getByClientEmail)
  const proposals = useQuery(api.proposals.getByClient)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your projects and proposals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals?.filter((p) => ['sent', 'viewed'].includes(p.status)).length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Current status of all your projects.</CardDescription>
        </CardHeader>
        <CardContent>
          {!projects || projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No projects yet.
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.service}</p>
                  </div>
                  <Badge className={stageColors[project.stage] || ''}>
                    {project.stage.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Proposals</CardTitle>
            <CardDescription>Your latest proposals and their status.</CardDescription>
          </div>
          <Link
            to="/portal/proposals"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!proposals || proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No proposals yet.
            </p>
          ) : (
            <div className="space-y-2">
              {proposals.slice(0, 3).map((proposal) => (
                <Link
                  key={proposal._id}
                  to="/portal/proposals/$id"
                  params={{ id: proposal._id }}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{proposal.title}</p>
                    <p className="text-sm font-medium">
                      ${proposal.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{proposal.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
