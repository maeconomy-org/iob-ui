'use client'

import { useState, useEffect, useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { useObjects, useAggregate } from '@/hooks'
import { Button } from '@/components/ui'
import { isObjectDeleted } from '@/lib/object-utils'
import ProtectedRoute from '@/components/protected-route'
import { ObjectViewContainer } from '@/components/object-views'
import { ViewSelector, ViewType } from '@/components/view-selector'
import { ObjectDetailsSheet, ObjectAddSheet } from '@/components/sheets'
import type { AggregateEntity } from '@/types/iob'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useAuth } from '@/contexts/auth-context'

// Define extended object type that works with aggregate data
interface ExtendedObject extends AggregateEntity {
  // AggregateEntity already has all the fields we need
  [key: string]: any // Allow other properties for backward compatibility
}

function ObjectsPageContent() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0) // 0-based for API
  const [pageSize] = useState(12) // Fixed page size - good balance for both views

  const { certFingerprint } = useAuth()

  // Use aggregate API with pagination for better performance and richer data
  const { useAggregateEntities } = useAggregate()
  const { useDeleteObject, useCreateFullObject } = useObjects()

  // Get paginated aggregate data for objects
  const {
    data: aggregateResponse,
    isLoading,
    isError,
    error,
  } = useAggregateEntities(
    {
      page: currentPage,
      size: pageSize,
      createdBy: certFingerprint,
    },
    {
      staleTime: 30000, // Cache for 30 seconds
      keepPreviousData: true, // Keep previous page data while loading new page
    }
  )

  // Extract content from paginated response
  const allObjects = aggregateResponse?.content || []

  const objectModelsData: any[] = []

  // Filter objects to only show the latest version of each UUID
  const data = useMemo(() => {
    if (!allObjects || allObjects.length === 0) return []

    const uniqueObjects = new Map<string, ExtendedObject>()

    // Sort by createdAt in descending order (newest first)
    const sortedObjects = [...allObjects].sort(
      (a: AggregateEntity, b: AggregateEntity) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      }
    )

    // Take only the first (newest) object for each UUID
    sortedObjects.forEach((object: AggregateEntity) => {
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

  // Reset to first page when view type changes
  useEffect(() => {
    setCurrentPage(0)
  }, [viewType])

  // Calculate pagination info
  const totalPages = aggregateResponse?.totalPages || 0
  const totalElements = aggregateResponse?.totalElements || 0
  const isFirstPage = aggregateResponse?.first ?? true
  const isLastPage = aggregateResponse?.last ?? true

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1)
    }
  }

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
          Error loading objects data
        </h3>
        <p className="text-gray-600 text-center">
          {error instanceof Error
            ? error.message
            : 'Unknown error occurred while fetching aggregate data'}
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
          <div>
            <h1 className="text-2xl font-bold">Objects</h1>
          </div>
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
          // Pass pagination info to views
          pagination={{
            currentPage: currentPage + 1, // 1-based for display
            totalPages,
            totalElements,
            pageSize,
            isFirstPage,
            isLastPage,
          }}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    className={
                      isFirstPage
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* Show page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number

                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    pageNum = i
                  } else if (currentPage <= 3) {
                    // Show first 7 pages
                    pageNum = i
                  } else if (currentPage >= totalPages - 4) {
                    // Show last 7 pages
                    pageNum = totalPages - 7 + i
                  } else {
                    // Show pages around current page
                    pageNum = currentPage - 3 + i
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    className={
                      isLastPage
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
