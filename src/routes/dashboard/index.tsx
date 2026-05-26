import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Button } from '@/components/ui/button'
import {
  Inbox,
  FolderKanban,
  FileText,
  Clock,
  ArrowRight,
  ClipboardList,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const submissions = useQuery(api.contactSubmissions.list, {})
  const discoveries = useQuery(api.discoverySubmissions.list, {})
  const projects = useQuery(api.projects.list, {})
  const proposals = useQuery(api.proposals.list, {})

  const newSubmissions =
    submissions?.filter((s) => s.status === 'new').length ?? 0
  const newDiscoveries =
    discoveries?.filter((d) => d.status === 'new').length ?? 0
  const activeProjects =
    projects?.filter((p) => !['completed', 'lead'].includes(p.stage)).length ??
    0
  const pendingProposals =
    proposals?.filter((p) => ['sent', 'viewed'].includes(p.status)).length ?? 0
  const totalProjects = projects?.length ?? 0

  const stats = [
    {
      label: 'New Discoveries',
      value: newDiscoveries,
      icon: ClipboardList,
      description: 'Qualified CRM leads',
    },
    {
      label: 'New Submissions',
      value: newSubmissions,
      icon: Inbox,
      description: 'Awaiting review',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: FolderKanban,
      description: 'In progress',
    },
    {
      label: 'Pending Proposals',
      value: pendingProposals,
      icon: FileText,
      description: 'Sent or viewed',
    },
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: Clock,
      description: 'All time',
    },
  ]

  const statusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">New</Badge>
      case 'contacted':
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">Contacted</Badge>
      case 'quoted':
        return <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">Quoted</Badge>
      case 'converted':
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Converted</Badge>
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Discoveries</CardTitle>
              <CardDescription>
                {newDiscoveries} new discovery
                {newDiscoveries !== 1 ? ' submissions' : ' submission'} to
                review.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/discoveries">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!discoveries || discoveries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No discoveries yet.
              </p>
            ) : (
              <div className="space-y-4">
                {discoveries.slice(0, 5).map((d) => (
                  <div
                    key={d._id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1 min-w-0 mr-3">
                      <p className="text-sm font-medium leading-none truncate">
                        {d.businessName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {d.businessEmail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {d.primaryTrade.replace('-', ' ')}
                      </Badge>
                      {statusBadge(d.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                {newSubmissions} new submission{newSubmissions !== 1 ? 's' : ''}{' '}
                to review.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/submissions">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!submissions || submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No submissions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {submissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {sub.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sub.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {sub.service}
                      </span>
                      {statusBadge(sub.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                {activeProjects} project{activeProjects !== 1 ? 's' : ''} in
                progress.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/projects">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No projects yet.
              </p>
            ) : (
              <div className="space-y-4">
                {projects
                  .filter((p) => !['completed', 'lead'].includes(p.stage))
                  .slice(0, 5)
                  .map((project) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {project.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.service}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {project.stage.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
