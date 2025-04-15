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

type EntityType = 'House' | 'Floor' | 'Room' | 'Wall' | 'Foundation'

const entityTypes: EntityType[] = [
  'House',
  'Floor',
  'Room',
  'Wall',
  'Foundation',
]

// Define property fields for each entity type
const entityProperties: Record<EntityType, string[]> = {
  House: ['width', 'height'],
  Floor: ['area'],
  Room: ['area'],
  Wall: ['length', 'height'],
  Foundation: ['depth', 'material'],
}

interface EntityFormProps {
  entity?: any
  onSave: (entity: any) => void
  onCancel: () => void
}

export default function EntityForm({
  entity,
  onSave,
  onCancel,
}: EntityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'House' as EntityType,
    properties: {} as Record<string, string>,
  })

  useEffect(() => {
    if (entity && !entity.parentId) {
      setFormData({
        name: entity.name || '',
        type: entity.type || 'House',
        properties: entity.properties || {},
      })
    } else {
      // For new entities, set default properties based on type
      setFormData((prev) => ({
        ...prev,
        properties: entityProperties[prev.type].reduce(
          (acc, prop) => {
            acc[prop] = ''
            return acc
          },
          {} as Record<string, string>
        ),
      }))
    }
  }, [entity])

  const handleTypeChange = (type: EntityType) => {
    const newProperties = entityProperties[type].reduce(
      (acc, prop) => {
        // Preserve existing property values if they exist
        acc[prop] = formData.properties[prop] || ''
        return acc
      },
      {} as Record<string, string>
    )

    setFormData({
      ...formData,
      type,
      properties: newProperties,
    })
  }

  const handlePropertyChange = (property: string, value: string) => {
    setFormData({
      ...formData,
      properties: {
        ...formData.properties,
        [property]: value,
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...entity,
      ...formData,
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

        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleTypeChange(value as EntityType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Properties</h3>
          <div className="grid gap-4">
            {entityProperties[formData.type].map((property) => (
              <div key={property} className="grid gap-2">
                <Label htmlFor={property}>
                  {property.charAt(0).toUpperCase() + property.slice(1)}
                </Label>
                <Input
                  id={property}
                  value={formData.properties[property] || ''}
                  onChange={(e) =>
                    handlePropertyChange(property, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
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
