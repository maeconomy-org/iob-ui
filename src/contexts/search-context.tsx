'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { validate as uuidValidate } from 'uuid'

import { useCommonApi } from '@/hooks/api/useCommonApi'

interface SearchResult {
  id: string
  type: string
  name: string
  path?: string
  properties?: Record<string, any>
  description?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

interface RecentSearch {
  query: string
  timestamp: number
}

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  executeSearch: (query: string) => void
  recentSearches: RecentSearch[]
  clearRecentSearches: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const MIN_SEARCH_CHARS = 2
const MAX_RECENT_SEARCHES = 5
const RECENT_SEARCHES_KEY = 'iob-recent-searches'

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const { useSearch } = useCommonApi()
  const searchMutation = useSearch()

  // Load recent searches from localStorage on initial render
  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (storedSearches) {
        const parsedSearches = JSON.parse(storedSearches) as RecentSearch[]
        setRecentSearches(parsedSearches)
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  const addToRecentSearches = (query: string) => {
    // Don't add if query is too short or empty
    if (!query || !uuidValidate(query)) return

    const newRecentSearches = [...recentSearches]

    // Remove if this query already exists
    const existingIndex = newRecentSearches.findIndex((s) => s.query === query)
    if (existingIndex !== -1) {
      newRecentSearches.splice(existingIndex, 1)
    }

    // Add to the beginning of the array
    newRecentSearches.unshift({
      query,
      timestamp: Date.now(),
    })

    // Limit the number of recent searches
    const limitedSearches = newRecentSearches.slice(0, MAX_RECENT_SEARCHES)

    // Update state and localStorage
    setRecentSearches(limitedSearches)
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedSearches))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }

  const executeSearch = async (query: string) => {
    // Only search if query is valid uuid
    if (!query || !uuidValidate(query.trim())) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const trimmedQuery = query.trim().toLowerCase()

    try {
      const results = await searchMutation.mutateAsync(trimmedQuery)
      if (results && results.length > 0) {
        const result = results[0]
        // Transform the result into our SearchResult format
        const searchResult: SearchResult = {
          id: result.uuid || result.id || trimmedQuery,
          type: 'object',
          name: result.name || 'Unknown Item',
        }

        setSearchResults([searchResult])
        // addToRecentSearches(query)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        executeSearch,
        recentSearches,
        clearRecentSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
