import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Badge } from '@/components/ui/badge'
import { Check, Copy, Pencil, Plus, Trash2, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/dashboard/services')({
  component: ServicesPage,
})

/** A markdown only exists when the regular price is above the actual price. */
function getMarkdown(price: number, regular: number | undefined) {
  if (regular === undefined || !(regular > price) || regular <= 0) return null
  return {
    regular,
    percentOff: Math.round(((regular - price) / regular) * 100),
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

type CategoryWithItems = {
  _id: Id<'serviceCategories'>
  name: string
  slug: string
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  items: Array<{
    _id: Id<'serviceItems'>
    categoryId: Id<'serviceCategories'>
    name: string
    description?: string
    defaultPrice: number
    billingInterval?: 'one_time' | 'month'
    compareAtPrice?: number
    isActive: boolean
    displayOrder: number
    stripePaymentLinkUrl?: string
  }>
}

function ServicesPage() {
  const data = useQuery(api.serviceCatalog.listCategoriesWithItems)
  const backfill = useMutation(api.serviceCatalog.backfillStripeCatalog)
  // Use the already-deployed removeCategory (it cascades to its items) so the
  // Clear All button works without needing a fresh Convex backend deploy.
  const removeCategory = useMutation(api.serviceCatalog.removeCategory)
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>(
    'idle',
  )
  const [clearing, setClearing] = useState(false)

  async function handleSyncStripe() {
    setSyncState('syncing')
    try {
      await backfill({})
      setSyncState('done')
      setTimeout(() => setSyncState('idle'), 2500)
    } catch (err) {
      console.error('Stripe sync failed:', err)
      setSyncState('idle')
    }
  }

  async function handleClearAll() {
    if (!data) return
    setClearing(true)
    try {
      for (const cat of data) {
        await removeCategory({ id: cat._id })
      }
    } catch (err) {
      console.error('Clear all failed:', err)
      alert(
        'Could not clear the catalog: ' +
          (err instanceof Error ? err.message : String(err)),
      )
    } finally {
      setClearing(false)
    }
  }

  if (data === undefined) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        Loading…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Catalog of everything you sell, organized by category. Add new
            services, tweak prices, or remove what you don't offer anymore.
            Changes auto-sync to Stripe.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={clearing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {clearing ? 'Clearing…' : 'Clear All'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear entire catalog?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {data.length} categories and their
                    services. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="outline"
            onClick={handleSyncStripe}
            disabled={syncState === 'syncing'}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${syncState === 'syncing' ? 'animate-spin' : ''}`}
            />
            {syncState === 'syncing'
              ? 'Syncing…'
              : syncState === 'done'
                ? 'Synced ✓'
                : 'Sync to Stripe'}
          </Button>
          <NewCategoryButton />
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No services yet. Click "New category" to add your first one.
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((cat) => (
            <CategoryCard key={cat._id} category={cat as CategoryWithItems} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Category card
// ============================================================

function CategoryCard({ category }: { category: CategoryWithItems }) {
  const updateCategory = useMutation(api.serviceCatalog.updateCategory)
  const removeCategory = useMutation(api.serviceCatalog.removeCategory)
  const [editing, setEditing] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-xl">{category.name}</CardTitle>
          {category.description && (
            <CardDescription>{category.description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditing(true)}
            title="Edit category"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete "{category.name}"?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will also delete{' '}
                  <strong>{category.items.length} service
                  {category.items.length === 1 ? '' : 's'}</strong> under
                  this category. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeCategory({ id: category._id })}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete category + {category.items.length} item
                  {category.items.length === 1 ? '' : 's'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {category.items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            No services yet in this category.
          </p>
        ) : (
          <div className="space-y-1.5">
            {category.items.map((item) => (
              <ServiceItemRow key={item._id} item={item} />
            ))}
          </div>
        )}
        <AddItemRow categoryId={category._id} />
      </CardContent>

      {editing && (
        <EditCategoryDialog
          category={category}
          onClose={() => setEditing(false)}
          onSave={async (patch) => {
            await updateCategory({ id: category._id, ...patch })
            setEditing(false)
          }}
        />
      )}
    </Card>
  )
}

// ============================================================
// Service item row
// ============================================================

function ServiceItemRow({
  item,
}: {
  item: CategoryWithItems['items'][number]
}) {
  const updateItem = useMutation(api.serviceCatalog.updateItem)
  const removeItem = useMutation(api.serviceCatalog.removeItem)
  const [editing, setEditing] = useState(false)
  const [localPrice, setLocalPrice] = useState(item.defaultPrice.toString())
  const [copied, setCopied] = useState(false)
  const isMonthly = item.billingInterval === 'month'
  const markdown = getMarkdown(item.defaultPrice, item.compareAtPrice)

  useEffect(() => {
    setLocalPrice(item.defaultPrice.toString())
  }, [item.defaultPrice])

  async function copySubscribeLink() {
    if (!item.stripePaymentLinkUrl) return
    await navigator.clipboard.writeText(item.stripePaymentLinkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {isMonthly && (
            <Badge className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/10 border-amber-500/30 shrink-0 text-[10px] px-1.5 py-0">
              Monthly
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
        {markdown && (
          <p className="text-xs mt-0.5">
            <span className="text-muted-foreground line-through">
              ${formatMoney(markdown.regular)}
              {isMonthly ? '/mo' : ''}
            </span>{' '}
            <span className="text-green-300 font-medium">
              {markdown.percentOff}% off — clients see this markdown
            </span>
          </p>
        )}
      </div>
      {isMonthly && item.stripePaymentLinkUrl && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0"
          onClick={copySubscribeLink}
          title="Copy the Stripe subscribe link — send it to the client to start the monthly billing"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 mr-1.5" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1.5" />
          )}
          {copied ? 'Copied' : 'Subscribe link'}
        </Button>
      )}
      <div className="relative w-36 shrink-0">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          min={0}
          step={isMonthly ? 1 : 100}
          value={localPrice}
          onChange={(e) => setLocalPrice(e.target.value)}
          onBlur={() => {
            const n = parseFloat(localPrice)
            if (!Number.isFinite(n)) {
              setLocalPrice(item.defaultPrice.toString())
              return
            }
            if (n !== item.defaultPrice)
              updateItem({ id: item._id, defaultPrice: n })
          }}
          className={`pl-6 h-8 text-sm text-right ${isMonthly ? 'pr-10' : ''}`}
        />
        {isMonthly && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            /mo
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setEditing(true)}
        title="Edit service"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Delete service"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the service from the catalog. Existing proposals
              that already include this line item are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeItem({ id: item._id })}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing && (
        <EditItemDialog
          item={item}
          onClose={() => setEditing(false)}
          onSave={async (patch) => {
            await updateItem({ id: item._id, ...patch })
            setEditing(false)
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// Add item inline form
// ============================================================

function AddItemRow({
  categoryId,
}: {
  categoryId: Id<'serviceCategories'>
}) {
  const addItem = useMutation(api.serviceCatalog.addItem)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [billing, setBilling] = useState<'one_time' | 'month'>('one_time')

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-1"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add service
      </Button>
    )
  }

  async function handleAdd() {
    const n = parseFloat(price)
    if (!name.trim() || !Number.isFinite(n)) return
    await addItem({
      categoryId,
      name: name.trim(),
      description: description.trim() || undefined,
      defaultPrice: n,
      billingInterval: billing,
    })
    setName('')
    setPrice('')
    setDescription('')
    setBilling('one_time')
    setOpen(false)
  }

  return (
    <div className="grid grid-cols-12 gap-2 items-start rounded-md border-2 border-dashed border-brand-primary/30 p-3 mt-1">
      <div className="col-span-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name"
          autoFocus
          className="h-8 text-sm"
        />
      </div>
      <div className="col-span-3">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="h-8 text-sm"
        />
      </div>
      <div className="col-span-2">
        <Select
          value={billing}
          onValueChange={(v) => setBilling(v as 'one_time' | 'month')}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="month">Monthly retainer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            step={billing === 'month' ? 1 : 100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className={`pl-6 h-8 text-sm text-right ${billing === 'month' ? 'pr-9' : ''}`}
          />
          {billing === 'month' && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              /mo
            </span>
          )}
        </div>
      </div>
      <div className="col-span-1 flex gap-1">
        <Button size="sm" onClick={handleAdd} className="h-8 px-2">
          Add
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false)
            setName('')
            setPrice('')
            setDescription('')
            setBilling('one_time')
          }}
          className="h-8 px-2"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// New / edit dialogs
// ============================================================

function NewCategoryButton() {
  const addCategory = useMutation(api.serviceCatalog.addCategory)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function handleAdd() {
    if (!name.trim()) return
    await addCategory({
      name: name.trim(),
      description: description.trim() || undefined,
    })
    setName('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        New category
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New service category</DialogTitle>
          <DialogDescription>
            A top-level grouping like "AI Voice" or "Custom CRM". You'll
            add individual services to it after.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">
              Description{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short note about what this category covers."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Create category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({
  category,
  onClose,
  onSave,
}: {
  category: CategoryWithItems
  onClose: () => void
  onSave: (patch: { name?: string; description?: string }) => Promise<void>
}) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description ?? '')

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                name: name.trim() || undefined,
                description: description.trim() || undefined,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditItemDialog({
  item,
  onClose,
  onSave,
}: {
  item: CategoryWithItems['items'][number]
  onClose: () => void
  onSave: (patch: {
    name?: string
    description?: string
    defaultPrice?: number
    compareAtPrice?: number | null
    billingInterval?: 'one_time' | 'month'
  }) => Promise<void>
}) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? '')
  const [price, setPrice] = useState(item.defaultPrice.toString())
  const [regular, setRegular] = useState(item.compareAtPrice?.toString() ?? '')
  const [billing, setBilling] = useState<'one_time' | 'month'>(
    item.billingInterval ?? 'one_time',
  )
  const priceNum = parseFloat(price)
  const regularNum = parseFloat(regular)
  const preview = Number.isFinite(priceNum)
    ? getMarkdown(priceNum, Number.isFinite(regularNum) ? regularNum : undefined)
    : null
  const regularTooLow =
    regular.trim() !== '' &&
    Number.isFinite(regularNum) &&
    Number.isFinite(priceNum) &&
    regularNum <= priceNum
  const per = billing === 'month' ? '/mo' : ''

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit service</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Billing</Label>
            <Select
              value={billing}
              onValueChange={(v) => setBilling(v as 'one_time' | 'month')}
            >
              <SelectTrigger className="max-w-[14rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-time</SelectItem>
                <SelectItem value="month">Monthly retainer</SelectItem>
              </SelectContent>
            </Select>
            {billing === 'month' && (
              <p className="text-xs text-muted-foreground">
                Syncs to Stripe as a recurring monthly price and generates a
                subscribe link you can send to the client.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{billing === 'month' ? 'Price per month' : 'Default price'}</Label>
            <div className="relative max-w-[10rem]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min={0}
                step={billing === 'month' ? 1 : 100}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={billing === 'month' ? 'pl-7 pr-12' : 'pl-7'}
              />
              {billing === 'month' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  /mo
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              Regular price{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (optional — mark it down)
              </span>
            </Label>
            <div className="relative max-w-[10rem]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min={0}
                step={billing === 'month' ? 1 : 100}
                value={regular}
                onChange={(e) => setRegular(e.target.value)}
                placeholder="—"
                className={billing === 'month' ? 'pl-7 pr-12' : 'pl-7'}
              />
              {billing === 'month' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  /mo
                </span>
              )}
            </div>
            {regularTooLow ? (
              <p className="text-xs text-amber-300">
                The regular price has to be higher than your price to show a
                markdown — this would be ignored.
              </p>
            ) : preview ? (
              <p className="text-xs">
                Clients see:{' '}
                <span className="text-muted-foreground line-through">
                  ${formatMoney(preview.regular)}
                  {per}
                </span>{' '}
                <span className="font-semibold">
                  ${formatMoney(priceNum)}
                  {per}
                </span>{' '}
                <span className="text-green-300">
                  — {preview.percentOff}% off
                </span>
                <span className="block text-muted-foreground mt-1">
                  They're still only charged ${formatMoney(priceNum)}
                  {per}. The regular price is shown, never billed.
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Set a higher regular price and clients see it crossed out next
                to yours — on proposals
                {billing === 'month' ? ' and the Stripe subscribe page' : ''}.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const n = parseFloat(price)
              return onSave({
                name: name.trim() || undefined,
                description: description.trim() || undefined,
                defaultPrice: Number.isFinite(n) ? n : undefined,
                // Blank clears the markdown; the server also drops a regular
                // price that isn't above the actual price.
                compareAtPrice:
                  regular.trim() === '' || !Number.isFinite(regularNum)
                    ? null
                    : regularNum,
                billingInterval: billing,
              })
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
