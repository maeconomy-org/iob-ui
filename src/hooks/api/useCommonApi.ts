import { useMutation } from '@tanstack/react-query'
import { AggregateFindDTO, AuthResponse } from 'iob-client'

import { useIobClient } from '@/providers/query-provider'

export function useCommonApi() {
  const client = useIobClient()

  // Request certificate authentication (both base and UUID auth)
  const useRequestCertificate = () => {
    return useMutation({
      mutationFn: async (): Promise<{
        base: AuthResponse
        uuid: AuthResponse
      }> => {
        const baseAuthResponse = await client.auth.requestBaseAuth()
        const uuidAuthResponse = await client.auth.requestUuidAuth()

        return {
          base: baseAuthResponse.data as AuthResponse,
          uuid: uuidAuthResponse.data as AuthResponse,
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
    useRequestCertificate, // Consolidated auth method for both base and UUID
    useSearch,
  }
}
