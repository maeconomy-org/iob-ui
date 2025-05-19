'use client'

import { useState, useEffect, useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { useObjects } from '@/hooks'
import { Button } from '@/components/ui'
import { objectModelsData } from '@/lib/data'
import { ObjectViewContainer } from '@/components/object-views'
import { ViewSelector, ViewType } from '@/components/view-selector'
import { ObjectDetailsSheet, ObjectEditSheet } from '@/components/sheets'

// Define augmented object type that includes the fields from the API response
interface ExtendedObject {
  uuid: string
  name: string
  createdAt: string
  lastUpdatedAt?: string
  softDeleted?: boolean
  softDeletedAt?: string
  softDeleteBy?: string
  [key: string]: any // Allow other properties
}

export default function ObjectsPage() {
  // Use our custom hooks
  const {
    useAllObjects,
    useDeleteObject,
    useCreateFullObject,
    useUpdateObject,
  } = useObjects()

  // Object queries
  const { data: allObjects = [], isLoading, isError, error } = useAllObjects()

  // Filter objects to only show the latest version of each UUID
  const data = useMemo(() => {
    if (!allObjects || allObjects.length === 0) return []

    const uniqueObjects = new Map<string, ExtendedObject>()

    // Sort by createdAt in descending order (newest first)
    const sortedObjects = [...allObjects].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })

    // Take only the first (newest) object for each UUID
    sortedObjects.forEach((object: any) => {
      if (object.uuid && !uniqueObjects.has(object.uuid)) {
        uniqueObjects.set(object.uuid, object as ExtendedObject)
      }
    })

    return Array.from(uniqueObjects.values())
  }, [allObjects])

  // Object mutations
  const deleteObject = useDeleteObject()
  const createFullObjectMutation = useCreateFullObject()
  const updateObjectMutation = useUpdateObject()

  const [viewType, setViewType] = useState<ViewType>('table')
  const [isObjectSheetOpen, setIsObjectSheetOpen] = useState(false)
  const [isObjectEditSheetOpen, setIsObjectEditSheetOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [objectSheetMode, setObjectSheetMode] = useState<'add' | 'edit'>('add')

  // Initialize view type from localStorage after the component mounts
  useEffect(() => {
    const savedView = localStorage.getItem('view')
    if (savedView) {
      setViewType(savedView as ViewType)
    }
  }, [])

  const handleAddObject = () => {
    setSelectedObject(null)
    setObjectSheetMode('add')
    setIsObjectEditSheetOpen(true)
  }

  const handleViewObject = (object: any) => {
    setSelectedObject(object)
    setIsObjectSheetOpen(true)
  }

  const handleEditObject = (object: any) => {
    setObjectSheetMode('edit')
    setSelectedObject(object)
    setIsObjectEditSheetOpen(true)
  }

  const handleSaveObject = async (object: any, receivedObject?: any) => {
    try {
      // Create a loading toast with an ID so we can dismiss it later
      toast.loading('Saving object...', { id: 'save-object' })

      // Handle normal single object save
      if (objectSheetMode === 'add') {
        // Extract properties from the object for the high-level API
        const objectProperties =
          object.properties?.map((p: any) => ({
            property: {
              key: p.key,
              label: p.label || '',
              description: p.description || '',
              type: p.type || '',
            },
            values:
              p.values?.length > 0
                ? [
                    {
                      value: {
                        value: p.values[0].value || '',
                        valueTypeCast: p.valueTypeCast || 'string',
                      },
                      // Add files for this property value if they exist
                      files:
                        p.values[0].files?.map((f: any) => ({
                          file: {
                            fileName: f.fileName,
                            fileReference: f.fileReference,
                            label: f.label || 'Uploaded file',
                          },
                        })) || [],
                    },
                  ]
                : [],
            // Add files for this property if they exist
            files:
              p.files?.map((f: any) => ({
                file: {
                  fileName: f.fileName,
                  fileReference: f.fileReference,
                  label: f.label || 'Uploaded file',
                },
              })) || [],
          })) || []

        // Use the createFullObject API for more powerful object creation
        await createFullObjectMutation.mutateAsync({
          object: {
            name: object.name,
            abbreviation: object.abbreviation || '',
            version: object.version || '',
            description: object.description || '',
          },
          // Add parent UUID if it exists
          parentUuid: object.parentUuid,
          // Add files directly attached to the object
          files:
            object.files?.map((f: any) => ({
              file: {
                fileName: f.fileName,
                fileReference: f.fileReference,
                label: f.label || 'Uploaded file',
              },
            })) || [],
          properties: objectProperties,
        })

        toast.success('Object created successfully', { id: 'save-object' })
      } else {
        // We need to carefully track what has changed by comparing the updated object
        // with the original object (selectedObject)
        const originalObject = receivedObject || selectedObject
        console.log('Original object:', originalObject)
        console.log('Updated object:', object)

        // Normalize objects to ensure consistent comparison
        const normalizedOriginal = normalizeObject(originalObject)
        const normalizedUpdated = normalizeObject(object)
        console.log('Normalized original:', normalizedOriginal)
        console.log('Normalized updated:', normalizedUpdated)

        // Build a minimal update payload with only what's changed
        const updates: any = {}

        // 1. Process basic object information - only include fields that changed
        const objectChanges: any = {}

        if (normalizedOriginal.name !== normalizedUpdated.name) {
          objectChanges.name = normalizedUpdated.name
        }

        if (
          normalizedOriginal.abbreviation !== normalizedUpdated.abbreviation
        ) {
          objectChanges.abbreviation = normalizedUpdated.abbreviation || ''
        }

        if (normalizedOriginal.version !== normalizedUpdated.version) {
          objectChanges.version = normalizedUpdated.version || ''
        }

        if (normalizedOriginal.description !== normalizedUpdated.description) {
          objectChanges.description = normalizedUpdated.description || ''
        }

        // Only add the object field if there are actual changes
        if (Object.keys(objectChanges).length > 0) {
          updates.object = objectChanges
        }

        // 2. Process parent relationship changes - only if changed
        if (normalizedOriginal.parentUuid !== normalizedUpdated.parentUuid) {
          updates.parentUuid = normalizedUpdated.parentUuid
        }

        // 3. Process file changes on the object itself

        // 3.1 Track files to add (new files that weren't in the original)
        if (object.files && object.files.length > 0) {
          const originalFileIds = new Set(
            normalizedOriginal.files?.map((f: any) => f.uuid) || []
          )

          const newFiles = object.files.filter(
            (f: any) => !f.uuid || !originalFileIds.has(f.uuid)
          )

          if (newFiles.length > 0) {
            updates.addFiles = newFiles.map((f: any) => ({
              file: {
                fileName: f.fileName,
                fileReference: f.fileReference,
                label: f.label || 'Uploaded file',
              },
            }))
          }
        }

        // 3.2 Track files to remove (files that were in original but not in updated)
        if (normalizedOriginal.files && normalizedOriginal.files.length > 0) {
          const updatedFileIds = new Set(
            object.files?.map((f: any) => f.uuid).filter(Boolean) || []
          )

          const filesToRemove = normalizedOriginal.files
            .filter((f: any) => f.uuid && !updatedFileIds.has(f.uuid))
            .map((f: any) => f.uuid)

          if (filesToRemove.length > 0) {
            updates.removeFiles = filesToRemove
          }
        }

        // 4. Process property changes only if they truly changed
        if (
          normalizedUpdated.properties &&
          normalizedUpdated.properties.length > 0
        ) {
          const propertyUpdates = []
          // Track which original properties have been processed
          const processedOriginalProps = new Set()

          // First, identify properties by UUID if available to detect key renames
          for (const updatedProp of normalizedUpdated.properties) {
            // First try to match by UUID (for existing properties that may have key changes)
            const originalPropByUuid = updatedProp.uuid
              ? normalizedOriginal.properties?.find(
                  (p: any) => p.uuid === updatedProp.uuid
                )
              : null

            // Then try to match by key if no UUID match
            const originalPropByKey = !originalPropByUuid
              ? normalizedOriginal.properties?.find(
                  (p: any) => p.key === updatedProp.key
                )
              : null

            const originalProp = originalPropByUuid || originalPropByKey

            // Create an update object with the key
            const propUpdate: any = {
              key: updatedProp.key,
            }

            // Always include UUID when available for existing properties
            if (originalProp && originalProp.uuid) {
              propUpdate.uuid = originalProp.uuid
              console.log(
                `Including property UUID ${originalProp.uuid} in update for ${updatedProp.key}`
              )
            }
            // If we found a match by UUID but the key is different, this is a key rename
            else if (
              originalPropByUuid &&
              originalPropByUuid.key !== updatedProp.key
            ) {
              console.log(
                `Detected key rename from ${originalPropByUuid.key} to ${updatedProp.key}`
              )
              // Include UUID to ensure we update the existing property
              propUpdate.uuid = originalPropByUuid.uuid
            }

            // Track what exactly changed to minimize API updates
            let hasChanges = false

            // Only include property changes if something actually changed
            if (originalProp) {
              // Mark this original property as processed
              if (originalProp.uuid) {
                processedOriginalProps.add(originalProp.uuid)
              }

              // Property exists - check what changed
              const propertyChanges: any = {}

              if (originalProp.label !== updatedProp.label) {
                propertyChanges.label = updatedProp.label || ''
                hasChanges = true
              }

              if (originalProp.description !== updatedProp.description) {
                propertyChanges.description = updatedProp.description || ''
                hasChanges = true
              }

              if (originalProp.type !== updatedProp.type) {
                propertyChanges.type = updatedProp.type || ''
                hasChanges = true
              }

              // Key change is also a change
              if (
                originalPropByUuid &&
                originalPropByUuid.key !== updatedProp.key
              ) {
                hasChanges = true
              }

              // Only include property field if something changed
              if (Object.keys(propertyChanges).length > 0) {
                propUpdate.property = propertyChanges
              }
            } else {
              // New property - include all metadata
              propUpdate.property = {
                label: updatedProp.label || '',
                description: updatedProp.description || '',
                type: updatedProp.type || '',
              }
              hasChanges = true
            }

            // Process value changes efficiently
            if (originalProp) {
              // Check if all values were removed from a property with existing values
              if (
                originalProp.values &&
                originalProp.values.length > 0 &&
                (!updatedProp.values || updatedProp.values.length === 0)
              ) {
                console.log(
                  `All values removed from property ${updatedProp.key} (${originalProp.uuid})`
                )
                // Add all original value UUIDs to removeValues
                propUpdate.removeValues = originalProp.values
                  .filter((val: any) => val.uuid)
                  .map((val: any) => val.uuid)

                if (propUpdate.removeValues.length > 0) {
                  console.log(
                    `Removing ${propUpdate.removeValues.length} values: ${propUpdate.removeValues.join(', ')}`
                  )
                  hasChanges = true
                }
              } else if (updatedProp.values) {
                // Normal case - check for value additions, updates, and removals
                const valueChanges = comparePropertyValues(
                  originalProp.values || [],
                  updatedProp.values
                )

                // If values were added or updated, include them
                if (valueChanges.addValues.length > 0) {
                  propUpdate.addValues = valueChanges.addValues.map(
                    (val: any) => ({
                      value: {
                        value: val.value,
                        valueTypeCast: 'string',
                      },
                      // Include files for this value if they exist
                      ...(val.files?.length > 0
                        ? {
                            addFiles: val.files.map((f: any) => ({
                              file: {
                                fileName: f.fileName,
                                fileReference: f.fileReference,
                                label: f.label || 'Uploaded file',
                              },
                            })),
                          }
                        : {}),
                    })
                  )
                  hasChanges = true
                }

                // If values were removed, include their UUIDs
                if (valueChanges.removeValues.length > 0) {
                  propUpdate.removeValues = valueChanges.removeValues
                  hasChanges = true
                }
              }
            } else if (updatedProp.values?.length > 0) {
              // All values are new for new properties
              propUpdate.addValues = updatedProp.values.map((val: any) => ({
                value: {
                  value: val.value,
                  valueTypeCast: 'string',
                },
                // Include files for this value if they exist
                ...(val.files?.length > 0
                  ? {
                      addFiles: val.files.map((f: any) => ({
                        file: {
                          fileName: f.fileName,
                          fileReference: f.fileReference,
                          label: f.label || 'Uploaded file',
                        },
                      })),
                    }
                  : {}),
              }))
              hasChanges = true
            }

            // Only add this property update if something actually changed
            if (hasChanges) {
              console.log(
                `Property ${updatedProp.key} has changes - including in update`
              )
              propertyUpdates.push(propUpdate)
            }
          }

          // Check for properties that were truly removed (not just renamed)
          // We need to handle cases with duplicate keys properly
          const removedProperties = normalizedOriginal.properties.filter(
            (origProp: any) =>
              // Only include properties that haven't been processed (weren't matched by UUID)
              origProp.uuid &&
              !processedOriginalProps.has(origProp.uuid) &&
              // And don't have a matching property in the updated properties
              !normalizedUpdated.properties.some(
                (updatedProp: any) =>
                  // Match by UUID if available
                  (updatedProp.uuid && updatedProp.uuid === origProp.uuid) ||
                  // Or by key as fallback
                  (!updatedProp.uuid && updatedProp.key === origProp.key)
              )
          )

          // Handle property and value removals
          if (removedProperties.length > 0) {
            // Collect UUIDs of properties to remove
            const propertyUuidsToRemove = removedProperties
              .filter((prop: any) => prop.uuid)
              .map((prop: any) => prop.uuid)

            console.log(
              `Removing ${removedProperties.length} properties by UUID`
            )
            removedProperties.forEach((prop: any) => {
              console.log(`- Removing property: ${prop.key} (${prop.uuid})`)

              // Also log values being removed with this property
              if (prop.values && prop.values.length > 0) {
                const valueUuids = prop.values
                  .filter((val: any) => val.uuid)
                  .map((val: any) => val.uuid)
                console.log(
                  `  - Also removing ${valueUuids.length} values: ${valueUuids.join(', ')}`
                )
              }
            })

            // API actually needs property UUIDs for removal, not keys
            if (propertyUuidsToRemove.length > 0) {
              updates.removeProperties = propertyUuidsToRemove
            }
          }

          // Only include properties if there are actual updates
          if (propertyUpdates.length > 0) {
            console.log('Changed properties:', propertyUpdates)
            updates.properties = propertyUpdates
          }
        }

        console.log('Updates:', updates)
        // Only perform the update if there are actual changes
        if (Object.keys(updates).length > 0) {
          console.log('Performing update with changes:', updates)

          // Use the updateObject API
          // await updateObjectMutation.mutateAsync({
          //   uuid: object.uuid,
          //   updates,
          // })

          toast.success('Object updated successfully', { id: 'save-object' })
        } else {
          console.log('No changes detected')
          toast.info('No changes detected', { id: 'save-object' })
        }
      }

      setIsObjectEditSheetOpen(false)
    } catch (err) {
      console.error('Error saving object:', err)
      toast.error('Failed to save object', { id: 'save-object' })
    }
  }

  /**
   * Normalizes an object to ensure consistent property structure for comparison
   */
  const normalizeObject = (obj: any) => {
    if (!obj) return {}

    // Make a deep copy to avoid modifying the original
    const normalized = { ...obj }

    // Normalize properties
    if (normalized.properties) {
      normalized.properties = normalized.properties.map((prop: any) => {
        // Create a normalized property
        const normalizedProp = {
          uuid: prop.uuid,
          key: prop.key,
          label: prop.label || '',
          description: prop.description || '',
          type: prop.type || '',
          values: [],
          files: [...(prop.files || [])],
        }

        // Normalize values
        if (prop.values) {
          normalizedProp.values = prop.values.map((val: any) => {
            // Handle different value structures
            return {
              uuid: val.uuid,
              value: val.value?.value || val.value,
              files: [...(val.files || [])],
            }
          })
        }

        return normalizedProp
      })
    }

    return normalized
  }

  /**
   * Compare property values between original and updated properties
   * Returns an object with arrays of values to add and UUIDs of values to remove
   */
  const comparePropertyValues = (
    originalValues: any[] = [],
    updatedValues: any[] = []
  ) => {
    const addValues: any[] = []
    const removeValues: string[] = []

    // Find values to add or update
    for (const updatedVal of updatedValues) {
      // Try to find matching value by UUID if available
      const originalValByUuid = updatedVal.uuid
        ? originalValues.find((val) => val.uuid === updatedVal.uuid)
        : null

      // If no match by UUID, try to find a value with the same content
      const originalValByContent = !originalValByUuid
        ? originalValues.find((val) => val.value === updatedVal.value)
        : null

      // If value is new or the content changed, mark it for addition
      if (!originalValByUuid && !originalValByContent) {
        // Brand new value
        addValues.push(updatedVal)
      } else if (
        originalValByUuid &&
        originalValByUuid.value !== updatedVal.value
      ) {
        // Existing value with updated content
        addValues.push({
          ...updatedVal,
          // Ensure we use the original UUID if available
          uuid: originalValByUuid.uuid,
        })
      }
    }

    // Find values that were removed
    for (const originalVal of originalValues) {
      if (
        originalVal.uuid &&
        !updatedValues.some(
          (val) =>
            val.uuid === originalVal.uuid ||
            (!val.uuid && val.value === originalVal.value)
        )
      ) {
        removeValues.push(originalVal.uuid)
      }
    }

    return { addValues, removeValues }
  }

  // Handle object deletion
  const handleDeleteObject = async (objectUuid: string) => {
    try {
      toast.loading('Deleting object...', { id: 'delete-object' })
      await deleteObject.mutateAsync(objectUuid)
      setIsObjectSheetOpen(false)
      toast.success('Object has been deleted!', { id: 'delete-object' })
    } catch (err) {
      console.error('Error deleting object:', err)
      toast.error('Failed to delete object', { id: 'delete-object' })
    }
  }

  // Check if an object is deleted
  const isObjectDeleted = (object: any) => {
    return object?.softDeletedAt !== null
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h3 className="text-xl font-semibold text-red-500">
          Error loading objects
        </h3>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Objects</h2>
            <div className="flex items-center gap-4">
              <ViewSelector view={viewType} onChange={setViewType} />
              <Button onClick={handleAddObject}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Object
              </Button>
            </div>
          </div>
          <ObjectViewContainer
            viewType={viewType}
            data={data}
            availableModels={objectModelsData}
            onViewObject={handleViewObject}
            onEditObject={handleEditObject}
            onSaveObject={handleSaveObject}
            loading={isLoading}
          />
        </div>
      </div>

      {/* View Object Details Sheet */}
      <ObjectDetailsSheet
        isOpen={isObjectSheetOpen}
        onClose={() => setIsObjectSheetOpen(false)}
        object={selectedObject}
        uuid={selectedObject?.uuid}
        availableModels={objectModelsData}
        onEdit={() => {
          setIsObjectSheetOpen(false)
          setObjectSheetMode('edit')
          setIsObjectEditSheetOpen(true)
        }}
        onDelete={(objectId) => {
          // Call the delete function with the object's UUID
          handleDeleteObject(objectId)
        }}
        onSave={handleSaveObject}
        isDeleted={isObjectDeleted(selectedObject)}
      />

      {/* Add/Edit Object Sheet */}
      <ObjectEditSheet
        isOpen={isObjectEditSheetOpen}
        onClose={() => {
          setIsObjectEditSheetOpen(false)
          setSelectedObject(null)
        }}
        object={objectSheetMode === 'add' ? selectedObject : null}
        objectUuid={selectedObject?.uuid || undefined}
        availableModels={objectModelsData}
        mode={objectSheetMode}
        onSave={handleSaveObject}
      />
    </div>
  )
}
