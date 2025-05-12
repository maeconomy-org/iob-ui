'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { useObjects } from '@/hooks'
import { objectModelsData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { ObjectViewContainer } from '@/components/object-views'
import { ObjectDetailsSheet, ObjectEditSheet } from '@/components/sheets'
import { ViewSelector, ViewType } from '@/components/view-selector'

export default function ObjectsPage() {
  // Use our custom hooks
  const {
    useAllObjects,
    useDeleteObject,
    useCreateFullObject,
    useUpdateObject,
  } = useObjects()

  // Object queries
  const { data = [], isLoading, isError, error } = useAllObjects()

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
    setSelectedObject(object)
    setObjectSheetMode('edit')
    setIsObjectEditSheetOpen(true)
  }

  const handleSaveObject = async (object: any) => {
    try {
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

        console.log('Creating new object:', {
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

        toast.success('Object created successfully')
      } else {
        // We need to carefully track what has changed by comparing the updated object
        // with the original object (selectedObject)
        const originalObject = selectedObject

        console.log('Original object:', originalObject)
        console.log('Updated object:', object)

        // Build a proper update payload with only what's changed
        const updates: any = {}

        // 1. Process basic object information if changed
        if (
          originalObject.name !== object.name ||
          originalObject.abbreviation !== object.abbreviation ||
          originalObject.version !== object.version ||
          originalObject.description !== object.description
        ) {
          updates.object = {
            name: object.name,
            abbreviation: object.abbreviation || '',
            version: object.version || '',
            description: object.description || '',
          }
        }

        // 2. Process parent relationship changes
        if (originalObject.parentUuid !== object.parentUuid) {
          updates.parentUuid = object.parentUuid
        }

        // 3. Process file changes on the object itself

        // 3.1 Track files to add (new files that weren't in the original)
        if (object.files && object.files.length > 0) {
          const originalFileIds = new Set(
            originalObject.files?.map((f: any) => f.uuid) || []
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
        if (originalObject.files && originalObject.files.length > 0) {
          const updatedFileIds = new Set(
            object.files?.map((f: any) => f.uuid).filter(Boolean) || []
          )

          const filesToRemove = originalObject.files
            .filter((f: any) => f.uuid && !updatedFileIds.has(f.uuid))
            .map((f: any) => f.uuid)

          if (filesToRemove.length > 0) {
            updates.removeFiles = filesToRemove
          }
        }

        // 4. Process property changes

        // 4.1 Track properties to remove (in original but not in update)
        if (originalObject.properties && originalObject.properties.length > 0) {
          const updatedPropertyKeys = new Set(
            object.properties?.map((p: any) => p.key) || []
          )

          const propertiesToRemove = originalObject.properties
            .filter((p: any) => !updatedPropertyKeys.has(p.property.key))
            .map((p: any) => p.property.key)

          if (propertiesToRemove.length > 0) {
            updates.removeProperties = propertiesToRemove
          }
        }

        // 4.2 Process property updates and additions
        if (object.properties && object.properties.length > 0) {
          const propertyUpdates = []

          for (const updatedProp of object.properties) {
            // Find the matching original property by key
            const originalProp = originalObject.properties?.find(
              (p: any) => p.property.key === updatedProp.key
            )

            const propUpdate: any = {
              key: updatedProp.key,
            }

            // Track property metadata changes or add new property
            if (
              !originalProp ||
              originalProp.property.label !== updatedProp.label ||
              originalProp.property.description !== updatedProp.description ||
              originalProp.property.type !== updatedProp.type
            ) {
              propUpdate.property = {
                label: updatedProp.label || '',
                description: updatedProp.description || '',
                type: updatedProp.type || '',
              }
            }

            // Process property values

            // Detect new or changed values
            if (updatedProp.values && updatedProp.values.length > 0) {
              const originalValueUuids = new Set(
                originalProp?.values?.map((v: any) => v.value.uuid) || []
              )

              const newOrChangedValues = updatedProp.values.filter(
                (v: any) =>
                  !v.uuid ||
                  !originalValueUuids.has(v.uuid) ||
                  originalProp?.values.find(
                    (ov: any) => ov.value.uuid === v.uuid
                  )?.value.value !== v.value
              )

              if (newOrChangedValues.length > 0) {
                propUpdate.addValues = newOrChangedValues.map((v: any) => {
                  const valueUpdate: any = {
                    value: {
                      value: v.value || '',
                      valueTypeCast: v.valueTypeCast || 'string',
                    },
                  }

                  // Process files on values
                  if (v.files && v.files.length > 0) {
                    // For a new value, all files are considered new
                    valueUpdate.addFiles = v.files.map((f: any) => ({
                      file: {
                        fileName: f.fileName,
                        fileReference: f.fileReference,
                        label: f.label || 'Uploaded file',
                      },
                    }))
                  }

                  return valueUpdate
                })
              }
            }

            // Detect values to remove
            if (originalProp?.values && originalProp.values.length > 0) {
              const updatedValueUuids = new Set(
                updatedProp.values?.map((v: any) => v.uuid).filter(Boolean) ||
                  []
              )

              const valuesToRemove = originalProp.values
                .filter(
                  (v: any) =>
                    v.value.uuid && !updatedValueUuids.has(v.value.uuid)
                )
                .map((v: any) => v.value.uuid)

              if (valuesToRemove.length > 0) {
                propUpdate.removeValues = valuesToRemove
              }
            }

            // Process property files

            // Detect new files on property
            if (updatedProp.files && updatedProp.files.length > 0) {
              const originalFileIds = new Set(
                originalProp?.files?.map((f: any) => f.uuid) || []
              )

              const newFiles = updatedProp.files.filter(
                (f: any) => !f.uuid || !originalFileIds.has(f.uuid)
              )

              if (newFiles.length > 0) {
                propUpdate.addFiles = newFiles.map((f: any) => ({
                  file: {
                    fileName: f.fileName,
                    fileReference: f.fileReference,
                    label: f.label || 'Uploaded file',
                  },
                }))
              }
            }

            // Detect files to remove from property
            if (originalProp?.files && originalProp.files.length > 0) {
              const updatedFileIds = new Set(
                updatedProp.files?.map((f: any) => f.uuid).filter(Boolean) || []
              )

              const filesToRemove = originalProp.files
                .filter((f: any) => f.uuid && !updatedFileIds.has(f.uuid))
                .map((f: any) => f.uuid)

              if (filesToRemove.length > 0) {
                propUpdate.removeFiles = filesToRemove
              }
            }

            // Only add this property to updates if it has actual changes
            if (Object.keys(propUpdate).length > 1) {
              // > 1 because it always has the 'key' property
              propertyUpdates.push(propUpdate)
            }
          }

          if (propertyUpdates.length > 0) {
            updates.properties = propertyUpdates
          }
        }

        // Only perform the update if there are actual changes
        if (Object.keys(updates).length > 0) {
          console.log('Performing update with changes:', updates)

          // Use the updateObject API
          await updateObjectMutation.mutateAsync({
            uuid: object.uuid,
            updates,
          })

          toast.success('Object updated successfully')
        } else {
          console.log('No changes detected')
          toast.info('No changes detected')
        }
      }

      setIsObjectEditSheetOpen(false)
    } catch (err) {
      console.error('Error saving object:', err)
      toast.error('Failed to save object')
    }
  }

  // Handle object deletion
  const handleDeleteObject = async (objectUuid: string) => {
    try {
      await deleteObject.mutateAsync(objectUuid)
      setIsObjectSheetOpen(false)
      toast.success('Object has been moved to trash')
    } catch (err) {
      console.error('Error deleting object:', err)
      toast.error('Failed to delete object')
    }
  }

  // Check if an object is deleted
  const isObjectDeleted = (object: any) => {
    // Check if the object is marked as deleted in its metadata
    return object?.metadata?.deleted === true
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
        isDeleted={isObjectDeleted(selectedObject)}
      />

      {/* Add/Edit Object Sheet */}
      <ObjectEditSheet
        isOpen={isObjectEditSheetOpen}
        onClose={() => setIsObjectEditSheetOpen(false)}
        object={selectedObject}
        availableModels={objectModelsData}
        mode={objectSheetMode}
        onSave={handleSaveObject}
      />
    </div>
  )
}
