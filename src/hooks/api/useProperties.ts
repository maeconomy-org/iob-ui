import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'
import type { UUPropertyDTO, UUPropertyValueDTO } from 'iob-client'

export function useProperties() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  // Get all properties
  const useAllProperties = (options = {}) => {
    return useQuery({
      queryKey: ['properties'],
      queryFn: async () => {
        const response = await client.properties.api.getOwn({
          softDeleted: false,
        })
        return response.data
      },
      ...options,
    })
  }

  // Get property by ID
  const useProperty = (uuid: string, options = {}) => {
    return useQuery({
      queryKey: ['property', uuid],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.properties.api.getById(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Get property by key
  const usePropertyByKey = (key: string, options = {}) => {
    return useQuery({
      queryKey: ['property', 'key', key],
      queryFn: async () => {
        if (!key) return null
        const response = await client.properties.api.getByKey(key)
        return response.data
      },
      enabled: !!key,
      ...options,
    })
  }

  // Create property mutation
  const useCreateProperty = () => {
    return useMutation({
      mutationFn: async (property: UUPropertyDTO) => {
        const response = await client.properties.api.create(property)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['properties'] })
      },
    })
  }

  // Delete property mutation
  const useDeleteProperty = () => {
    return useMutation({
      mutationFn: async (uuid: string) => {
        const response = await client.properties.api.delete(uuid)
        return uuid
      },
      onSuccess: (deletedUuid) => {
        queryClient.invalidateQueries({ queryKey: ['properties'] })
        queryClient.removeQueries({ queryKey: ['property', deletedUuid] })
      },
    })
  }

  // Add property to object
  const useAddPropertyToObject = () => {
    return useMutation({
      mutationFn: async ({
        objectUuid,
        property,
      }: {
        objectUuid: string
        property: Partial<UUPropertyDTO> & { key: string }
      }) => {
        const response = await client.properties.addToObject(
          objectUuid,
          property
        )
        return { objectUuid, property: response.data }
      },
      onSuccess: ({ objectUuid }) => {
        // Invalidate the object with properties
        queryClient.invalidateQueries({
          queryKey: ['object', objectUuid, 'withProperties'],
        })
      },
    })
  }

  // Get property value by ID
  const usePropertyValue = (uuid: string, options = {}) => {
    return useQuery({
      queryKey: ['propertyValue', uuid],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.values.api.getById(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Set property value
  const useSetPropertyValue = () => {
    return useMutation({
      mutationFn: async ({
        propertyUuid,
        value,
      }: {
        propertyUuid: string
        value: Partial<UUPropertyValueDTO>
      }) => {
        const response = await client.values.setForProperty(propertyUuid, value)
        return { propertyUuid, value: response.data }
      },
      onSuccess: ({ propertyUuid }) => {
        // Invalidate the property and any objects that might use this property
        queryClient.invalidateQueries({ queryKey: ['property', propertyUuid] })
        queryClient.invalidateQueries({ queryKey: ['object'] })
      },
    })
  }

  // Update property with values (combined operation)
  const useUpdatePropertyWithValues = () => {
    return useMutation({
      mutationFn: async ({
        property,
        values = [],
      }: {
        property: UUPropertyDTO
        values?: Array<{ uuid?: string; value: string; valueTypeCast?: string }>
      }) => {
        // Then process each value
        for (const value of values) {
          if (value.uuid) {
            // Update existing value
            await client.values.api.create({
              uuid: value.uuid,
              value: value.value,
              valueTypeCast: value.valueTypeCast || 'string',
            })
          } else {
            // Add new value to the property
            await client.values.setForProperty(property.uuid, {
              value: value.value,
              valueTypeCast: value.valueTypeCast || 'string',
            })
          }
        }

        // Return the updated property
        const response = await client.properties.api.getById(property.uuid)
        return response.data
      },
      onSuccess: (updatedProperty) => {
        // Invalidate all the caches that might be affected
        if (updatedProperty) {
          queryClient.invalidateQueries({
            queryKey: ['property', updatedProperty.uuid],
          })
        }
        queryClient.invalidateQueries({ queryKey: ['propertyValue'] })
        queryClient.invalidateQueries({ queryKey: ['object'] })
      },
    })
  }

  return {
    useAllProperties,
    useProperty,
    usePropertyByKey,
    useCreateProperty,
    useDeleteProperty,
    useAddPropertyToObject,
    usePropertyValue,
    useSetPropertyValue,
    useUpdatePropertyWithValues,
  }
}
