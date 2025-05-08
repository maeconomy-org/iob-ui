'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Upload,
  File,
  Info,
  PlusCircle,
  Edit,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge as UIBadge } from '@/components/ui/badge'
import { PropertyDetailsModal } from '@/components/modals/property-details-modal'
import { usePropertyEditor } from '@/hooks/use-property-editor'
import { Separator } from '@/components/ui/separator'
import { generateUUIDv7 } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ObjectDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  object: any
  model?: any
}

interface PropertyValueState {
  uuid: string
  value: string
  files: any[]
}

export function ObjectDetailsModal({
  isOpen,
  onClose,
  object,
  model,
}: ObjectDetailsModalProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [newPropertyKey, setNewPropertyKey] = useState('')
  const [newPropertyValues, setNewPropertyValues] = useState<
    PropertyValueState[]
  >([{ uuid: generateUUIDv7(), value: '', files: [] }])
  const [newPropertyFiles, setNewPropertyFiles] = useState<any[]>([])

  // Get property editor utils from the hook - moved before conditional return
  const propertyEditor = usePropertyEditor(selectedProperty)

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

  const handleOpenPropertyModal = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyModalOpen(true)
  }

  const handleSaveProperty = (updatedProperty: any) => {
    // Here you would typically update the property in your data store
    console.log('Property updated:', updatedProperty)
    setIsPropertyModalOpen(false)
  }

  const handleAddFile = () => {
    // In a real app, this would open a file picker
    const newFile = {
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    // Initialize files array if it doesn't exist
    if (!object.files) {
      object.files = []
    }

    // Add file to the object
    object.files.push(newFile)
  }

  const handleAddPropertyValue = () => {
    setNewPropertyValues([
      ...newPropertyValues,
      { uuid: generateUUIDv7(), value: '', files: [] },
    ])
  }

  const handleRemovePropertyValue = (index: number) => {
    if (newPropertyValues.length > 1) {
      const updatedValues = [...newPropertyValues]
      updatedValues.splice(index, 1)
      setNewPropertyValues(updatedValues)
    }
  }

  const handlePropertyValueChange = (index: number, value: string) => {
    const updatedValues = [...newPropertyValues]
    updatedValues[index].value = value
    setNewPropertyValues(updatedValues)
  }

  const handleAddFileToValue = (valueIndex: number) => {
    // Simulate adding a file
    const newFile = {
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    const updatedValues = [...newPropertyValues]
    updatedValues[valueIndex].files.push(newFile)
    setNewPropertyValues(updatedValues)
  }

  const handleAddFileToProperty = () => {
    // Simulate adding a file to the property
    const newFile = {
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    setNewPropertyFiles([...newPropertyFiles, newFile])
  }

  const handleRemoveFileFromValue = (valueIndex: number, fileIndex: number) => {
    const updatedValues = [...newPropertyValues]
    updatedValues[valueIndex].files.splice(fileIndex, 1)
    setNewPropertyValues(updatedValues)
  }

  const handleRemoveFileFromProperty = (fileIndex: number) => {
    const updatedFiles = [...newPropertyFiles]
    updatedFiles.splice(fileIndex, 1)
    setNewPropertyFiles(updatedFiles)
  }

  const handleAddProperty = () => {
    if (!newPropertyKey.trim()) {
      // Validate that property key is not empty
      return
    }

    // Create new property in the new format with values array
    const newProperty = {
      uuid: generateUUIDv7(),
      key: newPropertyKey.trim(),
      values: newPropertyValues.map((v) => ({
        uuid: v.uuid,
        value: v.value.trim(),
        files: v.files,
        creator: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      files: newPropertyFiles,
      creator: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to object properties array (or initialize if needed)
    if (!object.properties) {
      object.properties = []
    }

    if (Array.isArray(object.properties)) {
      object.properties.push(newProperty as any)
    } else {
      // Convert object format to array format if needed
      const propertiesArray = Object.entries(object.properties).map(
        ([key, value]) => ({
          uuid: generateUUIDv7(),
          key,
          values: [
            {
              uuid: generateUUIDv7(),
              value: value as string,
              files: [],
            },
          ],
          files: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      )

      propertiesArray.push(newProperty as any)
      object.properties = propertiesArray
    }

    // Reset form
    setNewPropertyKey('')
    setNewPropertyValues([{ uuid: generateUUIDv7(), value: '', files: [] }])
    setNewPropertyFiles([])
    setIsAddPropertyModalOpen(false)
  }

  const handleRemoveFile = (index: number) => {
    if (object.files) {
      const updatedFiles = [...object.files]
      updatedFiles.splice(index, 1)
      object.files = updatedFiles
    }
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
            <DialogHeader className="px-6 py-4">
              <DialogTitle className="text-xl">{object.name} 111</DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1"
            >
              <TabsList className="px-6 justify-start h-12 border-b rounded-none">
                <TabsTrigger
                  value="details"
                  className="text-base px-4 py-2 data-[state=active]:bg-white"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="text-base px-4 py-2 data-[state=active]:bg-white"
                >
                  Properties
                </TabsTrigger>
                {/* Only show Model tab if the object has a modelUuid */}
                {model && (
                  <TabsTrigger
                    value="model"
                    className="text-base px-4 py-2 data-[state=active]:bg-white"
                  >
                    Model
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="files"
                  className="text-base px-4 py-2 data-[state=active]:bg-white"
                >
                  Files
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6 pt-4">
                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">ID</h3>
                    <p className="text-sm font-mono text-muted-foreground">
                      {object.uuid}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium">Name</h3>
                    <p className="text-sm">{object.name}</p>
                  </div>

                  {object.description && (
                    <div className="space-y-1">
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm">{object.description}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-medium">Created 111</h3>
                    <p className="text-sm">
                      {new Date(object.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {object.updatedAt && (
                    <div className="space-y-1">
                      <h3 className="font-medium">Last Updated</h3>
                      <p className="text-sm">
                        {new Date(object.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {object.tags && object.tags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {object.tags.map((tag: string) => (
                          <UIBadge key={tag} variant="secondary">
                            {tag}
                          </UIBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="properties" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Properties</h3>
                    <Button onClick={() => setIsAddPropertyModalOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </div>

                  {object.properties && object.properties.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {object.properties.map((property: any) => (
                          <TableRow key={property.uuid}>
                            <TableCell className="font-medium">
                              {property.key}
                            </TableCell>
                            <TableCell>
                              {property.values ? (
                                <div className="flex flex-col gap-1">
                                  {property.values.map(
                                    (val: any, i: number) => (
                                      <div
                                        key={val.uuid}
                                        className="flex items-center gap-1"
                                      >
                                        <span>{val.value}</span>
                                        {val.files && val.files.length > 0 && (
                                          <UIBadge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <File className="h-3 w-3 mr-1" />
                                            {val.files.length}
                                          </UIBadge>
                                        )}
                                        {i < property.values.length - 1 && ', '}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                property.value || 'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {property.updatedAt
                                ? new Date(property.updatedAt).toLocaleString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOpenPropertyModal(property)
                                }
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 border rounded">
                      <p className="text-muted-foreground">
                        No properties found for this object
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAddPropertyModalOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </div>
                  )}

                  {/* Add Property Form Dialog */}
                  {isAddPropertyModalOpen && (
                    <Dialog
                      open={isAddPropertyModalOpen}
                      onOpenChange={setIsAddPropertyModalOpen}
                    >
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Property</DialogTitle>
                          <DialogDescription>
                            Enter the details for the new property.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="property-key">Property Key</Label>
                            <Input
                              id="property-key"
                              value={newPropertyKey}
                              onChange={(e) =>
                                setNewPropertyKey(e.target.value)
                              }
                              placeholder="Enter property key"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Property Values</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAddFileToProperty}
                                className="h-8"
                                title="Add file to property"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Add File
                              </Button>
                            </div>

                            {newPropertyValues.map((value, index) => (
                              <div key={value.uuid} className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    value={value.value}
                                    onChange={(e) =>
                                      handlePropertyValueChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Value ${index + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleAddFileToValue(index)}
                                    title="Add file to value"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                  {newPropertyValues.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleRemovePropertyValue(index)
                                      }
                                      title="Remove value"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Display files for this value */}
                                {value.files.length > 0 && (
                                  <div className="ml-2 space-y-1 text-sm">
                                    {value.files.map((file, fileIndex) => (
                                      <div
                                        key={file.uuid}
                                        className="flex items-center justify-between p-1 hover:bg-muted/50 rounded"
                                      >
                                        <div className="flex items-center">
                                          <File className="h-3 w-3 mr-1 text-muted-foreground" />
                                          <span className="text-xs">
                                            {file.name}
                                          </span>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          onClick={() =>
                                            handleRemoveFileFromValue(
                                              index,
                                              fileIndex
                                            )
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={handleAddPropertyValue}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Another Value
                            </Button>

                            {/* Display property files */}
                            {newPropertyFiles.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <Label className="text-sm">
                                  Property Files
                                </Label>
                                <div className="space-y-1 border rounded-md p-2">
                                  {newPropertyFiles.map((file, fileIndex) => (
                                    <div
                                      key={file.uuid}
                                      className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded"
                                    >
                                      <div className="flex items-center">
                                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{file.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({file.size})
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleRemoveFileFromProperty(
                                            fileIndex
                                          )
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddPropertyModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddProperty}>Add</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </TabsContent>

                {/* Model Tab Content */}
                {model && (
                  <TabsContent value="model">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Model Details
                        </h4>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm">{model.name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium">
                              Abbreviation:
                            </span>
                            <span className="text-sm">
                              {model.abbreviation}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium">
                              Version:
                            </span>
                            <span className="text-sm">{model.version}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium">UUID:</span>
                            <span className="text-sm">{model.uuid}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* New Files tab content */}
                <TabsContent value="files" className="mt-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Object Files</h3>
                    <Button variant="outline" onClick={handleAddFile}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {object.files && object.files.length > 0 ? (
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
                        {object.files.map((file: any, index: number) => (
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
                                title="Remove file"
                                onClick={() => handleRemoveFile(index)}
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
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </div>

              <DialogFooter className="px-6 py-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </DialogFooter>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isPropertyModalOpen}
          onClose={() => setIsPropertyModalOpen(false)}
          onSave={handleSaveProperty}
        />
      )}
    </>
  )
}
