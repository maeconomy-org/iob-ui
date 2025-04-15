'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Box, Tag, Loader2 } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useSearch } from '@/contexts/search-context'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    executeSearch,
  } = useSearch()

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  )

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

  const handleSelect = (path: string) => {
    router.push(path)
    onOpenChange(false)
  }

  // Setup keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' || e.key === 'k') {
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
    switch (type) {
      case 'object':
        return <Building2 className="mr-2 h-5 w-5" />
      case 'material':
        return <Box className="mr-2 h-5 w-5" />
      case 'property':
        return <Tag className="mr-2 h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-3xl w-full">
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        <Command className="rounded-lg border shadow-md bg-white w-full">
          <div
            className="flex items-center border-b w-full"
            cmdk-input-wrapper=""
          >
            <CommandInput
              placeholder="Search objects, materials, or properties..."
              value={searchQuery}
              onValueChange={handleSearch}
              className="w-full flex-1 p-4 text-base"
            />
            {/* <kbd className="hidden md:inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium opacity-50 ml-2 shrink-0">
              <span className="text-xs">ESC</span>
            </kbd> */}
          </div>
          <CommandList className="max-h-[450px]">
            {!searchQuery && (
              <>
                <CommandGroup heading="Search Help">
                  <CommandItem className="flex flex-col items-start p-3">
                    <div className="mb-2 text-base font-medium">
                      Basic Search
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Just type to search names and descriptions
                    </div>
                  </CommandItem>
                  <CommandItem className="flex flex-col items-start p-3">
                    <div className="mb-2 text-base font-medium">
                      Advanced Filters
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-mono text-sm">
                          property:value
                        </span>{' '}
                        Search objects with specific properties
                      </div>
                      <div>
                        <span className="font-mono text-sm">
                          material:value
                        </span>{' '}
                        Search objects with specific materials
                      </div>
                      <div>
                        <span className="font-mono text-sm">creator:value</span>{' '}
                        Search objects by creator
                      </div>
                      <div className="mt-1 text-sm italic">
                        Example: property:asbestos type:building
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Use quotation marks for values with spaces:{' '}
                      <span className="font-mono">type:"office building"</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandEmpty>
              {isSearching ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <div className="text-base">Searching...</div>
                </div>
              ) : (
                <div className="py-10 text-center text-base">
                  No results found. Try a different search term or filter.
                </div>
              )}
            </CommandEmpty>
            {searchResults.length > 0 && (
              <>
                <CommandGroup heading="Objects">
                  {searchResults
                    .filter((result) => result.type === 'object')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(`/objects/${result.id}`)}
                        className="p-3"
                      >
                        {getIcon(result.type)}
                        <div>
                          <div className="text-base font-medium">
                            {result.name}
                          </div>
                          {result.matches && result.matches.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Matches:{' '}
                              {result.matches
                                .map((m) => `${m.field}:${m.value}`)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Materials">
                  {searchResults
                    .filter((result) => result.type === 'material')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(`/materials/${result.id}`)}
                        className="p-3"
                      >
                        {getIcon(result.type)}
                        <div className="text-base font-medium">
                          {result.name}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Properties">
                  {searchResults
                    .filter((result) => result.type === 'property')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() =>
                          handleSelect(`/properties/${result.id}`)
                        }
                        className="p-3"
                      >
                        {getIcon(result.type)}
                        <div className="text-base font-medium">
                          {result.name}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
