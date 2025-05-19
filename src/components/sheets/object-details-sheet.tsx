'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react'

import { PropertyDetailsModal } from '@/components/modals'
import {
  Badge,
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui'
import { useObjects, usePropertyManagement } from '@/hooks'

interface ObjectSheetProps {
  isOpen: boolean
  onClose: () => void
  object?: any // Optional fallback object data
  uuid?: string // Object UUID to fetch from API
  availableModels: any[]
  onDelete?: (objectId: string) => void
  onEdit?: () => void
  isDeleted?: boolean
  onSave?: (object: any, originalObject?: any) => void
}

export function ObjectDetailsSheet({
  isOpen,
  onClose,
  object: initialObject,
  uuid,
  availableModels = [],
  onDelete,
  onEdit,
  isDeleted,
  onSave,
}: ObjectSheetProps) {
  // Get the useFullObject hook to fetch the complete object data
  const { useFullObject } = useObjects()

  // Fetch the full object details if a UUID is provided
  const { data: fullObjectData, isLoading } = useFullObject(uuid || '', {
    enabled: !!uuid && isOpen,
  })

  // Process object data to get the latest version and proper property structure
  const { object, properties, files, objectHistory } = useMemo(() => {
    if (!fullObjectData) {
      return {
        object: initialObject,
        properties: [],
        files: [],
        objectHistory: [],
      }
    }

    // Extract all object versions and sort by date (newest first)
    const objects = Array.isArray(fullObjectData.object)
      ? fullObjectData.object
      : [fullObjectData.object]
    const sortedObjects = objects.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Always get the latest object (regardless of deletion status)
    const latestObject = sortedObjects[0]

    // All other objects (for history)
    const history = sortedObjects.slice(1)

    // Process properties to correct format
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

    // Process files
    const processedFiles = fullObjectData.files || []

    return {
      object: latestObject,
      properties: processedProperties,
      files: processedFiles,
      objectHistory: history,
    }
  }, [fullObjectData, initialObject])

  // State for property and file management
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false)

  // Exit early if no object and still loading
  if (!object && isOpen && !isLoading) {
    return null
  }

  // Find model data if applicable
  const model = object?.modelUuid
    ? availableModels.find((m) => m.uuid === object.modelUuid)
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
  }

  // Use our new property management hook instead
  const { updatePropertyWithValues, isLoading: isPropertyUpdateLoading } =
    usePropertyManagement(object?.uuid)

  const handleSaveProperty = async (updatedProperty: any) => {
    console.log('updatedProperty', updatedProperty)

    try {
      // Use our more comprehensive hook to update the property
      await updatePropertyWithValues(
        {
          uuid: updatedProperty.uuid,
          key: updatedProperty.key,
          // Include optional metadata if available
          ...(updatedProperty.label && { label: updatedProperty.label }),
          ...(updatedProperty.description && {
            description: updatedProperty.description,
          }),
          ...(updatedProperty.type && { type: updatedProperty.type }),
        },
        // Include all values from the property
        updatedProperty.values || []
      )

      // Find the property in the object's properties array
      const updatedProperties = properties.map((prop: any) =>
        prop.uuid === updatedProperty.uuid ? updatedProperty : prop
      )

      console.log('updatedProperties', updatedProperties)

      // Create updated object with the modified properties
      const updatedObject = {
        ...object,
        properties: updatedProperties,
      }

      console.log('updatedObject', updatedObject)

      // Call the parent's save function if provided
      if (onSave) {
        onSave(updatedObject)
      }
    } catch (error) {
      console.error('Error updating property:', error)
    }

    setIsPropertyDetailsOpen(false)
  }

  const isObjectDeleted = object?.softDeleted || isDeleted

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <span className="flex items-center gap-2">
              <SheetTitle>{object?.name}</SheetTitle>
              {isObjectDeleted && <Badge variant="destructive">Deleted</Badge>}
            </span>
            {model && (
              <SheetDescription>
                <Badge variant="outline">
                  {model.name} {model.version && `v${model.version}`}
                </Badge>
              </SheetDescription>
            )}
          </SheetHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 py-6">
              {/* Metadata Section */}
              <div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-sm font-medium">UUID</div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {object?.uuid}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-medium">Name</div>
                      <div className="text-sm text-muted-foreground">
                        {object?.name}
                      </div>
                    </div>
                    {object?.abbreviation && (
                      <div>
                        <div className="text-sm font-medium">Abbreviation</div>
                        <div className="text-sm text-muted-foreground">
                          {object?.abbreviation}
                        </div>
                      </div>
                    )}
                    {object?.version && (
                      <div>
                        <div className="text-sm font-medium">Version</div>
                        <div className="text-sm text-muted-foreground">
                          {object?.version}
                        </div>
                      </div>
                    )}
                    {object?.description && (
                      <div>
                        <div className="text-sm font-medium">Description</div>
                        <div className="text-sm text-muted-foreground">
                          {object?.description}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {object?.createdAt &&
                          new Date(object.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {object?.lastUpdatedAt && (
                      <div>
                        <div className="text-sm font-medium">Updated</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(object.lastUpdatedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {/* Display soft delete metadata if object is deleted */}
                    {isObjectDeleted && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-destructive">
                            Deleted At
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {object?.softDeletedAt &&
                              new Date(object.softDeletedAt).toLocaleString()}
                          </div>
                        </div>
                        {object?.softDeleteBy && (
                          <div>
                            <div className="text-sm font-medium text-destructive">
                              Deleted By
                            </div>
                            <div
                              className="text-sm text-muted-foreground font-mono"
                              title={object.softDeleteBy}
                              aria-label={object.softDeleteBy}
                            >
                              {object.softDeleteBy.substring(
                                object.softDeleteBy.length - 30
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Properties Section */}
              <Separator />
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Properties
                  </h3>
                </div>

                {properties && properties.length > 0 ? (
                  <div className="space-y-2">
                    {properties.map((prop: any, idx: number) => (
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
              <Separator />
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Files
                  </h3>
                </div>

                {files && files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-muted last:border-0"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {file.label || file.name}
                          </span>
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
                <>
                  <Separator />
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
                        <div className="col-span-2 text-sm">
                          {model.abbreviation || 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                        <div className="font-medium text-sm">Version</div>
                        <div className="col-span-2 text-sm">
                          {model.version || 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                        <div className="font-medium text-sm">Description</div>
                        <div className="col-span-2 text-sm">
                          {model.description || 'No description'}
                        </div>
                      </div>
                      {model.creator && (
                        <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                          <div className="font-medium text-sm">Created By</div>
                          <div className="col-span-2 text-sm">
                            {model.creator}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Object History Section */}
              {objectHistory && objectHistory.length > 0 && (
                <>
                  <Separator />
                  <Collapsible
                    open={isHistoryOpen}
                    onOpenChange={setIsHistoryOpen}
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
                          {isHistoryOpen ? (
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
                </>
              )}
            </div>
          )}

          <SheetFooter className="border-t pt-4">
            <div className="flex w-full justify-between items-center gap-2">
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDelete(object?.uuid)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2">
                {onEdit && (
                  <Button type="button" variant="outline" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button type="button" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
