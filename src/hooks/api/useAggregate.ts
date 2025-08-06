import { useQuery } from '@tanstack/react-query'
import type { AggregateFindDTO } from 'iob-client'

import { useIobClient } from '@/providers/query-provider'

export function useAggregate() {
  const client = useIobClient()

  // Get aggregate entity by UUID (rich data with all relationships)
  const useAggregateByUUID = (uuid: string, options = {}) => {
    return useQuery({
      queryKey: ['aggregate', uuid],
      queryFn: async () => {
        if (!uuid) return null
        const response = await client.aggregate.findByUUID(uuid)
        return response.data
      },
      enabled: !!uuid,
      ...options,
    })
  }

  // Get paginated aggregate entities (for tables/lists)
  const useAggregateEntities = (params?: AggregateFindDTO, options = {}) => {
    return useQuery({
      queryKey: ['aggregates', params],
      queryFn: async () => {
        const response = await client.aggregate.getAggregateEntities(params)
        return response.data
      },
      ...options,
    })
  }

  // Get all aggregate entities without pagination (convenience method)
  const useAllAggregateEntities = (options = {}) => {
    return useQuery({
      queryKey: ['aggregates', 'all'],
      queryFn: async () => {
        const response = await client.aggregate.getAggregateEntities({
          page: 0,
          size: 1000, // Large size to get most entities
        })
        return response.data
      },
      ...options,
    })
  }

  // Search aggregate entities by creator
  const useAggregateEntitiesByCreator = (createdBy: string, options = {}) => {
    return useQuery({
      queryKey: ['aggregates', 'creator', createdBy],
      queryFn: async () => {
        if (!createdBy) return null
        const response = await client.aggregate.getAggregateEntities({
          createdBy,
          page: 0,
          size: 1000,
        })
        return response.data
      },
      enabled: !!createdBy,
      ...options,
    })
  }

  // Get aggregate entities with history
  const useAggregateEntitiesWithHistory = (
    params?: AggregateFindDTO,
    options = {}
  ) => {
    return useQuery({
      queryKey: ['aggregates', 'withHistory', params],
      queryFn: async () => {
        const response = await client.aggregate.getAggregateEntities({
          ...params,
          hasHistory: true,
        })
        return response.data
      },
      ...options,
    })
  }

  return {
    useAggregateByUUID,
    useAggregateEntities,
    useAllAggregateEntities,
    useAggregateEntitiesByCreator,
    useAggregateEntitiesWithHistory,
  }
}
