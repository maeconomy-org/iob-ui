'use client'

import { Loader2 } from 'lucide-react'

import { ViewType } from '@/components/view-selector'
import { ObjectsTable } from '@/components/tables'
import { ObjectExplorer } from './object-explorer'

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
}

interface ObjectViewContainerProps {
  viewType: ViewType
  data: any[]
  availableModels: any[]
  loading?: boolean
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
  pagination?: PaginationInfo
}

export function ObjectViewContainer({
  viewType,
  data,
  availableModels,
  loading = false,
  onViewObject,
  onEditObject,
  onSaveObject,
  pagination,
}: ObjectViewContainerProps) {
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading objects...</span>
      </div>
    )
  }

  // Render the appropriate view based on viewType
  switch (viewType) {
    case 'table':
      return (
        <ObjectsTable
          initialData={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          pagination={pagination}
        />
      )

    case 'explorer':
      return (
        <ObjectExplorer
          data={data}
          availableModels={availableModels}
          pagination={pagination}
        />
      )

    // case 'columns':
    //   return (
    //     <ObjectColumnsView
    //       data={data}
    //       availableModels={availableModels}
    //       onViewObject={onViewObject}
    //       onEditObject={onEditObject}
    //       onSaveObject={onSaveObject}
    //     />
    //   )

    default:
      return (
        <ObjectsTable
          initialData={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
          onSaveObject={onSaveObject}
          pagination={pagination}
        />
      )
  }
}
