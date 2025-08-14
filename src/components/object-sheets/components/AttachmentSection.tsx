'use client'

import { useState } from 'react'
import {
  Plus,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  Trash2,
} from 'lucide-react'

import { Button, Input, Label, Separator } from '@/components/ui'
import { FileDropzone } from '@/components/ui/file-dropzone'
import type { Attachment, AttachmentMode } from '../utils/attachments'
import {
  bytesToReadable,
  getMaxUploadSizeMB,
  isOversize,
} from '../utils/attachments'
import { generateUUIDv7 } from '@/lib/utils'

type AttachmentSectionProps = {
  title?: string
  attachments: Attachment[]
  onChange: (next: Attachment[]) => void
  disabled?: boolean
  allowReference?: boolean
  allowUpload?: boolean
}

export function AttachmentSection({
  attachments,
  onChange,
  disabled = false,
  allowReference = true,
  allowUpload = true,
}: AttachmentSectionProps) {
  const [referenceUrl, setReferenceUrl] = useState('')
  const [referenceLabel, setReferenceLabel] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleAddReference = () => {
    if (!referenceUrl.trim()) return
    const url = referenceUrl.trim()
    const fileName = url.split('/').pop() || 'reference'
    const att: Attachment = {
      uuid: generateUUIDv7(),
      mode: 'reference',
      fileName,
      url,
      label: referenceLabel || undefined,
    }
    onChange([...(attachments || []), att])
    setReferenceUrl('')
    setReferenceLabel('')
  }

  const handleDrop = async (files: File[]) => {
    if (!allowUpload || disabled) return
    setError(null)
    const maxMB = getMaxUploadSizeMB()

    // For now, just simulate upload and create local attachment entries.
    // TODO: Implement actual API upload via FormData and persist returned fileReference/url
    setIsUploading(true)
    setUploadProgress(10)

    const accepted: Attachment[] = []
    for (const file of files) {
      if (isOversize(file, maxMB)) {
        setError(`File ${file.name} exceeds max size of ${maxMB}MB`)
        continue
      }
      accepted.push({
        uuid: generateUUIDv7(),
        mode: 'upload',
        fileName: file.name,
        size: file.size,
        mimeType: file.type,
        // TODO: after successful upload, set fileReference from backend response
      })
    }

    // Simulate progress
    setUploadProgress(60)
    await new Promise((r) => setTimeout(r, 350))
    setUploadProgress(100)
    await new Promise((r) => setTimeout(r, 200))

    if (accepted.length > 0) onChange([...(attachments || []), ...accepted])
    setIsUploading(false)
    setUploadProgress(0)
  }

  const removeAttachment = (uuid: string) => {
    onChange((attachments || []).filter((a) => a.uuid !== uuid))
  }

  const openAttachment = (att: Attachment) => {
    if (att.mode === 'reference' && att.url) {
      window.open(att.url, '_blank', 'noopener,noreferrer')
      return
    }
    // TODO: Request a download url from backend for uploaded files and open it
  }

  return (
    <div className="space-y-3 py-4">
      {allowUpload && (
        <FileDropzone
          onDrop={handleDrop}
          isLoading={isUploading}
          loadingText={`Uploading... (${uploadProgress}%)`}
          progress={uploadProgress}
          error={error}
          disabled={disabled}
          accept={{ '*/*': [] }}
          multiple
          className="py-8"
        >
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-5 w-5 mb-2" />
            <p className="text-sm">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm font-semibold">
              Max {getMaxUploadSizeMB()}MB
            </p>
          </div>
        </FileDropzone>
      )}

      {allowReference && (
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Enter external file URL"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              disabled={disabled}
            />
          </div>
          <Input
            placeholder="Label (optional)"
            className="max-w-[180px]"
            value={referenceLabel}
            onChange={(e) => setReferenceLabel(e.target.value)}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddReference}
            disabled={disabled}
          >
            <LinkIcon className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      )}

      <Separator />

      {(attachments?.length ?? 0) > 0 ? (
        <div className="space-y-2">
          {(attachments || []).map((att) => (
            <div
              key={att.uuid}
              className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {att.mode === 'reference' ? (
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {att.label || att.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {att.mode === 'reference'
                      ? 'External reference'
                      : `${att.mimeType || 'file'} • ${bytesToReadable(att.size)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeAttachment(att.uuid)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          No attachments
        </div>
      )}
    </div>
  )
}
