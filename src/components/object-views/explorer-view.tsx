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
  Search,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react'

import {
  Button,
  Input,
  Badge,
  ScrollArea,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui'
import {
  PropertyDetailsModal,
  DeleteConfirmationDialog,
} from '@/components/modals'
import { useObjects, usePropertyEditor, usePropertyManagement } from '@/hooks'
import { useIobClient } from '@/providers/query-provider'

// Define interfaces for our data
interface Property {
  uuid: string
  key: string
  value?: string
  values?: { uuid?: string; value: string }[]
  label?: string
  description?: string
  type?: string
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
  softDeleted?: boolean
  softDeletedAt?: string
  softDeleteBy?: string
  lastUpdatedAt?: string
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
  onSaveObject?: (object: any) => void
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
  const isDeleted = isObjectDeleted(item)

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
        className={`flex items-center px-2 py-2.5 hover:bg-muted/50 cursor-pointer rounded-sm ${
          isSelected ? 'bg-muted' : ''
        }`}
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

          <span
            className={`text-sm truncate ${isDeleted ? 'line-through text-destructive' : ''}`}
          >
            {item.name}
          </span>

          {isDeleted && (
            <span className="ml-2 text-xs text-destructive">(Deleted)</span>
          )}

          {model && (
            <Badge variant="outline" className="ml-2 text-xs py-0 h-4">
              {model.name}
            </Badge>
          )}
        </div>
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

// Check if an object is soft deleted based on system properties
const isObjectDeleted = (object: any) => {
  // Direct check for softDeleted flag on the object
  return object?.softDeleted === true
}

// Function to get deleted metadata for an object
const getDeletedMetadata = (object: any) => {
  if (!object) return null

  // Get deletion metadata directly from object properties
  return {
    deletedAt: object.softDeletedAt || null,
    deletedBy: object.softDeleteBy || null,
  }
}

// Object details panel
function DetailsPanel({
  item,
  availableModels,
  onViewDetails,
  onEdit,
  onDelete,
  onPropertyClick,
  onSaveObject,
}: DetailsPanelProps) {
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  // Use the iob-client hooks
  const { useFullObject } = useObjects()
  const client = useIobClient()
  const { property: editedProperty } = usePropertyEditor(selectedProperty)

  // Use our new property management hook
  const { updatePropertyWithValues, isLoading: isPropertyUpdateLoading } =
    usePropertyManagement(item?.uuid)

  // State for processed object data
  const [files, setFiles] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [objectHistory, setObjectHistory] = useState<ObjectItem[]>([])

  // Fetch full object data when an item is selected
  const { data: fullObjectData, isLoading } = useFullObject(item?.uuid || '', {
    enabled: !!item?.uuid,
  })

  // Process the fetched object data
  useEffect(() => {
    if (!fullObjectData) return

    // Extract all object versions and sort by date (newest first)
    const objects = Array.isArray(fullObjectData.object)
      ? fullObjectData.object
      : [fullObjectData.object]
    const sortedObjects = objects.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Set history to all but the first object
    setObjectHistory(sortedObjects.slice(1))

    // Process properties
    const processedProperties =
      fullObjectData.properties?.map((propGroup: any) => {
        // Extract property metadata from the first property item
        const propMeta = propGroup.property?.[0] || {}

        // Extract and combine all values
        const values =
          propGroup.values?.flatMap(
            (valueObj: any) => valueObj.value?.map((val: any) => val) || []
          ) || []

        return {
          ...propMeta,
          values,
        }
      }) || []

    setProperties(processedProperties)

    // Process files
    setFiles(fullObjectData.files || [])
  }, [fullObjectData])

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
    // Handle property with values array in new structure
    if (property.values && property.values.length > 0) {
      return property.values
        .filter((v: any) => v && v.value && !v.softDeleted)
        .map((v: any) => v.value)
        .join(', ')
    }

    // Handle property with single value
    if (typeof property.value === 'string') {
      return property.value
    }

    return ''
  }

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyDetailsOpen(true)
    if (onPropertyClick) {
      onPropertyClick(property)
    }
  }

  const handleSaveProperty = async () => {
    if (!selectedProperty || !item) return

    try {
      // Save the property using our new comprehensive hook
      if (editedProperty) {
        // Use a type assertion to handle additional properties
        const propertyData = {
          uuid: selectedProperty.uuid,
          key: editedProperty.key,
        } as any

        // Add optional fields if they exist in the edited property
        if ((editedProperty as any).label) {
          propertyData.label = (editedProperty as any).label
        }
        if ((editedProperty as any).description) {
          propertyData.description = (editedProperty as any).description
        }
        if ((editedProperty as any).type) {
          propertyData.type = (editedProperty as any).type
        }

        await updatePropertyWithValues(
          propertyData,
          editedProperty.values || []
        )

        // Refresh the object data after updates
        if (onSaveObject && item) {
          // Since we updated properties directly via API, we should refetch the object
          const response = await client.objects.getFullObject(item.uuid)
          if (response.data) {
            onSaveObject(response.data)
          }
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
    }

    setIsPropertyDetailsOpen(false)
  }

  const isDeleted = isObjectDeleted(item)
  const deletedMetadata = isDeleted ? getDeletedMetadata(item) : null

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8">
          {/* Header with actions */}
          <div className="flex justify-between items-start">
            <div>
              <span className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                {isDeleted && (
                  <Badge className="mt-1 ml-2 bg-destructive">Deleted</Badge>
                )}
              </span>
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
              {!isDeleted && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
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
                      {item?.lastUpdatedAt &&
                        new Date(item.lastUpdatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Deletion Metadata */}
                {isDeleted && deletedMetadata && (
                  <div className="mt-4 bg-destructive/10 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-destructive mb-2">
                      Deletion Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {deletedMetadata.deletedAt && (
                        <div>
                          <div className="text-sm font-medium">Deleted At</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              deletedMetadata.deletedAt
                            ).toLocaleString()}
                          </div>
                        </div>
                      )}
                      {deletedMetadata.deletedBy && (
                        <div>
                          <div className="text-sm font-medium">Deleted By</div>
                          <div
                            className="text-sm text-muted-foreground"
                            aria-label={deletedMetadata.deletedBy}
                            title={deletedMetadata.deletedBy}
                          >
                            {deletedMetadata.deletedBy.substring(0, 30) + '...'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Properties
              </h3>
            </div>

            {isLoading ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading properties...
                  </span>
                </div>
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-2">
                {properties.map((prop, idx) => (
                  <div
                    key={prop.uuid || idx}
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
            </div>

            {isLoading ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading files...
                  </span>
                </div>
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 border-b border-muted last:border-0"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{file.label || file.name}</span>
                    </div>
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

          {/* Object History Section */}
          {objectHistory && objectHistory.length > 0 && (
            <div>
              <Collapsible
                open={isHistoryExpanded}
                onOpenChange={setIsHistoryExpanded}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center p-0 hover:bg-transparent"
                    >
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Object History ({objectHistory.length})
                      </h3>
                      {isHistoryExpanded ? (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-2" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-3">
                  {objectHistory.map((historyItem, index) => (
                    <div key={index} className="bg-muted/20 rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {historyItem.name}
                          {historyItem.softDeleted && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-destructive"
                            >
                              Deleted
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(historyItem.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {historyItem.description || 'No description'}
                      </div>
                      {historyItem.softDeleted && (
                        <div className="text-xs text-destructive mt-1">
                          Deleted:{' '}
                          {historyItem.softDeletedAt &&
                            new Date(
                              historyItem.softDeletedAt
                            ).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isPropertyDetailsOpen}
          onClose={() => setIsPropertyDetailsOpen(false)}
          onSave={handleSaveProperty}
        />
      )}
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

  // Modal states
  const [isFullDetailsModalOpen, setIsFullDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [objectToDelete, setObjectToDelete] = useState<ObjectItem | null>(null)

  // Use the iob-client hooks
  const { useDeleteObject, useAllObjects } = useObjects()

  // Get the delete mutation
  const { mutateAsync: deleteObject } = useDeleteObject()

  // Fetch the list of available objects for parent selection in edit mode
  const { data: availableObjects = [] } = useAllObjects({
    enabled: isEditModalOpen,
  })

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
      // Local fallback if parent doesn't provide edit handler
      setSelectedItem(item)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (item: ObjectItem) => {
    setObjectToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async (uuid: string) => {
    try {
      await deleteObject(uuid)
      // Remove the deleted object from the local state or refresh data
      console.log('Object deleted successfully:', uuid)
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting object:', error)
    }
  }

  const handlePropertyClick = (property: any) => {
    // This method is now implemented in the DetailsPanel component
    // It's kept here as a simple pass-through to maintain API compatibility
    console.log('Property clicked:', property)
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
            onSaveObject={onSaveObject}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
