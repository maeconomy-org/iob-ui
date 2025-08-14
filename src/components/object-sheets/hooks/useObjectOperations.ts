import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useObjects } from '@/hooks'

export interface UseObjectOperationsProps {
  initialObject?: any
  isEditing: boolean
  onRefetch?: () => void
}

export interface UseObjectOperationsReturn {
  editedObject: any | null
  setEditedObject: (object: any) => void
  saveMetadata: () => Promise<void>
  deleteObject: (objectId: string) => Promise<void>
  createObject: (object: any) => Promise<boolean>
  hasMetadataChanged: boolean
  isCreating: boolean
}

/**
 * Hook for managing object metadata operations (CRUD)
 */
export function useObjectOperations({
  initialObject,
  isEditing,
  onRefetch,
}: UseObjectOperationsProps): UseObjectOperationsReturn {
  const [editedObject, setEditedObject] = useState<any>(null)

  // Get the specialized metadata update mutation
  const { useUpdateObjectMetadata, useDeleteObject, useCreateFullObject } =
    useObjects()
  const updateObjectMetadataMutation = useUpdateObjectMetadata()
  const deleteObjectMutation = useDeleteObject()

  // Get the object creation mutation
  const createFullObjectMutation = useCreateFullObject()

  // Reset editing object when data changes or editing mode changes
  useEffect(() => {
    if (initialObject && !isEditing) {
      setEditedObject({ ...initialObject })
    }
  }, [initialObject, isEditing])

  // Check if metadata has changed
  const hasMetadataChanged =
    editedObject &&
    initialObject &&
    (editedObject.name !== initialObject.name ||
      editedObject.abbreviation !== initialObject.abbreviation ||
      editedObject.version !== initialObject.version ||
      editedObject.description !== initialObject.description)

  const saveMetadata = async (): Promise<void> => {
    if (!editedObject || !initialObject) {
      throw new Error('Missing required data for metadata update')
    }

    if (!hasMetadataChanged) {
      // No changes to save
      return
    }

    try {
      // Call the API to update metadata
      const updatedObject = await updateObjectMetadataMutation.mutateAsync({
        uuid: initialObject.uuid,
        name: editedObject.name,
        abbreviation: editedObject.abbreviation,
        version: editedObject.version,
        description: editedObject.description,
      })

      // Reset the editing state to reflect the updated data
      if (updatedObject) {
        setEditedObject({
          ...initialObject,
          name: updatedObject.name || editedObject.name,
          abbreviation: updatedObject.abbreviation || editedObject.abbreviation,
          version: updatedObject.version || editedObject.version,
          description: updatedObject.description || editedObject.description,
        })
      }

      toast.success('Object metadata updated successfully')

      // Manually trigger a refetch to ensure UI updates immediately
      if (onRefetch) {
        onRefetch()
      }
    } catch (error) {
      console.error('Error saving metadata:', error)
      toast.error('Failed to update object metadata')
      throw error
    }
  }

  const deleteObject = async (objectId: string): Promise<void> => {
    if (!objectId) {
      throw new Error('Object ID is required for deletion')
    }

    try {
      await toast.promise(deleteObjectMutation.mutateAsync(objectId), {
        loading: 'Deleting object...',
        success: 'Object deleted successfully',
        error: 'Failed to delete object',
      })
    } catch (error) {
      console.error('Error deleting object:', error)
      throw error
    }
  }

  const createObject = async (object: any): Promise<boolean> => {
    try {
      console.log('Creating object:', object)

      // Show loading toast
      toast.loading('Saving object...', { id: 'save-object' })

      // Extract properties from the object for the high-level API
      const objectProperties =
        object.properties?.map((p: any) => ({
          property: {
            key: p.key,
            label: p.label || '',
            description: p.description || '',
            type: p.type || '',
          },
          values: (p.values || [])
            .filter((v: any) => v && v.value !== undefined && v.value !== '')
            .map((v: any) => ({
              value: {
                value: v.value,
                valueTypeCast: v.valueTypeCast || p.valueTypeCast || 'string',
              },
              files:
                (v.files || []).map((f: any) => ({
                  file: {
                    fileName: f.fileName,
                    fileReference: f.fileReference,
                    label: f.label || 'Uploaded file',
                  },
                })) || [],
            })),
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

        ...(object.address && object.address.fullAddress
          ? {
              address: {
                fullAddress: object.address.fullAddress || '',
                street: object.address.components.street || '',
                houseNumber: object.address.components.houseNumber || '',
                city: object.address.components.city || '',
                postalCode: object.address.components.postalCode || '',
                country: object.address.components.country || '',
                state: object.address.components.state || '',
                district: object.address.components.district || '',
              },
            }
          : {}),

        parents: object.parents,

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

      // Trigger refetch if provided
      if (onRefetch) {
        onRefetch()
      }

      return true
    } catch (error: any) {
      console.error('Error creating object:', error)
      toast.error('Failed to save object', { id: 'save-object' })
      return false
    }
  }

  return {
    editedObject,
    setEditedObject,
    saveMetadata,
    deleteObject,
    createObject,
    hasMetadataChanged,
    isCreating: createFullObjectMutation.isPending,
  }
}
