'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface ModelNodeData {
  label: string
  object: any
  type?: string
  icon?: React.ReactNode
}

function ModelNode({ data }: NodeProps<ModelNodeData>) {
  const model = data.object

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-2 shadow-md rounded-lg border border-amber-200 bg-amber-50 min-w-[150px]">
            <div className="flex items-center">
              <div className="rounded-full w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-700">
                {data.icon}
              </div>
              <div
                className="ml-2 text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px]"
                title={data.label}
              >
                {data.label}
              </div>
            </div>
            {model.abbreviation && (
              <div className="mt-1 text-xs text-amber-700">
                {model.abbreviation} {model.version && `v${model.version}`}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="p-2">
            <div className="font-semibold mb-1">{model.name}</div>
            {model.abbreviation && (
              <div className="text-xs mb-2">
                <span className="font-medium">ID:</span> {model.abbreviation}
                {model.version && (
                  <span className="ml-2">Version: {model.version}</span>
                )}
              </div>
            )}
            {model.description && (
              <div className="text-xs text-gray-700 mt-1">
                {model.description}
              </div>
            )}
            {model.properties && model.properties.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-semibold mb-1">Properties:</div>
                <div className="space-y-1">
                  {model.properties.map((prop: any) => (
                    <div key={prop.uuid} className="text-xs">
                      {prop.key}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Handles for connecting nodes - positioned on all sides */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-amber-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-amber-500"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-amber-500"
      />
    </TooltipProvider>
  )
}

export default memo(ModelNode)
