'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  MoreHorizontal,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ObjectDetailsModal from './object-details-modal'
import AddObjectModal from './add-object-modal'
import PropertyDetailsModal from './property-details-modal'
import { objectsData } from '@/lib/data'

interface ObjectsTableProps {
  initialData?: any[]
  showParentLink?: boolean
}

export default function ObjectsTable({
  initialData,
  showParentLink = true,
}: ObjectsTableProps) {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)

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
    setSelectedObject(object)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (object: any) => {
    setSelectedObject(object)
    setIsEditModalOpen(true)
  }

  const handleDelete = (uuid: string) => {
    // Implement soft delete logic
    const updateObject = (objects: any[]): any[] => {
      return objects.map((obj) => {
        if (obj.uuid === uuid) {
          return { ...obj, isDeleted: true }
        }
        if (obj.children && obj.children.length > 0) {
          return { ...obj, children: updateObject(obj.children) }
        }
        return obj
      })
    }

    setData(updateObject(data))
  }

  const handleSave = (updatedObject: any) => {
    // Update object in the data structure
    const updateObject = (objects: any[]): any[] => {
      return objects.map((obj) => {
        if (obj.uuid === updatedObject.uuid) {
          return { ...updatedObject, updatedAt: new Date().toISOString() }
        }
        if (obj.children && obj.children.length > 0) {
          return { ...obj, children: updateObject(obj.children) }
        }
        return obj
      })
    }

    setData(updateObject(data))
    setIsEditModalOpen(false)
  }

  const toggleRow = (uuid: string, e: React.MouseEvent) => {
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

  const handlePropertyClick = (property: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProperty(property)
    setIsPropertyModalOpen(true)
  }

  const handleSaveProperty = (updatedProperty: any) => {
    // This would update the property in the data structure
    console.log('Updated property:', updatedProperty)
    setIsPropertyModalOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Filter function to remove deleted objects
  const filterDeleted = (objects: any[]): any[] => {
    return objects
      .filter((obj) => !obj.isDeleted)
      .map((obj) => {
        if (obj.children && obj.children.length > 0) {
          return { ...obj, children: filterDeleted(obj.children) }
        }
        return obj
      })
  }

  const visibleData = filterDeleted(data)

  const formatPropertyValue = (property: any) => {
    // Handle new property format with values array
    if (property.values && property.values.length > 0) {
      const values = property.values.map((v: any) => v.value).filter(Boolean)
      return values.join(', ')
    }

    // Handle old property format
    if (typeof property.value === 'string') {
      // Check if the value is a number with a decimal point
      if (/^-?\d+\.\d+$/.test(property.value)) {
        return Number.parseFloat(property.value).toFixed(2)
      }
      return property.value
    }

    return ''
  }

  const renderRows = (objects: any[], level = 0) => {
    return objects.flatMap((object) => {
      const hasChildren = object.children && object.children.length > 0
      const isExpanded = expandedRows[object.uuid]

      const rows = [
        <TableRow
          key={object.uuid}
          onDoubleClick={() => handleRowDoubleClick(object)}
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 16}px` }} />
              {hasChildren && showParentLink ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={(e) => toggleRow(object.uuid, e)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-7" />
              )}
              <span className="truncate max-w-[200px]">{object.name}</span>
            </div>
          </TableCell>
          <TableCell className="text-xs text-muted-foreground font-mono">
            {object.uuid}
          </TableCell>
          <TableCell>{formatDate(object.createdAt)}</TableCell>
          <TableCell>
            {object.properties.slice(0, 2).map((prop: any, index: number) => (
              <div
                key={`${object.uuid}-${prop.key}-${index}`}
                className="text-sm cursor-pointer hover:underline"
                onClick={(e) => handlePropertyClick(prop, e)}
              >
                <span className="font-medium">{prop.key}:</span>{' '}
                {formatPropertyValue(prop)}
              </div>
            ))}
            {object.properties.length > 2 && (
              <div className="text-xs text-muted-foreground mt-1">
                + {object.properties.length - 2} more properties
              </div>
            )}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDetails(object)}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(object)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(object)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(object.uuid)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  {hasChildren && showParentLink && (
                    <DropdownMenuItem
                      onClick={() => navigateToChildren(object)}
                    >
                      <ChevronRight className="mr-2 h-4 w-4" />
                      View Children
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>,
      ]

      // If this row is expanded and has children, recursively render the children
      if (hasChildren && isExpanded) {
        rows.push(...renderRows(object.children, level + 1))
      }

      return rows
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    )
  }

  return (
    <>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[280px]">UUID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Properties</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows(visibleData)}</TableBody>
      </Table>

      <ObjectDetailsModal
        object={selectedObject}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddObjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        object={selectedObject}
        onSave={handleSave}
      />

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveProperty}
      />
    </>
  )
}
