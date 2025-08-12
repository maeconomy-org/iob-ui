'use client'

import { Badge } from '@/components/ui'
import { CopyButton } from '@/components/ui'

interface ParentDisplayProps {
  parents: (string | { uuid: string; name?: string })[]
  className?: string
}

/**
 * Optimized component for displaying parent UUIDs or objects
 * Handles both string arrays and object arrays gracefully
 */
export function ParentDisplay({ parents, className = '' }: ParentDisplayProps) {
  if (!parents || parents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
        No parent objects
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {parents.map((parent, index) => {
        // Handle both string UUIDs and objects
        const parentUuid = typeof parent === 'string' ? parent : parent.uuid
        const parentName = typeof parent === 'string' ? null : parent.name

        // Create a display name - show name if available, otherwise truncated UUID
        const displayName =
          parentName || `${parentUuid.slice(0, 6)}...${parentUuid.slice(-6)}`
        const fullUuid = parentUuid

        return (
          <div key={parentUuid || index} className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="font-mono text-xs cursor-pointer"
              title={`Parent: ${fullUuid}${parentName ? ` (${parentName})` : ''}`}
            >
              <span className="truncate max-w-32">{displayName}</span>
            </Badge>
            <CopyButton
              text={fullUuid}
              label="Parent UUID"
              size="sm"
              className="h-4 w-4"
            />
          </div>
        )
      })}
    </div>
  )
}
