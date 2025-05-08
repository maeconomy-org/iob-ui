'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { objectsData, objectModelsData } from '@/lib/data'
import { ObjectViewContainer } from '@/components/object-views'
import { ObjectDetailsSheet, ObjectEditSheet } from '@/components/sheets'
import { ViewSelector, ViewType } from '@/components/view-selector'

import { createClient } from 'iob-client'

export default function ObjectsPage() {
  const [data, setData] = useState(objectsData)
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

  const handleSaveObject = (object: any) => {
    console.log('Save object:', object)

    // Handle multi-import case
    if (object.isMultiImport && object.importedObjects) {
      const { importedObjects, parentId } = object

      // If parent specified, add objects as children
      if (parentId) {
        // Create a deep copy of the data
        const updatedData = JSON.parse(JSON.stringify(data))

        // Recursive function to find parent and add children
        const addChildrenToParent = (
          items: any[],
          id: string,
          newChildren: any[]
        ) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].uuid === id) {
              // Add imported objects as children
              items[i].children = [...(items[i].children || []), ...newChildren]
              return true
            }

            // Recursively check children
            if (items[i].children?.length) {
              if (addChildrenToParent(items[i].children, id, newChildren)) {
                return true
              }
            }
          }
          return false
        }

        // Add children to parent
        addChildrenToParent(updatedData, parentId, importedObjects)
        setData(updatedData)
      }
      // Otherwise add as root objects
      else {
        setData([...data, ...importedObjects])
      }

      return
    }

    // Handle normal single object save
    if (objectSheetMode === 'add') {
      setData([...data, object])
    } else {
      setData(data.map((obj: any) => (obj.uuid === object.uuid ? object : obj)))
    }
    setIsObjectEditSheetOpen(false)
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
          />
        </div>
      </div>

      {/* View Object Details Sheet */}
      <ObjectDetailsSheet
        isOpen={isObjectSheetOpen}
        onClose={() => setIsObjectSheetOpen(false)}
        object={selectedObject}
        availableModels={objectModelsData}
        onEdit={() => {
          setIsObjectSheetOpen(false)
          setObjectSheetMode('edit')
          setIsObjectEditSheetOpen(true)
        }}
        onDelete={() => {
          // Simple delete implementation
          setData(data.filter((obj: any) => obj.uuid !== selectedObject?.uuid))
          setIsObjectSheetOpen(false)
        }}
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
