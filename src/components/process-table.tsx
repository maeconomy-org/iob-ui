'use client'

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
import { Pencil, Trash2, MoreHorizontal, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ProcessDetailsModal from './process-details-modal'
import AddMaterialModal from './add-material-modal'
import { processData } from '@/lib/data'

export default function ProcessTable() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from the data file
  useEffect(() => {
    setData(processData)
    setIsLoading(false)
  }, [])

  const handleViewDetails = (process: any) => {
    setSelectedProcess(process)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (process: any) => {
    setSelectedProcess(process)
    setIsEditModalOpen(true)
  }

  const handleDelete = (uuid: string) => {
    // Implement soft delete logic
    setData((prevData) =>
      prevData.map((item) =>
        item.uuid === uuid ? { ...item, isDeleted: true } : item
      )
    )
  }

  const handleSave = (updatedProcess: any) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.uuid === updatedProcess.uuid
          ? { ...updatedProcess, updatedAt: new Date().toISOString() }
          : item
      )
    )
    setIsEditModalOpen(false)
  }

  const handleRowClick = (process: any) => {
    router.push(`/process/${process.uuid}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPropertyValue = (properties: any[], key: string) => {
    const property = properties.find((prop) => prop.key === key)
    if (!property) return ''

    if (property.values && property.values.length > 0) {
      return property.values.map((v: any) => v.value).join(', ')
    }

    return property.value || ''
  }

  // Filter out deleted items
  const visibleData = data.filter((item) => !item.isDeleted)

  const formatPropertyValue = (value: string) => {
    // Check if the value is a number with a decimal point
    if (/^-?\d+\.\d+$/.test(value)) {
      return Number.parseFloat(value).toFixed(2)
    }
    return value
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
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[280px]">UUID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Inputs</TableHead>
            <TableHead>Outputs</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((item) => (
            <TableRow
              key={item.uuid}
              onDoubleClick={() => handleRowClick(item)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div>
                  <span className="truncate max-w-[180px] inline-block">
                    {item.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {item.uuid}
              </TableCell>
              <TableCell>
                {formatPropertyValue(
                  getPropertyValue(item.properties, 'quantity')
                )}{' '}
                {getPropertyValue(item.properties, 'unit')}
              </TableCell>
              <TableCell>
                {item.inputs?.slice(0, 2).map((input: any) => (
                  <div key={input.uuid} className="text-sm mb-1">
                    <span className="truncate max-w-[150px] inline-block">
                      {input.name}
                    </span>
                  </div>
                ))}
                {item.inputs && item.inputs.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + {item.inputs.length - 2} more inputs
                  </div>
                )}
              </TableCell>
              <TableCell>
                {item.outputs?.slice(0, 2).map((output: any) => (
                  <div key={output.uuid} className="text-sm mb-1">
                    <span className="truncate max-w-[150px] inline-block">
                      {output.name}
                    </span>
                  </div>
                ))}
                {item.outputs && item.outputs.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + {item.outputs.length - 2} more outputs
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(item)}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.uuid)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProcessDetailsModal
        process={selectedProcess}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        material={selectedProcess}
        onSave={handleSave}
      />
    </>
  )
}
