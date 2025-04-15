'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Upload, File } from 'lucide-react'
import { generateUUIDv7 } from '@/lib/utils'
import { objectsData } from '@/lib/data'

interface PropertyValue {
  uuid: string
  value: string
  files: any[]
  creator?: string
  createdAt?: string
  updatedAt?: string
}

interface Property {
  uuid: string
  key: string
  values: PropertyValue[]
  files: any[]
  creator?: string
  createdAt?: string
  updatedAt?: string
}

interface AddObjectModalProps {
  isOpen: boolean
  onClose: () => void
  object?: any
  onSave?: (object: any) => void
}

export default function AddObjectModal({
  isOpen,
  onClose,
  object,
  onSave,
}: AddObjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    parentUuid: '',
    properties: [] as Property[],
  })

  // Get available objects for parent selection
  const [availableObjects, setAvailableObjects] = useState<any[]>([])
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<
    number | null
  >(null)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)

  useEffect(() => {
    // Flatten the object hierarchy to get all objects
    const flattenObjects = (objects: any[]): any[] => {
      return objects.flatMap((obj) => [
        { uuid: obj.uuid, name: obj.name },
        ...(obj.children ? flattenObjects(obj.children) : []),
      ])
    }

    setAvailableObjects(flattenObjects(objectsData))
  }, [])

  // Initialize form data when editing an existing object
  useEffect(() => {
    if (object) {
      // Convert old property format to new format if needed
      const convertedProperties = object.properties.map((prop: any) => {
        // Check if property is already in new format
        if (prop.values) {
          return prop
        }

        // Convert old format to new format
        return {
          uuid: prop.uuid || generateUUIDv7(),
          key: prop.key,
          values: [
            {
              uuid: generateUUIDv7(),
              value: prop.value,
              files: [],
              creator: 'Current User',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          files: [],
          creator: prop.creator || 'Current User',
          createdAt: prop.createdAt || new Date().toISOString(),
          updatedAt: prop.updatedAt || new Date().toISOString(),
        }
      })

      setFormData({
        name: object.name || '',
        parentUuid: object.parentUuid || '',
        properties:
          convertedProperties.length > 0
            ? convertedProperties
            : [createEmptyProperty()],
      })
    } else {
      // Reset form for new objects
      setFormData({
        name: '',
        parentUuid: '',
        properties: [createEmptyProperty()],
      })
    }
  }, [object, isOpen])

  const createEmptyProperty = (): Property => {
    return {
      uuid: generateUUIDv7(),
      key: '',
      values: [
        {
          uuid: generateUUIDv7(),
          value: '',
          files: [],
        },
      ],
      files: [],
      creator: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, createEmptyProperty()],
    })
  }

  const handleRemoveProperty = (index: number) => {
    const updatedProperties = [...formData.properties]
    updatedProperties.splice(index, 1)
    setFormData({
      ...formData,
      properties:
        updatedProperties.length > 0
          ? updatedProperties
          : [createEmptyProperty()],
    })
  }

  const handlePropertyKeyChange = (index: number, key: string) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[index].key = key
    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleAddValue = (propertyIndex: number) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[propertyIndex].values.push({
      uuid: generateUUIDv7(),
      value: '',
      files: [],
    })
    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleRemoveValue = (propertyIndex: number, valueIndex: number) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[propertyIndex].values.splice(valueIndex, 1)

    // Ensure at least one value exists
    if (updatedProperties[propertyIndex].values.length === 0) {
      updatedProperties[propertyIndex].values.push({
        uuid: generateUUIDv7(),
        value: '',
        files: [],
      })
    }

    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleValueChange = (
    propertyIndex: number,
    valueIndex: number,
    value: string
  ) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[propertyIndex].values[valueIndex].value = value
    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleAddFile = (
    propertyIndex: number,
    valueIndex: number | null = null
  ) => {
    // In a real app, this would open a file picker
    const newFile = {
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    const updatedProperties = [...formData.properties]

    if (valueIndex !== null) {
      // Add file to a specific value
      updatedProperties[propertyIndex].values[valueIndex].files.push(newFile)
    } else {
      // Add file to the property itself
      updatedProperties[propertyIndex].files.push(newFile)
    }

    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter out empty properties
    const validProperties = formData.properties.filter(
      (prop) => prop.key && prop.values.some((v) => v.value)
    )

    if (object) {
      // Update existing object
      const updatedObject = {
        ...object,
        name: formData.name,
        parentUuid: formData.parentUuid,
        properties: validProperties,
        updatedAt: new Date().toISOString(),
      }

      if (onSave) {
        onSave(updatedObject)
      }
    } else {
      // Create new object with UUID v7
      const newObject = {
        ...formData,
        properties: validProperties,
        uuid: generateUUIDv7(),
        creator: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        files: [],
        children: [],
      }

      console.log('New object:', newObject)
      // Here you would add the object to your data store
      if (onSave) {
        onSave(newObject)
      }
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {object ? 'Edit Object' : 'Add New Object'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <form
              id="object-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parent">Parent Object</Label>
                  <Select
                    value={formData.parentUuid}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentUuid: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableObjects
                        .filter((obj) => obj.uuid !== (object?.uuid || ''))
                        .map((obj) => (
                          <SelectItem key={obj.uuid} value={obj.uuid}>
                            {obj.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Properties</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddProperty}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Property
                    </Button>
                  </div>

                  {formData.properties.map((property, propIndex) => (
                    <div
                      key={property.uuid}
                      className="space-y-2 border p-3 rounded-md"
                    >
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Property name"
                          value={property.key}
                          onChange={(e) =>
                            handlePropertyKeyChange(propIndex, e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddFile(propIndex)}
                          title="Attach file to property"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProperty(propIndex)}
                          disabled={formData.properties.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="pl-4 space-y-2">
                        <Label className="text-sm">Values</Label>
                        {property.values.map((value, valueIndex) => (
                          <div
                            key={value.uuid}
                            className="flex gap-2 items-center"
                          >
                            <Input
                              placeholder="Value"
                              value={value.value}
                              onChange={(e) =>
                                handleValueChange(
                                  propIndex,
                                  valueIndex,
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleAddFile(propIndex, valueIndex)
                              }
                              title="Attach file to value"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveValue(propIndex, valueIndex)
                              }
                              disabled={property.values.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddValue(propIndex)}
                          className="mt-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Value
                        </Button>
                      </div>

                      {property.files.length > 0 && (
                        <div className="pl-4 mt-2">
                          <Label className="text-sm">Property Files</Label>
                          <div className="space-y-1 mt-1">
                            {property.files.map((file) => (
                              <div
                                key={file.uuid}
                                className="flex items-center gap-2 text-sm"
                              >
                                <File className="h-3 w-3" />
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {property.values.some((v) => v.files.length > 0) && (
                        <div className="pl-4 mt-2">
                          <Label className="text-sm">Value Files</Label>
                          {property.values.map(
                            (value, valueIndex) =>
                              value.files.length > 0 && (
                                <div key={value.uuid} className="mt-1">
                                  <div className="text-xs text-muted-foreground">
                                    Value {valueIndex + 1}: {value.value}
                                  </div>
                                  <div className="space-y-1 mt-1">
                                    {value.files.map((file) => (
                                      <div
                                        key={file.uuid}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <File className="h-3 w-3" />
                                        <span>{file.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="object-form">
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
