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
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, DollarSign, Save, Mail, Phone, Pencil, Trash2, Wrench } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUsdInput(raw: string): string {
  const num = parseFloat(raw.replace(/,/g, ''))
  if (isNaN(num)) return raw
  // Format integer part with commas, keep any decimal the user typed
  const [intPart, decPart] = raw.replace(/,/g, '').split('.')
  const formatted = Number(intPart).toLocaleString('en-US')
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted
}

function stripCommas(s: string): string {
  return s.replace(/,/g, '')
}

const initialUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  billableRate: '',
  role: 'user' as 'admin' | 'user',
}

const initialServiceForm = {
  name: '',
  description: '',
  defaultRate: '',
}

function SettingsPage() {
  const users = useQuery(api.users.list)
  const createUser = useMutation(api.users.createByAdmin)
  const updateUser = useMutation(api.users.updateUser)

  const services = useQuery(api.services.list, { includeInactive: true })
  const createService = useMutation(api.services.create)
  const updateService = useMutation(api.services.update)
  const removeService = useMutation(api.services.remove)

  const removeUser = useMutation(api.users.removeByAdmin)

  const [addUserOpen, setAddUserOpen] = useState(false)
  const [form, setForm] = useState(initialUserForm)
  const [editingUserId, setEditingUserId] = useState<Id<'users'> | null>(null)
  const [deleteUserTarget, setDeleteUserTarget] = useState<Id<'users'> | null>(null)
  const [editingRates, setEditingRates] = useState<
    Record<string, string>
  >({})

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<Id<'services'> | null>(null)
  const [serviceForm, setServiceForm] = useState(initialServiceForm)

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateServiceField(field: keyof typeof serviceForm, value: string) {
    setServiceForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveRate(userId: Id<'users'>) {
    const rateStr = editingRates[userId]
    if (rateStr === undefined) return

    const rate = parseFloat(rateStr)
    if (isNaN(rate)) return

    await updateUser({
      id: userId,
      billableRate: rate,
    })

    setEditingRates((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  function handleOpenCreateUser() {
    setEditingUserId(null)
    setForm(initialUserForm)
    setAddUserOpen(true)
  }

  function handleOpenEditUser(user: NonNullable<typeof users>[number]) {
    setEditingUserId(user._id)
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      street: user.address?.street ?? '',
      city: user.address?.city ?? '',
      state: user.address?.state ?? '',
      zip: user.address?.zip ?? '',
      billableRate: user.billableRate?.toString() ?? '',
      role: user.role as 'admin' | 'user',
    })
    setAddUserOpen(true)
  }

  async function handleSaveUser() {
    if (!form.firstName || !form.lastName || !form.email) return

    const address =
      form.street || form.city || form.state || form.zip
        ? { street: form.street, city: form.city, state: form.state, zip: form.zip }
        : undefined

    if (editingUserId) {
      await updateUser({
        id: editingUserId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        address,
        billableRate: form.billableRate ? parseFloat(form.billableRate) : undefined,
        role: form.role,
      })
    } else {
      await createUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        address,
        billableRate: form.billableRate ? parseFloat(form.billableRate) : undefined,
        role: form.role,
      })
    }

    setForm(initialUserForm)
    setEditingUserId(null)
    setAddUserOpen(false)
  }

  async function handleDeleteUser() {
    if (!deleteUserTarget) return
    try {
      await removeUser({ id: deleteUserTarget })
    } catch (err) {
      console.error('Failed to delete user:', err)
    } finally {
      setDeleteUserTarget(null)
    }
  }

  function openAddService() {
    setEditingServiceId(null)
    setServiceForm(initialServiceForm)
    setServiceDialogOpen(true)
  }

  function openEditService(service: { _id: Id<'services'>; name: string; description?: string; defaultRate?: number }) {
    setEditingServiceId(service._id)
    setServiceForm({
      name: service.name,
      description: service.description ?? '',
      defaultRate: service.defaultRate?.toString() ?? '',
    })
    setServiceDialogOpen(true)
  }

  async function handleSaveService() {
    if (!serviceForm.name) return

    if (editingServiceId) {
      await updateService({
        id: editingServiceId,
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        defaultRate: serviceForm.defaultRate ? parseFloat(serviceForm.defaultRate) : undefined,
      })
    } else {
      await createService({
        name: serviceForm.name,
        description: serviceForm.description || undefined,
        defaultRate: serviceForm.defaultRate ? parseFloat(serviceForm.defaultRate) : undefined,
      })
    }

    setServiceForm(initialServiceForm)
    setEditingServiceId(null)
    setServiceDialogOpen(false)
  }

  async function handleToggleServiceActive(id: Id<'services'>, currentlyActive: boolean) {
    await updateService({ id, isActive: !currentlyActive })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage billable rates and team members.
        </p>
      </div>

      {/* Billable Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Billable Rates
          </CardTitle>
          <CardDescription>
            Set default hourly rates for each team member. These rates are
            automatically applied when logging billable time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No users found. Make sure you are logged in as an admin.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isEditing = editingRates[user._id] !== undefined
                const displayRate = isEditing
                  ? editingRates[user._id]
                  : user.billableRate?.toString() ?? ''

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-7 text-right"
                          placeholder="0.00"
                          value={displayRate}
                          onChange={(e) =>
                            setEditingRates((prev) => ({
                              ...prev,
                              [user._id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">/hr</span>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveRate(user._id)}
                        >
                          <Save className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {users?.length ?? 0} total member
              {(users?.length ?? 0) !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateUser}>
                <Plus className="w-4 h-4 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogDescription>
                  {editingUserId
                    ? 'Update team member details.'
                    : 'Create a new team member with their contact info and billable rate.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Name */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Name</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userFirstName">First Name *</Label>
                      <Input
                        id="userFirstName"
                        value={form.firstName}
                        onChange={(e) =>
                          updateField('firstName', e.target.value)
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userLastName">Last Name *</Label>
                      <Input
                        id="userLastName"
                        value={form.lastName}
                        onChange={(e) =>
                          updateField('lastName', e.target.value)
                        }
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone</Label>
                      <Input
                        id="userPhone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Address</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userStreet">Street</Label>
                      <Input
                        id="userStreet"
                        value={form.street}
                        onChange={(e) => updateField('street', e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-2 sm:col-span-2">
                        <Label htmlFor="userCity">City</Label>
                        <Input
                          id="userCity"
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userState">State</Label>
                        <Input
                          id="userState"
                          value={form.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          placeholder="IL"
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userZip">Zip</Label>
                        <Input
                          id="userZip"
                          value={form.zip}
                          onChange={(e) => updateField('zip', e.target.value)}
                          placeholder="60601"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate & Role */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Role & Rate</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userRate">Billable Rate ($/hr)</Label>
                      <Input
                        id="userRate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.billableRate}
                        onChange={(e) =>
                          updateField('billableRate', e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={form.role}
                        onValueChange={(value) =>
                          updateField('role', value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={
                    !form.firstName || !form.lastName || !form.email
                  }
                >
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No users found. Make sure you are logged in as an admin.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || 'Unnamed'}
                      </p>
                      <Badge
                        variant="secondary"
                        className={
                          user.role === 'admin'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 mt-1'
                            : 'mt-1'
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <Badge
                      variant={user.isActive ? 'default' : 'secondary'}
                      className={
                        user.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border-green-200'
                          : ''
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.billableRate !== undefined && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${formatUsd(user.billableRate)}/hr</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditUser(user)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteUserTarget(user._id)}
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

      {/* Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Services
            </CardTitle>
            <CardDescription>
              {services?.length ?? 0} total service
              {(services?.length ?? 0) !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddService}>
                <Plus className="w-4 h-4 mr-1" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingServiceId ? 'Edit Service' : 'Add Service'}
                </DialogTitle>
                <DialogDescription>
                  {editingServiceId
                    ? 'Update this service.'
                    : 'Add a new service that can be used in proposals and projects.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={serviceForm.name}
                    onChange={(e) => updateServiceField('name', e.target.value)}
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Description</Label>
                  <Textarea
                    id="serviceDescription"
                    value={serviceForm.description}
                    onChange={(e) => updateServiceField('description', e.target.value)}
                    placeholder="Brief description of the service"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceRate">Default Rate ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="serviceRate"
                      type="text"
                      inputMode="decimal"
                      className="pl-7"
                      value={formatUsdInput(serviceForm.defaultRate)}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.,]/g, '')
                        updateServiceField('defaultRate', stripCommas(v))
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setServiceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveService}
                  disabled={!serviceForm.name}
                >
                  {editingServiceId ? 'Save Changes' : 'Add Service'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {services === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                No services yet. Add services to use in proposals and projects.
              </p>
              <Button variant="outline" onClick={openAddService}>
                <Plus className="w-4 h-4 mr-1" />
                Add your first service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{service.name}</p>
                    <Badge
                      variant={service.isActive ? 'default' : 'secondary'}
                      className={
                        service.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border-green-200 cursor-pointer'
                          : 'cursor-pointer'
                      }
                      onClick={() => handleToggleServiceActive(service._id, service.isActive)}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  {service.defaultRate !== undefined && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${formatUsd(service.defaultRate)}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditService(service)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeService({ id: service._id })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserTarget} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
