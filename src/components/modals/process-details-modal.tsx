'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

import {
  Badge,
  Button,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'

interface ProcessDetailsModalProps {
  process: any
  isOpen: boolean
  onClose: () => void
}

export function ProcessDetailsModal({
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
    if (!property) return ''

    if (property.values && property.values.length > 0) {
      return property.values.map((v: any) => v.value).join(', ')
    }

    return property.value || ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="px-6 py-4">
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
              <TabsTrigger
                value="details"
                className="text-base px-4 py-2 data-[state=active]:bg-white"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="flow"
                className="text-base px-4 py-2 data-[state=active]:bg-white"
              >
                Process Flow
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="text-base px-4 py-2 data-[state=active]:bg-white"
              >
                Files
              </TabsTrigger>
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
                        key={prop.uuid || prop.key}
                        className="flex flex-col p-2 border rounded-md"
                      >
                        <span className="text-sm font-medium">{prop.key}</span>
                        <span className="text-sm">
                          {prop.values && prop.values.length > 0
                            ? prop.values.map((v: any) => v.value).join(', ')
                            : prop.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flow" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Inputs</h3>
                  {process.inputs && process.inputs.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Process</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {process.inputs.map((input: any) => (
                            <TableRow
                              key={input.id || input.uuid}
                              className="hover:bg-muted/50 cursor-pointer"
                            >
                              <TableCell className="font-medium">
                                {input.name}
                              </TableCell>
                              <TableCell>
                                {input.quantity || '1'} {input.unit || ''}
                              </TableCell>
                              <TableCell>{input.process}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
                      No inputs defined
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Badge className="px-4 py-2">{process.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {getPropertyValue(process.properties, 'Quantity')}{' '}
                      {getPropertyValue(process.properties, 'Unit')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Outputs</h3>
                  {process.outputs && process.outputs.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Process</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {process.outputs.map((output: any) => (
                            <TableRow
                              key={output.id || output.uuid}
                              className="hover:bg-muted/50 cursor-pointer"
                            >
                              <TableCell className="font-medium">
                                {output.name}
                              </TableCell>
                              <TableCell>
                                {output.quantity || '1'} {output.unit || ''}
                              </TableCell>
                              <TableCell>{output.process}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
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

            <DialogFooter className="px-6 py-4 border-t mt-auto">
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
