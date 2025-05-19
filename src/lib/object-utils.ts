/**
 * Utility functions for working with objects in the IoB application
 */

/**
 * Formats a property value for display
 */
export const formatPropertyValue = (property: any) => {
  // Handle property with values array in new structure
  if (property.values && property.values.length > 0) {
    return property.values
      .filter((v: any) => v && v.value && !v.softDeleted)
      .map((v: any) => v.value)
      .join(', ')
  }

  // Handle property with single value
  if (typeof property.value === 'string') {
    return property.value
  }

  return ''
}

/**
 * Normalizes an object to ensure consistent property structure for comparison
 */
export const normalizeObject = (obj: any) => {
  if (!obj) return {}

  // Make a deep copy to avoid modifying the original
  const normalized = { ...obj }

  // Normalize properties
  if (normalized.properties) {
    normalized.properties = normalized.properties.map((prop: any) => {
      // Create a normalized property
      const normalizedProp = {
        uuid: prop.uuid,
        key: prop.key,
        label: prop.label || '',
        description: prop.description || '',
        type: prop.type || '',
        values: [],
        files: [...(prop.files || [])],
      }

      // Normalize values
      if (prop.values) {
        normalizedProp.values = prop.values.map((val: any) => {
          // Handle different value structures
          return {
            uuid: val.uuid,
            value: val.value?.value || val.value,
            files: [...(val.files || [])],
          }
        })
      }

      return normalizedProp
    })
  }

  return normalized
}

/**
 * Compare property values between original and updated properties
 * Returns an object with arrays of values to add and UUIDs of values to remove
 */
export const comparePropertyValues = (
  originalValues: any[] = [],
  updatedValues: any[] = []
) => {
  const addValues: any[] = []
  const removeValues: string[] = []

  // Find values to add or update
  for (const updatedVal of updatedValues) {
    // Try to find matching value by UUID if available
    const originalValByUuid = updatedVal.uuid
      ? originalValues.find((val) => val.uuid === updatedVal.uuid)
      : null

    // If no match by UUID, try to find a value with the same content
    const originalValByContent = !originalValByUuid
      ? originalValues.find((val) => val.value === updatedVal.value)
      : null

    // If value is new or the content changed, mark it for addition
    if (!originalValByUuid && !originalValByContent) {
      // Brand new value
      addValues.push(updatedVal)
    } else if (
      originalValByUuid &&
      originalValByUuid.value !== updatedVal.value
    ) {
      // Existing value with updated content
      addValues.push({
        ...updatedVal,
        // Ensure we use the original UUID if available
        uuid: originalValByUuid.uuid,
      })
    }
  }

  // Find values that were removed
  for (const originalVal of originalValues) {
    if (
      originalVal.uuid &&
      !updatedValues.some(
        (val) =>
          val.uuid === originalVal.uuid ||
          (!val.uuid && val.value === originalVal.value)
      )
    ) {
      removeValues.push(originalVal.uuid)
    }
  }

  return { addValues, removeValues }
}

/**
 * Check if an object is marked as deleted
 */
export const isObjectDeleted = (object: any): boolean => {
  return object?.softDeleted === true
}

/**
 * Get metadata for a deleted object
 */
export const getDeletedMetadata = (object: any) => {
  return {
    deletedAt: object?.deletedAt || object?.updatedAt,
    deletedBy: object?.deletedBy || 'Unknown',
  }
}

/**
 * Filter objects by name (for search functionality)
 */
export const filterObjectsByName = (objects: any[], searchTerm: string) => {
  if (!searchTerm) return objects

  const term = searchTerm.toLowerCase()
  return objects.filter(
    (obj) =>
      obj.name?.toLowerCase().includes(term) ||
      obj.abbreviation?.toLowerCase().includes(term)
  )
}
