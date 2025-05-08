'use client'

import { useState, useEffect } from 'react'

export interface PropertyValue {
  uuid: string
  value: string
  files: any[]
  creator?: string
  createdAt?: string
  updatedAt?: string
}

export interface Property {
  uuid: string
  key: string
  values: PropertyValue[]
  files: any[]
  creator?: string
  createdAt?: string
  updatedAt?: string
}

export function usePropertyEditor(initialProperty: any) {
  const [property, setProperty] = useState<Property | null>(null)
  const [newValue, setNewValue] = useState('')

  // Initialize property data
  useEffect(() => {
    if (initialProperty) {
      setProperty({ ...initialProperty })
    }
  }, [initialProperty])

  // Add a new value
  const addValue = () => {
    if (!property || !newValue.trim()) return

    const updatedProperty = { ...property }
    const newValueObj = {
      uuid: crypto.randomUUID(),
      value: newValue,
      files: [],
      creator: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Handle both new and old property formats
    if (Array.isArray(updatedProperty.values)) {
      // New format with values array
      updatedProperty.values = [...updatedProperty.values, newValueObj]
    } else {
      // Convert old format to new format
      const oldValue =
        'value' in updatedProperty
          ? (updatedProperty as any).value || '' // Type assertion to access value
          : ''

      // Create values array
      updatedProperty.values = [
        {
          uuid: crypto.randomUUID(),
          value: oldValue,
          files: [],
          creator: updatedProperty.creator || 'Current User',
          createdAt: updatedProperty.createdAt || new Date().toISOString(),
          updatedAt: updatedProperty.updatedAt || new Date().toISOString(),
        },
        newValueObj,
      ]

      // Remove old value property if it exists
      if ('value' in updatedProperty) {
        delete (updatedProperty as any).value
      }
    }

    setProperty(updatedProperty)
    setNewValue('')
  }

  // Remove a value
  const removeValue = (valueIndex: number) => {
    if (!property) return

    const updatedProperty = { ...property }
    if (updatedProperty.values) {
      updatedProperty.values = updatedProperty.values.filter(
        (_: any, index: number) => index !== valueIndex
      )
      setProperty(updatedProperty)
    }
  }

  // Update a value
  const updateValue = (valueIndex: number, newValue: string) => {
    if (!property) return

    const updatedProperty = { ...property }
    if (updatedProperty.values) {
      updatedProperty.values[valueIndex].value = newValue
      updatedProperty.values[valueIndex].updatedAt = new Date().toISOString()
      setProperty(updatedProperty)
    }
  }

  // Add file to property
  const addFileToProperty = () => {
    if (!property) return

    // In a real app, this would open a file picker
    const newFile = {
      uuid: crypto.randomUUID(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    const updatedProperty = { ...property }
    updatedProperty.files = [...(updatedProperty.files || []), newFile]
    setProperty(updatedProperty)
  }

  // Add file to a specific value
  const addFileToValue = (valueIndex: number) => {
    if (!property) return

    // In a real app, this would open a file picker
    const newFile = {
      uuid: crypto.randomUUID(),
      name: `ValueFile-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    const updatedProperty = { ...property }
    if (updatedProperty.values && updatedProperty.values[valueIndex]) {
      if (!updatedProperty.values[valueIndex].files) {
        updatedProperty.values[valueIndex].files = []
      }
      updatedProperty.values[valueIndex].files.push(newFile)
      setProperty(updatedProperty)
    }
  }

  // Remove file from property
  const removeFileFromProperty = (fileIndex: number) => {
    if (!property) return

    const updatedProperty = { ...property }
    updatedProperty.files = updatedProperty.files.filter(
      (_: any, index: number) => index !== fileIndex
    )
    setProperty(updatedProperty)
  }

  // Remove file from a specific value
  const removeFileFromValue = (valueIndex: number, fileIndex: number) => {
    if (!property) return

    const updatedProperty = { ...property }
    if (
      updatedProperty.values &&
      updatedProperty.values[valueIndex] &&
      updatedProperty.values[valueIndex].files
    ) {
      updatedProperty.values[valueIndex].files = updatedProperty.values[
        valueIndex
      ].files.filter((_: any, index: number) => index !== fileIndex)
      setProperty(updatedProperty)
    }
  }

  // Format date strings
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return {
    property,
    newValue,
    setNewValue,
    addValue,
    removeValue,
    updateValue,
    addFileToProperty,
    addFileToValue,
    removeFileFromProperty,
    removeFileFromValue,
    formatDate,
  }
}
