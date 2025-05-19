'use client'

import {
  Input,
  Label,
  Button,
  Badge,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from '@/components/ui'
import {
  useColumnMapper,
  PropertyDefinition,
  DEFAULT_PROPERTIES,
} from '@/hooks'
import { useState } from 'react'
import { Save, MoveRight, Undo } from 'lucide-react'
import { toast } from 'sonner'

interface ColumnMapperProps {
  sheetData: any[]
  onColumnsMapped: (mapping: Record<string, string>, data: any[]) => void
  suggestedStartRow?: number
  onBack?: () => void
  title?: string
  description?: string
}

export function ColumnMapper({
  sheetData,
  onColumnsMapped,
  suggestedStartRow = 0,
  onBack,
  title,
  description,
}: ColumnMapperProps) {
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Use the column mapper hook
  const {
    columnMapping,
    headerRowIndex,
    useFirstRowAsHeaders,
    headers,
    previewData,
    requiredFieldsMapped,
    mappingTemplates,

    // Actions
    handleMappingChange,
    setHeaderRowIndex,
    toggleUseFirstRowAsHeaders,
    saveTemplate: saveTemplateToStorage,
    applyTemplate,
    resetMapping,
    processData,
    handleMapMultipleAsProperties,
  } = useColumnMapper({
    sheetData,
    suggestedStartRow,
  })

  // Start mapping
  const handleContinue = () => {
    // Generate final data with the mapping
    const finalMappedData = processData()

    // Check if we have required properties
    if (!requiredFieldsMapped) {
      toast.error('Please map all required properties before continuing')
      return
    }

    // Call the parent callback
    onColumnsMapped(columnMapping, finalMappedData)
  }

  // Handle header row change
  const handleHeaderRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10) - 1
    if (isNaN(newValue) || newValue < 0 || newValue >= sheetData.length) return

    setHeaderRowIndex(newValue)
  }

  // Save template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    saveTemplateToStorage(templateName)
    toast.success(`Template "${templateName}" saved`)
    setSaveTemplateDialogOpen(false)
    setTemplateName('')
  }

  // Check if data is available for mapping
  const hasData = Array.isArray(sheetData) && sheetData.length > 0

  return (
    <div className="space-y-6">
      {title && description && (
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}

      {!hasData ? (
        <div className="border rounded-md p-8 text-center text-muted-foreground">
          <p>No data available for mapping. Please select a sheet first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            {/* Data Selection Options */}
            <div className="border rounded-md p-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="start-row"
                    className="text-sm whitespace-nowrap"
                  >
                    Header Row:
                  </Label>
                  <Input
                    id="start-row"
                    type="number"
                    min="1"
                    max={Math.min(100, sheetData.length)}
                    value={headerRowIndex + 1}
                    onChange={handleHeaderRowChange}
                    className="w-16 h-8"
                  />
                  <span className="text-xs text-muted-foreground">
                    (showing rows {Math.max(1, headerRowIndex - 1)} to{' '}
                    {Math.min(headerRowIndex + 5, sheetData.length)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="use-headers"
                    checked={useFirstRowAsHeaders}
                    onCheckedChange={toggleUseFirstRowAsHeaders}
                    key={`header-switch-${headerRowIndex}`}
                  />
                  <Label htmlFor="use-headers" className="text-sm">
                    Use row as headers
                  </Label>
                </div>

                {/* Template selection */}
                {mappingTemplates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="template" className="text-sm">
                      Apply Template:
                    </Label>
                    <Select onValueChange={applyTemplate}>
                      <SelectTrigger className="w-[200px] h-8">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {mappingTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Sheet Preview */}
            <div className="border rounded-md p-3">
              <h3 className="text-sm font-medium mb-1">Sheet Preview</h3>
              <div className="border rounded-md overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-xs sticky top-0 bg-background z-10">
                        Row
                      </TableHead>
                      {Array.from({
                        length: Math.min(10, sheetData[0]?.length || 0),
                      }).map((_, index) => (
                        <TableHead
                          key={index}
                          className="text-xs sticky top-0 bg-background z-10"
                        >
                          Col {index + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheetData
                      .slice(
                        Math.max(0, headerRowIndex - 1),
                        Math.min(headerRowIndex + 6, sheetData.length)
                      )
                      .map((row, rowIndex) => {
                        const actualRowIndex =
                          Math.max(0, headerRowIndex - 1) + rowIndex
                        return (
                          <TableRow
                            key={actualRowIndex}
                            className={
                              actualRowIndex === headerRowIndex
                                ? 'bg-primary/10'
                                : ''
                            }
                          >
                            <TableCell className="text-sm py-2 sticky left-0 bg-background z-10">
                              {actualRowIndex + 1}
                            </TableCell>
                            {row
                              .slice(0, 10)
                              .map((cell: any, cellIndex: number) => (
                                <TableCell
                                  key={cellIndex}
                                  className="text-xs truncate max-w-[150px] py-1"
                                >
                                  {String(cell || '')}
                                </TableCell>
                              ))}
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Column Mapping Section */}
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">
                  Map Columns to Properties
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetMapping}
                    className="flex items-center gap-1"
                  >
                    <Undo className="h-3 w-3" />
                    <span>Reset</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMapMultipleAsProperties}
                  >
                    Map All Unmapped as Properties
                  </Button>

                  <Dialog
                    open={saveTemplateDialogOpen}
                    onOpenChange={setSaveTemplateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={Object.keys(columnMapping).length === 0}
                      >
                        <Save className="h-3 w-3" />
                        <span>Save Template</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Save Mapping Template</DialogTitle>
                        <DialogDescription>
                          Templates save your column mappings so you can reuse
                          them
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="template-name" className="text-sm">
                          Template Name
                        </Label>
                        <Input
                          id="template-name"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="e.g. Customer Import"
                          className="mt-1"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSaveTemplateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveTemplate}
                          disabled={!templateName.trim()}
                        >
                          Save Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Column</TableHead>
                      <TableHead className="w-[300px]">
                        Map to Property
                      </TableHead>
                      <TableHead>Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {headers.map((header: any, index: number) => {
                      // Get preview data for this column
                      const previewValues = previewData
                        .slice(0, 3)
                        .map((row) => row[index] || '-')
                        .filter((value) => value !== '-')
                        .map(String)

                      return (
                        <TableRow key={index}>
                          <TableCell className="py-1">
                            {useFirstRowAsHeaders ? (
                              <div className="font-medium text-sm">
                                {header || `Column ${index + 1}`}
                              </div>
                            ) : (
                              <div className="font-medium text-sm">
                                Column {index + 1}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-1">
                            <Select
                              value={
                                columnMapping[index]?.startsWith(
                                  '__property__:'
                                )
                                  ? '__property__'
                                  : columnMapping[index] || 'none'
                              }
                              onValueChange={(value) => {
                                if (value === 'none') {
                                  handleMappingChange(index, '')
                                } else {
                                  handleMappingChange(index, value)
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Don't Import This Column
                                </SelectItem>
                                {DEFAULT_PROPERTIES.map((prop) => (
                                  <SelectItem key={prop.key} value={prop.key}>
                                    {prop.label}
                                    {prop.required && ' (Required)'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {previewValues.length > 0
                                ? previewValues.join(', ')
                                : '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={!onBack}>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={
                !requiredFieldsMapped || Object.keys(columnMapping).length === 0
              }
              className="flex items-center gap-1"
            >
              <span>Continue</span>
              <MoveRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
