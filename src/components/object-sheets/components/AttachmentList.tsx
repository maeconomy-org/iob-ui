'use client'

import type { Attachment } from '../utils/attachments'
import { Button } from '@/components/ui/button'
import { ExternalLink, Link as LinkIcon, Upload, Trash2 } from 'lucide-react'

type AttachmentListProps = {
  attachments: Attachment[]
  onOpenAttachment?: (att: Attachment) => void
  onRemoveAttachment?: (att: Attachment) => void
  emptyText?: string
}

export function AttachmentList({
  attachments,
  onOpenAttachment,
  onRemoveAttachment,
  emptyText = 'No attachments',
}: AttachmentListProps) {
  // if (!attachments || attachments.length === 0) {
  //   return (
  //     <div className="text-sm text-muted-foreground italic">{emptyText}</div>
  //   )
  // }

  const open = (att: Attachment) => onOpenAttachment?.(att)
  const remove = (att: Attachment) => onRemoveAttachment?.(att)

  return (
    <div className="space-y-2">
      {attachments.map((att) => (
        <div
          key={att.uuid}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            {att.mode === 'reference' ? (
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="truncate">{att.label || att.fileName}</div>
          </div>
          <div className="flex items-center gap-1">
            {onOpenAttachment && (
              <Button variant="ghost" size="icon" onClick={() => open(att)}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {onRemoveAttachment && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
                onClick={() => remove(att)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
