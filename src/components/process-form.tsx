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
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

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
  })

  const [newOutput, setNewOutput] = useState({
    id: '',
    process: 'Mix',
  })

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

    const selectedProcess = allProcesses.find(
      (p) => p.id.toString() === newInput.id
    )
    if (!selectedProcess) return

    const input = {
      id: Number.parseInt(newInput.id),
      name: selectedProcess.name,
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

    const selectedProcess = allProcesses.find(
      (p) => p.id.toString() === newOutput.id
    )
    if (!selectedProcess) return

    const output = {
      id: Number.parseInt(newOutput.id),
      name: selectedProcess.name,
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

  const handleRemoveInput = (id: number) => {
    setFormData({
      ...formData,
      inputs: formData.inputs.filter((input) => input.id !== id),
    })
  }

  const handleRemoveOutput = (id: number) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              setFormData({ ...formData, quantity: e.target.value })
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
              onValueChange={(value) => setNewInput({ ...newInput, id: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {allProcesses
                  .filter((p) => p.id !== (process?.id || 0))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
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
            <Table className="border mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Process</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.inputs.map((input) => (
                  <TableRow key={input.id}>
                    <TableCell>{input.name}</TableCell>
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
                  .filter((p) => p.id !== (process?.id || 0))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
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
            <Table className="border mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Process</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.outputs.map((output) => (
                  <TableRow key={output.id}>
                    <TableCell>{output.name}</TableCell>
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
  )
}
