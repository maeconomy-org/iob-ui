'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ObjectModelsTable } from '@/components/tables'
import { ObjectModelSheet } from '@/components/sheets'
import { hotelModelsData } from '@/lib/hotel-models'
import { schoolModelsData } from '@/lib/school-models'
import { DeleteConfirmationDialog } from '@/components/modals'

interface Property {
  uuid: string
  key: string
  values: { uuid: string; value: string; files: any[] }[]
  files: any[]
}

interface ObjectModel {
  uuid: string
  name: string
  abbreviation: string
  version: string
  description: string
  creator: string
  createdAt: string
  updatedAt: string
  properties: Property[]
}

export default function ObjectModelsPage() {
  // State for managing models, we'll start with the imported data
  const [hotelModels, setHotelModels] = useState<ObjectModel[]>([])
  const [schoolModels, setSchoolModels] = useState<ObjectModel[]>([])
  const [activeTab, setActiveTab] = useState<string>('hotel')

  // Sheet control state
  const [sheetOpen, setSheetOpen] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<ObjectModel | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Alert dialog state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [modelToDelete, setModelToDelete] = useState<string | null>(null)

  // Initialize with example data
  useEffect(() => {
    setHotelModels(hotelModelsData)
    setSchoolModels(schoolModelsData)
  }, [])

  // Handle opening the sheet for adding a new model
  const handleAddModel = () => {
    setSelectedModel(null)
    setIsEditing(false)
    setSheetOpen(true)
  }

  // Handle opening the sheet for editing an existing model
  const handleEditModel = (model: ObjectModel) => {
    setSelectedModel(model)
    setIsEditing(true)
    setSheetOpen(true)
  }

  // Handle saving a model (new or edited)
  const handleSaveModel = (model: ObjectModel) => {
    if (activeTab === 'hotel') {
      if (isEditing) {
        // Update existing model
        setHotelModels(
          hotelModels.map((m) => (m.uuid === model.uuid ? model : m))
        )
      } else {
        // Add new model
        setHotelModels([...hotelModels, model])
      }
    } else {
      if (isEditing) {
        // Update existing model
        setSchoolModels(
          schoolModels.map((m) => (m.uuid === model.uuid ? model : m))
        )
      } else {
        // Add new model
        setSchoolModels([...schoolModels, model])
      }
    }
  }

  // Handle opening the delete confirmation dialog
  const handleDeleteConfirm = (uuid: string) => {
    const modelToBeDeleted =
      [...hotelModels, ...schoolModels].find((model) => model.uuid === uuid) ||
      null
    setSelectedModel(modelToBeDeleted)
    setModelToDelete(uuid)
    setDeleteDialogOpen(true)
  }

  // Handle actual deletion after confirmation
  const handleDeleteModel = () => {
    if (!modelToDelete) return

    // Check which list contains the model to be deleted
    const isHotelModel = hotelModels.some(
      (model) => model.uuid === modelToDelete
    )

    if (isHotelModel) {
      setHotelModels(
        hotelModels.filter((model) => model.uuid !== modelToDelete)
      )
    } else {
      setSchoolModels(
        schoolModels.filter((model) => model.uuid !== modelToDelete)
      )
    }

    setDeleteDialogOpen(false)
    setModelToDelete(null)
    setSelectedModel(null)
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Object Models</h2>
            <Button onClick={handleAddModel}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Object Model
            </Button>
          </div>

          <ObjectModelsTable
            models={[...hotelModels, ...schoolModels]}
            onEdit={handleEditModel}
            onDelete={handleDeleteConfirm}
          />
        </div>
      </div>

      {/* Sheet for adding/editing models */}
      <ObjectModelSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSaveModel}
        model={selectedModel}
        isEditing={isEditing}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteModel}
        objectName={selectedModel?.name || 'Object Model'}
      />
    </div>
  )
}
