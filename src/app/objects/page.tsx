'use client'

import { useState } from 'react'
import ObjectsTable from '@/components/objects-table'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import AddObjectModal from '@/components/add-object-modal'

export default function ObjectsPage() {
  const [isAddObjectModalOpen, setIsAddObjectModalOpen] = useState(false)

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Objects</h2>
            <Button onClick={() => setIsAddObjectModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Object
            </Button>
          </div>
          <ObjectsTable />
        </div>
      </div>

      <AddObjectModal
        isOpen={isAddObjectModalOpen}
        onClose={() => setIsAddObjectModalOpen(false)}
      />
    </div>
  )
}
