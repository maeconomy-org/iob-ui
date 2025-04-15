'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ProcessTable from '@/components/process-table'
import AddMaterialModal from '@/components/add-material-modal'

export default function ProcessPage() {
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Process Management</h2>
            <Button onClick={() => setIsAddMaterialModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </div>
          <ProcessTable />
        </div>
      </div>

      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
      />
    </div>
  )
}
