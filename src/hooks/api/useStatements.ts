import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UUStatementDTO, StatementQueryParams } from 'iob-client'

import { useIobClient } from '@/providers/query-provider'

export function useStatements() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  // Get all statements using the new unified API
  const useAllStatements = (
    options?: StatementQueryParams & { enabled?: boolean }
  ) => {
    const { enabled = true, ...queryParams } = options || {}
    return useQuery({
      queryKey: ['statements', queryParams],
      queryFn: async () => {
        const response = await client.statements.getStatements(queryParams)
        return response.data
      },
      enabled,
    })
  }

  // Create statement mutation - using new simplified method
  const useCreateStatement = () => {
    return useMutation({
      mutationFn: async (statement: UUStatementDTO) => {
        const response = await client.statements.create(statement)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['statements'] })
      },
    })
  }

  // Delete statement mutation - using new simplified method
  const useDeleteStatement = () => {
    return useMutation({
      mutationFn: async (statement: UUStatementDTO) => {
        const response = await client.statements.delete(statement)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['statements'] })
      },
    })
  }

  return {
    useAllStatements,
    useCreateStatement,
    useDeleteStatement,
  }
}
