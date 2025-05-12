import { useMutation } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'

export function useUuid() {
  const client = useIobClient()

  // Generate a new UUID
  const useGenerateUuid = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await client.uuid.create()
        return response.data?.uuid
      },
    })
  }

  // Get UUIDs owned by the current user
  const useOwnedUuids = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await client.uuid.getOwned()
        return response.data
      },
    })
  }

  return {
    useGenerateUuid,
    useOwnedUuids,
  }
}
