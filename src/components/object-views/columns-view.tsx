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

import {
  Button,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { DeleteConfirmationDialog } from '@/components/modals'

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
  softDeleted?: boolean
  softDeletedAt?: string
  softDeleteBy?: string
  description?: string
}

// Define type for history items
interface HistoryItem {
  uuid: string
  name: string
  createdAt: string
  description?: string
  softDeleted?: boolean
  softDeletedAt?: string
  [key: string]: any
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
