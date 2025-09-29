import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'
import { useAuth } from '@/contexts/auth-context'

/**
 * Import API object structure based on the provided schema
 */
export interface ImportObjectData {
  name: string
  abbreviation?: string
  version?: string
  description?: string
  address?: {
    fullAddress: string
    street: string
    houseNumber: string
    city: string
    postalCode: string
    country: string
    state?: string
    district?: string
  }
  parents?: string[]
  files?: Array<{
    fileName: string
    fileReference: string
    label?: string
    contentType?: string
    size?: number
  }>
  properties?: Array<{
    key: string
    label?: string
    type?: string
    values?: Array<{
      value: string
      valueTypeCast?: string
      sourceType?: string
      files?: Array<{
        uuid: string
        fileName: string
        fileReference: string
        label?: string
        contentType?: string
        size?: number
      }>
    }>
    files?: Array<{
      uuid: string
      fileName: string
      fileReference: string
      label?: string
      contentType?: string
      size?: number
    }>
  }>
}

/**
 * Result from import API
 */
export interface ImportResult {
  success: boolean
  message?: string
  data?: any
  // The actual structure depends on what the import API returns
  // We'll log the response to understand the structure
}

/**
 * Hook for using the import API directly from client-side
 */
export function useImportApi() {
  const client = useIobClient()
  const queryClient = useQueryClient()
  const { userUuid } = useAuth()

  const importSingleObject = useMutation({
    mutationFn: async (objectData: ImportObjectData): Promise<any> => {
      if (!userUuid) {
        throw new Error('User UUID is required for import')
      }

      // Wrap data with required structure
      const payload = {
        aggregateEntityList: [objectData],
        user: { userUuid },
      }

      const response = await client.aggregate.createAggregateObject(payload)
      return response.data
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful import
      queryClient.invalidateQueries({ queryKey: ['objects'] })
      queryClient.invalidateQueries({ queryKey: ['aggregates'] })
    },
  })

  return {
    importSingleObject,
    isImporting: importSingleObject.isPending,
  }
}
