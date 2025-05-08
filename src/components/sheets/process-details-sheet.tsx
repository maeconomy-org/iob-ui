'use client'

import { FileText } from 'lucide-react'

import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'

interface ProcessDetailsSheetProps {
  process: any
  isOpen: boolean
  onClose: () => void
}

export function ProcessDetailsSheet({
  process,
  isOpen,
  onClose,
}: ProcessDetailsSheetProps) {
  if (!process) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getObjectProperty = (obj: any, key: string) => {
    if (!obj || !obj.properties) return ''

    const property = obj.properties.find((prop: any) => prop.key === key)
    if (!property) return ''

    if (property.values && property.values.length > 0) {
      return property.values.map((v: any) => v.value).join(', ')
    }

    return property.value || ''
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span>Process Flow</span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Details Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Details
            </h3>

            <div className="space-y-4">
              <div className="">
                <p className="text-sm font-medium mb-1">UUID</p>
                <p className="text-sm font-mono">{process.uuid}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
          <Separator />

          {/* Process Flow Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Process Flow
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Inputs</h4>
                {process.inputs && process.inputs.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
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
                              {getObjectProperty(input, 'Type') || 'Material'}
                            </TableCell>
                            <TableCell>
                              {input.quantity ||
                                getObjectProperty(input, 'Quantity') ||
                                '1'}
                            </TableCell>
                            <TableCell>
                              {input.unit ||
                                getObjectProperty(input, 'Unit') ||
                                '-'}
                            </TableCell>
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

              <div>
                <h4 className="text-sm font-medium mb-2">Outputs</h4>
                {process.outputs && process.outputs.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
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
                              {getObjectProperty(output, 'Type') || 'Material'}
                            </TableCell>
                            <TableCell>
                              {output.quantity ||
                                getObjectProperty(output, 'Quantity') ||
                                '1'}
                            </TableCell>
                            <TableCell>
                              {output.unit ||
                                getObjectProperty(output, 'Unit') ||
                                '-'}
                            </TableCell>
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
            </div>
          </div>

          {/* Files Section */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Files
            </h3>

            <div className="flex flex-col items-center justify-center py-4 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <h4 className="text-lg font-medium">No Files</h4>
              <p className="text-sm text-muted-foreground">
                This process doesn't have any files attached.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-4 mt-auto">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
