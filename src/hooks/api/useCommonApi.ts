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

  // Search for a UUID
  const useSearch = () => {
    return useMutation({
      mutationFn: async (uuid: string) => {
        const response = await client.aggregate.findByUUID(uuid)
        return response.data
      },
    })
  }

  return {
    useRequestCertificate,
    useSearch,
  }
}
