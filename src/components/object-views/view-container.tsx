'use client'

import { ViewData } from '@/hooks'
import { ObjectsTable } from '@/components/tables'
import { ViewType } from '@/components/view-selector'
import { ObjectColumnsView } from './columns-view'

interface ObjectViewContainerProps {
  viewType: ViewType
  viewData: ViewData
  onViewObject?: (object: any) => void
  onEditObject?: (object: any) => void
  onObjectDoubleClick?: (object: any) => void
}

export function ObjectViewContainer({
  viewType,
  viewData,
  onViewObject,
  onEditObject,
  onObjectDoubleClick,
}: ObjectViewContainerProps) {
  switch (viewType) {
    case 'table': {
      if (viewData.type !== 'table') {
        console.error('Expected table data but received:', viewData.type)
        return null
      }

      return (
        <ObjectsTable
          initialData={viewData.data}
          fetching={viewData.fetching}
          onViewObject={onViewObject}
          onObjectDoubleClick={onObjectDoubleClick}
          pagination={{
            currentPage: viewData.pagination.currentPage + 1,
            totalPages: viewData.pagination.totalPages,
            totalElements: viewData.pagination.totalElements,
            pageSize: viewData.pagination.pageSize,
            isFirstPage: viewData.pagination.isFirstPage,
            isLastPage: viewData.pagination.isLastPage,
          }}
          onPageChange={viewData.pagination.handlePageChange}
          onFirstPage={viewData.pagination.handleFirst}
          onPreviousPage={viewData.pagination.handlePrevious}
          onNextPage={viewData.pagination.handleNext}
          onLastPage={viewData.pagination.handleLast}
        />
      )
    }

    case 'columns': {
      if (viewData.type !== 'columns') {
        console.error('Expected columns data but received:', viewData.type)
        return null
      }

      return (
        <ObjectColumnsView
          data={viewData.rootObjects}
          loading={viewData.loading}
          fetching={viewData.fetching}
          loadChildren={viewData.loadChildren}
          rootPagination={viewData.rootPagination}
          onViewObject={onViewObject}
          onEditObject={onEditObject}
        />
      )
    }

    default: {
      // Default to table view
      if (viewData.type !== 'table') {
        console.error(
          'Expected table data for default case but received:',
          viewData.type
        )
        return null
      }

      return (
        <ObjectsTable
          initialData={viewData.data}
          fetching={viewData.fetching} // Pass fetching state for internal loading
          onViewObject={onViewObject}
          onObjectDoubleClick={onObjectDoubleClick}
          pagination={{
            currentPage: viewData.pagination.currentPage + 1, // Convert to 1-based for display
            totalPages: viewData.pagination.totalPages,
            totalElements: viewData.pagination.totalElements,
            pageSize: viewData.pagination.pageSize,
            isFirstPage: viewData.pagination.isFirstPage,
            isLastPage: viewData.pagination.isLastPage,
          }}
          onPageChange={viewData.pagination.handlePageChange}
          onFirstPage={viewData.pagination.handleFirst}
          onPreviousPage={viewData.pagination.handlePrevious}
          onNextPage={viewData.pagination.handleNext}
          onLastPage={viewData.pagination.handleLast}
        />
      )
    }
  }
}
