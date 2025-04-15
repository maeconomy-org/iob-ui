'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ProcessDetailsModalProps {
  process: any
  isOpen: boolean
  onClose: () => void
}

export default function ProcessDetailsModal({
  process,
  isOpen,
  onClose,
}: ProcessDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details')

  if (!process) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPropertyValue = (properties: any[], key: string) => {
    const property = properties.find((prop) => prop.key === key)
    return property ? property.value : ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <span>{process.name}</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1"
          >
            <TabsList className="px-6 justify-start border-b rounded-none">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="flow">Process Flow</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="p-3 border rounded-md">
                    <p className="text-sm font-medium mb-1">UUID</p>
                    <p className="text-sm font-mono">{process.uuid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Creator</p>
                    <p className="text-sm text-muted-foreground">
                      {process.creator}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(process.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(process.updatedAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Properties</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {process.properties.map((prop: any) => (
                      <div
                        key={prop.key}
                        className="flex flex-col p-2 border rounded-md"
                      >
                        <span className="text-sm font-medium">{prop.key}</span>
                        <span className="text-sm">{prop.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flow" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Inputs</h3>
                  {process.inputs && process.inputs.length > 0 ? (
                    <Table className="border">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {process.inputs.map((input: any) => (
                          <TableRow key={input.uuid}>
                            <TableCell>{input.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No inputs defined
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Badge className="px-4 py-2">{process.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {getPropertyValue(process.properties, 'quantity')}{' '}
                      {getPropertyValue(process.properties, 'unit')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Outputs</h3>
                  {process.outputs && process.outputs.length > 0 ? (
                    <Table className="border">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {process.outputs.map((output: any) => (
                          <TableRow key={output.uuid}>
                            <TableCell>{output.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No outputs defined
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-0">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Files</h3>
                  <p className="text-sm text-muted-foreground">
                    This process doesn't have any files attached.
                  </p>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="p-6 pt-2 border-t mt-auto">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
