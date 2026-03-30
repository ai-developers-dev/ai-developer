import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Send, Save } from 'lucide-react'
import { sendProposalEmail } from '@/lib/resend-server'

export const Route = createFileRoute('/dashboard/proposals/new')({
  component: NewProposalPage,
})

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

function NewProposalPage() {
  const navigate = useNavigate()
  const clients = useQuery(api.clients.list)
  const projects = useQuery(api.projects.list, {})
  const createProposal = useMutation(api.proposals.create)
  const markSent = useMutation(api.proposals.markSent)

  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ])
  const [saving, setSaving] = useState(false)

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0)

  const clientProjects = projects?.filter(
    (p) => p.clientId === clientId
  )

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems]
    const item = { ...updated[index] }

    if (field === 'description') {
      item.description = value as string
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0
      item.total = item.quantity * item.unitPrice
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value) || 0
      item.total = item.quantity * item.unitPrice
    }

    updated[index] = item
    setLineItems(updated)
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  async function handleSave(send: boolean) {
    if (!clientId || !title || lineItems.some((li) => !li.description)) return

    setSaving(true)
    try {
      const proposalId = await createProposal({
        clientId: clientId as Id<'clients'>,
        projectId: projectId ? (projectId as Id<'projects'>) : undefined,
        title,
        description: description || undefined,
        lineItems: lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          total: li.total,
        })),
        totalAmount,
      })

      if (send) {
        const client = clients?.find((c) => c._id === clientId)
        if (client) {
          await markSent({ id: proposalId })
          try {
            await sendProposalEmail({
              data: {
                to: client.contactEmail,
                clientName: client.name,
                proposalTitle: title,
                lineItems: lineItems.map((li) => ({
                  description: li.description,
                  quantity: li.quantity,
                  unitPrice: li.unitPrice,
                  total: li.total,
                })),
                totalAmount,
                payUrl: `${window.location.origin}/pay/${proposalId}`,
                signInUrl: `${window.location.origin}/sign-in`,
                signUpUrl: `${window.location.origin}/sign-up`,
              },
            })
          } catch (emailErr) {
            console.error('Email send failed (proposal still saved):', emailErr)
          }
        }
      }

      navigate({ to: '/dashboard/proposals' })
    } catch (err) {
      console.error('Failed to create proposal:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        New Proposal
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project (optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {clientProjects?.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proposal Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Website Development Proposal"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of work..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>

            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(i, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(i, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium px-3">
                    ${item.total.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => removeLineItem(i)}
                    className="p-1 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t pt-3 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-1" />
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          <Send className="w-4 h-4 mr-1" />
          Save & Send
        </Button>
      </div>
    </div>
  )
}
