'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  FileText,
  ArrowRight,
} from 'lucide-react'

import { processData } from '@/lib/data'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ProcessDetailsSheet, ProcessFormSheet } from '@/components/sheets'

export function ProcessTable() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from the data file
  useEffect(() => {
    setData(processData)
    setIsLoading(false)
  }, [])

  const handleViewDetails = (process: any) => {
    setSelectedProcess(process)
    setIsDetailsSheetOpen(true)
  }

  const handleEdit = (process: any) => {
    setSelectedProcess(process)
    setIsEditSheetOpen(true)
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
    setIsEditSheetOpen(false)
  }

  const handleRowClick = (process: any) => {
    router.push(`/process/${process.uuid}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Filter out deleted items
  const visibleData = data.filter((item) => !item.isDeleted)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UUID</TableHead>
              <TableHead>Inputs</TableHead>
              <TableHead className="w-[50px] text-center"></TableHead>
              <TableHead>Outputs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleData.map((item) => (
              <TableRow
                key={item.uuid}
                onDoubleClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    {item.uuid}
                  </div>
                </TableCell>
                <TableCell>
                  {item.inputs?.slice(0, 1).map((input: any) => (
                    <div
                      key={input.id}
                      className="text-sm flex items-center mb-1"
                    >
                      <span className="truncate max-w-[150px] inline-block">
                        {input.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({input.quantity} {input.unit})
                      </span>
                    </div>
                  ))}
                  {item.inputs && item.inputs.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      + {item.inputs.length - 1} more inputs
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                </TableCell>
                <TableCell>
                  {item.outputs?.slice(0, 1).map((output: any) => (
                    <div
                      key={output.id}
                      className="text-sm flex items-center mb-1"
                    >
                      <span className="truncate max-w-[150px] inline-block">
                        {output.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({output.quantity} {output.unit})
                      </span>
                    </div>
                  ))}
                  {item.outputs && item.outputs.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      + {item.outputs.length - 1} more outputs
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
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(item)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.uuid)}
                        >
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
      </div>

      <ProcessDetailsSheet
        process={selectedProcess}
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
      />

      <ProcessFormSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        process={selectedProcess}
        allProcesses={data}
        onSave={handleSave}
      />
    </>
  )
}
