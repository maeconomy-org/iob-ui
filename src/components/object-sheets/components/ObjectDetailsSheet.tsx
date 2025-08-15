'use client'

import { useState, useEffect } from 'react'
import {
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
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
  CopyButton,
} from '@/components/ui'
import { DeleteConfirmationDialog } from '@/components/modals'
import { HereAddressAutocomplete } from '@/components/ui/'
import { PropertySectionEditor } from '@/components/properties'
import { formatPropertyValue } from '@/lib/object-utils'

// Import our extracted hooks and utilities
import {
  useObjectData,
  useAddressManagement,
  usePropertyEditor,
  useObjectOperations,
  useParentManagement,
} from '../hooks'
import {
  getObjectDisplayName,
  getObjectTimestamps,
  getSoftDeleteInfo,
} from '../utils'
import { formatFingerprint } from '@/lib/utils'
import { useUnifiedDelete } from '@/hooks'
import { ParentDisplay } from './ParentDisplay'
import { ParentSelector } from './ParentSelector'

interface ObjectSheetProps {
  isOpen: boolean
  onClose: () => void
  object?: any // Optional fallback object data
  uuid?: string // Object UUID to fetch from API
  isDeleted?: boolean
}

export function ObjectDetailsSheet({
  isOpen,
  onClose,
  object: initialObject,
  uuid,
  isDeleted,
}: ObjectSheetProps) {
  // State for UI interactions
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [activeEditingSection, setActiveEditingSection] = useState<
    string | null
  >(null)
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(
    null
  )
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Derived states for editing modes
  const isMetadataEditing = activeEditingSection === 'metadata'
  const isPropertiesEditing = activeEditingSection === 'properties'
  const isAddressEditing = activeEditingSection === 'address'
  const isParentsEditing = activeEditingSection === 'parents'

  // Use our extracted hooks
  const {
    object,
    properties,
    objectHistory,
    addressInfo,
    isLoading,
    refetchAggregate,
  } = useObjectData({
    uuid,
    initialObject,
    isOpen,
  })

  const { addressData, editedAddressData, setEditedAddressData, saveAddress } =
    useAddressManagement({
      initialAddressInfo: addressInfo,
      objectUuid: object?.uuid,
    })

  const {
    parents,
    setParents,
    addParent,
    removeParent,
    saveParents,
    hasParentsChanged,
    isSaving: isParentsSaving,
  } = useParentManagement({
    initialParents: object?.parents || [],
    objectUuid: object?.uuid,
    onRefetch: refetchAggregate,
  })

  const { editedProperties, setEditedProperties, saveProperties } =
    usePropertyEditor({
      initialProperties: properties,
      objectUuid: object?.uuid,
      isEditing: isPropertiesEditing,
    })

  const { editedObject, setEditedObject, saveMetadata } = useObjectOperations({
    initialObject: object,
    isEditing: isMetadataEditing,
    onRefetch: refetchAggregate,
  })

  // Unified delete hook
  const {
    isDeleteModalOpen,
    objectToDelete,
    isDeleting,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useUnifiedDelete()

  // Exit early if no object and still loading
  if (!object && isOpen && !isLoading) {
    return null
  }

  // Function to toggle property expansion
  const togglePropertyExpansion = (propertyId: string) => {
    setExpandedPropertyId((prevId) =>
      prevId === propertyId ? null : propertyId
    )
  }

  // Handle section edit toggling
  const handleEditToggle = (section: string, isEditing: boolean) => {
    if (isEditing) {
      setActiveEditingSection(section)
    } else {
      if (activeEditingSection === section) {
        setActiveEditingSection(null)
      }
    }
  }

  // Handle saving operations
  const handleSaveMetadata = async (): Promise<void> => {
    try {
      await saveMetadata()
      setActiveEditingSection(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleSaveProperties = async (): Promise<void> => {
    try {
      await saveProperties()
      // Manually trigger a refetch to ensure UI updates immediately
      if (uuid && refetchAggregate) {
        refetchAggregate()
      }
      setActiveEditingSection(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleSaveAddress = async (): Promise<void> => {
    try {
      await saveAddress()
      setActiveEditingSection(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleSaveParents = async (): Promise<void> => {
    try {
      await saveParents()
      setActiveEditingSection(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  // Handle object deletion with unified modal
  const handleDeleteObject = (objectId: string, objectName: string) => {
    handleDelete({ uuid: objectId, name: objectName })
  }

  // Close sheet after successful delete
  useEffect(() => {
    if (!isDeleteModalOpen && objectToDelete) {
      // If modal was closed and we had an object to delete, close the sheet
      onClose()
    }
  }, [isDeleteModalOpen, objectToDelete, onClose])

  // Get computed values
  const objectName = getObjectDisplayName(object)
  const { created, updated } = getObjectTimestamps(object)
  const softDeleteInfo = getSoftDeleteInfo(object)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <span className="flex items-center gap-2">
              <SheetTitle>{objectName}</SheetTitle>
              {(object?.softDeleted || isDeleted) && (
                <Badge variant="destructive">Deleted</Badge>
              )}
            </span>
            <SheetDescription></SheetDescription>
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
                          {created}
                        </div>
                      </div>
                      {updated && (
                        <div>
                          <div className="text-sm font-medium">Updated</div>
                          <div className="text-sm text-muted-foreground">
                            {updated}
                          </div>
                        </div>
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

                    {/* Display soft delete metadata if object is deleted */}
                    {softDeleteInfo && (
                      <div className="grid grid-cols-2 gap-3">
                        {softDeleteInfo.deletedAt && (
                          <div>
                            <div className="text-sm font-medium text-destructive">
                              Deleted At
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {softDeleteInfo.deletedAt}
                            </div>
                          </div>
                        )}
                        {softDeleteInfo.deletedBy && (
                          <div>
                            <div className="text-sm font-medium text-destructive">
                              Deleted By
                            </div>
                            <div
                              className="text-sm text-muted-foreground font-mono"
                              title={softDeleteInfo.deletedBy}
                              aria-label={softDeleteInfo.deletedBy}
                            >
                              {formatFingerprint(softDeleteInfo.deletedBy)}
                            </div>
                          </div>
                        )}
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

              {/* Parent Objects Section - Now Editable */}
              <Separator />
              <EditableSection
                title="Parent Objects"
                isEditing={isParentsEditing}
                onEditToggle={(isEditing) =>
                  handleEditToggle('parents', isEditing)
                }
                onSave={handleSaveParents}
                successMessage="Parent objects updated successfully"
                showToast={false}
                renderDisplay={() => (
                  <div>
                    {parents && parents.length > 0 ? (
                      <ParentDisplay parents={parents} />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No parent objects assigned
                      </div>
                    )}
                  </div>
                )}
                renderEdit={() => (
                  <div className="space-y-4">
                    <ParentSelector
                      selectedParents={parents}
                      onParentsChange={setParents}
                      placeholder="Search for parent objects..."
                      maxSelections={50}
                      currentObjectUuid={object?.uuid}
                    />
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

              {/* Address Section */}
              <Separator />
              <EditableSection
                title="Address"
                isEditing={isAddressEditing}
                onEditToggle={(isEditing) =>
                  handleEditToggle('address', isEditing)
                }
                onSave={handleSaveAddress}
                successMessage="Address updated successfully"
                showToast={false}
                renderDisplay={() => (
                  <div>
                    {addressData.fullAddress ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            {addressData.fullAddress}
                          </div>
                        </div>

                        <div className="ml-6 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="space-y-1">
                            {addressData.street && (
                              <div>Street: {addressData.street}</div>
                            )}
                            {addressData.houseNumber && (
                              <div>House Number: {addressData.houseNumber}</div>
                            )}
                            {addressData.city && (
                              <div>City: {addressData.city}</div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {addressData.postalCode && (
                              <div>Postal Code: {addressData.postalCode}</div>
                            )}
                            {addressData.country && (
                              <div>Country: {addressData.country}</div>
                            )}
                            {addressData.state && (
                              <div>State: {addressData.state}</div>
                            )}
                            {addressData.district && (
                              <div>District: {addressData.district}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                        No address specified for this object
                      </div>
                    )}
                  </div>
                )}
                renderEdit={() => (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address-search">Building Address</Label>
                      <HereAddressAutocomplete
                        value={editedAddressData.fullAddress}
                        placeholder="Search for building address..."
                        onAddressSelect={(fullAddress, components) => {
                          setEditedAddressData({
                            fullAddress,
                            street: components?.street,
                            houseNumber: components?.houseNumber,
                            city: components?.city,
                            postalCode: components?.postalCode,
                            country: components?.country,
                            state: components?.state,
                            district: components?.district || '',
                          })
                        }}
                        className="mt-1"
                      />
                    </div>

                    {(editedAddressData.street ||
                      editedAddressData.city ||
                      editedAddressData.country) && (
                      <div className="p-3 bg-muted/20 rounded-md">
                        <div className="text-sm font-medium mb-2">
                          Address Components:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {editedAddressData.street && (
                            <div>
                              <strong>Street:</strong>{' '}
                              {editedAddressData.street}
                            </div>
                          )}
                          {editedAddressData.houseNumber && (
                            <div>
                              <strong>Number:</strong>{' '}
                              {editedAddressData.houseNumber}
                            </div>
                          )}
                          {editedAddressData.city && (
                            <div>
                              <strong>City:</strong> {editedAddressData.city}
                            </div>
                          )}
                          {editedAddressData.postalCode && (
                            <div>
                              <strong>Postal Code:</strong>{' '}
                              {editedAddressData.postalCode}
                            </div>
                          )}
                          {editedAddressData.country && (
                            <div>
                              <strong>Country:</strong>{' '}
                              {editedAddressData.country}
                            </div>
                          )}
                          {editedAddressData.state && (
                            <div>
                              <strong>State:</strong> {editedAddressData.state}
                            </div>
                          )}
                          {editedAddressData.district && (
                            <div>
                              <strong>District:</strong>{' '}
                              {editedAddressData.district}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />

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
                  onClick={() => handleDeleteObject(object.uuid, object.name)}
                  disabled={isDeleting}
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

      {/* Unified Delete Confirmation Dialog */}
      {isDeleteModalOpen && objectToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteModalOpen}
          onOpenChange={handleDeleteCancel}
          objectName={objectToDelete.name}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  )
}
