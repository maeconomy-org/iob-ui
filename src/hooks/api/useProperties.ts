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
      onSuccess: ({ objectUuid, property }) => {
        // Update the object with properties cache directly
        queryClient.setQueryData(
          ['object', objectUuid, 'withProperties'],
          (oldData: any) => {
            if (!oldData) return oldData

            // Add the new property to the object's properties
            const updatedData = { ...oldData }
            if (!updatedData.properties) {
              updatedData.properties = []
            }

            // Add in the format expected by the object details sheet
            updatedData.properties.push({
              property: [property],
              values: [],
            })

            return updatedData
          }
        )

        // Also invalidate the queries that might need a refresh
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
      onSuccess: ({ propertyUuid, value }) => {
        // Try to update object cache directly for the specific property
        queryClient
          .getQueryCache()
          .findAll({ queryKey: ['object'] })
          .forEach((query) => {
            queryClient.setQueryData(query.queryKey, (oldData: any) => {
              if (!oldData || !oldData.properties) return oldData

              // Find the property group containing this property
              const updatedData = { ...oldData }
              const propertyGroup = updatedData.properties.find(
                (group: any) =>
                  group.property &&
                  group.property.some((p: any) => p.uuid === propertyUuid)
              )

              if (propertyGroup) {
                // Add the new value to the values array
                if (!propertyGroup.values) {
                  propertyGroup.values = []
                }

                // Add the value in the format expected by the object details
                propertyGroup.values.push({
                  value: [value],
                })
              }

              return updatedData
            })
          })

        // Invalidate the property and related queries
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
        // First update the property metadata (like key)
        if (property.uuid) {
          // Note: The API uses the same endpoint for create and update
          // When uuid is provided, it updates the existing property
          await client.properties.api.create({
            uuid: property.uuid,
            key: property.key,
          })
        }

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
        if (!updatedProperty) return

        // Try to update object caches directly with the updated property
        queryClient
          .getQueryCache()
          .findAll({ queryKey: ['object'] })
          .forEach((query) => {
            queryClient.setQueryData(query.queryKey, (oldData: any) => {
              if (!oldData || !oldData.properties) return oldData

              const updatedData = { ...oldData }

              // Find the property group containing this property
              const propertyGroupIndex = updatedData.properties.findIndex(
                (group: any) =>
                  group.property &&
                  group.property.some(
                    (p: any) => p.uuid === updatedProperty.uuid
                  )
              )

              if (propertyGroupIndex >= 0) {
                // Update the property in the cache
                const propertyGroup = updatedData.properties[propertyGroupIndex]
                const propertyIndex = propertyGroup.property.findIndex(
                  (p: any) => p.uuid === updatedProperty.uuid
                )

                if (propertyIndex >= 0) {
                  // Update the property metadata
                  propertyGroup.property[propertyIndex] = {
                    ...propertyGroup.property[propertyIndex],
                    key: updatedProperty.key,
                    // Add other fields as needed
                  }
                }
              }

              return updatedData
            })
          })

        // Invalidate the caches to ensure eventual consistency
        queryClient.invalidateQueries({
          queryKey: ['property', updatedProperty.uuid],
        })
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
