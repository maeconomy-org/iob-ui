// App information
export const APP_NAME = 'Internet of Materials'
export const APP_DESCRIPTION = 'Material Management System'
export const APP_ACRONYM = 'IoM'

// Auth-related
export const AUTH_SESSION_KEY = 'auth_status'
export const AUTH_SESSION_TIMEOUT = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

// Navigation
export const NAV_ITEMS = [
  // { name: 'Object Models', path: '/object-models' },
  { name: 'Objects', path: '/objects' },
  { name: 'Import', path: '/import' },
  // { name: 'Process', path: '/process' },
]

// Footer links
export const FOOTER_LINKS = [
  { name: 'Help', path: '/help' },
  // { name: 'Privacy', path: '/privacy' },
  // { name: 'Terms', path: '/terms' },
]

// Contact information
export const SUPPORT_EMAIL = 'support@internetofmaterials.com'
export const CONTACT_URL = 'https://example.com/contact'

// -------------------------------------------------------
// Import-related constants
// -------------------------------------------------------

// Session storage keys for import state
export const IMPORT_HEADER_ROW_KEY = 'import_header_row'
export const IMPORT_START_ROW_KEY = 'import_start_row'
export const IMPORT_COLUMN_MAPPING_KEY = 'import_column_mapping'
export const IMPORT_MAPPING_TEMPLATES_KEY = 'import_mapping_templates'

// Local storage keys for persistent import state
export const LOCAL_STORAGE_MAPPING_KEY = 'import_last_column_mapping'

// File processing limits
export const MAX_FILE_SIZE_MB = 100 // Max file size in MB
export const STREAM_CHUNK_SIZE = 2 * 1024 * 1024 // 2MB chunks for file streaming
export const IMPORT_CHUNK_SIZE = 500 // Process 500 objects at a time
export const SIZE_THRESHOLD_MB = 5 // Use chunking for datasets larger than 5MB
export const MAX_PREVIEW_ROWS = 500 // Maximum number of rows to process for preview
