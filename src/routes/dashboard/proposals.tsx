import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Pencil, FileText, Mail } from 'lucide-react'
import { sendProposalEmail } from '@/lib/resend-server'

export const Route = createFileRoute('/dashboard/proposals')({
  component: ProposalsPage,
})

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUsdInput(raw: string): string {
  const str = String(raw)
  const cleaned = str.replace(/,/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num)) return str
  const [intPart, decPart] = cleaned.split('.')
  const formatted = Number(intPart).toLocaleString('en-US')
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted
}

function stripCommas(s: string): string {
  return String(s).replace(/,/g, '')
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'sent':
      return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Sent</Badge>
    case 'viewed':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">Viewed</Badge>
    case 'accepted':
      return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Accepted</Badge>
    case 'rejected':
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Rejected</Badge>
    case 'expired':
      return <Badge variant="outline">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

const emptyLineItem: LineItem = { description: '', quantity: 1, unitPrice: 0 }

function ProposalsPage() {
  const proposals = useQuery(api.proposals.list, {})
  const clients = useQuery(api.clients.list)
  const services = useQuery(api.services.list, {})
  const createProposal = useMutation(api.proposals.create)
  const updateProposal = useMutation(api.proposals.update)
  const removeProposal = useMutation(api.proposals.remove)
  const markSent = useMutation(api.proposals.markSent)

  const projects = useQuery(api.projects.list, {})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }])
  const [validUntil, setValidUntil] = useState('')

  // New state
  const [paymentMode, setPaymentMode] = useState<'full' | 'split'>('full')
  const [emailToClient, setEmailToClient] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingProposalId, setEditingProposalId] = useState<Id<'proposals'> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Id<'proposals'> | null>(null)
  const [pdfProposal, setPdfProposal] = useState<(typeof proposals extends (infer T)[] | undefined ? T : never) | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<Id<'proposals'> | null>(null)

  const clientProjects = projects?.filter((p) => p.clientId === clientId) ?? []

  function resetForm() {
    setClientId('')
    setProjectId('')
    setServiceId('')
    setTitle('')
    setDescription('')
    setLineItems([{ ...emptyLineItem }])
    setValidUntil('')
    setPaymentMode('full')
    setEmailToClient(false)
    setEditingProposalId(null)
  }

  function handleOpenDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(proposal: NonNullable<typeof proposals>[number]) {
    setEditingProposalId(proposal._id)
    setClientId(proposal.clientId)
    setProjectId(proposal.projectId ?? '')
    setServiceId('')
    setTitle(proposal.title)
    setDescription(proposal.description ?? '')
    setLineItems(
      proposal.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      }))
    )
    setValidUntil(
      proposal.validUntil
        ? new Date(proposal.validUntil).toISOString().split('T')[0]
        : ''
    )
    setPaymentMode((proposal as any).paymentMode || 'full')
    setEmailToClient(false)
    setDialogOpen(true)
  }

  function handleServiceChange(serviceIdValue: string) {
    setServiceId(serviceIdValue)
    const service = services?.find((s) => s._id === serviceIdValue)
    if (!service) return

    const updated = [...lineItems]
    updated[0] = {
      description: service.name + (service.description ? ` - ${service.description}` : ''),
      quantity: 1,
      unitPrice: service.defaultRate ?? 0,
    }
    setLineItems(updated)

    if (!title || title === autoTitle(clientId, '')) {
      setTitle(autoTitle(clientId, service.name))
    }
  }

  function handleClientChange(clientIdValue: string) {
    setClientId(clientIdValue)
    setProjectId('')
    const serviceName = services?.find((s) => s._id === serviceId)?.name ?? ''
    if (!title || title === autoTitle('', serviceName)) {
      setTitle(autoTitle(clientIdValue, serviceName))
    }
  }

  function autoTitle(cId: string, serviceName: string) {
    const client = clients?.find((c) => c._id === cId)
    const clientName = client?.businessName || client?.name || ''
    if (serviceName && clientName) return `${serviceName} - ${clientName}`
    if (serviceName) return serviceName
    if (clientName) return `Proposal for ${clientName}`
    return ''
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { ...emptyLineItem }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const grandTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  async function handleSave() {
    if (!clientId || !title || lineItems.length === 0) return

    setSending(true)
    try {
      const finalLineItems = lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }))

      const serviceName = services?.find((s) => s._id === serviceId)?.name

      if (editingProposalId) {
        // Update existing proposal
        await updateProposal({
          id: editingProposalId,
          title,
          description: description || undefined,
          service: serviceName || undefined,
          lineItems: finalLineItems,
          totalAmount: grandTotal,
          validUntil: validUntil ? new Date(validUntil).getTime() : undefined,
        })
      } else {
        // Create new proposal
        const proposalId = await createProposal({
          clientId: clientId as Id<'clients'>,
          projectId: projectId && projectId !== 'none' ? (projectId as Id<'projects'>) : undefined,
          title,
          description: description || undefined,
          service: serviceName || undefined,
          lineItems: finalLineItems,
          totalAmount: grandTotal,
          validUntil: validUntil ? new Date(validUntil).getTime() : undefined,
          paymentMode,
        })

        // If email checkbox is checked, mark as sent and email client
        if (emailToClient) {
          const client = clients?.find((c) => c._id === clientId)
          if (client) {
            await markSent({ id: proposalId })
            try {
              const finalLineItems = lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
              }))
              await sendProposalEmail({
                data: {
                  to: client.contactEmail,
                  clientName: client.name,
                  proposalTitle: title,
                  description: description || undefined,
                  lineItems: finalLineItems,
                  totalAmount: grandTotal,
                  validUntil: validUntil || undefined,
                  payUrl: `${window.location.origin}/pay/${proposalId}`,
                  signInUrl: `${window.location.origin}/sign-in`,
                  signUpUrl: `${window.location.origin}/sign-up`,
                },
              })
            } catch (emailErr) {
              console.error('Email send failed (proposal still saved):', emailErr)
              alert('Proposal saved but email failed to send. Check console for details.')
            }
          }
        }
      }

      resetForm()
      setDialogOpen(false)
    } catch (err) {
      console.error('Failed to save proposal:', err)
    } finally {
      setSending(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await removeProposal({ id: deleteTarget })
    } catch (err) {
      console.error('Failed to delete proposal:', err)
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleSendEmail(proposal: NonNullable<typeof proposals>[number]) {
    if (!proposal.client) return
    setSendingEmailId(proposal._id)
    try {
      // Mark as sent if still draft
      if (proposal.status === 'draft') {
        await markSent({ id: proposal._id })
      }
      await sendProposalEmail({
        data: {
          to: proposal.client.contactEmail,
          clientName: proposal.client.name,
          proposalTitle: proposal.title,
          description: proposal.description || undefined,
          lineItems: proposal.lineItems,
          totalAmount: proposal.totalAmount,
          validUntil: proposal.validUntil
            ? new Date(proposal.validUntil).toISOString().split('T')[0]
            : undefined,
          payUrl: `${window.location.origin}/pay/${proposal._id}`,
          signInUrl: `${window.location.origin}/sign-in`,
          signUpUrl: `${window.location.origin}/sign-up`,
        },
      })
    } catch (err) {
      console.error('Email send failed:', err)
      alert('Failed to send email. Check console for details.')
    } finally {
      setSendingEmailId(null)
    }
  }

  function handlePrintProposal() {
    if (!pdfProposal) return
    const content = document.getElementById('proposal-pdf-content')
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfProposal.title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: hsl(var(--brand-primary)); line-height: 48px; text-align: center; color: white; font-size: 24px; font-weight: bold; }
            .company-name { font-size: 24px; font-weight: bold; color: hsl(var(--foreground)); margin: 12px 0 4px; }
            .divider { border: none; border-top: 2px solid #E5E7EB; margin: 24px 0; }
            .section-title { font-size: 14px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .info-label { font-size: 12px; color: #9CA3AF; margin-bottom: 2px; }
            .info-value { font-size: 14px; color: #1a1a1a; }
            .proposal-title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
            .proposal-desc { color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th { background: #F3F4F6; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; }
            td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 12px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  async function handleSaveAsPdf() {
    if (!pdfProposal) return
    const content = document.getElementById('proposal-pdf-content')
    if (!content) return

    try {
      const html2pdf = (await import('html2pdf.js')).default
      html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${pdfProposal.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(content)
        .save()
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Create and manage client proposals.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-1" />
              New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProposalId ? 'Edit Proposal' : 'New Proposal'}</DialogTitle>
              <DialogDescription>
                {editingProposalId
                  ? 'Update proposal details.'
                  : 'Create a proposal for a client. Select a service to auto-populate line items.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Client & Service selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select
                    value={clientId}
                    onValueChange={handleClientChange}
                    disabled={!!editingProposalId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.businessName || client.name}
                          {client.contactEmail ? ` (${client.contactEmail})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={serviceId} onValueChange={handleServiceChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name}
                          {service.defaultRate ? ` ($${formatUsd(service.defaultRate)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project (filtered by selected client) */}
              {clientId && clientProjects.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {clientProjects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Proposal title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional proposal description"
                  rows={2}
                />
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Row
                  </Button>
                </div>

                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 text-xs font-medium text-muted-foreground">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span>Total</span>
                    <span />
                  </div>

                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center"
                    >
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                      />
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="pl-5"
                          value={formatUsdInput(String(item.unitPrice))}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9.,]/g, '')
                            updateLineItem(index, 'unitPrice', parseFloat(stripCommas(v)) || 0)
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium text-right pr-1">
                        ${formatUsd(item.quantity * item.unitPrice)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Grand total */}
                <div className="flex justify-end border-t pt-2">
                  <p className="text-sm font-semibold">
                    Total: ${formatUsd(grandTotal)}
                  </p>
                </div>
              </div>

              {/* Valid Until */}
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              {/* Split Payment toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="splitPayment"
                    checked={paymentMode === 'split'}
                    onCheckedChange={(checked) =>
                      setPaymentMode(checked === true ? 'split' : 'full')
                    }
                  />
                  <Label htmlFor="splitPayment" className="text-sm font-normal cursor-pointer">
                    Split Payment (50/50) — half upfront, half on project completion
                  </Label>
                </div>
                {paymentMode === 'split' && grandTotal > 0 && (
                  <div className="ml-6 text-xs text-muted-foreground bg-muted/50 rounded-md p-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Payment 1 (upfront)</span>
                      <span className="font-medium">${formatUsd(Math.ceil((grandTotal * 100) / 2) / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment 2 (on completion)</span>
                      <span className="font-medium">${formatUsd(Math.floor((grandTotal * 100) / 2) / 100)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Email to Client checkbox — only when creating */}
              {!editingProposalId && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailToClient"
                    checked={emailToClient}
                    onCheckedChange={(checked) => setEmailToClient(checked === true)}
                  />
                  <Label htmlFor="emailToClient" className="text-sm font-normal cursor-pointer">
                    Email proposal to client on creation
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!clientId || !title || lineItems.every((i) => !i.description) || sending}
              >
                {sending
                  ? 'Saving...'
                  : editingProposalId
                    ? 'Save Changes'
                    : emailToClient
                      ? 'Create & Send'
                      : 'Create Proposal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
          <CardDescription>
            {proposals?.length ?? 0} total proposal{(proposals?.length ?? 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!proposals || proposals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No proposals yet.</p>
              <Button variant="outline" onClick={handleOpenDialog}>
                Create your first proposal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Client</th>
                    <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Service</th>
                    <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 px-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {proposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-muted/50 rounded-lg">
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">
                          {proposal.client?.businessName || proposal.client?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proposal.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(proposal._creationTime).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ${formatUsd(proposal.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {proposal.service || '\u2014'}
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <div>{statusBadge(proposal.status)}</div>
                        {(proposal as any).paymentMode === 'split' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {(proposal as any).secondPaymentStatus === 'paid'
                              ? '2/2 Paid'
                              : (proposal as any).firstPaymentStatus === 'paid'
                                ? '1/2 Paid'
                                : 'Split 50/50'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                            onClick={() => openEditDialog(proposal)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/10"
                            title="Send Email"
                            disabled={sendingEmailId === proposal._id}
                            onClick={() => handleSendEmail(proposal)}
                          >
                            <Mail className={`w-4 h-4 ${sendingEmailId === proposal._id ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/10"
                            title="PDF Preview"
                            onClick={() => setPdfProposal(proposal)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            onClick={() => setDeleteTarget(proposal._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfProposal} onOpenChange={(open) => !open && setPdfProposal(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Preview</DialogTitle>
            <DialogDescription>Preview, print, or save as PDF.</DialogDescription>
          </DialogHeader>

          {pdfProposal && (
            <div id="proposal-pdf-content" className="bg-surface p-8 rounded-lg border">
              {/* Company Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primary text-white text-2xl font-bold mb-3">
                  A
                </div>
                <h2 className="text-2xl font-bold text-foreground">AI Developer</h2>
                <p className="text-sm text-gray-500">Websites, Apps & AI Solutions Built Faster</p>
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Client & Proposal Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prepared For</p>
                  <p className="font-medium">{pdfProposal.client?.businessName || pdfProposal.client?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{pdfProposal.client?.contactEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-sm">{new Date(pdfProposal._creationTime).toLocaleDateString()}</p>
                  {pdfProposal.validUntil && (
                    <>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 mt-3">Valid Until</p>
                      <p className="text-sm">{new Date(pdfProposal.validUntil).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Proposal Title & Description */}
              <h3 className="text-xl font-bold mb-2">{pdfProposal.title}</h3>
              {pdfProposal.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{pdfProposal.description}</p>
              )}

              {/* Line Items Table */}
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfProposal.lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm">{item.description}</td>
                      <td className="py-2 px-3 text-sm text-right">{item.quantity}</td>
                      <td className="py-2 px-3 text-sm text-right">${formatUsd(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-sm text-right font-medium">${formatUsd(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end border-t-2 border-gray-200 pt-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase">Total Amount</p>
                  <p className="text-2xl font-bold text-brand-primary">${formatUsd(pdfProposal.totalAmount)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">AI Developer &mdash; Websites, Apps & AI Solutions Built Faster</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfProposal(null)}>
              Close
            </Button>
            <Button variant="outline" onClick={handlePrintProposal}>
              Print
            </Button>
            <Button onClick={handleSaveAsPdf}>
              Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
