'use client'

import { useState } from 'react'
import { PlusCircle, X, Upload, File } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePropertyEditor } from '@/hooks/use-property-editor'

interface PropertyDetailsModalProps {
  property: any
  isOpen: boolean
  onClose: () => void
  onSave?: (property: any) => void
}

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  onSave,
}: PropertyDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('values')

  const {
    property: editedProperty,
    newValue,
    setNewValue,
    addValue,
    removeValue,
    updateValue,
    addFileToProperty,
    addFileToValue,
    removeFileFromProperty,
    removeFileFromValue,
    formatDate,
  } = usePropertyEditor(property)

  if (!property || !editedProperty) return null

  const handleSave = () => {
    if (onSave) {
      onSave(editedProperty)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-xl">{property.key}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="px-6 justify-start h-12 border-b rounded-none">
            <TabsTrigger
              value="metadata"
              className="text-base px-4 py-2 data-[state=active]:bg-white"
            >
              Metadata
            </TabsTrigger>
            <TabsTrigger
              value="values"
              className="text-base px-4 py-2 data-[state=active]:bg-white"
            >
              Values
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="text-base px-4 py-2 data-[state=active]:bg-white"
            >
              Files
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="values" className="mt-0 space-y-4 mb-4">
              <div className="space-y-4">
                {editedProperty.values ? (
                  editedProperty.values.map((value: any, index: number) => (
                    <div
                      key={value.uuid}
                      className="border rounded-md p-3 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Value {index + 1}</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => addFileToValue(index)}
                            title="Add file to value"
                            className="h-8 w-8"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          {editedProperty.values.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeValue(index)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Input
                        value={value.value}
                        onChange={(e) => updateValue(index, e.target.value)}
                        className="mt-1"
                      />
                      {value.files && value.files.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <Label className="text-xs text-muted-foreground">
                            Files
                          </Label>
                          <div className="space-y-1">
                            {value.files.map((file: any, fileIndex: number) => (
                              <div
                                key={file.uuid}
                                className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded border"
                              >
                                <div className="flex items-center">
                                  <File className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(file.uploadedAt)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeFileFromValue(index, fileIndex)
                                    }
                                    className="h-6 w-6"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border rounded-md p-3 space-y-2">
                    <Label className="text-sm">Value</Label>
                    <Input
                      value={property.value || ''}
                      onChange={(e) => updateValue(0, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="border rounded-md p-3 space-y-2">
                  <Label className="text-sm">Add New Value</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter new value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addValue}
                      size="sm"
                      className="shrink-0"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0 space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Property Files</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFileToProperty}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {editedProperty.files && editedProperty.files.length > 0 ? (
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">File Name</TableHead>
                      <TableHead className="w-[15%]">Size</TableHead>
                      <TableHead className="w-[25%]">Uploaded</TableHead>
                      <TableHead className="w-[10%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedProperty.files.map((file: any, index: number) => (
                      <TableRow key={file.uuid}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFileFromProperty(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                  <File className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Files</h3>
                  <p className="text-sm text-muted-foreground">
                    This property doesn't have any files attached.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={addFileToProperty}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="mt-0 space-y-4 mb-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">
                    Identification
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Property UUID
                    </p>
                    <p className="text-sm font-mono">{property.uuid}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Property Key
                    </p>
                    <p className="text-sm">{property.key}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {property.creator && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Creator
                        </p>
                        <p className="text-sm">{property.creator}</p>
                      </div>
                    )}
                    {property.createdAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Created
                        </p>
                        <p className="text-sm">
                          {formatDate(property.createdAt)}
                        </p>
                      </div>
                    )}
                    {property.updatedAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Updated
                        </p>
                        <p className="text-sm">
                          {formatDate(property.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-auto shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
