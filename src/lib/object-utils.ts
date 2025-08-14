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
 * Check if an object is marked as deleted
 */
export const isObjectDeleted = (object: any): boolean => {
  return object?.softDeleted === true
}
