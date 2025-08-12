import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  UUObjectDTO,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  UUID,
  QueryParams,
} from 'iob-client'
import { useIobClient } from '@/providers/query-provider'

export function useObjects() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  // Get all objects using the new unified API
  const useAllObjects = (options?: QueryParams & { enabled?: boolean }) => {
    const { enabled = true, ...queryParams } = options || {}
    return useQuery({
      queryKey: ['objects', queryParams],
      queryFn: async () => {
        const response = await client.objects.getObjects({
          softDeleted: false,
          ...queryParams,
        })
        return response.data
      },
      enabled,
    })
  }

  // Get objects by specific UUID (returns array but should contain single object)
  const useObject = (uuid: string, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['object', uuid],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.objects.getObjects({ uuid })
        // Since API returns array, get the first object
        return response.data?.[0] || null
      },
      enabled: !!uuid && options?.enabled !== false,
    })
  }

  // Create object mutation - using new simplified method
  const useCreateObject = () => {
    return useMutation({
      mutationFn: async (object: UUObjectDTO) => {
        const response = await client.objects.create(object)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['objects'] })

        // Also invalidate aggregate queries to refresh table/explorer views
        queryClient.invalidateQueries({ queryKey: ['aggregates'] })
      },
    })
  }

  // Create full object mutation - keep high-level method
  const useCreateFullObject = () => {
    return useMutation({
      mutationFn: async (objectData: ComplexObjectCreationInput) => {
        console.log('Creating full object:', objectData)
        const response = await client.objects.createFullObject(objectData)
        return response.data
      },
      onSuccess: (data: ComplexObjectOutput | null) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['objects'] })

        // Also invalidate aggregate queries to refresh table/explorer views
        queryClient.invalidateQueries({ queryKey: ['aggregates'] })

        if (data?.object?.uuid) {
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid, 'withProperties'],
          })
          queryClient.invalidateQueries({
            queryKey: ['aggregate', data.object.uuid],
          })
        }

        // According to the ComplexObjectOutput type, there may be a parent property
        if (data?.parents?.length && data.parents.length > 0) {
          data.parents.forEach((parent) => {
            queryClient.invalidateQueries({
              queryKey: ['object', parent],
            })
            queryClient.invalidateQueries({
              queryKey: ['object', parent, 'children'],
            })
            queryClient.invalidateQueries({
              queryKey: ['aggregate', parent],
            })
          })
        }
      },
    })
  }

  // Update object metadata only - using create method (which handles updates)
  const useUpdateObjectMetadata = () => {
    return useMutation({
      mutationFn: async ({
        uuid,
        name,
        abbreviation,
        version,
        description,
      }: {
        uuid: UUID
        name?: string
        abbreviation?: string
        version?: string
        description?: string
      }) => {
        // Use the create method which handles both create and update
        const response = await client.objects.create({
          uuid,
          name,
          abbreviation,
          version,
          description,
        })
        return response.data
      },
      onSuccess: (data) => {
        if (data?.uuid) {
          // Invalidate just the object queries, not the entire objects collection
          queryClient.invalidateQueries({
            queryKey: ['object', data.uuid],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.uuid, 'withProperties'],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.uuid, 'full'],
          })

          // Also invalidate aggregate queries to refresh table/explorer views
          queryClient.invalidateQueries({ queryKey: ['aggregates'] })
          queryClient.invalidateQueries({ queryKey: ['aggregate', data.uuid] })
        }
      },
    })
  }

  // Delete object mutation - using new simplified method
  const useDeleteObject = () => {
    return useMutation({
      mutationFn: async (uuid: string) => {
        const response = await client.objects.delete(uuid)
        return response.data
      },
      onSuccess: (deletedUuid) => {
        queryClient.invalidateQueries({ queryKey: ['objects'] })
        // Don't remove queries since soft delete keeps the object
        queryClient.invalidateQueries({ queryKey: ['object', deletedUuid] })

        // Also invalidate aggregate queries to refresh table/explorer views
        queryClient.invalidateQueries({ queryKey: ['aggregates'] })
        queryClient.invalidateQueries({ queryKey: ['aggregate', deletedUuid] })
      },
    })
  }

  return {
    useAllObjects,
    useObject,
    useCreateObject,
    useCreateFullObject,
    useUpdateObjectMetadata,
    useDeleteObject,
  }
}
