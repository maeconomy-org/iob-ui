import { useMemo } from 'react'
import { useViewData } from '@/hooks'
import type { ParentObject } from '../components/ParentSelector'

/**
 * Hook for looking up parent object details from UUIDs
 */
export function useParentLookup(parentUuids: string[]): ParentObject[] {
  const viewData = useViewData({ viewType: 'table' })
  const availableObjects = 'data' in viewData ? viewData.data || [] : []

  return useMemo(() => {
    if (!parentUuids || parentUuids.length === 0) {
      return []
    }

    return parentUuids
      .map((uuid) => {
        // Handle the case where uuid might be empty or invalid
        if (!uuid || typeof uuid !== 'string') {
          return null
        }

        const foundObject = availableObjects.find(
          (obj: any) => obj.uuid === uuid
        )
        if (foundObject) {
          return {
            uuid: foundObject.uuid,
            name: foundObject.name || foundObject.uuid, // Fallback to UUID if no name
            description: foundObject.description,
          }
        }

        // Return minimal info if object not found in current data
        // This shows just the UUID since we don't have the full object data
        return {
          uuid,
          name: `Object: ${uuid.slice(0, 8)}...`, // Show truncated UUID for readability
        }
      })
      .filter((parent): parent is ParentObject => parent !== null)
  }, [parentUuids, availableObjects])
}
