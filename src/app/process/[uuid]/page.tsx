'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Info } from 'lucide-react'

import { processData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import ProcessDetailsModal from '@/components/process-details-modal'

export default function ProcessDetailsPage() {
  const params = useParams()
  const [process, setProcess] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    const uuid = params.uuid as string

    // Find the process by UUID
    const findProcess = (processes: any[]): any => {
      for (const proc of processes) {
        if (proc.uuid === uuid) {
          return proc
        }
      }
      return null
    }

    const result = findProcess(processData)

    if (result) {
      setProcess(result)
    }

    setIsLoading(false)
  }, [params.uuid])

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPropertyValue = (properties: any[], key: string) => {
    const property = properties.find((prop) => prop.key === key)
    if (!property) return ''

    if (property.values && property.values.length > 0) {
      return property.values.map((v: any) => v.value).join(', ')
    }

    return property.value || ''
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">Loading...</div>
    )
  }

  if (!process) {
    return (
      <div className="flex flex-col flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-40">
            <p>Process not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{process.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewDetails}
              className="h-8 w-8"
              title="View process details"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {process.uuid}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Quantity</p>
                <p>
                  {getPropertyValue(process.properties, 'quantity')}{' '}
                  {getPropertyValue(process.properties, 'unit')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Creator</p>
                <p>{process.creator}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created At</p>
                <p>{formatDate(process.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Process Flow</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Inputs</p>
                <ul className="list-disc list-inside">
                  {process.inputs && process.inputs.length > 0 ? (
                    process.inputs.map((input: any) => (
                      <li key={input.uuid}>{input.name}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No inputs defined</li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium">Outputs</p>
                <ul className="list-disc list-inside">
                  {process.outputs && process.outputs.length > 0 ? (
                    process.outputs.map((output: any) => (
                      <li key={output.uuid}>{output.name}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">
                      No outputs defined
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProcessDetailsModal
        process={process}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  )
}
