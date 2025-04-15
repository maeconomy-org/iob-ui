'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, FileText, Upload, File } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PropertyDetailsModal from './property-details-modal'

interface ObjectDetailsModalProps {
  object: any
  isOpen: boolean
  onClose: () => void
}

export default function ObjectDetailsModal({
  object,
  isOpen,
  onClose,
}: ObjectDetailsModalProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  if (!object) return null

  const toggleRow = (uuid: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyModalOpen(true)
  }

  const handleSaveProperty = (updatedProperty: any) => {
    // This would update the property in the data structure
    console.log('Updated property:', updatedProperty)
    setIsPropertyModalOpen(false)
  }

  const handleAddFile = () => {
    // In a real app, this would open a file picker
    console.log('Add file to object:', object.uuid)
  }

  const renderChildRows = (children: any[], level = 0) => {
    return children.flatMap((child) => {
      const isExpanded = expandedRows[child.uuid]
      const hasChildren = child.children && child.children.length > 0

      const rows = [
        <TableRow key={child.uuid}>
          <TableCell className="font-medium">
            <div className="flex items-center">
              <div style={{ width: `${level * 24}px` }} />
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={() => toggleRow(child.uuid)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-7" />}
              <span>{child.name}</span>
            </div>
          </TableCell>
          <TableCell>
            {child.properties.map((prop: any) => (
              <div
                key={prop.uuid}
                className="text-sm cursor-pointer hover:underline"
                onClick={() => handlePropertyClick(prop)}
              >
                <span className="font-medium">{prop.key}:</span>{' '}
                {prop.values && prop.values.length > 0
                  ? prop.values.map((v: any) => v.value).join(', ')
                  : prop.value}
              </div>
            ))}
          </TableCell>
        </TableRow>,
      ]

      if (hasChildren && isExpanded) {
        rows.push(...renderChildRows(child.children, level + 1))
      }

      return rows
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <div className="flex flex-col h-full max-h-[85vh]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <span>{object.name}</span>
              </DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1"
            >
              <TabsList className="px-6 justify-start border-b rounded-none">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="children">Children</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6 pt-4">
                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm font-medium mb-1">UUID</p>
                      <p className="text-sm font-mono">{object.uuid}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Creator</p>
                      <p className="text-sm text-muted-foreground">
                        {object.creator}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created At</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(object.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Updated At</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(object.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Properties</h3>
                    </div>
                    <div className="space-y-3">
                      {object.properties.map((prop: any) => (
                        <div
                          key={prop.uuid}
                          className="flex flex-col p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                          onClick={() => handlePropertyClick(prop)}
                        >
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {prop.key}
                            </span>
                            {prop.files && prop.files.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {prop.files.length} files
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            {prop.values ? (
                              prop.values.map((val: any, index: number) => (
                                <div
                                  key={val.uuid}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm">{val.value}</span>
                                  {val.files && val.files.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      ({val.files.length} files)
                                    </span>
                                  )}
                                  {index < prop.values.length - 1 && (
                                    <span className="text-muted-foreground">
                                      ,
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm">{prop.value}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="children" className="mt-0">
                  {object.children && object.children.length > 0 ? (
                    <Table className="border">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Name</TableHead>
                          <TableHead>Properties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{renderChildRows(object.children)}</TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No Children</h3>
                      <p className="text-sm text-muted-foreground">
                        This object doesn't have any children.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="files" className="mt-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Object Files</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddFile}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload File
                    </Button>
                  </div>

                  {object.files && object.files.length > 0 ? (
                    <Table className="border">
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {object.files.map((file: any) => (
                          <TableRow key={file.uuid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4" />
                                {file.name}
                              </div>
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No Files</h3>
                      <p className="text-sm text-muted-foreground">
                        This object doesn't have any files attached.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={handleAddFile}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload File
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </div>

              <DialogFooter className="p-6 pt-2 border-t mt-auto">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </DialogFooter>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveProperty}
      />
    </>
  )
}
