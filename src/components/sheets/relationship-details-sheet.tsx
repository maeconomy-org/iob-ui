'use client'

import React from 'react'
import {
  ArrowRight,
  Package,
  Settings,
  X,
} from 'lucide-react'
import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { MaterialRelationship } from '@/types'

interface RelationshipDetailsSheetProps {
  relationship: MaterialRelationship | null
  isOpen: boolean
  onClose: () => void
}

const RelationshipDetailsSheet: React.FC<RelationshipDetailsSheetProps> = ({
  relationship,
  isOpen,
  onClose,
}) => {
  if (!relationship) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Process Details
          </SheetTitle>
          <SheetDescription>
            Detailed information about this process relationship
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Process Information */}
          <div>
            <div className="text-sm font-medium text-blue-900">Process Name</div>
            <div className="text-lg font-semibold text-blue-800">
              {relationship.processName || 'Not specified'}
            </div>
          </div>

          {/* Quantity & Unit */}
          {(relationship.quantity || relationship.unit) && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-blue-900">Quantity</div>
                  <div className="text-xl font-bold text-blue-800">
                    {relationship.quantity?.toLocaleString() || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900">Unit</div>
                  <div className="text-xl font-bold text-blue-800">
                    {relationship.unit || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Material Flow */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-blue-900">
              Material Flow
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="text-center flex-1">
                <div className="text-sm font-medium text-blue-900">From</div>
                <div className="text-lg font-bold text-blue-800 mt-1">
                  {relationship.subject.name}
                </div>
              </div>

              <ArrowRight className="h-6 w-6 text-gray-400 mx-4" />

              <div className="text-center flex-1">
                <div className="text-sm font-medium text-green-900">To</div>
                <div className="text-lg font-bold text-green-800 mt-1">
                  {relationship.object.name}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Technical Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Input Object UUID</span>
                <span className="font-mono text-gray-900 break-all">
                  {relationship.subject.uuid}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Output Object UUID</span>
                <span className="font-mono text-gray-900 break-all">
                  {relationship.object.uuid}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4">
            <Button onClick={onClose} className="w-full" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { RelationshipDetailsSheet }
