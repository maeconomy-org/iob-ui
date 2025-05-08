'use client'

import { useState } from 'react'
import { PlusCircle, X, Upload, File } from 'lucide-react'

import {
  Input,
  Label,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  ScrollArea,
} from '@/components/ui'
import { generateUUIDv7 } from '@/lib/utils'

interface PropertyManagementModalProps {
  object: any
  isOpen: boolean
  onClose: () => void
  onSave: (object: any) => void
  onViewPropertyDetails?: (property: any) => void
}

interface PropertyValueState {
  uuid: string
  value: string
  files: any[]
}

export function PropertyManagementModal({
  object,
  isOpen,
  onClose,
  onSave,
  onViewPropertyDetails,
}: PropertyManagementModalProps) {
  const [newPropertyKey, setNewPropertyKey] = useState('')
  const [newPropertyValues, setNewPropertyValues] = useState<
    PropertyValueState[]
  >([{ uuid: generateUUIDv7(), value: '', files: [] }])
  const [activeTab, setActiveTab] = useState('properties')

  if (!object) return null

  const handlePropertyValueChange = (index: number, value: string) => {
    const updatedValues = [...newPropertyValues]
    updatedValues[index].value = value
    setNewPropertyValues(updatedValues)
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

  const handleRemoveFileFromValue = (valueIndex: number, fileIndex: number) => {
    const updatedValues = [...newPropertyValues]
    updatedValues[valueIndex].files.splice(fileIndex, 1)
    setNewPropertyValues(updatedValues)
  }

  const handleAddProperty = () => {
    if (!newPropertyKey.trim()) return

    // Create the new property with values
    const newProperty = {
      uuid: generateUUIDv7(),
      key: newPropertyKey,
      values: newPropertyValues.map((v) => ({
        uuid: v.uuid,
        value: v.value,
        files: v.files,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to object properties
    const updatedProperties = [...(object.properties || []), newProperty]
    const updatedObject = { ...object, properties: updatedProperties }

    // Save object
    onSave(updatedObject)

    // Reset form
    setNewPropertyKey('')
    setNewPropertyValues([{ uuid: generateUUIDv7(), value: '', files: [] }])
  }

  const handleDeleteProperty = (propertyIndex: number) => {
    const updatedProperties = [...object.properties]
    updatedProperties.splice(propertyIndex, 1)
    onSave({ ...object, properties: updatedProperties })
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Manage Properties</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <TabsList className="mx-6 mt-2">
            <TabsTrigger className="w-full" value="properties">
              Properties
            </TabsTrigger>
            <TabsTrigger className="w-full" value="add">
              Add Property
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="properties" className="mt-0 space-y-4">
              {/* Existing properties */}
              {object.properties && object.properties.length > 0 ? (
                <div className="space-y-3">
                  {object.properties.map((property: any, index: number) => (
                    <div
                      key={property.uuid || index}
                      className="border rounded-md p-3 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{property.key}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.values && property.values.length > 0
                              ? `${property.values.length} value(s)`
                              : property.value || 'No value'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {onViewPropertyDetails && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewPropertyDetails(property)}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteProperty(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                  <h3 className="text-lg font-medium">No Properties</h3>
                  <p className="text-sm text-muted-foreground">
                    This object doesn't have any properties.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('add')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="add" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property-key">Property Key</Label>
                  <Input
                    id="property-key"
                    value={newPropertyKey}
                    onChange={(e) => setNewPropertyKey(e.target.value)}
                    placeholder="Enter property key"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Values</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPropertyValue}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Value
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newPropertyValues.map((value, index) => (
                      <div
                        key={value.uuid}
                        className="border rounded-md p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">
                                Value {index + 1}
                              </Label>
                              {newPropertyValues.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    handleRemovePropertyValue(index)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              value={value.value}
                              onChange={(e) =>
                                handlePropertyValueChange(index, e.target.value)
                              }
                              placeholder="Enter value"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Label className="text-xs">Files</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddFileToValue(index)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Add File
                          </Button>
                        </div>

                        {value.files && value.files.length > 0 ? (
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
                                      handleRemoveFileFromValue(
                                        index,
                                        fileIndex
                                      )
                                    }
                                    className="h-6 w-6"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground border rounded-sm p-2">
                            No files attached to this value
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            {activeTab === 'add' ? (
              <div className="flex justify-between w-full gap-2">
                <Button
                  className="w-full"
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('properties')}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full"
                  type="button"
                  onClick={handleAddProperty}
                  disabled={!newPropertyKey.trim()}
                >
                  Add Property
                </Button>
              </div>
            ) : (
              <Button className="w-full" type="button" onClick={onClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
