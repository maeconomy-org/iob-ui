'use client'

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Package,
} from 'lucide-react'
import { Badge } from '@/components/ui'
import { isObjectDeleted } from '@/lib/object-utils'

// Define interface for object item
export interface ObjectItem {
  uuid: string
  name: string
  modelUuid?: string
  modelName?: string
  modelVersion?: string
  abbreviation?: string
  version?: string
  description?: string
  properties?: any[]
  children?: ObjectItem[]
  createdAt: string
  updatedAt: string
  files?: any[]
  softDeleted?: boolean
  softDeletedAt?: string
  softDeleteBy?: string
  lastUpdatedAt?: string
}

interface TreeItemProps {
  item: ObjectItem
  level?: number
  expandedItems: string[]
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>
  selectedItem: ObjectItem | null
  setSelectedItem: React.Dispatch<React.SetStateAction<ObjectItem | null>>
  availableModels: any[]
}

export function TreeItem({
  item,
  level = 0,
  expandedItems,
  setExpandedItems,
  selectedItem,
  setSelectedItem,
  availableModels,
}: TreeItemProps) {
  const isExpanded = expandedItems.includes(item.uuid)
  const isSelected = selectedItem?.uuid === item.uuid
  const hasChildren = item.children && item.children.length > 0
  const indent = level * 16
  const isDeleted = isObjectDeleted(item)

  // Find model info if applicable
  const model = item.modelUuid
    ? availableModels.find((m) => m.uuid === item.modelUuid)
    : null

  // Get icon based on object type
  const getIcon = () => {
    return <FileText size={16} />
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedItems((prev) =>
      isExpanded ? prev.filter((id) => id !== item.uuid) : [...prev, item.uuid]
    )
  }

  const handleSelect = () => {
    setSelectedItem(item)
  }

  return (
    <>
      <div
        className={`flex items-center px-2 py-2.5 hover:bg-muted/50 cursor-pointer rounded-sm ${
          isSelected ? 'bg-muted' : ''
        }`}
        onClick={handleSelect}
      >
        <div
          style={{ marginLeft: `${indent}px` }}
          className="flex items-center flex-1"
        >
          <div className="rounded-full w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 mr-2">
            {getIcon()}
          </div>

          <span
            className={`text-sm truncate ${isDeleted ? 'line-through text-destructive' : ''}`}
          >
            {item.name}
          </span>

          {isDeleted && (
            <span className="ml-2 text-xs text-destructive">(Deleted)</span>
          )}

          {model && (
            <Badge variant="outline" className="ml-2 text-xs py-0 h-4">
              {model.name}
            </Badge>
          )}
        </div>
      </div>

      {/* {isExpanded && hasChildren && (
        <div>
          {item.children?.map((child) => (
            <TreeItem
              key={child.uuid}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              availableModels={availableModels}
            />
          ))}
        </div>
      )} */}
    </>
  )
}
