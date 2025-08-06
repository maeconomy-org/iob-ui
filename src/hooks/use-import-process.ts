import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { IMPORT_CHUNK_SIZE, SIZE_THRESHOLD_MB } from '@/constants'
import { useAuth } from '@/contexts/auth-context'

export interface ImportData {
  mappedData: any[]
  redirectOnComplete?: boolean
  statusPagePath?: string
}

export interface UseImportProcessOptions {
  onImportStarted?: (jobId: string) => void
  onImportError?: (error: Error) => void
  autoRedirect?: boolean
}

export interface UseImportProcessResult {
  isImporting: boolean
  importJobId: string | null
  startImport: (data: ImportData) => Promise<string | null>
  resetImport: () => void
}

// Config constants for chunking
const CHUNK_SIZE = IMPORT_CHUNK_SIZE

export function useImportProcess({
  onImportStarted,
  onImportError,
  autoRedirect = true,
}: UseImportProcessOptions = {}): UseImportProcessResult {
  const router = useRouter()
  const { certFingerprint } = useAuth()
  const [isImporting, setIsImporting] = useState(false)
  const [importJobId, setImportJobId] = useState<string | null>(null)

  // Get headers with user fingerprint
  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add user fingerprint if available
    if (certFingerprint) {
      headers['User-Fingerprint'] = certFingerprint
      headers['createdBy'] = certFingerprint
    }

    return headers
  }, [certFingerprint])

  // Function to start the import
  const startImport = useCallback(
    async ({
      mappedData,
      redirectOnComplete = autoRedirect,
      statusPagePath = '/import-status',
    }: ImportData) => {
      if (!mappedData || mappedData.length === 0) {
        toast.error('No data to import')
        return null
      }

      // Check if we have too many objects to import
      if (mappedData.length > 5000) {
        toast.warning(
          `You're about to import ${mappedData.length} objects. This might take some time.`
        )
      }

      setIsImporting(true)

      try {
        // Estimate data size to decide on chunking strategy
        const sampleSize = JSON.stringify(mappedData.slice(0, 10)).length / 10
        const estimatedDataSizeMB =
          (sampleSize * mappedData.length) / (1024 * 1024)

        // Always use chunking for large datasets
        const shouldUseChunking =
          estimatedDataSizeMB > SIZE_THRESHOLD_MB || mappedData.length > 1000

        let jobId: string | null = null

        if (shouldUseChunking) {
          toast.info(
            `Large dataset detected (estimated ${estimatedDataSizeMB.toFixed(2)}MB). Using optimized upload.`
          )
          jobId = await handleChunkedUpload(mappedData)
        } else {
          // Standard upload for smaller datasets
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ objects: mappedData }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to start import')
          }

          const data = await response.json()
          jobId = data.jobId
        }

        if (jobId) {
          setImportJobId(jobId)
          toast.success(`Import started with job ID: ${jobId}`)
          onImportStarted?.(jobId)

          // Redirect to status page if enabled
          if (redirectOnComplete) {
            toast.info('Redirecting to status page...')
            setTimeout(() => {
              router.push(`${statusPagePath}?jobId=${jobId}&redirect=true`)
            }, 1000)
          }
        }

        return jobId
      } catch (error) {
        console.error('Import error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        toast.error(`Import failed: ${errorMessage}`)
        onImportError?.(
          error instanceof Error ? error : new Error(errorMessage)
        )
        setIsImporting(false)
        return null
      }
    },
    [autoRedirect, router, onImportStarted, onImportError, getHeaders]
  )

  // Handle chunked upload for large payloads
  const handleChunkedUpload = useCallback(
    async (mappedData: any[]) => {
      try {
        // Split data into chunks
        const totalObjects = mappedData.length
        const totalChunks = Math.ceil(totalObjects / CHUNK_SIZE)

        toast.info(
          `Processing ${totalObjects} objects in ${totalChunks} chunks`
        )

        let jobId: string | null = null

        // Process each chunk
        for (let i = 0; i < totalObjects; i += CHUNK_SIZE) {
          const chunk = mappedData.slice(i, i + CHUNK_SIZE)
          const chunkIndex = Math.floor(i / CHUNK_SIZE)
          const chunkPercent = Math.round((chunkIndex / totalChunks) * 100)

          // Update progress toast
          toast.loading(
            `Uploading chunk ${chunkIndex + 1}/${totalChunks} (${chunkPercent}%)...`,
            {
              id: 'chunk-upload',
            }
          )

          // Send chunk to API
          const response: Response = await fetch('/api/import/chunk', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              chunk,
              total: totalObjects,
              chunkIndex,
              totalChunks,
              sessionId: jobId, // Only null for first chunk
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(
              errorData.error || `Failed to upload chunk ${chunkIndex + 1}`
            )
          }

          const data: {
            jobId: string
            status: string
            message: string
            progress: string
            complete: boolean
          } = await response.json()

          // Store job ID from first chunk response
          if (chunkIndex === 0) {
            jobId = data.jobId
            setImportJobId(data.jobId)
          }

          // Update progress
          toast.success(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`, {
            id: 'chunk-upload',
          })

          // If all chunks uploaded, show completion message
          if (data.complete || chunkIndex === totalChunks - 1) {
            toast.success(
              `All chunks uploaded (${totalObjects} objects), processing will start automatically`
            )
          }
        }

        return jobId
      } catch (error) {
        console.error('Chunked upload error:', error)
        toast.error(
          `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        setIsImporting(false)
        return null
      }
    },
    [getHeaders]
  )

  // Reset the import state
  const resetImport = useCallback(() => {
    setIsImporting(false)
    setImportJobId(null)
  }, [])

  return {
    isImporting,
    importJobId,
    startImport,
    resetImport,
  }
}
