'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Info, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui'
import Breadcrumbs from '@/components/breadcrumbs'
import { ObjectsTable } from '@/components/tables'
import { objectsData, objectModelsData } from '@/lib/data'
import { DeleteConfirmationDialog } from '@/components/modals'
import { ObjectDetailsSheet, ObjectEditSheet } from '@/components/sheets'
import { useObjects } from '@/hooks'

export default function ObjectChildrenPage() {
  const params = useParams()
  const { useUpdateObject, useDeleteObject } = useObjects()

  const updateObjectMutation = useUpdateObject()
  const deleteObject = useDeleteObject()

  const [parentObject, setParentObject] = useState<any>(null)
  const [childrenData, setChildrenData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Parent object view states
  const [isParentDetailsSheetOpen, setIsParentDetailsSheetOpen] =
    useState(false)

  // Child object states
  const [isObjectSheetOpen, setIsObjectSheetOpen] = useState(false)
  const [isObjectEditSheetOpen, setIsObjectEditSheetOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [objectSheetMode, setObjectSheetMode] = useState<'add' | 'edit'>('add')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [objectToDelete, setObjectToDelete] = useState<any>(null)

  // Function to check if an object is deleted
  const isObjectDeleted = (object: any) => {
    // Check if the object is marked as deleted in its metadata
    return object?.metadata?.deleted === true
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

  useEffect(() => {
    const uuid = params.uuid as string

    // Find the parent object and its children
    const findObjectAndChildren = (
      objects: any[]
    ): { parent: any; children: any[] } | null => {
      for (const obj of objects) {
        if (obj.uuid === uuid) {
          return { parent: obj, children: obj.children || [] }
        }

        if (obj.children && obj.children.length > 0) {
          const result = findObjectAndChildren(obj.children)
          if (result) return result
        }
      }

      return null
    }

    const result = findObjectAndChildren(objectsData)

    if (result) {
      setParentObject(result.parent)
      setChildrenData(result.children)
    }

    setIsLoading(false)
  }, [params.uuid])

  const handleViewParentDetails = () => {
    setIsParentDetailsSheetOpen(true)
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

  const handleAddObject = () => {
    setSelectedObject(null)
    setObjectSheetMode('add')
    setIsObjectEditSheetOpen(true)
  }

  const handleSaveObject = (object: any) => {
    if (objectSheetMode === 'add') {
      setChildrenData([...childrenData, object])
    } else {
      setChildrenData(
        childrenData.map((obj: any) =>
          obj.uuid === object.uuid ? object : obj
        )
      )
    }
    setIsObjectEditSheetOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    )
  }

  if (!parentObject) {
    return (
      <div className="flex flex-col flex-1">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
          <div className="flex justify-center items-center h-40">
            <p>Object not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto px-4">
        <Breadcrumbs />

        <div className="mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{parentObject.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleViewParentDetails}
                className="h-8 w-8"
                title="View object details"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {parentObject.uuid}
            </p>
          </div>

          <Button onClick={handleAddObject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Children</h2>
        </div>

        {childrenData.length > 0 ? (
          <ObjectsTable
            initialData={childrenData}
            showParentLink={true}
            onViewObject={handleViewObject}
            onEditObject={handleEditObject}
            availableModels={objectModelsData}
          />
        ) : (
          <div className="flex justify-center items-center h-40 border rounded-md bg-muted/50">
            <p className="text-muted-foreground">No children found</p>
          </div>
        )}
      </div>

      {/* Parent Object Details Sheet */}
      <ObjectDetailsSheet
        isOpen={isParentDetailsSheetOpen}
        onClose={() => setIsParentDetailsSheetOpen(false)}
        object={parentObject}
        uuid={parentObject?.uuid}
        availableModels={objectModelsData}
        onEdit={() => {
          // Handle parent editing if needed
        }}
        onDelete={(objectId) => handleDeleteObject(objectId)}
        isDeleted={isObjectDeleted(parentObject)}
      />

      {/* Child Object Details Sheet */}
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
        onDelete={(objectId) => handleDeleteObject(objectId)}
        isDeleted={isObjectDeleted(selectedObject)}
      />

      {/* Add/Edit Child Object Sheet */}
      <ObjectEditSheet
        isOpen={isObjectEditSheetOpen}
        onClose={() => setIsObjectEditSheetOpen(false)}
        object={selectedObject}
        availableModels={objectModelsData}
        mode={objectSheetMode}
        onSave={handleSaveObject}
      />

      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        objectName={objectToDelete?.name || 'this child object'}
        onDelete={() => {
          console.log('objectToDelete', objectToDelete)
          if (objectToDelete) {
            handleDeleteObject(objectToDelete.uuid)
            setIsDeleteModalOpen(false)
            setObjectToDelete(null)
          }
        }}
      />
    </div>
  )
}
