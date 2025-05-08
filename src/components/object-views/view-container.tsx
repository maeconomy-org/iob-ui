'use client'

import { ViewType } from '@/components/view-selector'
import { ObjectsTable } from '@/components/tables'
import { ObjectColumnsView } from './columns-view'
import { ObjectExplorerView } from './explorer-view'

interface ObjectViewContainerProps {
  viewType: ViewType
  data: any[]
  availableModels: any[]
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onSaveObject?: (object: any) => void
}

export function ObjectViewContainer({
  viewType,
  data,
  availableModels,
  onViewObject,
  onEditObject,
  onSaveObject,
}: ObjectViewContainerProps) {
  // Render the appropriate view based on viewType
  switch (viewType) {
    case 'table':
      return (
        <ObjectsTable
          initialData={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
          onSaveObject={onSaveObject}
        />
      )

    case 'explorer':
      return (
        <ObjectExplorerView
          data={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
          onSaveObject={onSaveObject}
        />
      )

    case 'columns':
      return (
        <ObjectColumnsView
          data={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
          onSaveObject={onSaveObject}
        />
      )

    default:
      return (
        <ObjectsTable
          initialData={data}
          availableModels={availableModels}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
          onSaveObject={onSaveObject}
        />
      )
  }
}
