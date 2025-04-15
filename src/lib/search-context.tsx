'use client'

import React, { createContext, useContext, useState } from 'react'
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
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const MIN_SEARCH_CHARS = 2

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const parseSearchQuery = (query: string) => {
    const filters: Record<string, string> = {}
    let text = query

    // Match patterns like property:value, material:value, etc.
    const filterPattern = /(\w+):(\w+)/g
    let match

    while ((match = filterPattern.exec(query)) !== null) {
      filters[match[1]] = match[2]
      // Remove the filter from the text search
      text = text.replace(match[0], '').trim()
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
            obj.type?.toLowerCase() === value.toLowerCase()
          ) {
            matches.push({ field: 'type', value })
            shouldInclude = true
          }

          // Creator search
          if (
            key === 'creator' &&
            obj.creator?.toLowerCase().includes(value.toLowerCase())
          ) {
            matches.push({ field: 'creator', value })
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
      await new Promise((resolve) => setTimeout(resolve, 100))

      // In the future, this will be replaced with:
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text, filters })
      // });
      // const results = await response.json();

      const results = searchObjects(text, filters)
      setSearchResults(results)
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
