'use client'

import { useState, useEffect } from 'react'
import {
  ChevronRight,
  Package,
  Building2,
  DoorClosed,
  Wind,
  Layers,
  FileText,
  MoreHorizontal,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DeleteConfirmationDialog } from '@/components/modals/delete-confirmation-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Define interfaces for our data
interface Property {
  uuid: string
  key: string
  value?: string
  values?: { value: string }[]
}

interface ObjectItem {
  uuid: string
  name: string
  modelUuid?: string
  modelName?: string
  modelVersion?: string
  properties?: Property[]
  children?: ObjectItem[]
  createdAt: string
  updatedAt: string
  files?: any[]
}

interface ObjectColumnsViewProps {
  data: any[]
  availableModels: any[]
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
}

// Column view component for a list of objects
function ObjectColumn({
  items,
  selectedId,
  onSelect,
  onShowDetails,
  onEdit,
  onDelete,
  level,
}: {
  items: ObjectItem[]
  selectedId: string | null
  onSelect: (item: ObjectItem) => void
  onShowDetails: (item: ObjectItem) => void
  onEdit: (item: ObjectItem) => void
  onDelete: (item: ObjectItem) => void
  level: number
}) {
  // Get icon based on object type
  const getIcon = (item: ObjectItem) => {
    const name = item.name?.toLowerCase() || ''

    if (name.includes('building') || name.includes('house'))
      return <Building2 size={16} />
    if (name.includes('floor')) return <Layers size={16} />
    if (name.includes('room')) return <Package size={16} />
    if (name.includes('wall')) return <Layers size={16} />
    if (name.includes('door')) return <DoorClosed size={16} />
    if (name.includes('window')) return <Wind size={16} />
    if (name.includes('kitchen')) return <Package size={16} />

    return <FileText size={16} />
  }

  return (
    <div className="flex-1 min-w-[250px] max-w-[300px] h-full border-r overflow-hidden flex flex-col">
      <div className="p-2 border-b bg-muted/20 text-xs text-muted-foreground">
        {items.length} items
      </div>

      <ScrollArea className="flex-1">
        <div className="px-1 py-2">
          {items.map((item) => {
            const isSelected = item.uuid === selectedId
            const hasChildren = item.children && item.children.length > 0
            const model = item.modelUuid
              ? { name: item.modelName, version: item.modelVersion }
              : null

            return (
              <div
                key={item.uuid}
                className={`
                  flex items-center justify-between p-2 rounded-md cursor-pointer mb-1
                  ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                `}
                onClick={() => onSelect(item)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="rounded-full w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 mr-2 shrink-0">
                    {getIcon(item)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>

                    {model && (
                      <span className="text-xs text-muted-foreground truncate">
                        {model.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onShowDetails(item)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {hasChildren && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// Object details sheet
function ObjectDetailsSheet({
  item,
  isOpen,
  onClose,
  availableModels,
  onViewFull,
  onEdit,
  onDelete,
  onPropertyClick,
}: {
  item: ObjectItem | null
  isOpen: boolean
  onClose: () => void
  availableModels: any[]
  onViewFull: (item: ObjectItem) => void
  onEdit: (item: ObjectItem) => void
  onDelete: (item: ObjectItem) => void
  onPropertyClick: (property: any) => void
}) {
  if (!item) return null

  // Find model if applicable
  const model = item.modelUuid
    ? availableModels.find((m) => m.uuid === item.modelUuid)
    : null

  // Format property value for display
  const formatPropertyValue = (property: any) => {
    // Handle property format with values array
    if (property.values && property.values.length > 0) {
      const values = property.values.map((v: any) => v.value).filter(Boolean)
      return values.join(', ')
    }

    // Handle old property format
    if (typeof property.value === 'string') {
      return property.value
    }

    return 'N/A'
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle>{item.name}</SheetTitle>
          </div>
          <SheetDescription>
            {model && (
              <Badge variant="outline">
                {model.name} v{model.version}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {/* Metadata Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium">UUID</div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {item.uuid}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                {item.children && (
                  <div>
                    <div className="text-sm font-medium">Children</div>
                    <div className="text-sm text-muted-foreground">
                      {item.children.length} items
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Properties
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewFull(item)}
                >
                  Manage Properties
                </Button>
              </div>
              {item.properties && item.properties.length > 0 ? (
                <div className="space-y-2">
                  {item.properties.map((prop, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 gap-2 py-1 border-b border-muted last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => onPropertyClick(prop)}
                    >
                      <div className="font-medium text-sm">{prop.key}</div>
                      <div className="col-span-2 text-sm">
                        {formatPropertyValue(prop)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                  No properties defined for this object
                </div>
              )}
            </div>

            {/* Files Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Files
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewFull(item)}
                >
                  Manage Files
                </Button>
              </div>
              {item.files && item.files.length > 0 ? (
                <div className="space-y-2">
                  {item.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-muted last:border-0"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {file.size}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                  No files attached to this object
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 flex justify-end">
          <SheetClose asChild>
            <Button className="w-full" onClick={onClose}>
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Path breadcrumb component
function PathBreadcrumb({
  path,
  onNavigate,
}: {
  path: ObjectItem[]
  onNavigate: (index: number) => void
}) {
  return (
    <div className="flex items-center space-x-1 overflow-x-auto p-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 shrink-0"
        onClick={() => onNavigate(-1)}
      >
        Root
      </Button>

      {path.map((item, index) => (
        <div key={item.uuid} className="flex items-center shrink-0">
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => onNavigate(index)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  )
}

export function ObjectColumnsView({
  data,
  availableModels,
  onViewObject,
  onEditObject,
  onSaveObject,
}: ObjectColumnsViewProps) {
  const [columns, setColumns] = useState<ObjectItem[][]>([data])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [path, setPath] = useState<ObjectItem[]>([])

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [objectToDelete, setObjectToDelete] = useState<ObjectItem | null>(null)

  // Update root column when data changes
  useEffect(() => {
    setColumns([data])
    setSelectedIds([])
    setPath([])
  }, [data])

  // Handle item selection in a column
  const handleSelectItem = (item: ObjectItem, columnIndex: number) => {
    // Update selected IDs up to this column
    const newSelectedIds = [...selectedIds.slice(0, columnIndex), item.uuid]
    setSelectedIds(newSelectedIds)

    // Update path
    const newPath = [...path.slice(0, columnIndex), item]
    setPath(newPath)

    // If item has children, add a new column
    if (item.children && item.children.length > 0) {
      setColumns([...columns.slice(0, columnIndex + 1), item.children])
    } else {
      // No children, so trim columns
      setColumns(columns.slice(0, columnIndex + 1))
    }
  }

  // Show details for an item
  const handleShowDetails = (item: ObjectItem) => {
    if (onViewObject) {
      onViewObject(item)
    }
  }

  const handleEdit = (item: ObjectItem) => {
    if (onEditObject) {
      onEditObject(item)
    }
  }

  const handleDelete = (item: ObjectItem) => {
    setObjectToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Delete logic would go here
    console.log('Deleting object:', objectToDelete?.uuid)
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Columns container */}
        <div className="border rounded-md overflow-hidden flex-1">
          <div className="flex h-full overflow-x-auto">
            {columns.map((items, index) => (
              <ObjectColumn
                key={index}
                items={items}
                selectedId={selectedIds[index] || null}
                onSelect={(item) => handleSelectItem(item, index)}
                onShowDetails={handleShowDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                level={index}
              />
            ))}

            {/* Empty state for when no columns have content */}
            {columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                <div>
                  <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Objects Found</h3>
                  <p className="text-sm">
                    Try refining your search or adding new objects
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use the reusable DeleteConfirmationDialog */}
      {objectToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          objectName={objectToDelete.name}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  )
}
