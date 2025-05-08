'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProcessTable } from '@/components/tables'
import { ProcessFormSheet } from '@/components/sheets'
import { processData } from '@/lib/data'

export default function ProcessPage() {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)

  const handleSave = (newProcess: any) => {
    // In a real app, you would save the process to your data store
    // For now, we'll just close the sheet
    console.log('New process flow:', newProcess)
    setIsFormSheetOpen(false)
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Process Flow Management</h2>
            <Button onClick={() => setIsFormSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Process Flow
            </Button>
          </div>

          <ProcessTable />
        </div>
      </div>

      <ProcessFormSheet
        isOpen={isFormSheetOpen}
        onClose={() => setIsFormSheetOpen(false)}
        allProcesses={processData}
        onSave={handleSave}
      />
    </div>
  )
}
