'use client'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'

interface TablePaginationProps {
  currentPage: number // 0-based
  totalPages: number
  totalElements: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
  onPageChange: (page: number) => void
  onFirst: () => void
  onPrevious: () => void
  onNext: () => void
  onLast: () => void
}

export function TablePagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  isFirstPage,
  isLastPage,
  onPageChange,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: TablePaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // Calculate display info
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalElements} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-3">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFirst}
          disabled={isFirstPage}
          className="size-10"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isFirstPage}
          className="size-10"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <Pagination>
          <PaginationContent>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number

              if (totalPages <= 7) {
                // Show all pages if 7 or fewer
                pageNum = i
              } else if (currentPage <= 3) {
                // Show first 7 pages
                pageNum = i
              } else if (currentPage >= totalPages - 4) {
                // Show last 7 pages
                pageNum = totalPages - 7 + i
              } else {
                // Show pages around current page
                pageNum = currentPage - 3 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer size-10"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
          </PaginationContent>
        </Pagination>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={isLastPage}
          className="size-10"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLast}
          disabled={isLastPage}
          className="size-10"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  )
}
