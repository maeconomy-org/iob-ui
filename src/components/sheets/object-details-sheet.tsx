'use client'

import { useState, useMemo, useEffect } from 'react'
import { Trash2, Loader2, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { toast } from 'sonner'

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
  CopyButton,
} from '@/components/ui'
import { PropertySectionEditor } from '@/components/properties'
import { useObjects, usePropertyManagement, useAggregate } from '@/hooks'
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
  // Get the aggregate hook for rich object data
  const { useAggregateByUUID } = useAggregate()
  const { useUpdateObjectMetadata, useDeleteObject } = useObjects()
  // Get the specialized metadata update mutation
  const updateObjectMetadataMutation = useUpdateObjectMetadata()

  // Get delete mutation
  const deleteObjectMutation = useDeleteObject()

  // Fetch the aggregate object details if a UUID is provided
  // This provides much richer data including all relationships, properties, and files
  const {
    data: aggregateData,
    isLoading,
    refetch: refetchAggregate,
  } = useAggregateByUUID(uuid || '', {
    enabled: !!uuid && isOpen, // Enable for both cases but will only fetch when needed
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale so it refetches when invalidated
  })

  // Process aggregate data to get the object details in the expected format
  const { object, properties, files, objectHistory } = useMemo(() => {
    // Prioritize aggregate data if available (this will be fresh data after mutations)
    if (aggregateData && aggregateData.length > 0) {
      const aggregate = aggregateData[0]

      return {
        object: {
          uuid: aggregate.uuid || '',
          name: aggregate.name || '',
          abbreviation: aggregate.abbreviation || '',
          version: aggregate.version || '',
          description: aggregate.description || '',
          createdAt: aggregate.createdAt || '',
          lastUpdatedAt: aggregate.lastUpdatedAt || '',
          softDeleted: aggregate.softDeleted || false,
          softDeletedAt: aggregate.softDeletedAt || '',
          softDeleteBy: aggregate.softDeleteBy || '',
          ...((aggregate as any).modelUuid && {
            modelUuid: (aggregate as any).modelUuid,
          }),
        },
        properties: (aggregate.properties || []).filter(
          (prop) => !prop.softDeleted
        ),
        files: (aggregate.files || []).filter((file) => !file.softDeleted),
        objectHistory: [],
      }
    }

    // Fall back to initialObject if provided and no aggregate data yet
    if (initialObject) {
      return {
        object: {
          uuid: initialObject.uuid || '',
          name: initialObject.name || '',
          abbreviation: initialObject.abbreviation || '',
          version: initialObject.version || '',
          description: initialObject.description || '',
          createdAt: initialObject.createdAt || '',
          lastUpdatedAt: initialObject.lastUpdatedAt || '',
          softDeleted: initialObject.softDeleted || false,
          softDeletedAt: initialObject.softDeletedAt || '',
          softDeleteBy: initialObject.softDeleteBy || '',
          ...(initialObject.modelUuid && {
            modelUuid: initialObject.modelUuid,
          }),
        },
        properties: (initialObject.properties || []).filter(
          (prop: any) => !prop.softDeleted
        ),
        files: (initialObject.files || []).filter(
          (file: any) => !file.softDeleted
        ),
        objectHistory: [],
      }
    }

    // No data available
    return {
      object: null,
      properties: [],
      files: [],
      objectHistory: [],
    }
  }, [aggregateData, initialObject])

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

  // Add state for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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

  // Reset editing states when data changes (after mutations)
  useEffect(() => {
    if (object && !isMetadataEditing && !isPropertiesEditing) {
      setEditedObject({ ...object })
    }
    if (properties && !isPropertiesEditing) {
      setEditedProperties([...properties])
    }
  }, [object, properties, isMetadataEditing, isPropertiesEditing])

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
        const updatedObject = await updateObjectMetadataMutation.mutateAsync({
          uuid: object.uuid,
          name: editedObject.name,
          abbreviation: editedObject.abbreviation,
          version: editedObject.version,
          description: editedObject.description,
        })

        // Reset the editing state to reflect the updated data
        if (updatedObject) {
          setEditedObject({
            ...object,
            name: updatedObject.name || editedObject.name,
            abbreviation:
              updatedObject.abbreviation || editedObject.abbreviation,
            version: updatedObject.version || editedObject.version,
            description: updatedObject.description || editedObject.description,
          })
        }

        // Show success toast
        toast.success('Object metadata updated successfully', { id: toastId })

        // Manually trigger a refetch to ensure UI updates immediately
        if (uuid && refetchAggregate) {
          refetchAggregate()
        }

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
        const originalProp = properties.find((p: any) => p.uuid === prop.uuid)
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

        // Reset the editing properties to reflect the current state
        // The useEffect will handle this when the cache updates

        // Show success toast
        toast.success('Object properties updated successfully', { id: toastId })

        // Manually trigger a refetch to ensure UI updates immediately
        if (uuid && refetchAggregate) {
          refetchAggregate()
        }

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
            <SheetDescription>
              {(model || object?.version) && (
                <Badge variant="outline">
                  {model && model.name}{' '}
                  {object?.version && `v${object?.version}`}
                </Badge>
              )}
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 py-6">
              {/* Metadata Section - Now Editable */}
              <EditableSection
                title="Metadata"
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
                      <div className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                        <span className="truncate flex">{object?.uuid}</span>
                        <CopyButton
                          text={object?.uuid || ''}
                          label="Object UUID"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium">Name</div>
                        <div className="text-sm text-muted-foreground">
                          {object?.name}
                        </div>
                      </div>
                      {object?.version && (
                        <div>
                          <div className="text-sm font-medium">Version</div>
                          <div className="text-sm text-muted-foreground">
                            {object?.version}
                          </div>
                        </div>
                      )}
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
                      {object?.softDeleted && isDeleted && (
                        <>
                          {object?.softDeletedAt && (
                            <div>
                              <div className="text-sm font-medium text-destructive">
                                Deleted At
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {object?.softDeletedAt &&
                                  new Date(
                                    object.softDeletedAt
                                  ).toLocaleString()}
                              </div>
                            </div>
                          )}
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
                                {object.softDeleteBy.length > 30
                                  ? object.softDeleteBy.substring(
                                      object.softDeleteBy.length - 30
                                    ) + '...'
                                  : object.softDeleteBy}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {object?.description && (
                      <div>
                        <div className="text-sm font-medium">Description</div>
                        <div className="text-sm text-muted-foreground">
                          {object.description.length > 100 ? (
                            <>
                              {isDescriptionExpanded
                                ? object.description
                                : `${object.description.substring(0, 100)}...`}
                              <button
                                onClick={() =>
                                  setIsDescriptionExpanded(
                                    !isDescriptionExpanded
                                  )
                                }
                                className="ml-2 text-primary hover:text-primary/80 underline text-xs"
                              >
                                {isDescriptionExpanded
                                  ? 'Show less'
                                  : 'Show more'}
                              </button>
                            </>
                          ) : (
                            object.description
                          )}
                        </div>
                      </div>
                    )}
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
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs">
                                        {prop.uuid || 'Not set'}
                                      </span>
                                      {prop.uuid && (
                                        <CopyButton
                                          text={prop.uuid}
                                          label="Property UUID"
                                          size="sm"
                                        />
                                      )}
                                    </div>
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
                            History ({objectHistory.length})
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
                      {objectHistory.map((historyItem: any, index: number) => (
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
