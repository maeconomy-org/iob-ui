'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { generateUUIDv7 } from '@/lib/utils'

// Define common presets for materials
const materialPresets = [
  {
    name: 'Water',
    properties: [
      { key: 'Unit', value: 'liters' },
      { key: 'Type', value: 'Material' },
    ],
  },
  {
    name: 'Cement',
    properties: [
      { key: 'Unit', value: 'kg' },
      { key: 'Type', value: 'Material' },
    ],
  },
  {
    name: 'Sand',
    properties: [
      { key: 'Unit', value: 'tonnes' },
      { key: 'Type', value: 'Material' },
    ],
  },
  {
    name: 'Crushed Stone',
    properties: [
      { key: 'Unit', value: 'tonnes' },
      { key: 'Type', value: 'Material' },
    ],
  },
  {
    name: 'Concrete',
    properties: [
      { key: 'Unit', value: 'm³' },
      { key: 'Type', value: 'Material' },
    ],
  },
  {
    name: 'Wall',
    properties: [
      { key: 'Unit', value: 'piece' },
      { key: 'Type', value: 'Component' },
    ],
  },
  {
    name: 'Concrete Waste',
    properties: [
      { key: 'Unit', value: 'tonnes' },
      { key: 'Type', value: 'Waste' },
    ],
  },
]

const unitTypes = ['liters', 'kg', 'tonnes', 'piece', 'm²', 'm³']
const materialTypes = ['Material', 'Component', 'Waste']
const processTypes = ['Mix', 'Pour', 'Demolish']

interface ProcessFormProps {
  process?: any
  allProcesses: any[]
  onSave: (process: any) => void
  onCancel: () => void
}

export function ProcessFormV2({
  process,
  allProcesses,
  onSave,
  onCancel,
}: ProcessFormProps) {
  const [formData, setFormData] = useState({
    uuid: '',
    type: 'Mix',
    inputs: [] as any[],
    outputs: [] as any[],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [newInput, setNewInput] = useState({
    id: '',
    quantity: 1,
  })

  const [newOutput, setNewOutput] = useState({
    id: '',
    quantity: 1,
  })

  // State for creating new objects
  const [isInputFormOpen, setIsInputFormOpen] = useState(false)
  const [isOutputFormOpen, setIsOutputFormOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    preset: 'custom',
    type: 'Material',
    unit: 'kg',
    customProperties: [] as { key: string; value: string }[],
  })

  useEffect(() => {
    if (process) {
      setFormData({
        uuid: process.uuid || generateUUIDv7(),
        type: process.type || 'Mix',
        inputs: process.inputs || [],
        outputs: process.outputs || [],
        createdAt: process.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      setFormData({
        uuid: generateUUIDv7(),
        type: 'Mix',
        inputs: [],
        outputs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }, [process])

  const handleAddInput = () => {
    if (!newInput.id) return

    const selectedProcess = allProcesses.find((p) => p.uuid === newInput.id)
    if (!selectedProcess) return

    // Get the unit from the selected process properties
    const unitValue = getObjectProperty(selectedProcess, 'Unit') || 'kg'

    const input = {
      id: newInput.id,
      name: selectedProcess.name,
      quantity: newInput.quantity,
      unit: unitValue,
      properties: selectedProcess.properties,
      files: selectedProcess.files || [],
    }

    // Add the input to the form data
    const updatedInputs = [...formData.inputs, input]
    setFormData({
      ...formData,
      inputs: updatedInputs,
    })

    setNewInput({
      id: '',
      quantity: 1,
    })
  }

  const handleAddOutput = () => {
    if (!newOutput.id) return

    const selectedProcess = allProcesses.find((p) => p.uuid === newOutput.id)
    if (!selectedProcess) return

    // Get the unit from the selected process properties
    const unitValue = getObjectProperty(selectedProcess, 'Unit') || 'kg'

    const output = {
      id: newOutput.id,
      name: selectedProcess.name,
      quantity: newOutput.quantity,
      unit: unitValue,
      properties: selectedProcess.properties,
      files: selectedProcess.files || [],
    }

    setFormData({
      ...formData,
      outputs: [...formData.outputs, output],
    })

    setNewOutput({
      id: '',
      quantity: 1,
    })
  }

  const handleRemoveInput = (id: string) => {
    setFormData({
      ...formData,
      inputs: formData.inputs.filter((input) => input.id !== id),
    })
  }

  const handleRemoveOutput = (id: string) => {
    setFormData({
      ...formData,
      outputs: formData.outputs.filter((output) => output.id !== id),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...process,
      ...formData,
      updatedAt: new Date().toISOString(),
    })
  }

  // Helper function to get property value from an object
  const getObjectProperty = (obj: any, key: string) => {
    if (!obj || !obj.properties) return ''

    const property = obj.properties.find((prop: any) => prop.key === key)
    if (!property) return ''

    if (property.values && property.values.length > 0) {
      return property.values.map((v: any) => v.value).join(', ')
    }

    return property.value || ''
  }

  // Create new material/component for input/output
  const handleCreateNewMaterial = (isInput: boolean) => {
    const properties = [
      ...newMaterial.customProperties.map((prop) => ({
        uuid: generateUUIDv7(),
        key: prop.key,
        values: [{ uuid: generateUUIDv7(), value: prop.value, files: [] }],
        files: [],
      })),
    ]

    // Add standard properties for Unit and Type if not already added
    if (!properties.some((p) => p.key === 'Unit')) {
      properties.push({
        uuid: generateUUIDv7(),
        key: 'Unit',
        values: [
          { uuid: generateUUIDv7(), value: newMaterial.unit, files: [] },
        ],
        files: [],
      })
    }

    if (!properties.some((p) => p.key === 'Type')) {
      properties.push({
        uuid: generateUUIDv7(),
        key: 'Type',
        values: [
          { uuid: generateUUIDv7(), value: newMaterial.type, files: [] },
        ],
        files: [],
      })
    }

    // Create new object
    const newObject = {
      uuid: generateUUIDv7(),
      name: newMaterial.name,
      properties,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to all processes
    allProcesses.push(newObject)

    // Get quantity value
    const quantity = isInput ? newInput.quantity : newOutput.quantity

    // Add as input or output
    const item = {
      id: newObject.uuid,
      name: newObject.name,
      quantity,
      unit: newMaterial.unit,
      properties: newObject.properties,
      files: [],
    }

    if (isInput) {
      setFormData({
        ...formData,
        inputs: [...formData.inputs, item],
      })
      setIsInputFormOpen(false)
    } else {
      setFormData({
        ...formData,
        outputs: [...formData.outputs, item],
      })
      setIsOutputFormOpen(false)
    }

    // Reset form
    setNewMaterial({
      name: '',
      preset: 'custom',
      type: 'Material',
      unit: 'kg',
      customProperties: [],
    })
  }

  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setNewMaterial({
        ...newMaterial,
        preset: 'custom',
        name: '',
      })
      return
    }

    const selectedPreset = materialPresets.find((p) => p.name === preset)
    if (!selectedPreset) return

    // Extract unit and type from preset properties
    const unitProp = selectedPreset.properties.find((p) => p.key === 'Unit')
    const typeProp = selectedPreset.properties.find((p) => p.key === 'Type')

    setNewMaterial({
      name: selectedPreset.name,
      preset,
      type: typeProp?.value || 'Material',
      unit: unitProp?.value || 'kg',
      customProperties: [],
    })
  }

  // Add custom property to new material
  const handleAddCustomProperty = () => {
    setNewMaterial({
      ...newMaterial,
      customProperties: [
        ...newMaterial.customProperties,
        { key: '', value: '' },
      ],
    })
  }

  // Update custom property
  const handleUpdateCustomProperty = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updatedProperties = [...newMaterial.customProperties]
    updatedProperties[index][field] = value

    setNewMaterial({
      ...newMaterial,
      customProperties: updatedProperties,
    })
  }

  // Remove custom property
  const handleRemoveCustomProperty = (index: number) => {
    const updatedProperties = [...newMaterial.customProperties]
    updatedProperties.splice(index, 1)

    setNewMaterial({
      ...newMaterial,
      customProperties: updatedProperties,
    })
  }

  // Render the new material form
  const renderNewMaterialForm = (isInput: boolean) => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="preset">Material Preset</Label>
        <Select value={newMaterial.preset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a preset or create custom" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            <SelectItem value="custom">Custom Material</SelectItem>
            {materialPresets.map((preset) => (
              <SelectItem key={preset.name} value={preset.name}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={newMaterial.name}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, name: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={newMaterial.type}
            onValueChange={(value) =>
              setNewMaterial({ ...newMaterial, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {materialTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={newMaterial.unit}
            onValueChange={(value) =>
              setNewMaterial({ ...newMaterial, unit: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {unitTypes.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label>Additional Properties</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomProperty}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Property
          </Button>
        </div>

        {newMaterial.customProperties.length > 0 && (
          <div className="space-y-2 mt-2">
            {newMaterial.customProperties.map((prop, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Property name"
                  value={prop.key}
                  onChange={(e) =>
                    handleUpdateCustomProperty(index, 'key', e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={prop.value}
                  onChange={(e) =>
                    handleUpdateCustomProperty(index, 'value', e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCustomProperty(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          className="w-full"
          variant="outline"
          onClick={() =>
            isInput ? setIsInputFormOpen(false) : setIsOutputFormOpen(false)
          }
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="w-full"
          onClick={() => handleCreateNewMaterial(isInput)}
          disabled={!newMaterial.name}
        >
          Create Material
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Inputs</h3>

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
                <SelectContent
                  position="popper"
                  className="min-w-[200px]"
                  sideOffset={5}
                >
                  {allProcesses
                    .filter((p) => p.uuid !== formData.uuid)
                    .map((p) => (
                      <SelectItem key={p.uuid} value={p.uuid}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Qty"
                className="w-[80px]"
                value={newInput.quantity}
                onChange={(e) =>
                  setNewInput({ ...newInput, quantity: Number(e.target.value) })
                }
              />

              <Button type="button" size="icon" onClick={handleAddInput}>
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsInputFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create New</span>
              </Button>
            </div>

            {formData.inputs.length > 0 && (
              <Table className="border mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.inputs.map((input) => (
                    <TableRow key={input.id}>
                      <TableCell>{input.name}</TableCell>
                      <TableCell>{input.quantity}</TableCell>
                      <TableCell>{input.unit}</TableCell>
                      <TableCell>{getObjectProperty(input, 'Type')}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInput(input.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Outputs</h3>

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
                <SelectContent
                  position="popper"
                  className="min-w-[200px]"
                  sideOffset={5}
                >
                  {allProcesses
                    .filter((p) => p.uuid !== formData.uuid)
                    .map((p) => (
                      <SelectItem key={p.uuid} value={p.uuid}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Qty"
                className="w-[80px]"
                value={newOutput.quantity}
                onChange={(e) =>
                  setNewOutput({
                    ...newOutput,
                    quantity: Number(e.target.value),
                  })
                }
              />

              <Button type="button" size="icon" onClick={handleAddOutput}>
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsOutputFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create New</span>
              </Button>
            </div>

            {formData.outputs.length > 0 && (
              <Table className="border mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.outputs.map((output) => (
                    <TableRow key={output.id}>
                      <TableCell>{output.name}</TableCell>
                      <TableCell>{output.quantity}</TableCell>
                      <TableCell>{output.unit}</TableCell>
                      <TableCell>{getObjectProperty(output, 'Type')}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOutput(output.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button className="w-full" type="submit">
            Save Process
          </Button>
        </div>
      </form>

      {/* Input Creation Dialog */}
      <Dialog open={isInputFormOpen} onOpenChange={setIsInputFormOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Create New Input Material</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {renderNewMaterialForm(true)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Output Creation Dialog */}
      <Dialog open={isOutputFormOpen} onOpenChange={setIsOutputFormOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Create New Output Material</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {renderNewMaterialForm(false)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
