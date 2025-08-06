'use client'

import { useState, useMemo } from 'react'

import { useObjects, useUnifiedDelete } from '@/hooks'
import { DeleteConfirmationDialog } from '@/components/modals'

import { filterObjectsBySearchTerm } from '@/lib/explorer-view-utils'

import { SearchBar, TreeItem, DetailsPanel } from './explorer-view'
import type { ObjectItem } from './explorer-view'

interface ObjectExplorerProps {
  data: ObjectItem[]
  availableModels: any[]
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
  pagination?: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}

export function ObjectExplorer({
  data,
  availableModels,
  pagination,
}: ObjectExplorerProps) {
  // State management
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ObjectItem | null>(null)
  const [search, setSearch] = useState('')

  // Unified delete hook
  const {
    isDeleteModalOpen,
    objectToDelete,
    isDeleting,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useUnifiedDelete()

  // Filter objects based on search
  const filteredObjects = useMemo(() => {
    return filterObjectsBySearchTerm(data, search)
  }, [search, data])

  return (
    <>
      <div className="flex space-x-4 h-[calc(100vh-180px)]">
        {/* Left side: Explorer tree with search */}
        <div className="w-1/3 border rounded-md flex flex-col">
          <div className="p-2 border-b">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="flex-1 overflow-auto p-1">
            {filteredObjects.length > 0 ? (
              filteredObjects.map((item) => (
                <TreeItem
                  key={item.uuid}
                  item={item}
                  expandedItems={expandedItems}
                  setExpandedItems={setExpandedItems}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  availableModels={availableModels}
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No objects found
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground">
            {pagination ? (
              <>
                Page {pagination.currentPage} of {pagination.totalPages}(
                {filteredObjects.length} of {pagination.totalElements} objects)
              </>
            ) : (
              `${filteredObjects.length} root objects`
            )}
          </div>
        </div>

        {/* Right side: Details panel */}
        <div className="w-2/3 border rounded-md overflow-hidden flex flex-col">
          <DetailsPanel
            item={selectedItem}
            availableModels={availableModels}
            onDelete={(item) =>
              handleDelete({ uuid: item.uuid, name: item.name })
            }
          />
        </div>
      </div>

      {/* Unified Delete Confirmation Dialog */}
      {isDeleteModalOpen && objectToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteModalOpen}
          onOpenChange={handleDeleteCancel}
          objectName={objectToDelete.name}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  )
}
