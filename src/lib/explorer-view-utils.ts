/**
 * Utility functions specifically for the object explorer view
 */

import { ObjectItem } from '@/components/object-views/explorer-view/tree-item'

/**
 * Filter objects based on search term
 * This performs a recursive search through the object tree
 */
export const filterObjectsBySearchTerm = (
  objects: ObjectItem[],
  term: string
): ObjectItem[] => {
  if (!term.trim()) return objects

  return objects
    .filter((obj) => {
      // Check if this object matches
      const nameMatch = obj.name.toLowerCase().includes(term.toLowerCase())

      // Check if any children match (recursively)
      const childrenMatch =
        obj.children && obj.children.length > 0
          ? filterObjectsBySearchTerm(obj.children, term).length > 0
          : false

      return nameMatch || childrenMatch
    })
    .map((obj) => {
      // If the object has children, filter them too
      if (!obj.children || obj.children.length === 0) return obj

      return {
        ...obj,
        children: filterObjectsBySearchTerm(obj.children, term),
      }
    })
}

/**
 * Process the properties from API response into a normalized format
 */
export const processProperties = (propertyGroups: any[] = []) => {
  return (
    propertyGroups?.map((propGroup: any) => {
      // Extract property metadata from the first property item
      const propMeta = propGroup.property?.[0] || {}

      // Extract and combine all values
      const values =
        propGroup.values?.flatMap(
          (valueObj: any) => valueObj.value?.map((val: any) => val) || []
        ) || []

      return {
        ...propMeta,
        values,
      }
    }) || []
  )
}

/**
 * Process the object versions from API response
 * Returns the current object and history
 */
export const processObjectVersions = (data: any) => {
  if (!data) return { currentObject: null, objectHistory: [] }

  // Extract all object versions and sort by date (newest first)
  const objects = Array.isArray(data.object) ? data.object : [data.object]
  const sortedObjects = objects.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return {
    currentObject: sortedObjects[0] || null,
    objectHistory: sortedObjects.slice(1) || [],
  }
}
