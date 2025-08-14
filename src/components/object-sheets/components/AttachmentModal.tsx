'use client'

import { AttachmentSection } from './AttachmentSection'
import type { Attachment } from '../utils/attachments'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type AttachmentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attachments: Attachment[]
  onChange: (next: Attachment[]) => void
  title?: string
  allowReference?: boolean
  allowUpload?: boolean
  disabled?: boolean
}

export function AttachmentModal({
  open,
  onOpenChange,
  attachments,
  onChange,
  title = 'Manage Attachments',
  allowReference = true,
  allowUpload = true,
  disabled = false,
}: AttachmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <AttachmentSection
          attachments={attachments}
          onChange={onChange}
          allowReference={allowReference}
          allowUpload={allowUpload}
          disabled={disabled}
        />

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
