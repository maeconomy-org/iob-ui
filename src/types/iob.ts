/**
 * IoB Types
 * This file extends and re-exports types from the iob-client package
 * for use throughout the application.
 */

import type {
  UUID,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUFileDTO,
  UUStatementDTO,
  Predicate,
  UUObjectWithProperties,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  ApiResponse,
  ApiError,
  IOBClientConfig,
  // New aggregate types
  AggregateEntity,
  AggregateProperty,
  AggregateFile,
  AggregateFindDTO,
  PageAggregateEntity,
  QueryParams,
  StatementQueryParams,
  AuthResponse,
} from 'iob-client'

// Re-export all types from the iob-client package
export type {
  UUID,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUFileDTO,
  UUStatementDTO,
  Predicate,
  UUObjectWithProperties,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  ApiResponse,
  ApiError,
  IOBClientConfig,
  // New aggregate types
  AggregateEntity,
  AggregateProperty,
  AggregateFile,
  AggregateFindDTO,
  PageAggregateEntity,
  QueryParams,
  StatementQueryParams,
  AuthResponse,
}

/**
 * Object update input type for the updateObject API
 */
export type ObjectUpdateInput = {
  object?: Partial<Omit<UUObjectDTO, 'uuid'>>
  parentUuid?: UUID | null
  addFiles?: Array<{
    file: Omit<UUFileDTO, 'uuid'>
  }>
  removeFiles?: UUID[]
  properties?: Array<{
    key: string
    property?: Partial<Omit<UUPropertyDTO, 'uuid'>>
    addValues?: Array<{
      value: Omit<UUPropertyValueDTO, 'uuid'>
      addFiles?: Array<{
        file: Omit<UUFileDTO, 'uuid'>
      }>
    }>
    removeValues?: UUID[]
    addFiles?: Array<{
      file: Omit<UUFileDTO, 'uuid'>
    }>
    removeFiles?: UUID[]
  }>
  removeProperties?: string[]
}

/**
 * React Query related types
 */
export type QueryOptions = {
  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

/**
 * Query filter options for API requests
 */
export type QueryFilters = {
  search?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

/**
 * Response object with pagination info
 */
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * API hooks return types for consistent interface
 */
export type ObjectsHookReturns = {
  useAllObjects: (options?: QueryOptions) => any
  useObject: (uuid: UUID, options?: QueryOptions) => any
  useCreateObject: () => any
  useCreateFullObject: () => any
  useUpdateObjectMetadata: () => any
  useDeleteObject: () => any
}
