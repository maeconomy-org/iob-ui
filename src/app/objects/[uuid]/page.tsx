'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Info } from 'lucide-react'

import { objectsData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/breadcrumbs'
import ObjectsTable from '@/components/objects-table'
import ObjectDetailsModal from '@/components/object-details-modal'

export default function ObjectChildrenPage() {
  const params = useParams()
  const [parentObject, setParentObject] = useState<any>(null)
  const [childrenData, setChildrenData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true)
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
                onClick={handleViewDetails}
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
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Children</h2>
        </div>

        {childrenData.length > 0 ? (
          <ObjectsTable initialData={childrenData} showParentLink={true} />
        ) : (
          <div className="flex justify-center items-center h-40 border rounded-md bg-muted/50">
            <p className="text-muted-foreground">No children found</p>
          </div>
        )}
      </div>

      <ObjectDetailsModal
        object={parentObject}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  )
}
