'use client'

import { useState } from 'react'
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
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EntityForm from './entity-form'

// Mock data structure
const initialData = [
  {
    id: 1,
    name: 'House A',
    type: 'House',
    properties: { width: '10m', height: '8m' },
    children: [
      {
        id: 2,
        name: 'First Floor',
        type: 'Floor',
        properties: { area: '80m²' },
        children: [
          {
            id: 3,
            name: 'Living Room',
            type: 'Room',
            properties: { area: '30m²' },
            children: [
              {
                id: 4,
                name: 'North Wall',
                type: 'Wall',
                properties: { length: '5m', height: '3m' },
                children: [],
              },
              {
                id: 5,
                name: 'South Wall',
                type: 'Wall',
                properties: { length: '5m', height: '3m' },
                children: [],
              },
            ],
          },
          {
            id: 6,
            name: 'Kitchen',
            type: 'Room',
            properties: { area: '20m²' },
            children: [
              {
                id: 7,
                name: 'East Wall',
                type: 'Wall',
                properties: { length: '4m', height: '3m' },
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 8,
        name: 'Second Floor',
        type: 'Floor',
        properties: { area: '75m²' },
        children: [],
      },
      {
        id: 9,
        name: 'Foundation',
        type: 'Foundation',
        properties: { depth: '2m', material: 'Concrete' },
        children: [],
      },
    ],
  },
  {
    id: 10,
    name: 'House B',
    type: 'House',
    properties: { width: '12m', height: '7m' },
    children: [],
  },
]

export default function HierarchyTable() {
  const [data, setData] = useState(initialData)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({
    1: true,
  })
  const [editEntity, setEditEntity] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleEdit = (entity: any) => {
    setEditEntity(entity)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    // Implement delete logic here
    alert(`Delete entity with ID: ${id}`)
  }

  const renderRows = (entities: any[], level = 0) => {
    return entities.flatMap((entity) => {
      const isExpanded = expandedRows[entity.id]
      const hasChildren = entity.children && entity.children.length > 0

      const rows = [
        <TableRow key={entity.id}>
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 24}px` }} />
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={() => toggleRow(entity.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-7" />}
              <span>{entity.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{entity.type}</Badge>
          </TableCell>
          <TableCell>
            {Object.entries(entity.properties).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(entity)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(entity.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                {hasChildren && (
                  <DropdownMenuItem
                    onClick={() => handleEdit({ parentId: entity.id })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>,
      ]

      if (hasChildren && isExpanded) {
        rows.push(...renderRows(entity.children, level + 1))
      }

      return rows
    })
  }

  return (
    <>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Properties</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows(data)}</TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editEntity && editEntity.parentId
                ? 'Add New Entity'
                : editEntity
                  ? 'Edit Entity'
                  : 'Entity Details'}
            </DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={editEntity}
            onSave={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
