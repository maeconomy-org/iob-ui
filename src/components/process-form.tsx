'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
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
import QuickObjectForm from '@/components/forms/quick-object-form'
import { suggestOutputs } from '@/lib/process-suggestions'
import { generateUUIDv7 } from '@/lib/utils'

const materialTypes = ['Material', 'Component', 'Waste']
const unitTypes = ['liters', 'kg', 'tonnes', 'piece', 'm²', 'm³']
const processTypes = ['Mix', 'Pour', 'Demolish']

interface ProcessFormProps {
  process?: any
  allProcesses: any[]
  onSave: (process: any) => void
  onCancel: () => void
}

export default function ProcessForm({
  process,
  allProcesses,
  onSave,
  onCancel,
}: ProcessFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Material',
    unit: 'kg',
    quantity: 0,
    inputs: [] as any[],
    outputs: [] as any[],
  })

  const [newInput, setNewInput] = useState({
    id: '',
    process: 'Mix',
    quantity: 1,
    unit: '',
  })

  const [newOutput, setNewOutput] = useState({
    id: '',
    process: 'Mix',
    quantity: 1,
    unit: '',
  })

  // New state for quick object creation dialogs
  const [isInputFormOpen, setIsInputFormOpen] = useState(false)
  const [isOutputFormOpen, setIsOutputFormOpen] = useState(false)

  useEffect(() => {
    if (process) {
      setFormData({
        name: process.name || '',
        type: process.type || 'Material',
        unit: process.unit || 'kg',
        quantity: process.quantity || 0,
        inputs: process.inputs || [],
        outputs: process.outputs || [],
      })
    }
  }, [process])

  const handleAddInput = () => {
    if (!newInput.id) return

    const selectedProcess = allProcesses.find((p) => p.uuid === newInput.id)
    if (!selectedProcess) return

    // Get the unit from the selected process properties
    const unitValue =
      selectedProcess.properties?.find((prop: any) => prop.key === 'Unit')
        ?.values?.[0]?.value || 'kg'

    const input = {
      id: newInput.id,
      name: selectedProcess.name,
      process: newInput.process,
      quantity: newInput.quantity,
      unit: unitValue,
    }

    // Add the input to the form data
    const updatedInputs = [...formData.inputs, input]
    setFormData({
      ...formData,
      inputs: updatedInputs,
    })

    // Check if we can suggest outputs based on the current inputs
    if (
      newInput.process === 'Mix' ||
      newInput.process === 'Pour' ||
      newInput.process === 'Demolish'
    ) {
      const suggestions = suggestOutputs(
        updatedInputs.map((input) => {
          const process = allProcesses.find((p) => p.uuid === input.id)
          return process || input
        }),
        newInput.process
      )

      // Only add suggestion if we don't already have outputs
      if (suggestions.length > 0 && formData.outputs.length === 0) {
        // Create notification about suggestions
        console.log('Suggested outputs:', suggestions)
      }
    }

    setNewInput({
      id: '',
      process: 'Mix',
      quantity: 1,
      unit: '',
    })
  }

  const handleAddOutput = () => {
    if (!newOutput.id) return

    const selectedProcess = allProcesses.find((p) => p.uuid === newOutput.id)
    if (!selectedProcess) return

    // Get the unit from the selected process properties
    const unitValue =
      selectedProcess.properties?.find((prop: any) => prop.key === 'Unit')
        ?.values?.[0]?.value || 'kg'

    const output = {
      id: newOutput.id,
      name: selectedProcess.name,
      process: newOutput.process,
      quantity: newOutput.quantity,
      unit: unitValue,
    }

    setFormData({
      ...formData,
      outputs: [...formData.outputs, output],
    })

    setNewOutput({
      id: '',
      process: 'Mix',
      quantity: 1,
      unit: '',
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
      quantity: Number(formData.quantity),
    })
  }

  // Handler for quick object creation (input)
  const handleCreateInput = (newObject: any) => {
    // Add the new object to all processes (this would typically be a server call)
    allProcesses.push(newObject)

    // Get the unit from the object properties
    const unitValue =
      newObject.properties?.find((prop: any) => prop.key === 'Unit')
        ?.values?.[0]?.value || 'kg'

    // Add it as an input
    const input = {
      id: newObject.uuid,
      name: newObject.name,
      process: newInput.process,
      quantity: newInput.quantity,
      unit: unitValue,
    }

    // Update form data with the new input
    const updatedInputs = [...formData.inputs, input]
    setFormData({
      ...formData,
      inputs: updatedInputs,
    })

    // Close the dialog
    setIsInputFormOpen(false)

    // Check for suggestions
    if (
      newInput.process === 'Mix' ||
      newInput.process === 'Pour' ||
      newInput.process === 'Demolish'
    ) {
      const suggestions = suggestOutputs(
        updatedInputs.map((input) => {
          const process = allProcesses.find((p) => p.uuid === input.id)
          return process || input
        }),
        newInput.process
      )

      // Only add suggestion if we don't already have outputs
      if (suggestions.length > 0 && formData.outputs.length === 0) {
        // Create notification about suggestions
        console.log('Suggested outputs:', suggestions)
      }
    }
  }

  // Handler for quick object creation (output)
  const handleCreateOutput = (newObject: any) => {
    // Add the new object to all processes
    allProcesses.push(newObject)

    // Get the unit from the object properties
    const unitValue =
      newObject.properties?.find((prop: any) => prop.key === 'Unit')
        ?.values?.[0]?.value || 'kg'

    // Add it as an output
    const output = {
      id: newObject.uuid,
      name: newObject.name,
      process: newOutput.process,
      quantity: newOutput.quantity,
      unit: unitValue,
    }

    // Update form data
    setFormData({
      ...formData,
      outputs: [...formData.outputs, output],
    })

    // Close the dialog
    setIsOutputFormOpen(false)
  }

  // Handler for applying suggested outputs
  const handleApplySuggestions = () => {
    // Get suggestions based on current inputs and process type
    // We use the first input's process type for suggestion
    if (formData.inputs.length === 0) return

    const processType = formData.inputs[0].process
    const suggestions = suggestOutputs(
      formData.inputs.map((input) => {
        const process = allProcesses.find((p) => p.uuid === input.id)
        return process || input
      }),
      processType
    )

    if (suggestions.length === 0) return

    // Create new objects for each suggestion
    const newOutputs = suggestions.map((suggestion) => {
      // Create the object
      const newObject = {
        uuid: generateUUIDv7(),
        name: suggestion.name,
        type: suggestion.type,
        unit: suggestion.unit,
        quantity: suggestion.quantity,
        properties: [
          {
            uuid: generateUUIDv7(),
            key: 'Unit',
            values: [
              { uuid: generateUUIDv7(), value: suggestion.unit, files: [] },
            ],
            files: [],
          },
          {
            uuid: generateUUIDv7(),
            key: 'Quantity',
            values: [
              {
                uuid: generateUUIDv7(),
                value: suggestion.quantity.toString(),
                files: [],
              },
            ],
            files: [],
          },
          {
            uuid: generateUUIDv7(),
            key: 'Type',
            values: [
              { uuid: generateUUIDv7(), value: suggestion.type, files: [] },
            ],
            files: [],
          },
        ],
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to all processes
      allProcesses.push(newObject)

      // Return as output format
      return {
        id: newObject.uuid,
        name: newObject.name,
        process: processType,
      }
    })

    // Update form data with suggested outputs
    setFormData({
      ...formData,
      outputs: [...formData.outputs, ...newOutputs],
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
              required
            />
          </div>

          <Separator />

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
                <SelectContent>
                  {allProcesses
                    .filter((p) => p.uuid !== (process?.uuid || ''))
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
                    <TableHead>Process</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.inputs.map((input) => (
                    <TableRow key={input.id}>
                      <TableCell>{input.name}</TableCell>
                      <TableCell>
                        {input.quantity} {input.unit}
                      </TableCell>
                      <TableCell>{input.process}</TableCell>
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

            {/* Add Suggestions Button */}
            {formData.inputs.length > 0 && formData.outputs.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleApplySuggestions}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Suggest Outputs
              </Button>
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
                <SelectContent>
                  {allProcesses
                    .filter((p) => p.uuid !== (process?.uuid || ''))
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
                    <TableHead>Process</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.outputs.map((output) => (
                    <TableRow key={output.id}>
                      <TableCell>{output.name}</TableCell>
                      <TableCell>
                        {output.quantity} {output.unit}
                      </TableCell>
                      <TableCell>{output.process}</TableCell>
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>

      {/* Quick Input Creation Dialog */}
      <Dialog open={isInputFormOpen} onOpenChange={setIsInputFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Input Material</DialogTitle>
          </DialogHeader>
          <QuickObjectForm
            onCancel={() => setIsInputFormOpen(false)}
            onSave={handleCreateInput}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Output Creation Dialog */}
      <Dialog open={isOutputFormOpen} onOpenChange={setIsOutputFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Output Material</DialogTitle>
          </DialogHeader>
          <QuickObjectForm
            onCancel={() => setIsOutputFormOpen(false)}
            onSave={handleCreateOutput}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
