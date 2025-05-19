'use client'

import { useEffect } from 'react'
import { Table, Columns, List } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type ViewType = 'table' | 'explorer' | 'columns'

interface ViewSelectorProps {
  view: ViewType
  onChange: (view: ViewType) => void
}

export function ViewSelector({ view, onChange }: ViewSelectorProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) => {
          if (value) {
            onChange(value as ViewType)
            localStorage.setItem('view', value)
          }
        }}
      >
        <Tooltip>
          <TooltipTrigger
            className={cn('hover:bg-muted', view === 'table' && 'bg-muted')}
            asChild
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <Table className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">Table View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn('hover:bg-muted', view === 'explorer' && 'bg-muted')}
            asChild
          >
            <ToggleGroupItem value="explorer" aria-label="Explorer view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">Explorer View</TooltipContent>
        </Tooltip>

        {/* <Tooltip>
          <TooltipTrigger
            className={cn('hover:bg-muted', view === 'columns' && 'bg-muted')}
            asChild
          >
            <ToggleGroupItem value="columns" aria-label="Columns view">
              <Columns className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">Columns View</TooltipContent>
        </Tooltip> */}
      </ToggleGroup>
    </TooltipProvider>
  )
}
