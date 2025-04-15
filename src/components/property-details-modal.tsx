'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Upload, Plus, X, File } from 'lucide-react'
import { generateUUIDv7 } from '@/lib/utils'

interface PropertyValue {
  uuid: string
  value: string
  files: any[]
  creator?: string
  createdAt?: string
  updatedAt?: string
}

interface PropertyDetailsModalProps {
  property: {
    key: string
    values: PropertyValue[]
    files: any[]
    uuid?: string
    creator?: string
    createdAt?: string
    updatedAt?: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSave: (property: any) => void
}

export default function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  onSave,
}: PropertyDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [editedProperty, setEditedProperty] = useState<any>(null)

  // Initialize the edited property when the modal opens
  useEffect(() => {
    if (property) {
      // Handle old property format if needed
      const values = property.values || [
        {
          uuid: generateUUIDv7(),
          value: property.value || '',
          files: [],
          creator: 'Current User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      setEditedProperty({
        key: property.key,
        values,
        files: property.files || [],
        uuid: property.uuid || generateUUIDv7(),
        creator: property.creator || 'Current User',
        createdAt: property.createdAt || new Date().toISOString(),
        updatedAt: property.updatedAt || new Date().toISOString(),
      })
    }
  }, [property, isOpen])

  if (!property || !editedProperty) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleAddValue = () => {
    setEditedProperty({
      ...editedProperty,
      values: [
        ...editedProperty.values,
        {
          uuid: generateUUIDv7(),
          value: '',
          files: [],
          creator: 'Current User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  }

  const handleRemoveValue = (uuid: string) => {
    setEditedProperty({
      ...editedProperty,
      values: editedProperty.values.filter(
        (v: PropertyValue) => v.uuid !== uuid
      ),
    })
  }

  const handleValueChange = (uuid: string, newValue: string) => {
    setEditedProperty({
      ...editedProperty,
      values: editedProperty.values.map((v: PropertyValue) =>
        v.uuid === uuid ? { ...v, value: newValue } : v
      ),
    })
  }

  const handleAddFile = (target: 'property' | 'value', valueUuid?: string) => {
    // In a real app, this would open a file picker
    const newFile = {
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    if (target === 'property') {
      setEditedProperty({
        ...editedProperty,
        files: [...editedProperty.files, newFile],
      })
    } else if (target === 'value' && valueUuid) {
      setEditedProperty({
        ...editedProperty,
        values: editedProperty.values.map((v: PropertyValue) =>
          v.uuid === valueUuid ? { ...v, files: [...v.files, newFile] } : v
        ),
      })
    }
  }

  const handleSave = () => {
    // Update the updatedAt timestamp
    const updatedProperty = {
      ...editedProperty,
      updatedAt: new Date().toISOString(),
    }

    onSave(updatedProperty)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1"
          >
            <TabsList className="px-6 justify-start border-b rounded-none">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="values">Values</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="p-3 border rounded-md">
                    <p className="text-sm font-medium mb-1">UUID</p>
                    <p className="text-sm font-mono">{editedProperty.uuid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Creator</p>
                    <p className="text-sm text-muted-foreground">
                      {editedProperty.creator}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedProperty.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedProperty.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key">Property Name</Label>
                    <Input
                      id="key"
                      value={editedProperty.key}
                      onChange={(e) =>
                        setEditedProperty({
                          ...editedProperty,
                          key: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Values</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddValue}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Value
                      </Button>
                    </div>

                    {editedProperty.values.map((value: PropertyValue) => (
                      <div key={value.uuid} className="flex gap-2 items-center">
                        <Input
                          value={value.value}
                          onChange={(e) =>
                            handleValueChange(value.uuid, e.target.value)
                          }
                          placeholder="Value"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddFile('value', value.uuid)}
                          title="Attach file"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveValue(value.uuid)}
                          disabled={editedProperty.values.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="values" className="mt-0 space-y-4">
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedProperty.values.map((value: PropertyValue) => (
                      <TableRow key={value.uuid}>
                        <TableCell>
                          {value.value || (
                            <span className="text-muted-foreground italic">
                              Empty value
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{value.creator || 'Unknown'}</TableCell>
                        <TableCell>
                          {value.createdAt
                            ? formatDate(value.createdAt)
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {value.files && value.files.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {value.files.map((file: any) => (
                                <div
                                  key={file.uuid}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <File className="h-3 w-3" />
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No files
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddFile('value', value.uuid)}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Attach
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddValue}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Value
                </Button>
              </TabsContent>

              <TabsContent value="files" className="mt-0 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Property Files</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFile('property')}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload File
                  </Button>
                </div>

                {editedProperty.files && editedProperty.files.length > 0 ? (
                  <Table className="border">
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedProperty.files.map((file: any) => (
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
                      This property doesn't have any files attached.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleAddFile('property')}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload File
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>

            <DialogFooter className="p-6 pt-2 border-t mt-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
