'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { objectsData } from '@/lib/data'

interface SearchResult {
  id: string
  type: 'object' | 'material' | 'property'
  name: string
  path?: string
  properties?: Record<string, any>
  matches?: {
    field: string
    value: string
  }[]
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
  parseSearchQuery: (query: string) => {
    text: string
    filters: Record<string, string>
  }
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
    if (!query || query.length < MIN_SEARCH_CHARS) return

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

  const parseSearchQuery = (query: string) => {
    const filters: Record<string, string> = {}
    let text = query.trim()

    // More robust filter pattern that allows values with spaces
    // Matches patterns like key:value including values with spaces when they're the only filter or at the end
    // Format: key:value or key:"value with spaces"
    const filterPattern = /(\w+):(["']([^"']+)["']|(\S+))/g
    let match
    let lastIndex = 0

    while ((match = filterPattern.exec(query)) !== null) {
      const key = match[1]
      // If we have a quoted value, use the value inside quotes, otherwise use the raw value
      const value = match[3] ? match[3] : match[4]

      filters[key] = value

      // Keep track of where we matched to help extract text
      lastIndex = match.index + match[0].length

      // Remove the matched filter from the text search
      const beforeMatch = text.substring(0, match.index)
      const afterMatch = text.substring(match.index + match[0].length)
      text = (beforeMatch + ' ' + afterMatch).trim()
    }

    return { text, filters }
  }

  const searchObjects = (text: string, filters: Record<string, string>) => {
    const results: SearchResult[] = []

    // Don't search if text is too short and no filters are applied
    if (!text && Object.keys(filters).length === 0) return results
    if (
      text &&
      text.length < MIN_SEARCH_CHARS &&
      Object.keys(filters).length === 0
    )
      return results

    const searchRecursive = (objects: any[], parentPath: string = '') => {
      for (const obj of objects) {
        let matches: { field: string; value: string }[] = []
        let shouldInclude = false

        // Text search in name and description (only if text is long enough)
        if (text && text.length >= MIN_SEARCH_CHARS) {
          const textLower = text.toLowerCase()
          const nameLower = obj.name?.toLowerCase() || ''
          const descriptionLower = obj.description?.toLowerCase() || ''

          if (
            nameLower.includes(textLower) ||
            descriptionLower.includes(textLower)
          ) {
            matches.push({
              field: 'text',
              value: nameLower.includes(textLower) ? 'name' : 'description',
            })
            shouldInclude = true
          }
        }

        // Filter search
        for (const [key, value] of Object.entries(filters)) {
          // Property search
          if (key === 'property' && obj.properties) {
            for (const [propKey, propValue] of Object.entries(obj.properties)) {
              if (
                String(propValue).toLowerCase().includes(value.toLowerCase())
              ) {
                matches.push({
                  field: 'property',
                  value: `${propKey}:${propValue}`,
                })
                shouldInclude = true
              }
            }
          }

          // Material search
          if (
            key === 'material' &&
            obj.properties?.material
              ?.toLowerCase()
              .includes(value.toLowerCase())
          ) {
            matches.push({ field: 'material', value: obj.properties.material })
            shouldInclude = true
          }

          // Type search
          if (
            key === 'type' &&
            obj.type?.toLowerCase().includes(value.toLowerCase())
          ) {
            matches.push({ field: 'type', value: obj.type })
            shouldInclude = true
          }

          // Creator search
          if (
            key === 'creator' &&
            obj.creator?.toLowerCase().includes(value.toLowerCase())
          ) {
            matches.push({ field: 'creator', value: obj.creator })
            shouldInclude = true
          }
        }

        // Determine final inclusion based on combined criteria
        if (text && Object.keys(filters).length > 0) {
          // Both text and filters: require both to match
          shouldInclude =
            matches.some((m) => m.field === 'text') &&
            matches.some((m) => m.field !== 'text')
        } else {
          // Either text or filters: any match is sufficient
          shouldInclude = matches.length > 0
        }

        if (shouldInclude) {
          results.push({
            id: obj.uuid || obj.id,
            type: obj.type?.toLowerCase() || 'object',
            name: obj.name,
            path: `${parentPath}/${obj.uuid || obj.id}`,
            properties: obj.properties,
            matches,
          })
        }

        // Search in children
        if (obj.children && Array.isArray(obj.children)) {
          searchRecursive(obj.children, `${parentPath}/${obj.uuid || obj.id}`)
        }
      }
    }

    searchRecursive(objectsData)
    return results
  }

  const executeSearch = async (query: string) => {
    setIsSearching(true)
    const { text, filters } = parseSearchQuery(query)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // In the future, this will be replaced with:
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text, filters })
      // });
      // const results = await response.json();

      const results = searchObjects(text, filters)
      setSearchResults(results)

      // Add to recent searches if we get results or if query is meaningful
      if (results.length > 0 || query.trim().length >= MIN_SEARCH_CHARS) {
        addToRecentSearches(query)
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
        parseSearchQuery,
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
