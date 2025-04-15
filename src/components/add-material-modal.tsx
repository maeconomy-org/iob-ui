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
import { Plus, X } from 'lucide-react'
import { generateUUIDv7 } from '@/lib/utils'
import { processData } from '@/lib/data'

// Removed "Demolish" from process types
const processTypes = ['Mix', 'Pour']
const unitTypes = ['liters', 'kg', 'tonnes', 'piece', 'm²', 'm³']

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  material?: any
  onSave?: (material: any) => void
}

export default function AddMaterialModal({
  isOpen,
  onClose,
  material,
  onSave,
}: AddMaterialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    properties: [
      { key: 'unit', value: 'kg' },
      { key: 'quantity', value: '0' },
    ],
    inputs: [] as { uuid: string; name: string; process: string }[],
    outputs: [] as { uuid: string; name: string; process: string }[],
  })

  const [newInput, setNewInput] = useState({
    uuid: '',
    process: 'Mix',
  })

  const [newOutput, setNewOutput] = useState({
    uuid: '',
    process: 'Mix',
  })

  // Get available materials for selection
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([])

  useEffect(() => {
    setAvailableMaterials(
      processData.map((m) => ({ uuid: m.uuid, name: m.name }))
    )
  }, [])

  // Initialize form data when editing an existing material
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        properties:
          material.properties && material.properties.length > 0
            ? [...material.properties]
            : [
                { key: 'unit', value: 'kg' },
                { key: 'quantity', value: '0' },
              ],
        inputs: material.inputs || [],
        outputs: material.outputs || [],
      })
    } else {
      // Reset form for new materials
      setFormData({
        name: '',
        properties: [
          { key: 'unit', value: 'kg' },
          { key: 'quantity', value: '0' },
        ],
        inputs: [],
        outputs: [],
      })
    }
  }, [material, isOpen])

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { key: '', value: '' }],
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
    updatedProperties[index][field] = value
    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handleAddInput = () => {
    if (!newInput.uuid) return

    const selectedMaterial = availableMaterials.find(
      (m) => m.uuid === newInput.uuid
    )
    if (!selectedMaterial) return

    const input = {
      uuid: newInput.uuid,
      name: selectedMaterial.name,
      process: newInput.process,
    }

    setFormData({
      ...formData,
      inputs: [...formData.inputs, input],
    })

    setNewInput({
      uuid: '',
      process: 'Mix',
    })
  }

  const handleAddOutput = () => {
    if (!newOutput.uuid) return

    const selectedMaterial = availableMaterials.find(
      (m) => m.uuid === newOutput.uuid
    )
    if (!selectedMaterial) return

    const output = {
      uuid: newOutput.uuid,
      name: selectedMaterial.name,
      process: newOutput.process,
    }

    setFormData({
      ...formData,
      outputs: [...formData.outputs, output],
    })

    setNewOutput({
      uuid: '',
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
      (prop) => prop.key && prop.value
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

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <form
              id="material-form"
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

                  {formData.properties.map((property, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Property name"
                        value={property.key}
                        onChange={(e) =>
                          handlePropertyChange(index, 'key', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Value"
                        value={property.value}
                        onChange={(e) =>
                          handlePropertyChange(index, 'value', e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProperty(index)}
                        disabled={formData.properties.length === 1}
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
                      value={newInput.uuid}
                      onValueChange={(value) =>
                        setNewInput({ ...newInput, uuid: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials
                          .filter((m) => m.uuid !== (material?.uuid || ''))
                          .map((m) => (
                            <SelectItem key={m.uuid} value={m.uuid}>
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
                      <SelectTrigger className="w-[150px]">
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

                  {formData.inputs.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.inputs.map((input, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span>{input.name}</span>
                            <span className="text-sm text-muted-foreground">
                              via {input.process}
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
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Outputs</Label>

                  <div className="flex gap-2">
                    <Select
                      value={newOutput.uuid}
                      onValueChange={(value) =>
                        setNewOutput({ ...newOutput, uuid: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials
                          .filter((m) => m.uuid !== (material?.uuid || ''))
                          .map((m) => (
                            <SelectItem key={m.uuid} value={m.uuid}>
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
                      <SelectTrigger className="w-[150px]">
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

                  {formData.outputs.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {formData.outputs.map((output, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span>{output.name}</span>
                            <span className="text-sm text-muted-foreground">
                              via {output.process}
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
                  )}
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="material-form">
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
