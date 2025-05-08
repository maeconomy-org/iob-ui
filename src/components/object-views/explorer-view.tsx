'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Package,
  Building2,
  DoorClosed,
  Wind,
  Layers,
  FileText,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react'

import {
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from '@/components/ui'
import {
  PropertyDetailsModal,
  PropertyManagementModal,
  FileManagementModal,
  DeleteConfirmationDialog,
} from '@/components/modals'

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
  abbreviation?: string
  version?: string
  description?: string
  properties?: Property[]
  children?: ObjectItem[]
  createdAt: string
  updatedAt: string
  files?: any[]
}

interface TreeItemProps {
  item: ObjectItem
  level?: number
  expandedItems: string[]
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>
  selectedItem: ObjectItem | null
  setSelectedItem: React.Dispatch<React.SetStateAction<ObjectItem | null>>
  availableModels: any[]
  onViewDetails: (item: ObjectItem) => void
  onEdit: (item: ObjectItem) => void
  onDelete: (item: ObjectItem) => void
}

interface DetailsPanelProps {
  item: ObjectItem | null
  availableModels: any[]
  onViewDetails: (item: ObjectItem) => void
  onEdit: (item: ObjectItem) => void
  onDelete: (item: ObjectItem) => void
  onPropertyClick: (property: any) => void
}

interface ObjectExplorerViewProps {
  data: any[]
  availableModels: any[]
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
}

// Tree item component
function TreeItem({
  item,
  level = 0,
  expandedItems,
  setExpandedItems,
  selectedItem,
  setSelectedItem,
  availableModels,
  onViewDetails,
  onEdit,
  onDelete,
}: TreeItemProps) {
  const isExpanded = expandedItems.includes(item.uuid)
  const isSelected = selectedItem?.uuid === item.uuid
  const hasChildren = item.children && item.children.length > 0
  const indent = level * 16

  // Find model info if applicable
  const model = item.modelUuid
    ? availableModels.find((m) => m.uuid === item.modelUuid)
    : null

  // Get icon based on object type
  const getIcon = () => {
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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedItems((prev) =>
      isExpanded ? prev.filter((id) => id !== item.uuid) : [...prev, item.uuid]
    )
  }

  const handleSelect = () => {
    setSelectedItem(item)
  }

  return (
    <>
      <div
        className={`flex items-center px-2 py-1.5 hover:bg-muted/50 cursor-pointer rounded-sm ${isSelected ? 'bg-muted' : ''}`}
        onClick={handleSelect}
      >
        <div
          style={{ marginLeft: `${indent}px` }}
          className="flex items-center flex-1"
        >
          {hasChildren ? (
            <button
              onClick={toggleExpand}
              className="mr-1 h-5 w-5 hover:bg-muted rounded-sm flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div className="rounded-full w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 mr-2">
            {getIcon()}
          </div>

          <span className="text-sm truncate">{item.name}</span>

          {model && (
            <Badge variant="outline" className="ml-2 text-xs py-0 h-4">
              {model.name}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(item)}>
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
      </div>

      {isExpanded && hasChildren && (
        <div>
          {item.children?.map((child) => (
            <TreeItem
              key={child.uuid}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              availableModels={availableModels}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  )
}

// Object details panel
function DetailsPanel({
  item,
  availableModels,
  onEdit,
  onDelete,
  onPropertyClick,
}: DetailsPanelProps) {
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false)
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  if (!item) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No Object Selected</h3>
        <p className="text-sm">
          Select an object from the explorer to view its details
        </p>
      </div>
    )
  }

  // Find model if applicable
  const model = item.modelUuid
    ? availableModels.find((m) => m.uuid === item.modelUuid)
    : null

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

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyDetailsOpen(true)
    if (onPropertyClick) {
      onPropertyClick(property)
    }
  }

  const handleSaveProperty = () => {
    setIsPropertyDetailsOpen(false)
  }

  const handleSaveObject = () => {
    // In view-only mode, we don't need to do anything
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8">
          {/* Header with actions */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              {model && (
                <Badge className="mt-1">
                  {model.name} v{model.version}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(item)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Details
            </h3>
            <div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium">UUID</div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {item?.uuid}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-sm text-muted-foreground">
                      {item?.name}
                    </div>
                  </div>
                  {item?.abbreviation && (
                    <div>
                      <div className="text-sm font-medium">Abbreviation</div>
                      <div className="text-sm text-muted-foreground">
                        {item?.abbreviation}
                      </div>
                    </div>
                  )}
                  {item?.version && (
                    <div>
                      <div className="text-sm font-medium">Version</div>
                      <div className="text-sm text-muted-foreground">
                        {item?.version}
                      </div>
                    </div>
                  )}
                  {item?.description && (
                    <div>
                      <div className="text-sm font-medium">Description</div>
                      <div className="text-sm text-muted-foreground">
                        {item?.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-muted-foreground">
                      {item?.createdAt &&
                        new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {item?.updatedAt &&
                        new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
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
                onClick={() => setIsPropertyModalOpen(true)}
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
                    onClick={() => handlePropertyClick(prop)}
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
                onClick={() => setIsFileModalOpen(true)}
              >
                Manage Files
              </Button>
            </div>

            {item.files && item.files.length > 0 ? (
              <div className="space-y-2">
                {item.files.map((file: any, idx: number) => (
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

          {/* Model Section (if applicable) */}
          {model && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Model Details
              </h3>
              <div className="space-y-2 bg-primary/5 rounded-md p-3">
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Name</div>
                  <div className="col-span-2 text-sm">{model.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Abbreviation</div>
                  <div className="col-span-2 text-sm">{model.abbreviation}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Version</div>
                  <div className="col-span-2 text-sm">{model.version}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Description</div>
                  <div className="col-span-2 text-sm">
                    {model.description || 'No description'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Created By</div>
                  <div className="col-span-2 text-sm">{model.creator}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                  <div className="font-medium text-sm">Created At</div>
                  <div className="col-span-2 text-sm">
                    {new Date(model.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Property Management Modal */}
      <PropertyManagementModal
        object={item}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveObject}
        onViewPropertyDetails={handlePropertyClick}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isPropertyDetailsOpen}
          onClose={() => setIsPropertyDetailsOpen(false)}
          onSave={handleSaveProperty}
        />
      )}

      {/* File Management Modal */}
      <FileManagementModal
        object={item}
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSave={handleSaveObject}
      />
    </>
  )
}

export function ObjectExplorerView({
  data,
  availableModels,
  onViewObject,
  onEditObject,
  onSaveObject,
}: ObjectExplorerViewProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ObjectItem | null>(null)
  const [search, setSearch] = useState('')
  const [allExpanded, setAllExpanded] = useState(false)

  // Modal states
  const [isFullDetailsModalOpen, setIsFullDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [objectToDelete, setObjectToDelete] = useState<ObjectItem | null>(null)

  // Initialize with root objects expanded
  useEffect(() => {
    // Root IDs for initial expansion
    const rootIds = data.map((obj) => obj.uuid)
    setExpandedItems(rootIds)
    setAllExpanded(true)
  }, [data])

  // Filter objects based on search
  const filteredObjects = useMemo(() => {
    if (!search.trim()) return data

    // Simple recursive search function
    const filterByName = (
      objects: ObjectItem[],
      term: string
    ): ObjectItem[] => {
      return objects
        .filter((obj) => {
          const nameMatch = obj.name.toLowerCase().includes(term.toLowerCase())
          const childrenMatch =
            obj.children && obj.children.length > 0
              ? filterByName(obj.children, term).length > 0
              : false

          return nameMatch || childrenMatch
        })
        .map((obj) => {
          if (!obj.children) return obj

          return {
            ...obj,
            children: filterByName(obj.children, term),
          }
        })
    }

    return filterByName(data, search)
  }, [search, data])

  // Handle expand/collapse all
  const toggleExpandAll = () => {
    if (allExpanded) {
      // Collapse all
      setExpandedItems([])
    } else {
      // Expand all - collect all object IDs with children recursively
      const getAllIds = (items: ObjectItem[]): string[] => {
        return items.reduce((acc: string[], item) => {
          if (item.children && item.children.length > 0) {
            return [...acc, item.uuid, ...getAllIds(item.children)]
          }
          return acc
        }, [])
      }
      setExpandedItems(getAllIds(data))
    }
    setAllExpanded(!allExpanded)
  }

  // Handler functions
  const handleViewDetails = (item: ObjectItem) => {
    if (onViewObject) {
      onViewObject(item)
    } else {
      setSelectedItem(item)
      setIsFullDetailsModalOpen(true)
    }
  }

  const handleEdit = (item: ObjectItem) => {
    if (onEditObject) {
      onEditObject(item)
    } else {
      setSelectedItem(item)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (item: ObjectItem) => {
    setObjectToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = (uuid: string) => {
    // Implement delete logic here
    console.log('Deleting object:', uuid)
    // You would typically update your data state here
  }

  const handlePropertyClick = (property: any) => {
    // This method is now implemented in the DetailsPanel component
    // It's kept here as a simple pass-through to maintain API compatibility
    console.log('Property clicked:', property)
  }

  const handleSaveObject = (updatedObject: ObjectItem) => {
    if (onSaveObject) {
      onSaveObject(updatedObject)
    }
    setIsEditModalOpen(false)
  }

  return (
    <>
      <div className="flex space-x-4 h-[calc(100vh-180px)]">
        {/* Left side: Explorer tree */}
        <div className="w-1/3 border rounded-md flex flex-col">
          <div className="p-2 border-b flex justify-between items-center">
            <div className="relative flex-1 mr-2">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search objects..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpandAll}
              title={allExpanded ? 'Collapse all' : 'Expand all'}
            >
              {allExpanded ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-1">
            {filteredObjects.length > 0 ? (
              filteredObjects.map((item) => (
                <TreeItem
                  key={item.uuid}
                  item={item}
                  expandedItems={expandedItems}
                  setExpandedItems={setExpandedItems}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  availableModels={availableModels}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No objects found
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground">
            {filteredObjects.length} root objects
          </div>
        </div>

        {/* Right side: Details panel */}
        <div className="w-2/3 border rounded-md overflow-hidden flex flex-col">
          <DetailsPanel
            item={selectedItem}
            availableModels={availableModels}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPropertyClick={handlePropertyClick}
          />
        </div>
      </div>

      {isDeleteModalOpen && objectToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          objectName={objectToDelete.name}
          onDelete={() => handleDeleteConfirm(objectToDelete.uuid)}
        />
      )}
    </>
  )
}
