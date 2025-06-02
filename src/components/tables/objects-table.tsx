'use client'

import { MouseEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, QrCode } from 'lucide-react'
import { toast } from 'sonner'

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  CopyButton,
} from '@/components/ui'
import { useObjects } from '@/hooks'
import { objectsData } from '@/lib/data'
import { QRCodeModal, DeleteConfirmationDialog } from '@/components/modals'

interface ObjectsTableProps {
  initialData?: any[]
  showParentLink?: boolean
  availableModels?: any[]
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
  pagination?: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}

const isObjectDeleted = (object: any) => {
  if (!object || !object.softDeleted) return false
  return object.softDeleted === true
}

export function ObjectsTable({
  initialData,
  showParentLink = true,
  onViewObject,
  pagination,
}: ObjectsTableProps) {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [objectToDelete, setObjectToDelete] = useState<any>(null)
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [selectedQRObject, setSelectedQRObject] = useState<any>(null)

  // Get the delete mutation
  const { useDeleteObject } = useObjects()
  const { mutateAsync: deleteObject } = useDeleteObject()

  // Load data from props or from the data file
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    } else {
      setData(objectsData)
    }
    setIsLoading(false)
  }, [initialData])

  const handleViewDetails = (object: any) => {
    if (onViewObject) {
      if (object && object.uuid) {
        onViewObject(object)
      }
    }
  }

  // Update the delete handler to use the API mutation
  const handleDeleteConfirm = async (uuid: string) => {
    try {
      await deleteObject(uuid)
      // Show a success toast
      toast.success('Object deleted successfully')

      // Update the local data to reflect the deletion
      // This assumes the API doesn't automatically trigger a refetch
      setData((prev) => {
        const updateDeleted = (items: any[]): any[] => {
          return items.map((item) => {
            if (item.uuid === uuid) {
              return {
                ...item,
                softDeleted: true,
                softDeletedAt: new Date().toISOString(),
              }
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: updateDeleted(item.children),
              }
            }
            return item
          })
        }
        return updateDeleted(prev)
      })

      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting object:', error)
      toast.error('Failed to delete object')
    }
  }

  const handleShowQRCode = (object: any, e: MouseEvent) => {
    e.stopPropagation()
    setSelectedQRObject(object)
    setIsQRCodeModalOpen(true)
  }

  const toggleRow = (uuid: string, e: MouseEvent) => {
    e.stopPropagation()
    setExpandedRows((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }))
  }

  const navigateToChildren = (object: any) => {
    if (object.children && object.children.length > 0) {
      router.push(`/objects/${object.uuid}`)
    }
  }

  const handleRowDoubleClick = (object: any) => {
    if (object.children && object.children.length > 0) {
      navigateToChildren(object)
    } else {
      handleViewDetails(object)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const renderRows = (objects: any[], level = 0) => {
    return objects.flatMap((object) => {
      const hasChildren = object.children && object.children.length > 0
      const isExpanded = expandedRows[object.uuid]
      const isDeleted = isObjectDeleted(object)

      const rows = [
        <TableRow
          key={object.uuid}
          onDoubleClick={() => handleRowDoubleClick(object)}
          className={`cursor-pointer hover:bg-muted/50 ${
            isDeleted ? 'bg-destructive/10' : ''
          }`}
        >
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 16}px` }} />
              <span
                className={`truncate max-w-[200px] ${
                  isDeleted ? 'line-through text-destructive' : ''
                }`}
              >
                {object.name}
              </span>
              {isDeleted && (
                <span className="ml-2 text-xs text-destructive">(Deleted)</span>
              )}
            </div>
          </TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground truncate">
            <div className="flex items-center gap-2">
              <span className="truncate flex">{object.uuid}</span>
              <CopyButton text={object.uuid} label="UUID" />
            </div>
          </TableCell>
          <TableCell>{formatDate(object.createdAt)}</TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleShowQRCode(object, e)}
              title="Show QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails(object)
                }}
              >
                <FileText className="h-4 w-4" />
              </Button>

              {!isDeleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setObjectToDelete(object)
                    setIsDeleteModalOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>,
      ]

      // if (hasChildren && isExpanded) {
      //   rows.push(...renderRows(object.children, level + 1))
      // }

      return rows
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>UUID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8" {...{ colSpan: 5 }}>
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    Loading objects...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8" {...{ colSpan: 5 }}>
                  <div className="flex flex-col items-center">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Objects Found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      There are no objects to display
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              renderRows(data)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info footer */}
      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}-
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalElements
            )}{' '}
            of {pagination.totalElements} objects
          </div>
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQRCodeModalOpen && selectedQRObject && (
        <QRCodeModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          uuid={selectedQRObject.uuid}
          objectName={selectedQRObject.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteModalOpen && objectToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          objectName={objectToDelete.name}
          onDelete={() => handleDeleteConfirm(objectToDelete.uuid)}
        />
      )}
    </div>
  )
}
