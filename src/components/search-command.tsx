'use client'

import { useEffect, useCallback, useState } from 'react'
import { Building2, Box, Tag, Loader2, History, Info } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useSearch } from '@/contexts/search-context'
import { ObjectDetailsSheet } from '@/components/sheets/object-details-sheet'
import {
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui'

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    executeSearch,
    recentSearches,
  } = useSearch()

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  )
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [isObjectSheetOpen, setIsObjectSheetOpen] = useState(false)

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value)

      // Clear any existing timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      // Set a new timeout to execute search after a short delay
      const timeout = setTimeout(() => {
        executeSearch(value)
      }, 300)

      setDebounceTimeout(timeout)
    },
    [setSearchQuery, executeSearch, debounceTimeout]
  )

  const handleSelect = (result: any) => {
    setSelectedObject(result)
    setIsObjectSheetOpen(true)
    onOpenChange(false)
  }

  // Setup keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // add ctrl/cmd + k
      if ((e.key === '/' || e.key === 'k') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }

      // Close with Escape key
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [debounceTimeout])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      const inputElement = document.querySelector(
        '[cmdk-input]'
      ) as HTMLInputElement
      if (inputElement) {
        setTimeout(() => {
          inputElement.focus()
        }, 50)
      }
    }
  }, [open])

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'object':
        return <Building2 className="h-5 w-5" />
      case 'material':
        return <Box className="h-5 w-5" />
      case 'property':
        return <Tag className="h-5 w-5" />
      case 'value':
        return <Info className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-3xl w-full">
          <VisuallyHidden>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search for objects, properties, and values by UUID or keywords
            </DialogDescription>
          </VisuallyHidden>
          <Command className="rounded-lg border shadow-md bg-white w-full">
            <div
              className="flex items-center border-b w-full"
              cmdk-input-wrapper=""
            >
              <CommandInput
                placeholder="Search by UUID..."
                value={searchQuery}
                onValueChange={handleSearch}
                className="w-full flex-1 p-4 text-base"
              />
              {isSearching && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
            </div>
            <CommandList className="max-h-[450px]">
              {!searchQuery && (
                <>
                  {recentSearches.length > 0 && (
                    <>
                      <CommandGroup heading="Recent Searches">
                        {recentSearches.slice(0, 5).map((search) => (
                          <CommandItem
                            key={search.query}
                            onSelect={() => handleSearch(search.query)}
                            className="flex items-center px-4 py-2 cursor-pointer"
                          >
                            <History className="mr-2 h-4 w-4 opacity-50" />
                            <span className="font-mono text-sm">
                              {search.query}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {new Date(search.timestamp).toLocaleDateString()}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  <CommandGroup heading="Search Help">
                    <CommandItem className="flex flex-col items-start p-4">
                      <div className="mb-2 text-base font-medium">
                        UUID Search
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Enter a UUID to find a specific object
                      </div>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Loading state */}
              {isSearching && searchResults.length === 0 && (
                <div className="py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <div className="text-base">Searching...</div>
                </div>
              )}

              {/* No results state */}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="py-10 text-center">
                  <div className="text-base mb-2">No results found</div>
                  <p className="text-sm text-muted-foreground">
                    Try searching with a valid UUID
                  </p>
                </div>
              )}

              {/* Results display */}
              {!isSearching && searchResults.length > 0 && (
                <CommandGroup heading="Results">
                  {searchResults.map((result, index) => (
                    <CommandItem
                      key={`${result.id}-${index}`}
                      onSelect={() => handleSelect(result)}
                      className="px-4 py-3 cursor-pointer hover:bg-secondary/20 transition-colors"
                      value={result.id}
                    >
                      <div className="flex w-full">
                        <div className="flex-shrink-0 mr-3 p-2 bg-secondary/30 rounded-md">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-medium truncate">
                              {result.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="capitalize text-xs"
                            >
                              {result.type}
                            </Badge>
                          </div>

                          {result.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {result.description}
                            </p>
                          )}

                          <div className="flex flex-col mt-1">
                            <code className="text-xs font-mono text-muted-foreground truncate">
                              {result.id}
                            </code>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Object Details Sheet */}
      {selectedObject && (
        <ObjectDetailsSheet
          isOpen={isObjectSheetOpen}
          onClose={() => {
            setIsObjectSheetOpen(false)
            setSelectedObject(null)
          }}
          uuid={selectedObject.id}
          availableModels={[]}
        />
      )}
    </>
  )
}
