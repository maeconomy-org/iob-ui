'use client'

import { useState, useCallback } from 'react'
import { useProperties } from './api'
import { useIobClient } from '@/providers/query-provider'
import type { UUPropertyDTO, UUPropertyValueDTO } from 'iob-client'
import { Predicate } from 'iob-client'

/**
 * A hook that provides comprehensive property management functions
 */
export function usePropertyManagement(objectUuid?: string) {
  const client = useIobClient()
  const {
    useUpdatePropertyWithValues,
    useAddPropertyToObject,
    useSetPropertyValue,
  } = useProperties()

  // Get the mutations
  const updatePropertyMutation = useUpdatePropertyWithValues()
  const addPropertyMutation = useAddPropertyToObject()
  const setValueMutation = useSetPropertyValue()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Create a new property and add it to an object
   */
  const createPropertyForObject = useCallback(
    async (
      objectId: string,
      propertyData: Partial<UUPropertyDTO> & { key: string }
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await addPropertyMutation.mutateAsync({
          objectUuid: objectId,
          property: propertyData,
        })
        return result
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to create property')
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [addPropertyMutation]
  )

  /**
   * Update a property and its values in a single operation
   */
  const updatePropertyWithValues = useCallback(
    async (
      property: UUPropertyDTO,
      values: Array<{
        uuid?: string
        value: string
        valueTypeCast?: string
      }> = []
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await updatePropertyMutation.mutateAsync({
          property,
          values,
        })
        return result
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to update property')
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [updatePropertyMutation]
  )

  /**
   * Add a value to an existing property
   */
  const addValueToProperty = useCallback(
    async (propertyUuid: string, valueData: Partial<UUPropertyValueDTO>) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await setValueMutation.mutateAsync({
          propertyUuid,
          value: valueData,
        })
        return result
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to add value to property')
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [setValueMutation]
  )

  /**
   * Remove a property from an object
   */
  const removePropertyFromObject = useCallback(
    async (objectId: string, propertyUuid: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // We need to find the property-object relationship and remove it
        const statements = await client.statements.api.find({
          subject: propertyUuid,
          predicate: Predicate.IS_PROPERTY_OF,
          object: objectId,
        })

        if (statements.data && statements.data.length > 0) {
          // Remove the relationship
          await client.statements.softDeleteRelationship(
            propertyUuid,
            Predicate.IS_PROPERTY_OF,
            objectId
          )
        }

        return { success: true }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to remove property from object')
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [client]
  )

  return {
    createPropertyForObject,
    updatePropertyWithValues,
    addValueToProperty,
    removePropertyFromObject,
    isLoading,
    error,
  }
}
