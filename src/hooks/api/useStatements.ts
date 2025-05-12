import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useIobClient } from '@/providers/query-provider'
import type { UUStatementDTO, Predicate } from 'iob-client'
import { Predicate as PredicateEnum } from 'iob-client'

export function useStatements() {
  const client = useIobClient()
  const queryClient = useQueryClient()

  // Get all statements
  const useAllStatements = (options = {}) => {
    return useQuery({
      queryKey: ['statements'],
      queryFn: async () => {
        const response = await client.statements.api.getAll()
        return response.data
      },
      ...options,
    })
  }

  // Get statements by predicate
  const useStatementsByPredicate = (predicate: Predicate, options = {}) => {
    return useQuery({
      queryKey: ['statements', 'predicate', predicate],
      queryFn: async () => {
        const response = await client.statements.api.getByPredicate(predicate)
        return response.data
      },
      enabled: !!predicate,
      ...options,
    })
  }

  // Get statements by UUID and predicate
  const useStatementsByUuidAndPredicate = (
    uuid: string,
    predicate: Predicate,
    options = {}
  ) => {
    return useQuery({
      queryKey: ['statements', uuid, predicate],
      queryFn: async () => {
        if (!uuid || !predicate) return []
        const response = await client.statements.api.getByUuidAndPredicate(
          uuid,
          predicate
        )
        return response.data
      },
      enabled: !!uuid && !!predicate,
      ...options,
    })
  }

  // Get child objects of a parent
  const useChildrenOf = (parentUuid: string, options = {}) => {
    return useQuery({
      queryKey: ['object', parentUuid, 'children'],
      queryFn: async () => {
        if (!parentUuid) return []

        // Get the statements where parent IS_PARENT_OF children
        const statementsResponse =
          await client.statements.api.getByUuidAndPredicate(
            parentUuid,
            PredicateEnum.IS_PARENT_OF
          )

        if (
          !statementsResponse.data ||
          !Array.isArray(statementsResponse.data)
        ) {
          return []
        }

        // Get the actual child objects
        const childObjects = await Promise.all(
          statementsResponse.data.map(async (statement) => {
            const objectResponse = await client.objects.api.getById(
              statement.object
            )
            return objectResponse.data
          })
        )

        // Filter out any nulls (failed object fetches)
        return childObjects.filter(Boolean)
      },
      enabled: !!parentUuid,
      ...options,
    })
  }

  // Get parent objects of a child
  const useParentsOf = (childUuid: string, options = {}) => {
    return useQuery({
      queryKey: ['object', childUuid, 'parents'],
      queryFn: async () => {
        if (!childUuid) return []

        // Get the statements where child IS_CHILD_OF parents
        const statementsResponse =
          await client.statements.api.getByUuidAndPredicate(
            childUuid,
            PredicateEnum.IS_CHILD_OF
          )

        if (
          !statementsResponse.data ||
          !Array.isArray(statementsResponse.data)
        ) {
          return []
        }

        // Get the actual parent objects
        const parentObjects = await Promise.all(
          statementsResponse.data.map(async (statement) => {
            const objectResponse = await client.objects.api.getById(
              statement.object
            )
            return objectResponse.data
          })
        )

        // Filter out any nulls (failed object fetches)
        return parentObjects.filter(Boolean)
      },
      enabled: !!childUuid,
      ...options,
    })
  }

  // Create relationship mutation
  const useCreateRelationship = () => {
    return useMutation({
      mutationFn: async ({
        subject,
        predicate,
        object,
      }: {
        subject: string
        predicate: Predicate
        object: string
      }) => {
        const response = await client.statements.createRelationship(
          subject,
          predicate,
          object
        )
        return response.data
      },
      onSuccess: (_, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['statements'] })
        queryClient.invalidateQueries({
          queryKey: ['statements', variables.subject, variables.predicate],
        })
        queryClient.invalidateQueries({
          queryKey: ['object', variables.subject, 'children'],
        })
        queryClient.invalidateQueries({
          queryKey: ['object', variables.object, 'parents'],
        })
      },
    })
  }

  // Delete relationship mutation
  const useDeleteRelationship = () => {
    return useMutation({
      mutationFn: async ({
        subject,
        predicate,
        object,
      }: {
        subject: string
        predicate: Predicate
        object: string
      }) => {
        const response = await client.statements.deleteRelationship(
          subject,
          predicate,
          object
        )
        return { subject, predicate, object }
      },
      onSuccess: ({ subject, predicate, object }) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['statements'] })
        queryClient.invalidateQueries({
          queryKey: ['statements', subject, predicate],
        })
        queryClient.invalidateQueries({
          queryKey: ['object', subject, 'children'],
        })
        queryClient.invalidateQueries({
          queryKey: ['object', object, 'parents'],
        })
      },
    })
  }

  return {
    useAllStatements,
    useStatementsByPredicate,
    useStatementsByUuidAndPredicate,
    useChildrenOf,
    useParentsOf,
    useCreateRelationship,
    useDeleteRelationship,
  }
}
