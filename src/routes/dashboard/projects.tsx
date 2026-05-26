import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileText, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/projects')({
  component: ProjectsPage,
})

type Stage =
  | 'lead'
  | 'proposal'
  | 'review'
  | 'contracted'
  | 'in_progress'
  | 'completed'

const stages: { key: Stage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'review', label: 'Review' },
  { key: 'contracted', label: 'Contracted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

const DRAG_MIME = 'application/x-project-id'

function ProjectsPage() {
  const projects = useQuery(api.projects.list, {})
  const updateStage = useMutation(api.projects.updateStage)
  const removeProject = useMutation(api.projects.remove)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    id: Id<'projects'>
    title: string
  } | null>(null)

  async function handleDrop(targetStage: Stage, e: React.DragEvent) {
    e.preventDefault()
    setDragOverStage(null)
    const id = e.dataTransfer.getData(DRAG_MIME)
    if (!id) return
    const project = projects?.find((p) => p._id === id)
    if (!project || project.stage === targetStage) return
    await updateStage({ id: id as Id<'projects'>, stage: targetStage })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects Pipeline</h1>
        <p className="text-muted-foreground">
          Drag cards between stages, or hover to delete.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageProjects =
            projects?.filter((p) => p.stage === stage.key) ?? []
          const isDropTarget = dragOverStage === stage.key

          return (
            <div key={stage.key} className="min-w-[220px] flex-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-medium">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {stageProjects.length}
                </Badge>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverStage !== stage.key) setDragOverStage(stage.key)
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return
                  setDragOverStage(null)
                }}
                onDrop={(e) => handleDrop(stage.key, e)}
                className={`space-y-2 rounded-lg p-1 transition-colors ${
                  isDropTarget ? 'bg-primary/5 ring-2 ring-primary/30' : ''
                }`}
              >
                {stageProjects.map((project) => (
                  <div
                    key={project._id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_MIME, project._id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    className="group relative rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <Link
                      to="/dashboard/projects/$id"
                      params={{ id: project._id }}
                      className="block p-3"
                    >
                      <div className="font-medium text-sm mb-1 line-clamp-1 pr-6">
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
                            {project.proposals.length} proposal
                            {project.proposals.length !== 1 ? 's' : ''}
                            {' · '}$
                            {project.proposals
                              .reduce((sum, p) => sum + p.totalAmount, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPendingDelete({
                          id: project._id,
                          title: project.title,
                        })
                      }}
                      aria-label="Delete project"
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}

                {stageProjects.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed">
                    {isDropTarget ? 'Drop here' : 'No projects'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{' '}
              <span className="font-medium">{pendingDelete?.title}</span>.
              Linked proposals and time entries are not deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDelete) {
                  await removeProject({ id: pendingDelete.id })
                  setPendingDelete(null)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
