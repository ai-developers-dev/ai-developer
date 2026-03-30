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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Mail, Phone, Building2, MapPin, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/clients')({
  component: ClientsPage,
})

const HOW_HEARD_OPTIONS = [
  'Google Search',
  'Social Media',
  'Referral',
  'Advertisement',
  'Word of Mouth',
  'LinkedIn',
  'Other',
]

const initialForm = {
  ownerFirstName: '',
  ownerLastName: '',
  businessName: '',
  businessPhone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  businessEmail: '',
  ownerEmail: '',
  howHeardOfUs: '',
}

function ClientsPage() {
  const clients = useQuery(api.clients.list)
  const createClient = useMutation(api.clients.create)
  const updateClient = useMutation(api.clients.update)
  const removeClient = useMutation(api.clients.remove)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingClientId, setEditingClientId] = useState<Id<'clients'> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Id<'clients'> | null>(null)

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenCreate() {
    setEditingClientId(null)
    setForm(initialForm)
    setOpen(true)
  }

  function handleOpenEdit(client: NonNullable<typeof clients>[number]) {
    setEditingClientId(client._id)
    setForm({
      ownerFirstName: client.ownerFirstName ?? '',
      ownerLastName: client.ownerLastName ?? '',
      businessName: client.businessName ?? client.company ?? '',
      businessPhone: client.businessPhone ?? client.phone ?? '',
      street: client.businessAddress?.street ?? '',
      city: client.businessAddress?.city ?? '',
      state: client.businessAddress?.state ?? '',
      zip: client.businessAddress?.zip ?? '',
      businessEmail: client.businessEmail ?? client.contactEmail ?? '',
      ownerEmail: client.ownerEmail ?? '',
      howHeardOfUs: client.howHeardOfUs ?? '',
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.ownerFirstName || !form.ownerLastName || !form.businessEmail) return

    const fullName = `${form.ownerFirstName} ${form.ownerLastName}`
    const address =
      form.street || form.city || form.state || form.zip
        ? { street: form.street, city: form.city, state: form.state, zip: form.zip }
        : undefined

    if (editingClientId) {
      await updateClient({
        id: editingClientId,
        name: fullName,
        contactEmail: form.businessEmail,
        company: form.businessName || undefined,
        phone: form.businessPhone || undefined,
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        businessName: form.businessName || undefined,
        businessPhone: form.businessPhone || undefined,
        businessAddress: address,
        businessEmail: form.businessEmail,
        ownerEmail: form.ownerEmail || undefined,
        howHeardOfUs: form.howHeardOfUs || undefined,
      })
    } else {
      await createClient({
        name: fullName,
        contactEmail: form.businessEmail,
        company: form.businessName || undefined,
        phone: form.businessPhone || undefined,
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        businessName: form.businessName || undefined,
        businessPhone: form.businessPhone || undefined,
        businessAddress: address,
        businessEmail: form.businessEmail,
        ownerEmail: form.ownerEmail || undefined,
        howHeardOfUs: form.howHeardOfUs || undefined,
      })
    }

    setForm(initialForm)
    setEditingClientId(null)
    setOpen(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await removeClient({ id: deleteTarget })
    } catch (err) {
      console.error('Failed to delete client:', err)
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClientId ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              <DialogDescription>
                {editingClientId
                  ? 'Update client information.'
                  : "Enter the client's business and owner information."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Owner Info */}
              <div>
                <h3 className="text-sm font-medium mb-3">Business Owner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerFirstName">First Name *</Label>
                    <Input
                      id="ownerFirstName"
                      value={form.ownerFirstName}
                      onChange={(e) => updateField('ownerFirstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerLastName">Last Name *</Label>
                    <Input
                      id="ownerLastName"
                      value={form.ownerLastName}
                      onChange={(e) => updateField('ownerLastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="text-sm font-medium mb-3">Business Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      placeholder="Business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={form.businessPhone}
                      onChange={(e) => updateField('businessPhone', e.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-medium mb-3">Business Address</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={form.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 sm:col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="IL"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip</Label>
                      <Input
                        id="zip"
                        value={form.zip}
                        onChange={(e) => updateField('zip', e.target.value)}
                        placeholder="60601"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Emails */}
              <div>
                <h3 className="text-sm font-medium mb-3">Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={form.businessEmail}
                      onChange={(e) => updateField('businessEmail', e.target.value)}
                      placeholder="info@business.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Personal Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={form.ownerEmail}
                      onChange={(e) => updateField('ownerEmail', e.target.value)}
                      placeholder="owner@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* How Heard */}
              <div className="space-y-2">
                <Label>How Did You Hear About Us?</Label>
                <Select
                  value={form.howHeardOfUs}
                  onValueChange={(value) => updateField('howHeardOfUs', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_HEARD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.ownerFirstName || !form.ownerLastName || !form.businessEmail}
              >
                {editingClientId ? 'Save Changes' : 'Create Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            {clients?.length ?? 0} total client
            {(clients?.length ?? 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No clients yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client._id}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {client.ownerFirstName && client.ownerLastName
                          ? `${client.ownerFirstName} ${client.ownerLastName}`
                          : client.name}
                      </p>
                      {(client.businessName || client.company) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {client.businessName || client.company}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={client.isActive ? 'default' : 'secondary'}
                      className={
                        client.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border-green-200'
                          : ''
                      }
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {client.businessEmail || client.contactEmail}
                      </span>
                    </div>
                    {(client.businessPhone || client.phone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{client.businessPhone || client.phone}</span>
                      </div>
                    )}
                    {client.businessAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {client.businessAddress.city}
                          {client.businessAddress.state
                            ? `, ${client.businessAddress.state}`
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(client)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(client._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
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
    </div>
  )
}
