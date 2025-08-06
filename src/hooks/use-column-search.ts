'use client'

import { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks'

interface UseColumnSearchProps {
  loadChildren: (
    parentUUID: string,
    page?: number,
    searchTerm?: string
  ) => Promise<{ items: any[]; totalPages: number; totalItems: number }>
  onDataUpdate: (columnIndex: number, items: any[]) => void
  onPaginationUpdate: (
    columnIndex: number,
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
    }
  ) => void
}

export function useColumnSearch({
  loadChildren,
  onDataUpdate,
  onPaginationUpdate,
}: UseColumnSearchProps) {
  // Search states for each column
  const [columnSearchTerms, setColumnSearchTerms] = useState<
    Record<number, string>
  >({})
  const [searchLoading, setSearchLoading] = useState<Set<number>>(new Set())

  // Debounced search to avoid too many API calls
  const debouncedSearch = useDebounce(
    async (columnIndex: number, searchTerm: string, parentUUID: string) => {
      if (!loadChildren) return

      try {
        setSearchLoading((prev) => new Set([...prev, columnIndex]))

        // Search with first page and search term
        const result = await loadChildren(parentUUID, 1, searchTerm.trim())

        setSearchLoading((prev) => {
          const newSet = new Set(prev)
          newSet.delete(columnIndex)
          return newSet
        })

        if (result) {
          // Update column data with search results
          onDataUpdate(columnIndex, result.items)

          // Update pagination (search results might have different pagination)
          onPaginationUpdate(columnIndex, {
            currentPage: 1,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
          })
        }
      } catch (error) {
        console.error('Search failed:', error)
        setSearchLoading((prev) => {
          const newSet = new Set(prev)
          newSet.delete(columnIndex)
          return newSet
        })
      }
    },
    300
  ) // 300ms debounce

  const handleColumnSearchChange = useCallback(
    (columnIndex: number, searchTerm: string, parentUUID: string) => {
      // Update local search term immediately for UI responsiveness
      setColumnSearchTerms((prev) => ({
        ...prev,
        [columnIndex]: searchTerm,
      }))

      // If search is cleared, reload without search
      if (!searchTerm.trim()) {
        // Clear search - reload original data
        debouncedSearch(columnIndex, '', parentUUID)
      } else {
        // Perform debounced search
        debouncedSearch(columnIndex, searchTerm, parentUUID)
      }
    },
    [debouncedSearch]
  )

  const isColumnSearching = useCallback(
    (columnIndex: number) => {
      return searchLoading.has(columnIndex)
    },
    [searchLoading]
  )

  const getColumnSearchTerm = useCallback(
    (columnIndex: number) => {
      return columnSearchTerms[columnIndex] || ''
    },
    [columnSearchTerms]
  )

  return {
    columnSearchTerms,
    handleColumnSearchChange,
    isColumnSearching,
    getColumnSearchTerm,
  }
}
