import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'
import { toast } from 'sonner'

export function useFilesApi() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  const useSoftDeleteFile = () => {
    return useMutation({
      mutationFn: async (fileUuid: string) => {
        const response = await client.files.delete(fileUuid)

        return response.data
      },
      onSuccess: () => {
        toast.success('File deleted successfully')

        queryClient.invalidateQueries({ queryKey: ['aggregate'] })
      },
      onError: (error) => {
        console.error('Failed to delete file:', error)
        toast.error('Failed to delete file')
      },
    })
  }

  return {
    useSoftDeleteFile,
  }
}
