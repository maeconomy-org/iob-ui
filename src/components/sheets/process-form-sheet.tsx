'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui'
import { ProcessFormV2 } from '@/components/forms'

interface ProcessFormSheetProps {
  isOpen: boolean
  onClose: () => void
  process?: any
  allProcesses: any[]
  onSave: (process: any) => void
}

export function ProcessFormSheet({
  isOpen,
  onClose,
  process,
  allProcesses,
  onSave,
}: ProcessFormSheetProps) {
  const handleSave = (updatedProcess: any) => {
    onSave(updatedProcess)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader className="mb-5">
          <SheetTitle>
            {process ? 'Edit Process Flow' : 'Create Process Flow'}
          </SheetTitle>
        </SheetHeader>

        <div className="py-4">
          <ProcessFormV2
            process={process}
            allProcesses={allProcesses}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
