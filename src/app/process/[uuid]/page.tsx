'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Info, Edit, ArrowRight } from 'lucide-react'

import { processData } from '@/lib/data'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { ProcessDetailsSheet, ProcessFormSheet } from '@/components/sheets'

export default function ProcessDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [process, setProcess] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

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
    setIsDetailsSheetOpen(true)
  }

  const handleEdit = () => {
    setIsEditSheetOpen(true)
  }

  const handleSave = (updatedProcess: any) => {
    // Update the process data (in a real app, this would be an API call)
    setProcess(updatedProcess)
    setIsEditSheetOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Helper function to get property value from an object
  const getObjectProperty = (obj: any, key: string) => {
    if (!obj || !obj.properties) return ''

    const property = obj.properties.find((prop: any) => prop.key === key)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="px-3 py-1 text-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                {process.type || 'Process'} Flow
              </Badge>
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => router.push('/process')}>
                Back to Process List
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {process.uuid}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Process Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inputs</h3>
                  {process.inputs && process.inputs.length > 0 ? (
                    <div className="space-y-2">
                      {process.inputs.map((input: any) => (
                        <div
                          key={input.id || input.uuid}
                          className="p-3 border rounded-md hover:bg-muted/20 transition-colors"
                        >
                          <div className="font-medium">{input.name}</div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              Quantity: {input.quantity} {input.unit}
                            </span>
                            <span>
                              Type:{' '}
                              {getObjectProperty(input.object, 'Type') ||
                                'Material'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No inputs defined
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Badge className="text-xl px-4 py-3">
                      {process.type || 'Process'}
                    </Badge>
                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Outputs</h3>
                  {process.outputs && process.outputs.length > 0 ? (
                    <div className="space-y-2">
                      {process.outputs.map((output: any) => (
                        <div
                          key={output.id || output.uuid}
                          className="p-3 border rounded-md hover:bg-muted/20 transition-colors"
                        >
                          <div className="font-medium">{output.name}</div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              Quantity: {output.quantity} {output.unit}
                            </span>
                            <span>
                              Type:{' '}
                              {getObjectProperty(output.object, 'Type') ||
                                'Material'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No outputs defined
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-muted-foreground">
                    {formatDate(process.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Updated At</p>
                  <p className="text-muted-foreground">
                    {formatDate(process.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProcessDetailsSheet
        process={process}
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
      />

      <ProcessFormSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        process={process}
        allProcesses={processData}
        onSave={handleSave}
      />
    </div>
  )
}
