'use client'

import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Trash2,
} from 'lucide-react'

import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  ScrollArea,
  Textarea,
  EditableSection,
  CopyButton,
} from '@/components/ui'
import { PropertySectionEditor } from '@/components/properties'
import { extractUserUUID } from '@/components/object-sheets/utils/objectUtils'
import { useObjects, usePropertyManagement } from '@/hooks'
import { formatPropertyValue } from '@/lib/object-utils'
import { ObjectItem } from './tree-item'

interface DetailsPanelProps {
  item: ObjectItem | null
  availableModels: any[]
  onDelete: (item: ObjectItem) => void
}

export function DetailsPanel({
  item,
  availableModels,
  onDelete,
}: DetailsPanelProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  // Section editing states - combined into a single activeEditingSection state
  const [activeEditingSection, setActiveEditingSection] = useState<
    string | null
  >(null)
  const isMetadataEditing = activeEditingSection === 'metadata'
  const isPropertiesEditing = activeEditingSection === 'properties'

  // Add the expanded property state inside the component
  const [expandedPropertyViewId, setExpandedPropertyViewId] = useState<
    string | null
  >(null)

  // Add state for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Temporary editing states
  const [editedObject, setEditedObject] = useState<any>(null)
  const [editedProperties, setEditedProperties] = useState<any[]>([])

  // Use the iob-client hooks
  const { useUpdateObjectMetadata } = useObjects()

  // Get the specialized metadata update mutation
  const updateObjectMetadataMutation = useUpdateObjectMetadata()

  // Use our property management hook
  const {
    updatePropertyWithValues,
    createPropertyForObject,
    removePropertyFromObject,
    isLoading: isPropertyUpdateLoading,
  } = usePropertyManagement(item?.uuid)

  // Add the toggle function inside the component
  const togglePropertyViewExpansion = (propertyId: string) => {
    setExpandedPropertyViewId((prevId) =>
      prevId === propertyId ? null : propertyId
    )
  }

  // State for processed object data
  const [files, setFiles] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [objectHistory, setObjectHistory] = useState<ObjectItem[]>([])

  // Process the aggregated item data and setup editing states
  useEffect(() => {
    if (!item) return

    // Extract object history if available (assuming it's in the item)
    // For now, we'll set it to empty array since object history might not be in aggregate data
    setObjectHistory([])

    // Process properties from the aggregated item data
    const processedProperties =
      item.properties?.map((property: any) => {
        return {
          uuid: property.uuid,
          key: property.key,
          type: property.type,
          description: property.description,
          values: property.values || [],
        }
      }) || []

    setProperties(processedProperties)

    // Setup editing states
    setEditedObject({ ...item })
    setEditedProperties(processedProperties || [])

    // Process files from the aggregated item data
    setFiles(item.files || [])
  }, [item])

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

  // Update the handleSaveMetadata function to use our specialized hook
  const handleSaveMetadata = async (): Promise<void> => {
    if (!editedObject || !item) return

    try {
      // Check if anything has actually changed
      const hasChanged =
        editedObject.name !== item.name ||
        editedObject.abbreviation !== item.abbreviation ||
        editedObject.version !== item.version ||
        editedObject.description !== item.description

      if (!hasChanged) {
        // No changes, just close the editing mode
        setActiveEditingSection(null)
        return
      }

      // Use our specialized hook to update just the metadata
      await updateObjectMetadataMutation.mutateAsync({
        uuid: item.uuid,
        name: editedObject.name,
        abbreviation: editedObject.abbreviation,
        version: editedObject.version,
        description: editedObject.description,
      })

      // No need to call onSaveObject since the API hook handles cache invalidation
      setActiveEditingSection(null)
    } catch (error) {
      console.error('Error saving metadata:', error)
    }
  }

  // Update the handleSaveProperties function
  const handleSaveProperties = async (): Promise<void> => {
    if (!editedProperties || !item) return

    try {
      // Check if any properties have been modified, added or deleted
      const hasChanges = editedProperties.some(
        (prop) => prop._isNew || prop._deleted || prop._modified
      )

      if (!hasChanges) {
        // No changes, just close the editing mode
        setActiveEditingSection(null)
        return
      }

      // Process each property directly with API calls
      for (const property of editedProperties) {
        if (property._deleted) {
          // Delete property if marked for deletion
          await removePropertyFromObject(item.uuid, property.uuid)
        } else if (property._isNew) {
          // Create new property with only key and values
          await createPropertyForObject(item.uuid, {
            key: property.key,
            values: property.values || [],
          })
        } else if (property._modified) {
          // Only update existing property if it was modified
          // Just use the key field and values
          await updatePropertyWithValues(
            {
              uuid: property.uuid,
              key: property.key,
            },
            property.values || []
          )
        }
      }

      // No need to call onSaveObject since our API hooks handle cache invalidation
      setActiveEditingSection(null)
    } catch (error) {
      console.error('Error saving properties:', error)
    }
  }

  const isDeleted = item.softDeleted === true
  const deletedMetadata = isDeleted
    ? {
        deletedAt: item.softDeletedAt,
        deletedBy: extractUserUUID(item.softDeleteBy),
      }
    : null

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

          {/* Metadata Section - Now Editable */}
          <EditableSection
            title="Details"
            isEditing={isMetadataEditing}
            onEditToggle={(isEditing) =>
              handleEditToggle('metadata', isEditing)
            }
            onSave={handleSaveMetadata}
            successMessage="Object metadata updated successfully"
            renderDisplay={() => (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium">UUID</div>
                    <div className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                      <span className="truncate flex">{item?.uuid}</span>
                      <CopyButton text={item?.uuid || ''} label="Object UUID" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-sm text-muted-foreground">
                      {item?.name}
                    </div>
                  </div>
                  {item?.version && (
                    <div>
                      <div className="text-sm font-medium">Version</div>
                      <div className="text-sm text-muted-foreground">
                        {item?.version}
                      </div>
                    </div>
                  )}
                  {item?.abbreviation && (
                    <div>
                      <div className="text-sm font-medium">Abbreviation</div>
                      <div className="text-sm text-muted-foreground">
                        {item?.abbreviation}
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

                {item?.description && (
                  <div className="mt-4 col-span-2">
                    <div className="text-sm font-medium">Description</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description.length > 100 ? (
                        <>
                          {isDescriptionExpanded
                            ? item.description
                            : `${item.description.substring(0, 100)}...`}
                          <button
                            onClick={() =>
                              setIsDescriptionExpanded(!isDescriptionExpanded)
                            }
                            className="ml-2 text-primary hover:text-primary/80 underline text-xs"
                          >
                            {isDescriptionExpanded ? 'Show less' : 'Show more'}
                          </button>
                        </>
                      ) : (
                        item.description
                      )}
                    </div>
                  </div>
                )}

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

          {/* Properties Section - Now Editable */}
          <EditableSection
            title="Properties"
            isEditing={isPropertiesEditing}
            onEditToggle={(isEditing) =>
              handleEditToggle('properties', isEditing)
            }
            onSave={handleSaveProperties}
            successMessage="Object properties updated successfully"
            renderDisplay={() => (
              <>
                {properties && properties.length > 0 ? (
                  <div className="space-y-2">
                    {properties.map((prop, idx) => (
                      <div
                        key={prop.uuid || idx}
                        className="border rounded-md overflow-hidden"
                      >
                        {/* Property header - always visible */}
                        <div
                          className="grid grid-cols-3 gap-2 py-2 px-3 hover:bg-muted/20 cursor-pointer"
                          onClick={() =>
                            togglePropertyViewExpansion(
                              prop.uuid || `idx-${idx}`
                            )
                          }
                        >
                          <div className="font-medium text-sm flex items-center">
                            <ChevronRight
                              className={`h-4 w-4 mr-2 transition-transform ${
                                expandedPropertyViewId ===
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
                        {expandedPropertyViewId ===
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

                                {(!prop.values || prop.values.length === 0) && (
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
              </>
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
    </>
  )
}
