'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Separator,
} from '@/components/ui'
import { generateUUIDv7 } from '@/lib/utils'
import { processData } from '@/lib/data'

// Included all process types
const processTypes = ['Mix', 'Pour', 'Demolish']

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  material?: any
  onSave?: (material: any) => void
}

export function AddMaterialModal({
  isOpen,
  onClose,
  material,
  onSave,
}: AddMaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    properties: [
      {
        uuid: generateUUIDv7(),
        key: 'Unit',
        values: [{ uuid: generateUUIDv7(), value: 'kg', files: [] }],
        files: [],
      },
      {
        uuid: generateUUIDv7(),
        key: 'Quantity',
        values: [{ uuid: generateUUIDv7(), value: '0', files: [] }],
        files: [],
      },
    ],
    inputs: [] as { id: string; name: string; process: string }[],
    outputs: [] as { id: string; name: string; process: string }[],
  })

  const [newInput, setNewInput] = useState({
    id: '',
    process: 'Mix',
  })

  const [newOutput, setNewOutput] = useState({
    id: '',
    process: 'Mix',
  })

  // Get available materials for selection
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([])

  useEffect(() => {
    setAvailableMaterials(
      processData.map((m) => ({ id: m.uuid, name: m.name }))
    )
  }, [])

  // Initialize form data when editing an existing material
  useEffect(() => {
    if (material) {
      // Ensure properties have the right format
      const convertedProperties =
        material.properties?.map((prop: any) => {
          // Check if the property is already in the new format with values array
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
              },
            ],
            files: [],
          }
        }) || []

      setFormData({
        name: material.name || '',
        properties:
          convertedProperties.length > 0
            ? convertedProperties
            : [
                {
                  uuid: generateUUIDv7(),
                  key: 'Unit',
                  values: [{ uuid: generateUUIDv7(), value: 'kg', files: [] }],
                  files: [],
                },
                {
                  uuid: generateUUIDv7(),
                  key: 'Quantity',
                  values: [{ uuid: generateUUIDv7(), value: '0', files: [] }],
                  files: [],
                },
              ],
        inputs: material.inputs || [],
        outputs: material.outputs || [],
      })
    } else {
      // Reset form for new materials
      setFormData({
        name: '',
        properties: [
          {
            uuid: generateUUIDv7(),
            key: 'Unit',
            values: [{ uuid: generateUUIDv7(), value: 'kg', files: [] }],
            files: [],
          },
          {
            uuid: generateUUIDv7(),
            key: 'Quantity',
            values: [{ uuid: generateUUIDv7(), value: '0', files: [] }],
            files: [],
          },
        ],
        inputs: [],
        outputs: [],
      })
    }
  }, [material, isOpen])

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [
        ...formData.properties,
        {
          uuid: generateUUIDv7(),
          key: '',
          values: [{ uuid: generateUUIDv7(), value: '', files: [] }],
          files: [],
        },
      ],
    })
  }

  const handleRemoveProperty = (index: number) => {
    const updatedProperties = [...formData.properties]
    updatedProperties.splice(index, 1)
    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handlePropertyChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updatedProperties = [...formData.properties]

    if (field === 'key') {
      updatedProperties[index].key = value
    } else {
      // Update the first value in the values array
      if (
        updatedProperties[index].values &&
        updatedProperties[index].values.length > 0
      ) {
        updatedProperties[index].values[0].value = value
      } else {
        updatedProperties[index].values = [
          { uuid: generateUUIDv7(), value, files: [] },
        ]
      }
    }

    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleAddInput = () => {
    if (!newInput.id) return

    const selectedMaterial = availableMaterials.find(
      (m) => m.id === newInput.id
    )
    if (!selectedMaterial) return

    const input = {
      id: newInput.id,
      name: selectedMaterial.name,
      process: newInput.process,
    }

    setFormData({
      ...formData,
      inputs: [...formData.inputs, input],
    })

    setNewInput({
      id: '',
      process: 'Mix',
    })
  }

  const handleAddOutput = () => {
    if (!newOutput.id) return

    const selectedMaterial = availableMaterials.find(
      (m) => m.id === newOutput.id
    )
    if (!selectedMaterial) return

    const output = {
      id: newOutput.id,
      name: selectedMaterial.name,
      process: newOutput.process,
    }

    setFormData({
      ...formData,
      outputs: [...formData.outputs, output],
    })

    setNewOutput({
      id: '',
      process: 'Mix',
    })
  }

  const handleRemoveInput = (index: number) => {
    const updatedInputs = [...formData.inputs]
    updatedInputs.splice(index, 1)
    setFormData({
      ...formData,
      inputs: updatedInputs,
    })
  }

  const handleRemoveOutput = (index: number) => {
    const updatedOutputs = [...formData.outputs]
    updatedOutputs.splice(index, 1)
    setFormData({
      ...formData,
      outputs: updatedOutputs,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter out empty properties
    const validProperties = formData.properties.filter(
      (prop) =>
        prop.key &&
        prop.values &&
        prop.values.length > 0 &&
        prop.values[0].value
    )

    if (material) {
      // Update existing material
      const updatedMaterial = {
        ...material,
        name: formData.name,
        properties: validProperties,
        inputs: formData.inputs,
        outputs: formData.outputs,
        updatedAt: new Date().toISOString(),
      }

      if (onSave) {
        onSave(updatedMaterial)
      }
    } else {
      // Create new material with UUID v7
      const newMaterial = {
        ...formData,
        properties: validProperties,
        uuid: generateUUIDv7(),
        creator: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        files: [],
      }

      console.log('New material:', newMaterial)
      // Here you would add the material to your data store
      if (onSave) {
        onSave(newMaterial)
      }
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {material ? 'Edit Material' : 'Add New Material'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <form id="add-material-form" onSubmit={handleSubmit}>
              <div className="space-y-4">
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

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Properties</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddProperty}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Property
                    </Button>
                  </div>

                  {formData.properties.map((prop, index) => (
                    <div
                      key={prop.uuid || index}
                      className="flex gap-2 items-center"
                    >
                      <Input
                        placeholder="Property name"
                        value={prop.key}
                        onChange={(e) =>
                          handlePropertyChange(index, 'key', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Value"
                        value={
                          prop.values && prop.values.length > 0
                            ? prop.values[0].value
                            : ''
                        }
                        onChange={(e) =>
                          handlePropertyChange(index, 'value', e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Inputs</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newInput.id}
                      onValueChange={(value) =>
                        setNewInput({ ...newInput, id: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newInput.process}
                      onValueChange={(value) =>
                        setNewInput({ ...newInput, process: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Process" />
                      </SelectTrigger>
                      <SelectContent>
                        {processTypes.map((process) => (
                          <SelectItem key={process} value={process}>
                            {process}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="button" size="icon" onClick={handleAddInput}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1 mt-2">
                    {formData.inputs.map((input, index) => (
                      <div
                        key={input.id + index}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <div>
                          <span className="font-medium">{input.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({input.process})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInput(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Outputs</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newOutput.id}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, id: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newOutput.process}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, process: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Process" />
                      </SelectTrigger>
                      <SelectContent>
                        {processTypes.map((process) => (
                          <SelectItem key={process} value={process}>
                            {process}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="button" size="icon" onClick={handleAddOutput}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1 mt-2">
                    {formData.outputs.map((output, index) => (
                      <div
                        key={output.id + index}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <div>
                          <span className="font-medium">{output.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({output.process})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOutput(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="add-material-form">
              {material ? 'Save Changes' : 'Add Material'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
