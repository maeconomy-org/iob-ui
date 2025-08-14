import { MAX_FILE_SIZE_MB } from '@/constants'

export type AttachmentMode = 'reference' | 'upload'

export type Attachment = {
  uuid: string
  mode: AttachmentMode
  fileName: string
  label?: string
  // For external references
  url?: string
  // For uploaded files (server-side reference/token)
  fileReference?: string
  size?: number
  mimeType?: string
}

export function getMaxUploadSizeMB(): number {
  const envValue = process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB
  const parsed = envValue ? Number(envValue) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MAX_FILE_SIZE_MB
}

export function isOversize(file: File, maxMB = getMaxUploadSizeMB()): boolean {
  const bytes = maxMB * 1024 * 1024
  return file.size > bytes
}

export function bytesToReadable(size?: number): string {
  if (!size || size <= 0) return '0 B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const value = (size / Math.pow(1024, i)).toFixed(2)
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  return `${value} ${units[i]}`
}

export function isReferenceAttachment(att: Attachment): boolean {
  return att.mode === 'reference' && !!att.url
}

export function toApiFilePayload(att: Attachment): {
  file: {
    fileName: string
    fileReference?: string
    label?: string
    url?: string
  }
} {
  // Keep it generic to match createFullObject mapping
  return {
    file: {
      fileName: att.fileName,
      fileReference: att.fileReference,
      label: att.label,
      // Some backends may accept url for references; keep here for flexibility
      url: att.url,
    },
  }
}

// TODO: add helpers to request signed upload URLs, perform multipart upload, etc.
// These will be integrated when backend APIs are defined.
