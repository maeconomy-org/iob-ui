// app/api/import/route.ts
import { NextResponse } from 'next/server'
import redis from '@/lib/redis'
import crypto from 'crypto'
import { processImportJob } from './process'

export const config = {
  api: {
    bodyParser: false, // Disable the built-in body parser
    responseLimit: false, // No response limit
  },
}

export async function POST(req: Request) {
  try {
    // Use a streaming approach for large payloads
    const contentType = req.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content type must be application/json' },
        { status: 400 }
      )
    }

    // Generate a unique job ID early
    const jobId = crypto.randomUUID()

    // Create initial job record
    await redis.hset(`import:${jobId}`, {
      status: 'receiving',
      createdAt: Date.now().toString(),
    })

    // Stream and process chunks
    const chunks: Uint8Array[] = []
    let totalSize = 0
    const reader = req.body?.getReader()

    if (!reader) {
      return NextResponse.json(
        { error: 'Request body could not be read' },
        { status: 400 }
      )
    }

    // Read the stream in chunks
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalSize += value.length
      chunks.push(value)

      // If total size exceeds limit (200MB), abort
      if (totalSize > 200 * 1024 * 1024) {
        await redis.hset(`import:${jobId}`, {
          status: 'failed',
          error: 'Payload too large (exceeds 200MB)',
        })
        return NextResponse.json(
          { error: 'Payload too large (exceeds 200MB)' },
          { status: 413 }
        )
      }
    }

    // Combine chunks and parse JSON
    const buffer = new Uint8Array(totalSize)
    let position = 0

    for (const chunk of chunks) {
      buffer.set(chunk, position)
      position += chunk.length
    }

    // Parse the JSON
    let data
    try {
      const text = new TextDecoder().decode(buffer)
      data = JSON.parse(text)
    } catch (error) {
      await redis.hset(`import:${jobId}`, {
        status: 'failed',
        error: 'Invalid JSON format',
      })
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const { objects } = data

    if (!Array.isArray(objects) || objects.length === 0) {
      await redis.hset(`import:${jobId}`, {
        status: 'failed',
        error: 'Invalid data: objects must be a non-empty array',
      })
      return NextResponse.json(
        { error: 'Invalid data: objects must be a non-empty array' },
        { status: 400 }
      )
    }

    // Update job metadata
    await redis.hset(`import:${jobId}`, {
      status: 'pending',
      total: objects.length,
      processed: 0,
      failed: 0,
    })

    // Store objects in chunks to avoid memory issues
    // Note: Objects are stored in chunks for memory efficiency,
    // but will be processed one by one in the background process
    const CHUNK_SIZE = 100
    const totalChunks = Math.ceil(objects.length / CHUNK_SIZE)

    for (let i = 0; i < objects.length; i += CHUNK_SIZE) {
      const chunk = objects.slice(i, i + CHUNK_SIZE)
      await redis.set(
        `import:${jobId}:chunk:${Math.floor(i / CHUNK_SIZE)}`,
        JSON.stringify(chunk)
      )
    }

    // Save total chunks information
    await redis.hset(`import:${jobId}`, {
      totalChunks: totalChunks.toString(),
    })

    // Start background processing
    startProcessing(jobId)

    return NextResponse.json({
      jobId,
      status: 'started',
      message: 'Import job started successfully',
      totalObjects: objects.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to start import job' },
      { status: 500 }
    )
  }
}
// Function to start processing in the background
async function startProcessing(jobId: string) {
  // Update job status to processing
  await redis.hset(`import:${jobId}`, { status: 'processing' })

  // Process the job in the background
  // We're using setImmediate to make it non-blocking
  setImmediate(() => {
    processImportJob(jobId).catch((error) => {
      console.error(`Error processing import job ${jobId}:`, error)
      // Update job status to failed
      redis
        .hset(`import:${jobId}`, {
          status: 'failed',
          error: error.message,
        })
        .catch(console.error)
    })
  })
}
