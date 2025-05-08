'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface ObjectNodeData {
  label: string
  object: any
  type?: string
  icon?: React.ReactNode
  properties?: Array<{ key: string; value: string }>
}

function ObjectNode({ data }: NodeProps<ObjectNodeData>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-2 shadow-md rounded-lg border border-gray-200 bg-white min-w-[150px]">
            <div className="flex items-center">
              <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700">
                {data.icon}
              </div>
              <div
                className="ml-2 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px]"
                title={data.label}
              >
                {data.label}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="p-2">
            <div className="font-semibold mb-2">{data.label}</div>
            {data.properties && data.properties.length > 0 ? (
              <div className="space-y-1">
                {data.properties.map((prop, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                    <span className="font-medium text-gray-700">
                      {prop.key}:
                    </span>
                    <span>{prop.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No properties</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Handles for connecting nodes - positioned on all sides */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
    </TooltipProvider>
  )
}

export default memo(ObjectNode)
