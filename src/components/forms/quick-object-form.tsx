'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { generateUUIDv7 } from '@/lib/utils'

// Predefined constants
const materialTypes = ['Material', 'Component', 'Waste']
const unitTypes = ['liters', 'kg', 'tonnes', 'piece', 'm²', 'm³']

// Common material templates with predefined properties
const materialTemplates = [
  { name: 'Water', type: 'Material', unit: 'liters', quantity: 1000 },
  { name: 'Cement', type: 'Material', unit: 'kg', quantity: 50 },
  { name: 'Sand', type: 'Material', unit: 'tonnes', quantity: 1 },
  { name: 'Concrete', type: 'Material', unit: 'm³', quantity: 1 },
  { name: 'Brick', type: 'Component', unit: 'piece', quantity: 1 },
  { name: 'Wood', type: 'Material', unit: 'm³', quantity: 1 },
  { name: 'Glass', type: 'Material', unit: 'm²', quantity: 1 },
  { name: 'Metal', type: 'Material', unit: 'kg', quantity: 1 },
]

interface QuickObjectFormProps {
  onCancel: () => void
  onSave: (object: any) => void
}

export default function QuickObjectForm({
  onCancel,
  onSave,
}: QuickObjectFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Material',
    unit: 'kg',
    quantity: 0,
  })

  // Function to handle template selection
  const handleTemplateSelect = (templateName: string) => {
    const template = materialTemplates.find((t) => t.name === templateName)
    if (template) {
      setFormData({
        ...template,
      })
    }
  }

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create a new object with UUID and properties
    const newObject = {
      uuid: generateUUIDv7(),
      name: formData.name,
      type: formData.type,
      unit: formData.unit,
      quantity: formData.quantity,
      properties: [
        {
          uuid: generateUUIDv7(),
          key: 'Unit',
          values: [{ uuid: generateUUIDv7(), value: formData.unit, files: [] }],
          files: [],
        },
        {
          uuid: generateUUIDv7(),
          key: 'Quantity',
          values: [
            {
              uuid: generateUUIDv7(),
              value: formData.quantity.toString(),
              files: [],
            },
          ],
          files: [],
        },
        {
          uuid: generateUUIDv7(),
          key: 'Type',
          values: [{ uuid: generateUUIDv7(), value: formData.type, files: [] }],
          files: [],
        },
      ],
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(newObject)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            {materialTemplates.map((template) => (
              <Button
                key={template.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template.name)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

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
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Object</Button>
      </div>
    </form>
  )
}
