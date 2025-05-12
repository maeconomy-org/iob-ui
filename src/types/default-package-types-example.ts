type UUID = string
declare enum Predicate {
  IS_PARENT_OF = 'IS_PARENT_OF',
  IS_CHILD_OF = 'IS_CHILD_OF',
  IS_INPUT_OF = 'IS_INPUT_OF',
  IS_OUTPUT_OF = 'IS_OUTPUT_OF',
  IS_MODEL_OF = 'IS_MODEL_OF',
  IS_INSTANCE_MODEL_OF = 'IS_INSTANCE_MODEL_OF',
  IS_PROPERTY_OF = 'IS_PROPERTY_OF',
  HAS_PROPERTY = 'HAS_PROPERTY',
  IS_VALUE_OF = 'IS_VALUE_OF',
  HAS_VALUE = 'HAS_VALUE',
  IS_FILE_OF = 'IS_FILE_OF',
  HAS_FILE = 'HAS_FILE',
}
interface QueryParams {
  softDeleted?: boolean
}
interface UUStatementDTO {
  subject: UUID
  predicate: Predicate
  object: UUID
}
interface UUPropertyDTO {
  uuid: UUID
  key: string
  version?: string
  label?: string
  description?: string
  type?: string
  inputType?: string
  formula?: string
  inputOrderPosition?: number
  processingOrderPosition?: number
  viewOrderPosition?: number
}
interface UUPropertyValueDTO {
  uuid: UUID
  value?: string
  valueTypeCast?: string
  sourceType?: string
}
interface UUObjectDTO {
  uuid: UUID
  version?: string
  name?: string
  abbreviation?: string
  description?: string
}
interface UUFileDTO {
  uuid: UUID
  fileName: string
  fileReference: string
  label?: string
}
interface IOBClientConfig {
  baseUrl: string
  uuidServiceBaseUrl?: string
  certificate?: {
    cert: string
    key: string
  }
  timeout?: number
  headers?: Record<string, string>
}
interface UUObjectWithProperties {
  object: UUObjectDTO
  properties: Array<{
    property: UUPropertyDTO
    value?: UUPropertyValueDTO
  }>
  children?: UUObjectDTO[]
  files?: UUFileDTO[]
}
interface ComplexObjectCreationInput {
  object: Omit<UUObjectDTO, 'uuid'>
  parentUuid?: UUID
  files?: Array<{
    file: Omit<UUFileDTO, 'uuid'>
  }>
  properties?: Array<{
    property: Omit<UUPropertyDTO, 'uuid'> & {
      key: string
    }
    values?: Array<{
      value: Omit<UUPropertyValueDTO, 'uuid'>
      files?: Array<{
        file: Omit<UUFileDTO, 'uuid'>
      }>
    }>
    files?: Array<{
      file: Omit<UUFileDTO, 'uuid'>
    }>
  }>
}
interface ComplexObjectOutput {
  object: UUObjectDTO
  properties: Array<{
    property: UUPropertyDTO
    values: Array<{
      value: UUPropertyValueDTO
      files: UUFileDTO[]
    }>
    files: UUFileDTO[]
  }>
  files: UUFileDTO[]
  parent?: UUObjectDTO
}
interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers?: Record<string, string>
}
interface ApiError {
  status: number
  statusText: string
  message: string
  details?: any
}

/**
 * Get all statements with optional softDeleted filter
 * Direct wrapper for the findBySoftDeleted endpoint
 *
 * @param client - HTTP client instance
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements based on the filter
 */
declare const getAllStatements$1: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (softDeleted?: boolean) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get all statements owned by the current user with optional softDeleted filter
 * Direct wrapper for the findBySoftDeletedOwn endpoint
 *
 * @param client - HTTP client instance
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements owned by the current user
 */
declare const getOwnStatements$1: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (softDeleted?: boolean) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by UUID and predicate
 * Direct wrapper for the readStatementsByUUIDAndPredicate endpoint
 *
 * @param client - HTTP client instance
 * @param uuid - UUID to filter by
 * @param predicate - Predicate to filter by
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements matching the UUID and predicate
 */
declare const getStatementsByUuidAndPredicate$1: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  predicate: Predicate,
  softDeleted?: boolean
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by predicate
 * Direct wrapper for the readStatementsByPredicate endpoint
 *
 * @param client - HTTP client instance
 * @param predicate - Predicate to filter by
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements matching the predicate
 */
declare const getStatementsByPredicate$1: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  predicate: Predicate,
  softDeleted?: boolean
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Create a relationship between two entities
 * This is a high-level wrapper around the createStatement service
 *
 * @param client - HTTP client instance
 * @param subject - UUID of the subject entity
 * @param predicate - Relationship type
 * @param object - UUID of the object entity
 * @returns The created statement
 */
declare const createRelationship: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  subject: UUID,
  predicate: Predicate,
  object: UUID
) => Promise<ApiResponse<UUStatementDTO>>
/**
 * Delete a relationship between two entities
 * This is a high-level wrapper around the deleteStatement service
 *
 * @param client - HTTP client instance
 * @param subject - UUID of the subject entity
 * @param predicate - Relationship type
 * @param object - UUID of the object entity
 * @returns Response indicating success or failure
 */
declare const deleteRelationship: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  subject: UUID,
  predicate: Predicate,
  object: UUID
) => Promise<ApiResponse<any>>
/**
 * Find all relationships for a specific entity
 * This combines multiple statement queries to find all relationships
 * where the entity appears as either subject or object
 *
 * @param client - HTTP client instance
 * @param entityUuid - UUID of the entity
 * @param params - Query parameters
 * @returns All statements involving the entity
 */
declare const findAllRelationships: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  entityUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get the entity details for each part of a statement
 * This expands a statement to include full details about subject and object entities
 *
 * @param client - HTTP client instance
 * @param statement - The statement to expand
 * @returns Statement with expanded subject and object details
 */
declare const expandStatement: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (statement: UUStatementDTO) => Promise<
  ApiResponse<{
    statement: UUStatementDTO
    subjectDetails: any | null
    objectDetails: any | null
  }>
>

declare const __facade_statement_facade_createRelationship: typeof createRelationship
declare const __facade_statement_facade_deleteRelationship: typeof deleteRelationship
declare const __facade_statement_facade_expandStatement: typeof expandStatement
declare const __facade_statement_facade_findAllRelationships: typeof findAllRelationships
declare namespace __facade_statement_facade {
  export {
    __facade_statement_facade_createRelationship as createRelationship,
    __facade_statement_facade_deleteRelationship as deleteRelationship,
    __facade_statement_facade_expandStatement as expandStatement,
    __facade_statement_facade_findAllRelationships as findAllRelationships,
    getAllStatements$1 as getAllStatements,
    getOwnStatements$1 as getOwnStatements,
    getStatementsByPredicate$1 as getStatementsByPredicate,
    getStatementsByUuidAndPredicate$1 as getStatementsByUuidAndPredicate,
  }
}

/**
 * Get a complete object with all its properties, values, and relationships
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the object to get
 * @returns The object with all its properties and related data
 */
declare const getObjectWithProperties: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<UUObjectWithProperties | null>>
/**
 * Create a complete object with properties and values in a single operation
 * This version first obtains a UUID from the UUID service before creating the object
 *
 * @param client - HTTP client instance
 * @param object - The object data to create (UUID will be automatically assigned)
 * @param properties - Array of properties and their values to associate with the object
 * @returns The created object
 */
declare const createObjectWithProperties: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  object: Omit<UUObjectDTO, 'uuid'>,
  properties: Array<{
    property: Omit<UUPropertyDTO, 'uuid'>
    value?: Omit<UUPropertyValueDTO, 'uuid'>
  }>
) => Promise<ApiResponse<UUObjectWithProperties | null>>
/**
 * Add a child object to a parent object
 *
 * @param client - HTTP client instance
 * @param parentUuid - UUID of the parent object
 * @param childUuid - UUID of the child object
 * @returns Success status
 */
declare const addChildToObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (parentUuid: UUID, childUuid: UUID) => Promise<ApiResponse<boolean>>
/**
 * Add a file to an object
 * This version first obtains a UUID from the UUID service before creating the file
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object
 * @param file - File data to add (UUID will be automatically assigned)
 * @returns Success status
 */
declare const addFileToObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  objectUuid: UUID,
  file: Omit<UUFileDTO, 'uuid'>
) => Promise<ApiResponse<boolean>>
/**
 * Create a complex object with multiple properties, multiple values per property,
 * and files attached to the object, properties, and values.
 * This high-level operation handles creating the complete object hierarchy in a single function call.
 *
 * @param client - HTTP client instance
 * @param objectData - The complex object data including properties, values, files, and optional parent
 * @returns The created complex object with all its relationships
 */
declare const createFullObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  objectData: ComplexObjectCreationInput
) => Promise<ApiResponse<ComplexObjectOutput | null>>
/**
 * Update an existing object with selectively changed properties, values, or files.
 * Unlike editFullObject which requires full object data, this method accepts partial updates
 * and only modifies what was provided.
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the object to update
 * @param updates - The partial updates to apply to the object
 * @returns The updated object with its modified relationships
 */
declare const updateObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  updates: {
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
) => Promise<ApiResponse<UUObjectWithProperties | null>>

declare const __facade_object_facade_addChildToObject: typeof addChildToObject
declare const __facade_object_facade_addFileToObject: typeof addFileToObject
declare const __facade_object_facade_createFullObject: typeof createFullObject
declare const __facade_object_facade_createObjectWithProperties: typeof createObjectWithProperties
declare const __facade_object_facade_getObjectWithProperties: typeof getObjectWithProperties
declare const __facade_object_facade_updateObject: typeof updateObject
declare namespace __facade_object_facade {
  export {
    __facade_object_facade_addChildToObject as addChildToObject,
    __facade_object_facade_addFileToObject as addFileToObject,
    __facade_object_facade_createFullObject as createFullObject,
    __facade_object_facade_createObjectWithProperties as createObjectWithProperties,
    __facade_object_facade_getObjectWithProperties as getObjectWithProperties,
    __facade_object_facade_updateObject as updateObject,
  }
}

/**
 * Get all UUID ownership information
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns All UUID ownership data
 */
declare const getAllUUIDOwners: (
  client?: {
    get: <T>(
      url: string,
      params?: Record<string, any>
    ) => Promise<ApiResponse<T>>
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    delete: <T>(url: string) => Promise<ApiResponse<T>>
    config: IOBClientConfig
  },
  baseURL?: string
) => () => Promise<ApiResponse<any>>
/**
 * Create a new UUID
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns The newly created UUID data
 */
declare const createUUID: (
  client?: {
    get: <T>(
      url: string,
      params?: Record<string, any>
    ) => Promise<ApiResponse<T>>
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    delete: <T>(url: string) => Promise<ApiResponse<T>>
    config: IOBClientConfig
  },
  baseURL?: string
) => () => Promise<
  ApiResponse<{
    uuid: UUID
  }>
>
/**
 * Get UUIDs owned by the current user/client
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns UUIDs owned by the current user/client
 */
declare const getOwnedUUIDs: (
  client?: {
    get: <T>(
      url: string,
      params?: Record<string, any>
    ) => Promise<ApiResponse<T>>
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
    delete: <T>(url: string) => Promise<ApiResponse<T>>
    config: IOBClientConfig
  },
  baseURL?: string
) => () => Promise<ApiResponse<any>>

declare const __services_uuid_service_createUUID: typeof createUUID
declare const __services_uuid_service_getAllUUIDOwners: typeof getAllUUIDOwners
declare const __services_uuid_service_getOwnedUUIDs: typeof getOwnedUUIDs
declare namespace __services_uuid_service {
  export {
    __services_uuid_service_createUUID as createUUID,
    __services_uuid_service_getAllUUIDOwners as getAllUUIDOwners,
    __services_uuid_service_getOwnedUUIDs as getOwnedUUIDs,
  }
}

/**
 * Get all files
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of files
 */
declare const getAllFiles: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>
/**
 * Get files owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of files owned by the current user
 */
declare const getOwnFiles: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>
/**
 * Create or update a file
 *
 * @param client - HTTP client instance
 * @param file - The file to create or update
 * @returns The created or updated file
 */
declare const createOrUpdateFile: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (file: UUFileDTO) => Promise<ApiResponse<UUFileDTO>>
/**
 * Get a file by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to get
 * @param params - Query parameters
 * @returns The requested file or null if not found
 */
declare const getFileByUuid: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUFileDTO | null>>
/**
 * Get file content
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to get content for
 * @returns The file content (typically base64 encoded)
 */
declare const getFileContent: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<string>>
/**
 * Soft delete a file
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to delete
 * @returns The API response
 */
declare const softDeleteFile: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<any>>

declare const __services_file_service_createOrUpdateFile: typeof createOrUpdateFile
declare const __services_file_service_getAllFiles: typeof getAllFiles
declare const __services_file_service_getFileByUuid: typeof getFileByUuid
declare const __services_file_service_getFileContent: typeof getFileContent
declare const __services_file_service_getOwnFiles: typeof getOwnFiles
declare const __services_file_service_softDeleteFile: typeof softDeleteFile
declare namespace __services_file_service {
  export {
    __services_file_service_createOrUpdateFile as createOrUpdateFile,
    __services_file_service_getAllFiles as getAllFiles,
    __services_file_service_getFileByUuid as getFileByUuid,
    __services_file_service_getFileContent as getFileContent,
    __services_file_service_getOwnFiles as getOwnFiles,
    __services_file_service_softDeleteFile as softDeleteFile,
  }
}

/**
 * Get all property values
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of property values
 */
declare const getAllPropertyValues: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>
/**
 * Get property values owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of property values owned by the current user
 */
declare const getOwnPropertyValues: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>
/**
 * Create or update a property value
 *
 * @param client - HTTP client instance
 * @param propertyValue - The property value to create or update
 * @returns The created or updated property value
 */
declare const createOrUpdatePropertyValue: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  propertyValue: UUPropertyValueDTO
) => Promise<ApiResponse<UUPropertyValueDTO>>
/**
 * Get a property value by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to get
 * @param params - Query parameters
 * @returns The requested property value or null if not found
 */
declare const getPropertyValueByUuid: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUPropertyValueDTO | null>>
/**
 * Soft delete a property value
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to delete
 * @returns The API response
 */
declare const softDeletePropertyValue: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<any>>

declare const __services_property_value_service_createOrUpdatePropertyValue: typeof createOrUpdatePropertyValue
declare const __services_property_value_service_getAllPropertyValues: typeof getAllPropertyValues
declare const __services_property_value_service_getOwnPropertyValues: typeof getOwnPropertyValues
declare const __services_property_value_service_getPropertyValueByUuid: typeof getPropertyValueByUuid
declare const __services_property_value_service_softDeletePropertyValue: typeof softDeletePropertyValue
declare namespace __services_property_value_service {
  export {
    __services_property_value_service_createOrUpdatePropertyValue as createOrUpdatePropertyValue,
    __services_property_value_service_getAllPropertyValues as getAllPropertyValues,
    __services_property_value_service_getOwnPropertyValues as getOwnPropertyValues,
    __services_property_value_service_getPropertyValueByUuid as getPropertyValueByUuid,
    __services_property_value_service_softDeletePropertyValue as softDeletePropertyValue,
  }
}

/**
 * Get all properties
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of properties
 */
declare const getAllProperties: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>
/**
 * Get properties owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of properties owned by the current user
 */
declare const getOwnProperties: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>
/**
 * Create or update a property
 *
 * @param client - HTTP client instance
 * @param property - The property to create or update
 * @returns The created or updated property
 */
declare const createOrUpdateProperty: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (property: UUPropertyDTO) => Promise<ApiResponse<UUPropertyDTO>>
/**
 * Get a property by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
declare const getPropertyByUuid: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUPropertyDTO | null>>
/**
 * Soft delete a property
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to delete
 * @returns The API response
 */
declare const softDeleteProperty: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<any>>
/**
 * Get a property by key
 *
 * @param client - HTTP client instance
 * @param key - The key of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
declare const getPropertyByKey: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  key: string,
  params?: QueryParams
) => Promise<ApiResponse<UUPropertyDTO | null>>

declare const __services_property_service_createOrUpdateProperty: typeof createOrUpdateProperty
declare const __services_property_service_getAllProperties: typeof getAllProperties
declare const __services_property_service_getOwnProperties: typeof getOwnProperties
declare const __services_property_service_getPropertyByKey: typeof getPropertyByKey
declare const __services_property_service_getPropertyByUuid: typeof getPropertyByUuid
declare const __services_property_service_softDeleteProperty: typeof softDeleteProperty
declare namespace __services_property_service {
  export {
    __services_property_service_createOrUpdateProperty as createOrUpdateProperty,
    __services_property_service_getAllProperties as getAllProperties,
    __services_property_service_getOwnProperties as getOwnProperties,
    __services_property_service_getPropertyByKey as getPropertyByKey,
    __services_property_service_getPropertyByUuid as getPropertyByUuid,
    __services_property_service_softDeleteProperty as softDeleteProperty,
  }
}

/**
 * Get all statements
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of statements
 */
declare const getAllStatements: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get a statement by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the statement
 * @param params - Query parameters
 * @returns Statement with the given UUID
 */
declare const getStatementByUuid: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO>>
/**
 * Get statements owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of statements owned by the current user
 */
declare const getOwnStatements: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Create or find statements
 *
 * @param client - HTTP client instance
 * @param statements - Statements to create or find
 * @returns Created or found statements
 */
declare const createOrFindStatements: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (statements: UUStatementDTO[]) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Create a single statement (convenience method)
 *
 * @param client - HTTP client instance
 * @param statement - Statement to create
 * @returns Created statement
 */
declare const createStatement: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (statement: UUStatementDTO) => Promise<ApiResponse<UUStatementDTO>>
/**
 * Find statements based on subject, predicate, and/or object criteria
 *
 * @param client - HTTP client instance
 * @param params - Search parameters (subject, predicate, object)
 * @param queryParams - Query parameters like softDeleted
 * @returns Statements matching the criteria
 */
declare const findStatements: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  params: {
    subject?: UUID
    predicate?: Predicate
    object?: UUID
  },
  queryParams?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by UUID and predicate
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID to find statements for
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the criteria
 */
declare const getStatementsByUuidAndPredicate: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  predicate: Predicate,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by predicate
 *
 * @param client - HTTP client instance
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the predicate
 */
declare const getStatementsByPredicate: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  predicate: Predicate,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by subject
 *
 * @param client - HTTP client instance
 * @param subjectUuid - The subject UUID
 * @param params - Query parameters
 * @returns Statements with the given subject
 */
declare const getStatementsBySubject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  subjectUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Get statements by object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with the given object
 */
declare const getStatementsByObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  objectUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Soft delete a statement
 *
 * @param client - HTTP client instance
 * @param statement - Statement to delete or individual components
 * @returns The API response
 */
declare const deleteStatement: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  statement:
    | UUStatementDTO
    | {
        subject: UUID
        predicate: Predicate
        object: UUID
      }
) => Promise<ApiResponse<any>>
/**
 * Find all children of a given UUID
 *
 * @param client - HTTP client instance
 * @param parentUuid - The parent UUID
 * @param params - Query parameters
 * @returns Statements with parent-child relationship
 */
declare const findChildren: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  parentUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Find all parents of a given UUID
 *
 * @param client - HTTP client instance
 * @param childUuid - The child UUID
 * @param params - Query parameters
 * @returns Statements with child-parent relationship
 */
declare const findParents: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  childUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Find all properties of an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-property relationship
 */
declare const findProperties: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  objectUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Find all values of a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - The property UUID
 * @param params - Query parameters
 * @returns Statements with property-value relationship
 */
declare const findPropertyValues: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  propertyUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>
/**
 * Find all files attached to an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-file relationship
 */
declare const findFiles: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  objectUuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUStatementDTO[]>>

declare const __services_statement_service_createOrFindStatements: typeof createOrFindStatements
declare const __services_statement_service_createStatement: typeof createStatement
declare const __services_statement_service_deleteStatement: typeof deleteStatement
declare const __services_statement_service_findChildren: typeof findChildren
declare const __services_statement_service_findFiles: typeof findFiles
declare const __services_statement_service_findParents: typeof findParents
declare const __services_statement_service_findProperties: typeof findProperties
declare const __services_statement_service_findPropertyValues: typeof findPropertyValues
declare const __services_statement_service_findStatements: typeof findStatements
declare const __services_statement_service_getAllStatements: typeof getAllStatements
declare const __services_statement_service_getOwnStatements: typeof getOwnStatements
declare const __services_statement_service_getStatementByUuid: typeof getStatementByUuid
declare const __services_statement_service_getStatementsByObject: typeof getStatementsByObject
declare const __services_statement_service_getStatementsByPredicate: typeof getStatementsByPredicate
declare const __services_statement_service_getStatementsBySubject: typeof getStatementsBySubject
declare const __services_statement_service_getStatementsByUuidAndPredicate: typeof getStatementsByUuidAndPredicate
declare namespace __services_statement_service {
  export {
    __services_statement_service_createOrFindStatements as createOrFindStatements,
    __services_statement_service_createStatement as createStatement,
    __services_statement_service_deleteStatement as deleteStatement,
    __services_statement_service_findChildren as findChildren,
    __services_statement_service_findFiles as findFiles,
    __services_statement_service_findParents as findParents,
    __services_statement_service_findProperties as findProperties,
    __services_statement_service_findPropertyValues as findPropertyValues,
    __services_statement_service_findStatements as findStatements,
    __services_statement_service_getAllStatements as getAllStatements,
    __services_statement_service_getOwnStatements as getOwnStatements,
    __services_statement_service_getStatementByUuid as getStatementByUuid,
    __services_statement_service_getStatementsByObject as getStatementsByObject,
    __services_statement_service_getStatementsByPredicate as getStatementsByPredicate,
    __services_statement_service_getStatementsBySubject as getStatementsBySubject,
    __services_statement_service_getStatementsByUuidAndPredicate as getStatementsByUuidAndPredicate,
  }
}

/**
 * Get all objects
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of objects
 */
declare const getAllObjects: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>
/**
 * Get objects owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of objects owned by the current user
 */
declare const getOwnObjects: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>
/**
 * Create or update an object
 *
 * @param client - HTTP client instance
 * @param object - The object to create or update
 * @returns The created or updated object
 */
declare const createOrUpdateObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (object: UUObjectDTO) => Promise<ApiResponse<UUObjectDTO>>
/**
 * Get an object by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to get
 * @param params - Query parameters
 * @returns The requested object or null if not found
 */
declare const getObjectByUuid: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  uuid: UUID,
  params?: QueryParams
) => Promise<ApiResponse<UUObjectDTO | null>>
/**
 * Soft delete an object
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to delete
 * @returns The API response
 */
declare const softDeleteObject: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (uuid: UUID) => Promise<ApiResponse<any>>
/**
 * Get all objects with a specific type
 *
 * @param client - HTTP client instance
 * @param type - The type to filter by
 * @param params - Query parameters
 * @returns List of objects with the specified type
 */
declare const getObjectsByType: (client?: {
  get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>
  delete: <T>(url: string) => Promise<ApiResponse<T>>
  config: IOBClientConfig
}) => (
  type: string,
  params?: QueryParams
) => Promise<ApiResponse<UUObjectDTO[]>>

declare const __services_object_service_createOrUpdateObject: typeof createOrUpdateObject
declare const __services_object_service_getAllObjects: typeof getAllObjects
declare const __services_object_service_getObjectByUuid: typeof getObjectByUuid
declare const __services_object_service_getObjectsByType: typeof getObjectsByType
declare const __services_object_service_getOwnObjects: typeof getOwnObjects
declare const __services_object_service_softDeleteObject: typeof softDeleteObject
declare namespace __services_object_service {
  export {
    __services_object_service_createOrUpdateObject as createOrUpdateObject,
    __services_object_service_getAllObjects as getAllObjects,
    __services_object_service_getObjectByUuid as getObjectByUuid,
    __services_object_service_getObjectsByType as getObjectsByType,
    __services_object_service_getOwnObjects as getOwnObjects,
    __services_object_service_softDeleteObject as softDeleteObject,
  }
}

/**
 * Initialize the IOB client with the given configuration
 *
 * @param config - Client configuration including baseUrl and optional certificate
 */
declare const initializeClient: (config: IOBClientConfig) => void
/**
 * Create a fully configured IOB client with API methods
 *
 * Example:
 * ```typescript
 * const iobClient = createClient({
 *   baseUrl: 'https://api.example.com',
 *   uuidServiceBaseUrl: 'https://uuid-service.example.com', // Optional
 *   certificate: {
 *     cert: '-----BEGIN CERTIFICATE-----\n...',
 *     key: '-----BEGIN PRIVATE KEY-----\n...'
 *   }
 * });
 *
 * // Then use it:
 * const building = await iobClient.objects.getWithProperties('uuid-here');
 * ```
 *
 * @param config - Client configuration
 * @returns A domain-based client with all API methods organized by entity type
 */
declare const createClient: (config: IOBClientConfig) => Promise<{
  objects: {
    getWithProperties: (
      uuid: UUID
    ) => Promise<ApiResponse<UUObjectWithProperties | null>>
    createWithProperties: (
      object: Omit<UUObjectDTO, 'uuid'>,
      properties: Array<{
        property: Omit<UUPropertyDTO, 'uuid'>
        value?: Omit<UUPropertyValueDTO, 'uuid'>
      }>
    ) => Promise<ApiResponse<UUObjectWithProperties | null>>
    createFullObject: (
      objectData: ComplexObjectCreationInput
    ) => Promise<ApiResponse<ComplexObjectOutput | null>>
    updateObject: (
      uuid: UUID,
      updates: {
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
    ) => Promise<ApiResponse<UUObjectWithProperties | null>>
    addChild: (
      parentUuid: UUID,
      childUuid: UUID
    ) => Promise<ApiResponse<boolean>>
    addFile: (
      objectUuid: UUID,
      file: UUFileDTO
    ) => Promise<ApiResponse<boolean>>
    api: {
      getById: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUObjectDTO | null>>
      getAll: (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>
      getOwn: (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>
      getByType: (
        type: string,
        params?: QueryParams
      ) => Promise<ApiResponse<UUObjectDTO[]>>
      create: (object: UUObjectDTO) => Promise<ApiResponse<UUObjectDTO>>
      delete: (uuid: UUID) => Promise<ApiResponse<any>>
    }
  }
  properties: {
    addToObject: (
      objectUuid: UUID,
      property: Partial<UUPropertyDTO> & {
        key: string
      }
    ) => Promise<ApiResponse<UUPropertyDTO>>
    api: {
      getById: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUPropertyDTO | null>>
      getByKey: (
        key: string,
        params?: QueryParams
      ) => Promise<ApiResponse<UUPropertyDTO | null>>
      getAll: (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>
      getOwn: (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>
      create: (property: UUPropertyDTO) => Promise<ApiResponse<UUPropertyDTO>>
      delete: (uuid: UUID) => Promise<ApiResponse<any>>
    }
  }
  values: {
    setForProperty: (
      propertyUuid: UUID,
      value: Partial<UUPropertyValueDTO>
    ) => Promise<ApiResponse<UUPropertyValueDTO>>
    api: {
      getById: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUPropertyValueDTO | null>>
      getAll: (
        params?: QueryParams
      ) => Promise<ApiResponse<UUPropertyValueDTO[]>>
      getOwn: (
        params?: QueryParams
      ) => Promise<ApiResponse<UUPropertyValueDTO[]>>
      create: (
        value: UUPropertyValueDTO
      ) => Promise<ApiResponse<UUPropertyValueDTO>>
      delete: (uuid: UUID) => Promise<ApiResponse<any>>
    }
  }
  files: {
    attachToObject: (
      objectUuid: UUID,
      file: Partial<UUFileDTO> & {
        fileName: string
        fileReference: string
      }
    ) => Promise<ApiResponse<UUFileDTO>>
    api: {
      getById: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUFileDTO | null>>
      getContent: (uuid: UUID) => Promise<ApiResponse<string>>
      getAll: (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>
      getOwn: (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>
      create: (file: UUFileDTO) => Promise<ApiResponse<UUFileDTO>>
      delete: (uuid: UUID) => Promise<ApiResponse<any>>
    }
  }
  statements: {
    createRelationship: (
      subject: UUID,
      predicate: Predicate,
      object: UUID
    ) => Promise<ApiResponse<UUStatementDTO>>
    deleteRelationship: (
      subject: UUID,
      predicate: Predicate,
      object: UUID
    ) => Promise<ApiResponse<any>>
    findAllRelationships: (
      entityUuid: UUID,
      params?: QueryParams
    ) => Promise<ApiResponse<UUStatementDTO[]>>
    expandStatement: (statement: UUStatementDTO) => Promise<
      ApiResponse<{
        statement: UUStatementDTO
        subjectDetails: any | null
        objectDetails: any | null
      }>
    >
    api: {
      getAll: (softDeleted?: boolean) => Promise<ApiResponse<UUStatementDTO[]>>
      getOwn: (softDeleted?: boolean) => Promise<ApiResponse<UUStatementDTO[]>>
      getByUuidAndPredicate: (
        uuid: UUID,
        predicate: Predicate,
        softDeleted?: boolean
      ) => Promise<ApiResponse<UUStatementDTO[]>>
      getByPredicate: (
        predicate: Predicate,
        softDeleted?: boolean
      ) => Promise<ApiResponse<UUStatementDTO[]>>
      getBySubject: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUStatementDTO[]>>
      getByObject: (
        uuid: UUID,
        params?: QueryParams
      ) => Promise<ApiResponse<UUStatementDTO[]>>
      create: (
        statement: UUStatementDTO
      ) => Promise<ApiResponse<UUStatementDTO>>
      createBatch: (
        statements: UUStatementDTO[]
      ) => Promise<ApiResponse<UUStatementDTO[]>>
      delete: (statement: UUStatementDTO) => Promise<ApiResponse<any>>
      find: (
        params: {
          subject?: UUID
          predicate?: Predicate
          object?: UUID
        },
        queryParams?: QueryParams
      ) => Promise<ApiResponse<UUStatementDTO[]>>
    }
  }
  uuid: {
    create: () => Promise<
      ApiResponse<{
        uuid: UUID
      }>
    >
    getOwned: () => Promise<ApiResponse<any>>
    getAllOwners: () => Promise<ApiResponse<any>>
  }
  objectService: typeof __services_object_service
  statementService: typeof __services_statement_service
  propertyService: typeof __services_property_service
  propertyValueService: typeof __services_property_value_service
  fileService: typeof __services_file_service
  uuidService: typeof __services_uuid_service
  objectFacade: typeof __facade_object_facade
  statementFacade: typeof __facade_statement_facade
}>

export {
  Predicate,
  createClient,
  __services_file_service as fileService,
  initializeClient,
  __facade_object_facade as objectFacade,
  __services_object_service as objectService,
  __services_property_service as propertyService,
  __services_property_value_service as propertyValueService,
  __facade_statement_facade as statementFacade,
  __services_statement_service as statementService,
  __services_uuid_service as uuidService,
}
export type {
  ApiError,
  ApiResponse,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  IOBClientConfig,
  QueryParams,
  UUFileDTO,
  UUID,
  UUObjectDTO,
  UUObjectWithProperties,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUStatementDTO,
}
