import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'
import type {
  UUObjectDTO,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  UUID,
  UUObjectWithProperties,
} from 'iob-client'
import type { QueryOptions, ObjectUpdateInput } from '@/types'

export function useObjects() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  // Get all objects
  const useAllObjects = (options?: QueryOptions) => {
    return useQuery({
      queryKey: ['objects'],
      queryFn: async () => {
        const response = await client.objects.api.getAll()
        return response.data
      },
      ...options,
    })
  }

  // Get objects by type
  const useObjectsByType = (type: string, options?: QueryOptions) => {
    return useQuery({
      queryKey: ['objects', 'type', type],
      queryFn: async () => {
        const response = await client.objects.api.getByType(type)
        return response.data
      },
      ...options,
    })
  }

  // Get object by ID with properties
  const useObjectWithProperties = (uuid: string, options?: QueryOptions) => {
    return useQuery({
      queryKey: ['object', uuid, 'withProperties'],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.objects.getWithProperties(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Get full object with all details (properties, values, files)
  const useFullObject = (uuid: string, options?: QueryOptions) => {
    return useQuery({
      queryKey: ['object', uuid, 'full'],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.objects.getFullObject(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Get object by ID (basic info)
  const useObject = (uuid: string, options?: QueryOptions) => {
    return useQuery({
      queryKey: ['object', uuid],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.objects.api.getById(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Create object mutation
  const useCreateObject = () => {
    return useMutation({
      mutationFn: async (object: UUObjectDTO) => {
        console.log('object', object)
        const response = await client.objects.api.create(object)
        console.log('response', response)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['objects'] })
      },
    })
  }

  // Create object with properties mutation
  const useCreateObjectWithProperties = () => {
    return useMutation({
      mutationFn: async ({
        object,
        properties,
      }: {
        object: Omit<UUObjectDTO, 'uuid'>
        properties: Array<{
          property: {
            key: string
            label?: string
            description?: string
            type?: string
          }
          value?: { value: string; valueTypeCast?: string }
        }>
      }) => {
        const response = await client.objects.createWithProperties(
          object,
          properties
        )
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['objects'] })
      },
    })
  }

  // Create full object mutation (renamed from createComplex to createFullObject)
  const useCreateFullObject = () => {
    return useMutation({
      mutationFn: async (objectData: ComplexObjectCreationInput) => {
        console.log('objectData', objectData)
        const response = await client.objects.createFullObject(objectData)
        return response.data
      },
      onSuccess: (data: ComplexObjectOutput | null) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['objects'] })

        if (data?.object?.uuid) {
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid, 'withProperties'],
          })
        }

        // According to the ComplexObjectOutput type, there may be a parent property
        if (data?.parent?.uuid) {
          queryClient.invalidateQueries({
            queryKey: ['object', data.parent.uuid],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.parent.uuid, 'children'],
          })
        }
      },
    })
  }

  // Update object mutation
  const useUpdateObject = () => {
    return useMutation({
      mutationFn: async ({
        uuid,
        updates,
      }: {
        uuid: UUID
        updates: ObjectUpdateInput
      }) => {
        const response = await client.objects.updateObject(uuid, updates)
        return response.data
      },
      onSuccess: (data: UUObjectWithProperties | null) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['objects'] })

        if (data?.object?.uuid) {
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid],
          })
          queryClient.invalidateQueries({
            queryKey: ['object', data.object.uuid, 'withProperties'],
          })
        }

        // For parent relationships, we'll need to check statements
        // But we can also invalidate any children queries since the structure may have changed
        queryClient.invalidateQueries({
          queryKey: ['objects', 'children'],
        })
      },
    })
  }

  // Delete object mutation (performs soft delete)
  const useDeleteObject = () => {
    return useMutation({
      mutationFn: async (uuid: string) => {
        console.log('uuid', uuid)
        const response = await client.objects.api.delete(uuid)
        console.log('response', response)
        return uuid
      },
      onSuccess: (deletedUuid) => {
        queryClient.invalidateQueries({ queryKey: ['objects'] })
        // Don't remove queries since soft delete keeps the object
        queryClient.invalidateQueries({ queryKey: ['object', deletedUuid] })
      },
    })
  }

  // Add child to parent object
  const useAddChildToObject = () => {
    return useMutation({
      mutationFn: async ({
        parentUuid,
        childUuid,
      }: {
        parentUuid: string
        childUuid: string
      }) => {
        const response = await client.objects.addChild(parentUuid, childUuid)
        return { parentUuid, childUuid, success: response.data }
      },
      onSuccess: ({ parentUuid }) => {
        // Invalidate the parent object and the parent's children
        queryClient.invalidateQueries({ queryKey: ['object', parentUuid] })
        queryClient.invalidateQueries({
          queryKey: ['object', parentUuid, 'children'],
        })
      },
    })
  }

  return {
    useAllObjects,
    useObjectsByType,
    useObjectWithProperties,
    useFullObject,
    useObject,
    useCreateObject,
    useCreateObjectWithProperties,
    useCreateFullObject,
    useUpdateObject,
    useDeleteObject,
    useAddChildToObject,
  }
}
