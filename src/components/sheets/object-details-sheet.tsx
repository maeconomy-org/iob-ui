'use client'

import { useState } from 'react'
import { FileText, Edit, Trash2 } from 'lucide-react'

import {
  FileManagementModal,
  PropertyDetailsModal,
  PropertyManagementModal,
} from '@/components/modals'
import {
  Badge,
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui'

interface ObjectSheetProps {
  isOpen: boolean
  onClose: () => void
  object?: any
  availableModels: any[]
  onDelete?: (objectId: string) => void
  onEdit?: () => void
}

export function ObjectDetailsSheet({
  isOpen,
  onClose,
  object,
  availableModels = [],
  onDelete,
  onEdit,
}: ObjectSheetProps) {
  // State for property and file management
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false)

  // Exit early if no object
  if (!object && isOpen) {
    return null
  }

  // Find model data if applicable
  const model = object?.modelUuid
    ? availableModels.find((m) => m.uuid === object.modelUuid)
    : null

  const formatPropertyValue = (property: any) => {
    // Handle property with values array
    if (property.values && property.values.length > 0) {
      const values = property.values.map((v: any) => v.value).filter(Boolean)
      return values.join(', ')
    }

    // Handle property with single value
    if (typeof property.value === 'string') {
      return property.value
    }

    return ''
  }

  const handleManageProperties = () => {
    setIsPropertyModalOpen(true)
  }

  const handleManageFiles = () => {
    setIsFileModalOpen(true)
  }

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyDetailsOpen(true)
  }

  const handleSaveProperty = () => {
    // In view-only mode, we don't update the object
    setIsPropertyDetailsOpen(false)
  }

  const handleSaveObject = () => {
    // In view-only mode, we don't update the object
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{object?.name}</SheetTitle>
            {model && (
              <SheetDescription>
                <Badge variant="outline">
                  {model.name} {model.version && `v${model.version}`}
                </Badge>
              </SheetDescription>
            )}
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Metadata Section */}
            <div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-sm font-medium">UUID</div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {object?.uuid}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-sm text-muted-foreground">
                      {object?.name}
                    </div>
                  </div>
                  {object?.abbreviation && (
                    <div>
                      <div className="text-sm font-medium">Abbreviation</div>
                      <div className="text-sm text-muted-foreground">
                        {object?.abbreviation}
                      </div>
                    </div>
                  )}
                  {object?.version && (
                    <div>
                      <div className="text-sm font-medium">Version</div>
                      <div className="text-sm text-muted-foreground">
                        {object?.version}
                      </div>
                    </div>
                  )}
                  {object?.description && (
                    <div>
                      <div className="text-sm font-medium">Description</div>
                      <div className="text-sm text-muted-foreground">
                        {object?.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-muted-foreground">
                      {object?.createdAt &&
                        new Date(object.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {object?.updatedAt &&
                        new Date(object.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <Separator />
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Properties
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageProperties}
                >
                  Manage Properties
                </Button>
              </div>

              {object?.properties && object.properties.length > 0 ? (
                <div className="space-y-2">
                  {object.properties.map((prop: any, idx: number) => (
                    <div
                      key={prop.uuid || idx}
                      className="grid grid-cols-3 gap-2 py-1 border-b border-muted last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => handlePropertyClick(prop)}
                    >
                      <div className="font-medium text-sm">{prop.key}</div>
                      <div className="col-span-2 text-sm">
                        {formatPropertyValue(prop)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                  No properties defined for this object
                </div>
              )}
            </div>

            {/* Files Section */}
            <Separator />
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Files
                </h3>
                <Button variant="outline" size="sm" onClick={handleManageFiles}>
                  Manage Files
                </Button>
              </div>

              {object?.files && object.files.length > 0 ? (
                <div className="space-y-2">
                  {object.files.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-muted last:border-0"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {file.size}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                  No files attached to this object
                </div>
              )}
            </div>

            {/* Model Section (if applicable) */}
            {model && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Model Details
                  </h3>
                  <div className="space-y-2 bg-primary/5 rounded-md p-3">
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                      <div className="font-medium text-sm">Name</div>
                      <div className="col-span-2 text-sm">{model.name}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                      <div className="font-medium text-sm">Abbreviation</div>
                      <div className="col-span-2 text-sm">
                        {model.abbreviation || 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                      <div className="font-medium text-sm">Version</div>
                      <div className="col-span-2 text-sm">
                        {model.version || 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                      <div className="font-medium text-sm">Description</div>
                      <div className="col-span-2 text-sm">
                        {model.description || 'No description'}
                      </div>
                    </div>
                    {model.creator && (
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-muted/40 last:border-0">
                        <div className="font-medium text-sm">Created By</div>
                        <div className="col-span-2 text-sm">
                          {model.creator}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <SheetFooter className="border-t pt-4">
            <div className="flex w-full justify-between items-center gap-2">
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDelete(object.uuid)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2">
                {onEdit && (
                  <Button type="button" variant="outline" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button type="button" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Property Management Modal */}
      <PropertyManagementModal
        object={object}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSave={handleSaveObject}
        onViewPropertyDetails={handlePropertyClick}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isPropertyDetailsOpen}
          onClose={() => setIsPropertyDetailsOpen(false)}
          onSave={handleSaveProperty}
        />
      )}

      {/* File Management Modal */}
      <FileManagementModal
        object={object}
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSave={handleSaveObject}
      />
    </>
  )
}
