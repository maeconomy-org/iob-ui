'use client'

import { X, Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search objects...',
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="relative flex items-center w-full">
      <div className="relative flex-1">
        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 pr-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
