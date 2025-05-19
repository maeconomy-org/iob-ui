import { useState } from 'react'
import { ChevronRight, Plus, Trash2, X } from 'lucide-react'

import { Button, Input, Label } from '@/components/ui'

interface CollapsiblePropertyProps {
  property: any
  isExpanded: boolean
  onToggle: () => void
  isEditable: boolean
  onUpdate?: (updatedProperty: any) => void
  onRemove?: () => void
}

export function CollapsibleProperty({
  property,
  isExpanded,
  onToggle,
  isEditable,
  onUpdate,
  onRemove,
}: CollapsiblePropertyProps) {
  const [editedProperty, setEditedProperty] = useState(property)

  // Handle field changes when editing
  const handleChange = (field: string, value: any) => {
    if (!isEditable || !onUpdate) return

    const updated = {
      ...editedProperty,
      [field]: value,
      _modified: true, // Explicitly mark as modified when any field changes
    }

    setEditedProperty(updated)
    onUpdate(updated)
  }

  // Handle value changes
  const handleValueChange = (valueIndex: number, newValue: string) => {
    if (!isEditable || !onUpdate) return

    const updatedValues = [...(editedProperty.values || [])]
    updatedValues[valueIndex] = {
      ...updatedValues[valueIndex],
      value: newValue,
    }

    // Mark property as modified when values change
    handleChange('values', updatedValues)
  }

  // Add a new value
  const handleAddValue = () => {
    if (!isEditable || !onUpdate) return

    const updatedValues = [...(editedProperty.values || []), { value: '' }]
    handleChange('values', updatedValues)
  }

  // Remove a value
  const handleRemoveValue = (valueIndex: number) => {
    if (!isEditable || !onUpdate) return

    const updatedValues = [...(editedProperty.values || [])]
    updatedValues.splice(valueIndex, 1)
    handleChange('values', updatedValues)
  }

  return (
    <div
      className={`border rounded-md overflow-hidden ${isExpanded ? 'shadow-md' : ''}`}
    >
      {/* Summary Row (Always Visible) */}
      <div className="flex justify-between items-center">
        <div
          className="px-4 py-3 flex-1 flex items-center cursor-pointer hover:bg-muted/50"
          onClick={onToggle}
        >
          <ChevronRight
            className={`h-4 w-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
          <div className="font-medium">{property.key}</div>

          <div className="ml-4 text-sm text-muted-foreground">
            {property.values?.length === 1
              ? property.values[0].value
              : `${property.values?.length || 0} values`}
          </div>
        </div>

        {isEditable && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="mr-2">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t bg-muted/10">
          {/* Property Metadata - Only Key field */}
          <div className="mb-4">
            {isEditable ? (
              <div>
                <Label htmlFor={`property-key-${property.uuid || 'new'}`}>
                  Key
                </Label>
                <Input
                  id={`property-key-${property.uuid || 'new'}`}
                  value={editedProperty.key}
                  onChange={(e) => handleChange('key', e.target.value)}
                />
              </div>
            ) : (
              property.uuid && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">UUID:</span>
                  <span className="font-mono text-xs">{property.uuid}</span>
                </div>
              )
            )}
          </div>

          {/* Property Values Section */}
          <div>
            <h4 className="font-medium mb-2">Values</h4>

            <div className="space-y-2">
              {(editedProperty.values || []).map(
                (value: any, index: number) => (
                  <div
                    key={value.uuid || `new-${index}`}
                    className="flex items-center"
                  >
                    {isEditable ? (
                      <>
                        <Input
                          value={value.value || ''}
                          onChange={(e) =>
                            handleValueChange(index, e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveValue(index)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="p-2 border rounded-md bg-background w-full">
                        {value.value}
                      </div>
                    )}
                  </div>
                )
              )}

              {(!editedProperty.values ||
                editedProperty.values.length === 0) && (
                <div className="text-sm text-muted-foreground">
                  No values defined
                </div>
              )}

              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddValue}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
