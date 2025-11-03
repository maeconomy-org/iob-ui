import { useMemo } from 'react'

import { useObjects, useStatements, useMaterialFlowProcessing } from '@/hooks'
import { generateComprehensiveData } from '@/lib/sample-data'

interface UseSankeyDataProps {
  objectUuid?: string | null
  useRealData: boolean
}

interface SankeyData {
  materials: any[]
  relationships: any[]
  isLoading: boolean
}

/**
 * Custom hook to manage sankey data fetching and processing
 * Handles both sample data and real data with optional object filtering
 */
export function useSankeyData({
  objectUuid,
  useRealData,
}: UseSankeyDataProps): SankeyData {
  const { useStatementsByPredicate, useObjectRelationships } = useStatements()
  const { useObjectsByUUIDs } = useObjects()

  // Optimized: Single call for object-specific relationships
  const { data: objectRelationships, isLoading: objectRelationshipsLoading } =
    useObjectRelationships(objectUuid || '', {
      enabled: useRealData && !!objectUuid,
      predicate: 'IS_INPUT_OF',
      includeDeleted: false,
    })

  // Fetch all IS_INPUT_OF statements when not filtering by specific object
  const { data: inputStatements, isLoading: statementsLoading } =
    useStatementsByPredicate('IS_INPUT_OF' as any, {
      enabled: useRealData && !objectUuid,
    })

  // Generate sample data (memoized)
  const sampleData = useMemo(() => {
    return generateComprehensiveData()
  }, [])

  // Combine statements based on filtering mode
  const combinedStatements = useMemo(() => {
    if (!objectUuid) return inputStatements
    return objectRelationships?.combined || []
  }, [objectUuid, objectRelationships, inputStatements])

  // Extract unique object UUIDs from statements for optimized fetching
  const participatingObjectUuids = useMemo(() => {
    if (!combinedStatements) return []

    const uuids = new Set<string>()
    combinedStatements.forEach((statement) => {
      uuids.add(statement.subject)
      uuids.add(statement.object)
    })

    return Array.from(uuids)
  }, [combinedStatements])

  // Optimized: Only fetch objects that participate in relationships
  const { data: realObjects, isLoading: objectsLoading } = useObjectsByUUIDs(
    participatingObjectUuids,
    {
      enabled: useRealData && participatingObjectUuids.length > 0,
    }
  )

  // Process real data using material flow processing hook
  const realDataConverted = useMaterialFlowProcessing({
    inputStatements: combinedStatements,
    realObjects: realObjects || null,
    enabled: useRealData,
  })

  // Determine loading state
  const isLoading = useRealData
    ? statementsLoading || objectsLoading || objectRelationshipsLoading
    : false

  // Return appropriate data based on mode
  const { materials, relationships } = useRealData
    ? realDataConverted
    : sampleData

  return {
    materials,
    relationships,
    isLoading,
  }
}
