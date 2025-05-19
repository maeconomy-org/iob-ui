'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { useXlsxProcessor, SheetData } from '@/hooks'

interface FileUploadProps {
  onFileSelected: (file: File, sheets: SheetData[]) => void
  title?: string
  description?: string
  maxSizeInMB?: number
}

export function FileUpload({
  onFileSelected,
  title,
  description,
  maxSizeInMB = 100,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const { processFile, isProcessing, progress, error, reset } =
    useXlsxProcessor({
      onProgress: setUploadProgress,
      maxSizeInMB,
      streamChunkSize: 2 * 1024 * 1024, // 2MB chunks for better performance
    })

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      reset() // Reset any previous state

      const file = acceptedFiles[0]
      const sheets = await processFile(file)

      if (sheets.length > 0) {
        onFileSelected(file, sheets)
      }
    },
    [processFile, onFileSelected, reset]
  )

  return (
    <div className="space-y-6">
      {title && description && (
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      <div className="space-y-4">
        <FileDropzone
          onDrop={handleDrop}
          isLoading={isProcessing}
          loadingText={`Processing file (${uploadProgress}%)...`}
          error={error}
          progress={uploadProgress}
          accept={{
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              ['.xlsx'],
            'text/csv': ['.csv'],
          }}
          maxFiles={1}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            {isProcessing ? (
              <div className="animate-pulse">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              </div>
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground" />
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isProcessing
                  ? `Processing file (${progress}%)...`
                  : 'Drag & drop your file here'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {!isProcessing && 'or click to browse'}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Supports XLSX and CSV files up to {maxSizeInMB}MB
            </div>
          </div>
        </FileDropzone>
      </div>
    </div>
  )
}
