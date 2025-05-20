'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react'

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
  Input,
  Textarea,
  Label,
  EditableSection,
} from '@/components/ui'
import { PropertySectionEditor } from '@/components/properties'
import { useObjects, usePropertyManagement } from '@/hooks'
import { formatPropertyValue } from '@/lib/object-utils'

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
  const { useFullObject, useUpdateObjectMetadata, useDeleteObject } =
    useObjects()

  // Get the specialized metadata update mutation
  const updateObjectMetadataMutation = useUpdateObjectMetadata()

  // Get delete mutation
  const deleteObjectMutation = useDeleteObject()

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

    // Process properties to correct format - filter out soft-deleted ones
    const processedProperties =
      fullObjectData.properties
        ?.map((propGroup: any) => {
          // Extract property metadata from the first property item that's not soft-deleted
          const propItems = propGroup.property || []
          const validPropItems = propItems.filter(
            (item: any) => !item.softDeleted
          )
          const propMeta =
            validPropItems.length > 0 ? validPropItems[0] : propItems[0] || {}

          // Extract and combine all values that are not soft-deleted
          const values =
            propGroup.values?.flatMap((valueObj: any) => {
              // Filter out soft-deleted value objects
              if (valueObj.softDeleted) return []
              // Get non-soft-deleted values from each value object
              return (
                valueObj.value
                  ?.filter((val: any) => !val.softDeleted)
                  .map((val: any) => val) || []
              )
            }) || []

          // Skip entirely soft-deleted properties
          if (propMeta.softDeleted) {
            return null
          }

          return {
            ...propMeta,
            values,
          }
        })
        .filter(Boolean) || []

    // Process files - filter out soft-deleted ones
    const processedFiles = (fullObjectData.files || []).filter(
      (file: any) => !file.softDeleted
    )

    return {
      object: latestObject,
      properties: processedProperties,
      files: processedFiles,
      objectHistory: history,
    }
  }, [fullObjectData, initialObject])

  // State for property and file management
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Section editing states - combined into a single activeEditingSection state
  const [activeEditingSection, setActiveEditingSection] = useState<
    string | null
  >(null)
  const isMetadataEditing = activeEditingSection === 'metadata'
  const isPropertiesEditing = activeEditingSection === 'properties'

  // State for expanded property in view mode
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(
    null
  )

  // Temporary editing states
  const [editedObject, setEditedObject] = useState<any>(null)
  const [editedProperties, setEditedProperties] = useState<any[]>([])

  // Set up initial editing states when object changes
  useMemo(() => {
    if (object) {
      setEditedObject({ ...object })
      setEditedProperties(properties || [])
    }
  }, [object, properties])

  // Exit early if no object and still loading
  if (!object && isOpen && !isLoading) {
    return null
  }

  // Find model data if applicable
  const model = object?.modelUuid
    ? availableModels.find((m) => m.uuid === object.modelUuid)
    : null

  // Use our property management hook
  const {
    updatePropertyWithValues,
    createPropertyForObject,
    removePropertyFromObject,
    isLoading: isPropertyUpdateLoading,
  } = usePropertyManagement(object?.uuid)

  // Function to toggle property expansion
  const togglePropertyExpansion = (propertyId: string) => {
    setExpandedPropertyId((prevId) =>
      prevId === propertyId ? null : propertyId
    )
  }

  // Handle saving changes to object metadata
  const handleSaveMetadata = async (): Promise<void> => {
    if (!editedObject || !object) return

    try {
      // Check if anything has actually changed before calling onSave
      const hasChanged =
        editedObject.name !== object.name ||
        editedObject.abbreviation !== object.abbreviation ||
        editedObject.version !== object.version ||
        editedObject.description !== object.description

      if (!hasChanged) {
        // No changes, just close the editing mode
        setActiveEditingSection(null)
        return
      }

      // Show a single toast for the operation
      const toastId = 'update-metadata-' + Date.now()
      toast.loading('Updating object metadata...', { id: toastId })

      try {
        // Call the API to update metadata
        await updateObjectMetadataMutation.mutateAsync({
          uuid: object.uuid,
          name: editedObject.name,
          abbreviation: editedObject.abbreviation,
          version: editedObject.version,
          description: editedObject.description,
        })

        // Show success toast
        toast.success('Object metadata updated successfully', { id: toastId })

        // Exit edit mode
        setActiveEditingSection(null)
      } catch (error) {
        // Show error toast
        toast.error('Failed to update object metadata', { id: toastId })
        console.error('Error saving metadata:', error)
      }
    } catch (error) {
      console.error('Error in metadata update process:', error)
      toast.error('Failed to process metadata updates')
    }
  }

  // Handle saving changes to properties
  const handleSaveProperties = async (): Promise<void> => {
    if (!editedProperties || !object) return

    try {
      // Create an array of properties that need to be updated
      const propertiesToUpdate = editedProperties.filter((prop) => {
        // Check if the property has been flagged as modified, deleted, or is new
        if (prop._isNew || prop._deleted || prop._modified) {
          return true
        }

        // Additional check: compare with original properties
        const originalProp = properties.find((p) => p.uuid === prop.uuid)
        if (!originalProp) return false

        // Check if key has changed
        if (prop.key !== originalProp.key) return true

        // Check if values have changed
        if (prop.values?.length !== originalProp.values?.length) return true

        // Check if any value content has changed
        const valuesChanged = prop.values?.some((val: any, i: number) => {
          const origVal = originalProp.values?.[i]
          return !origVal || val.value !== origVal.value
        })

        return valuesChanged
      })

      // If no changes, just close the editing mode
      if (propertiesToUpdate.length === 0) {
        setActiveEditingSection(null)
        return
      }

      // Show a single toast for the entire operation
      let toastId = 'update-properties-' + Date.now()
      toast.loading('Updating object properties...', { id: toastId })

      try {
        // Create an array to track all API operations
        const operations = []

        // Process each property that needs updating
        for (const property of propertiesToUpdate) {
          if (property._deleted) {
            // Delete property if marked for deletion
            operations.push(
              removePropertyFromObject(object.uuid, property.uuid)
            )
          } else if (property._isNew) {
            // Create new property with only key and values
            // Filter out any empty values
            const nonEmptyValues = (property.values || []).filter(
              (val: any) =>
                // Skip empty values
                val.value !== undefined &&
                val.value !== '' &&
                // Skip values marked as needing input (from the collapsible-property component)
                val._needsInput !== true
            )

            operations.push(
              createPropertyForObject(object.uuid, {
                key: property.key,
                values: nonEmptyValues,
              })
            )
          } else {
            // Update existing property - don't rely on _modified flag exclusively
            // Filter out any empty values
            const nonEmptyValues = (property.values || []).filter(
              (val: any) =>
                // Skip empty values
                val.value !== undefined &&
                val.value !== '' &&
                // Skip values marked as needing input (from the collapsible-property component)
                val._needsInput !== true
            )

            operations.push(
              updatePropertyWithValues(
                {
                  uuid: property.uuid,
                  key: property.key, // This will update the key/name
                },
                nonEmptyValues // Only include non-empty values
              )
            )
          }
        }

        // Wait for all operations to complete
        await Promise.all(operations)

        // Show success toast
        toast.success('Object properties updated successfully', { id: toastId })

        // Exit edit mode
        setActiveEditingSection(null)
      } catch (error) {
        // Show error toast
        toast.error('Failed to update object properties', { id: toastId })
        console.error('Error saving properties:', error)
      }
    } catch (error) {
      console.error('Error in property update process:', error)
      toast.error('Failed to process property updates')
    }
  }

  // Handle section edit toggling
  const handleEditToggle = (section: string, isEditing: boolean) => {
    if (isEditing) {
      // Activate this section
      setActiveEditingSection(section)
    } else {
      // Deactivate only if this section is active
      if (activeEditingSection === section) {
        setActiveEditingSection(null)
      }
    }
  }

  // Handle object deletion
  const handleDeleteObject = async (objectId: string) => {
    if (!objectId) return

    try {
      toast.promise(deleteObjectMutation.mutateAsync(objectId), {
        loading: 'Deleting object...',
        success: 'Object deleted successfully',
        error: 'Failed to delete object',
      })

      // Close the sheet after deletion
      onClose()
    } catch (error) {
      console.error('Error deleting object:', error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <span className="flex items-center gap-2">
              <SheetTitle>{object?.name}</SheetTitle>
              {(object?.softDeleted || isDeleted) && (
                <Badge variant="destructive">Deleted</Badge>
              )}
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
              {/* Metadata Section - Now Editable */}
              <EditableSection
                title="Object Metadata"
                isEditing={isMetadataEditing}
                onEditToggle={(isEditing) =>
                  handleEditToggle('metadata', isEditing)
                }
                onSave={handleSaveMetadata}
                successMessage="Object metadata updated successfully"
                showToast={false}
                renderDisplay={() => (
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
                          <div className="text-sm font-medium">
                            Abbreviation
                          </div>
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
                      {(object?.softDeleted || isDeleted) && (
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
                )}
                renderEdit={() => (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="object-name">Name</Label>
                      <Input
                        id="object-name"
                        value={editedObject?.name || ''}
                        onChange={(e) =>
                          setEditedObject({
                            ...editedObject,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="object-abbreviation">Abbreviation</Label>
                      <Input
                        id="object-abbreviation"
                        value={editedObject?.abbreviation || ''}
                        onChange={(e) =>
                          setEditedObject({
                            ...editedObject,
                            abbreviation: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="object-version">Version</Label>
                      <Input
                        id="object-version"
                        value={editedObject?.version || ''}
                        onChange={(e) =>
                          setEditedObject({
                            ...editedObject,
                            version: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="object-description">Description</Label>
                      <Textarea
                        id="object-description"
                        value={editedObject?.description || ''}
                        onChange={(e) =>
                          setEditedObject({
                            ...editedObject,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              />

              {/* Properties Section - Now uses PropertySectionEditor */}
              <Separator />
              <EditableSection
                title="Properties"
                isEditing={isPropertiesEditing}
                onEditToggle={(isEditing) =>
                  handleEditToggle('properties', isEditing)
                }
                onSave={handleSaveProperties}
                successMessage="Object properties updated successfully"
                showToast={false}
                renderDisplay={() => (
                  <div>
                    {properties && properties.length > 0 ? (
                      <div className="space-y-2">
                        {properties.map((prop: any, idx: number) => (
                          <div
                            key={prop.uuid || idx}
                            className="border rounded-md overflow-hidden"
                          >
                            {/* Property header - always visible */}
                            <div
                              className="grid grid-cols-3 gap-2 py-2 px-3 hover:bg-muted/20 cursor-pointer"
                              onClick={() =>
                                togglePropertyExpansion(
                                  prop.uuid || `idx-${idx}`
                                )
                              }
                            >
                              <div className="font-medium text-sm flex items-center">
                                <ChevronRight
                                  className={`h-4 w-4 mr-2 transition-transform ${
                                    expandedPropertyId ===
                                    (prop.uuid || `idx-${idx}`)
                                      ? 'rotate-90'
                                      : ''
                                  }`}
                                />
                                {prop.key}
                              </div>
                              <div className="col-span-2 text-sm">
                                {formatPropertyValue(prop)}
                              </div>
                            </div>

                            {/* Expanded content */}
                            {expandedPropertyId ===
                              (prop.uuid || `idx-${idx}`) && (
                              <div className="border-t bg-muted/10 px-4 py-3">
                                <div className="mb-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      UUID:
                                    </span>
                                    <span className="font-mono text-xs">
                                      {prop.uuid || 'Not set'}
                                    </span>
                                  </div>

                                  {prop.type && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">
                                        Type:
                                      </span>
                                      <span>{prop.type}</span>
                                    </div>
                                  )}

                                  {prop.description && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">
                                        Description:
                                      </span>
                                      <p className="mt-1">{prop.description}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Property Values Section */}
                                <div>
                                  <h4 className="font-medium mb-2">Values</h4>

                                  <div className="space-y-2">
                                    {(prop.values || []).map(
                                      (value: any, index: number) => (
                                        <div
                                          key={value.uuid || `value-${index}`}
                                          className="p-2 border rounded-md bg-background"
                                        >
                                          {value.value}
                                        </div>
                                      )
                                    )}

                                    {(!prop.values ||
                                      prop.values.length === 0) && (
                                      <div className="text-sm text-muted-foreground">
                                        No values defined
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                        No properties defined for this object
                      </div>
                    )}
                  </div>
                )}
                renderEdit={() => (
                  <PropertySectionEditor
                    properties={editedProperties}
                    isEditable={true}
                    onUpdate={setEditedProperties}
                  />
                )}
              />

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
            <div className="flex w-full items-center gap-2">
              <Button type="button" onClick={onClose} className="w-full">
                Close
              </Button>
              {!isDeleted && object?.uuid && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeleteObject(object.uuid)}
                  className="text-destructive w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
