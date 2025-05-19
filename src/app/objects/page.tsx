'use client'

import { useState, useEffect, useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { useObjects } from '@/hooks'
import { Button } from '@/components/ui'
import { isObjectDeleted } from '@/lib/object-utils'
import ProtectedRoute from '@/components/protected-route'
import { ObjectViewContainer } from '@/components/object-views'
import { ViewSelector, ViewType } from '@/components/view-selector'
import { ObjectDetailsSheet, ObjectAddSheet } from '@/components/sheets'

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

function ObjectsPageContent() {
  // Use our custom hooks
  const { useAllObjects, useDeleteObject, useCreateFullObject } = useObjects()

  // Object queries
  const { data: allObjects = [], isLoading, isError, error } = useAllObjects()

  const objectModelsData: any[] = []

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

  const [viewType, setViewType] = useState<ViewType>('table')
  const [isObjectSheetOpen, setIsObjectSheetOpen] = useState(false)
  const [isObjectEditSheetOpen, setIsObjectEditSheetOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<any>(null)

  // Initialize view type from localStorage after the component mounts
  useEffect(() => {
    const savedView = localStorage.getItem('view')
    if (savedView) {
      setViewType(savedView as ViewType)
    }
  }, [])

  const handleAddObject = () => {
    setSelectedObject(null)
    setIsObjectEditSheetOpen(true)
  }

  const handleViewObject = (object: any) => {
    setSelectedObject(object)
    setIsObjectSheetOpen(true)
  }

  const handleEditObject = (object: any) => {
    setSelectedObject(object)
    setIsObjectSheetOpen(true)
  }

  const handleSaveObject = async (object: any) => {
    try {
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
      setIsObjectEditSheetOpen(false)
    } catch (err) {
      console.error('Error saving object:', err)
      toast.error('Failed to save object', { id: 'save-object' })
    }
  }

  // Handle object deletion
  const handleDeleteObject = async (uuid: string) => {
    try {
      toast.loading('Deleting object...', { id: 'delete-object' })
      await deleteObject.mutateAsync(uuid)
      toast.success('Object has been deleted!', { id: 'delete-object' })
      setSelectedObject(null)
    } catch (error) {
      console.error('Error deleting object:', error)
      toast.error('Failed to delete object', { id: 'delete-object' })
    }
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
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Objects</h1>
          <div className="flex items-center gap-4">
            <ViewSelector
              view={viewType}
              onChange={(value: ViewType) => {
                setViewType(value)
                localStorage.setItem('view', value)
              }}
            />
            <Button onClick={handleAddObject}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Object
            </Button>
          </div>
        </div>

        <ObjectViewContainer
          viewType={viewType}
          data={data}
          availableModels={objectModelsData}
          loading={isLoading}
          onViewObject={handleViewObject}
        />
      </div>

      {/* Object detail sheet */}
      <ObjectDetailsSheet
        isOpen={isObjectSheetOpen}
        onClose={() => setIsObjectSheetOpen(false)}
        object={selectedObject}
        uuid={selectedObject?.uuid}
        availableModels={objectModelsData}
        onDelete={(objectId) => {
          handleDeleteObject(objectId)
          setIsObjectSheetOpen(false)
        }}
        onEdit={() => handleEditObject(selectedObject)}
        isDeleted={isObjectDeleted(selectedObject)}
      />

      {/* Object add sheet */}
      <ObjectAddSheet
        isOpen={isObjectEditSheetOpen}
        onClose={() => {
          setIsObjectEditSheetOpen(false)
          setSelectedObject(null)
        }}
        availableModels={objectModelsData}
        onSave={handleSaveObject}
      />
    </div>
  )
}

// Export the wrapped component
export default function ObjectsPage() {
  return (
    <ProtectedRoute>
      <ObjectsPageContent />
    </ProtectedRoute>
  )
}
