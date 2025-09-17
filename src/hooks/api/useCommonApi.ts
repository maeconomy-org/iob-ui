import { AggregateFindDTO } from 'iob-client'

import { useMutation } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'

export function useCommonApi() {
  const client = useIobClient()

  // Request a certificate
  const useRequestCertificate = () => {
    return useMutation({
      mutationFn: async (): Promise<{
        base: any
        uuid: any
      }> => {
        const baseAuthResponse = await client.auth.requestBaseAuth()
        const uuidAuthResponse = await client.auth.requestUuidAuth()

        return {
          base: { ...baseAuthResponse },
          uuid: { ...uuidAuthResponse },
        }
      },
    })
  }

  // Search for objects by text or UUID with pagination support
  const useSearch = () => {
    return useMutation({
      mutationFn: async (params: AggregateFindDTO) => {
        const response = await client.aggregate.getAggregateEntities(params)
        return response.data
      },
    })
  }

  return {
    useRequestCertificate,
    useSearch,
  }
}
