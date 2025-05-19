'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { FileUpload } from './components/file-upload'
import { ColumnMapper } from './components/column-mapper'
import { ImportPreview } from './components/import-preview'
import { Steps, Step } from './components/steps'
import { useImportProcess, SheetData } from '@/hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import {
  IMPORT_HEADER_ROW_KEY,
  IMPORT_START_ROW_KEY,
  IMPORT_COLUMN_MAPPING_KEY,
} from '@/constants'

type ImportStep = 'upload' | 'map-columns' | 'preview'

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [selectedSheetData, setSelectedSheetData] = useState<any[]>([])
  const [suggestedStartRow, setSuggestedStartRow] = useState<number>(0)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [mappedData, setMappedData] = useState<any[]>([])

  // Use the import process hook with redirection enabled
  const { isImporting, startImport } = useImportProcess({
    autoRedirect: true,
    onImportStarted: (jobId) => {
      console.log(`Import job started: ${jobId}`)
    },
  })

  // Clear session storage when component unmounts or when returning to upload step
  useEffect(() => {
    if (step === 'upload') {
      clearSessionStorage()
    }

    return () => {
      clearSessionStorage()
    }
  }, [step])

  const clearSessionStorage = () => {
    sessionStorage.removeItem(IMPORT_HEADER_ROW_KEY)
    sessionStorage.removeItem(IMPORT_START_ROW_KEY)
    sessionStorage.removeItem(IMPORT_COLUMN_MAPPING_KEY)
  }

  const handleFileSelected = (
    selectedFile: File,
    parsedSheets: SheetData[]
  ) => {
    setFile(selectedFile)
    setSheets(parsedSheets)

    // If there's only one sheet, select it automatically
    if (parsedSheets.length === 1) {
      const sheet = parsedSheets[0]
      handleSheetChange(sheet.name)
    } else if (parsedSheets.length > 0) {
      // Don't auto-select first sheet, leave it empty for user to select
      setSelectedSheet('')
    }

    setStep('map-columns')
  }

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName)

    // Find the selected sheet data
    const selectedSheetInfo = sheets.find((s) => s.name === sheetName)
    if (!selectedSheetInfo) return

    // Set the sheet data and suggested start row
    setSelectedSheetData(selectedSheetInfo.data)
    setSuggestedStartRow(selectedSheetInfo.suggestedStartRow || 0)
  }

  const handleColumnMapped = (mapping: Record<string, string>, data: any[]) => {
    setColumnMapping(mapping)
    setMappedData(data)
    setStep('preview')
  }

  const handleImport = async () => {
    if (mappedData.length === 0) {
      toast.error('No data to import')
      return
    }

    // Start import with redirect enabled
    await startImport({
      mappedData,
      redirectOnComplete: true,
    })
  }

  const handleBack = () => {
    switch (step) {
      case 'map-columns':
        setStep('upload')
        break
      case 'preview':
        setStep('map-columns')
        break
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'upload':
        return 'Upload File'
      case 'map-columns':
        return 'Map Columns'
      case 'preview':
        return 'Preview Data'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'upload':
        return 'Upload an XLSX or CSV file to import objects'
      case 'map-columns':
        return 'Select a sheet and map columns to object properties'
      case 'preview':
        return 'Review and import your data'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Import Objects</h1>
        <p className="text-muted-foreground mt-2">
          Import objects from XLSX or CSV files
          {selectedSheet && (
            <span className="ml-2">
              • <span className="font-medium">{selectedSheet}</span>
              {selectedSheetData.length > 0 && (
                <span> ({selectedSheetData.length} rows)</span>
              )}
            </span>
          )}
        </p>
      </div>

      <div className="mb-8">
        <Steps
          currentStep={step === 'upload' ? 0 : step === 'map-columns' ? 1 : 2}
        >
          <Step title="Upload File" />
          <Step title="Map Columns" />
          <Step title="Preview & Import" />
        </Steps>
      </div>

      <div className="pt-6">
        {step === 'upload' && (
          <FileUpload
            onFileSelected={handleFileSelected}
            title={getStepTitle()}
            description={getStepDescription()}
          />
        )}

        {step === 'map-columns' && (
          <div className="space-y-4">
            {sheets.length > 1 && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-1 block">
                  Select Sheet
                </label>
                <div className="flex gap-4 items-center">
                  <Select
                    value={selectedSheet}
                    onValueChange={handleSheetChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Please select a sheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map((sheet) => (
                        <SelectItem key={sheet.name} value={sheet.name}>
                          {sheet.name} ({sheet.data.length} rows)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedSheetData.length > 0 && (
              <ColumnMapper
                sheetData={selectedSheetData}
                onColumnsMapped={handleColumnMapped}
                onBack={handleBack}
                suggestedStartRow={suggestedStartRow}
                title="Map Columns"
                description="Map columns to object properties"
              />
            )}
          </div>
        )}

        {step === 'preview' && (
          <ImportPreview
            data={mappedData}
            onImport={handleImport}
            onBack={handleBack}
            isImporting={isImporting}
            title="Preview Data"
            description="Review and import your data"
          />
        )}
      </div>
    </div>
  )
}
