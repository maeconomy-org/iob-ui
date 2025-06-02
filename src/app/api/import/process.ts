import { API_CONFIG } from '@/lib/api-config'
import redis from '@/lib/redis'

export async function processImportJob(jobId: string) {
  try {
    // Get job metadata
    const jobData = await redis.hgetall(`import:${jobId}`)

    if (
      !jobData ||
      jobData.status === 'completed' ||
      jobData.status === 'failed'
    ) {
      console.log(`Job ${jobId} already ${jobData?.status || 'does not exist'}`)
      return
    }

    const totalChunks = parseInt(jobData.totalChunks || '0')
    const total = parseInt(jobData.total || '0')
    let processed = parseInt(jobData.processed || '0')
    let failed = parseInt(jobData.failed || '0')

    // Get the request delay from environment or use default (100ms)
    const requestDelay = parseInt(process.env.API_REQUEST_DELAY || '100')

    // Collect all objects first from all chunks to process them one by one
    const allObjects = []

    // Get objects from all chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Get chunk of objects
      const chunkKey = `import:${jobId}:chunk:${chunkIndex}`
      const chunkData = await redis.get(chunkKey)

      if (!chunkData) {
        console.warn(`Chunk ${chunkIndex} not found for job ${jobId}`)
        continue
      }

      const chunkObjects = JSON.parse(chunkData)
      allObjects.push(...chunkObjects)
    }

    console.log(
      `Job ${jobId}: Processing ${allObjects.length} objects individually`
    )

    // Process each object one by one
    for (let i = 0; i < allObjects.length; i++) {
      const object = allObjects[i]

      try {
        // Send to Java backend API
        // const response = await fetch(`${API_CONFIG.baseUrl}/api/Import`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(object),
        // })

        // console.log(response)

        // if (!response.ok) {
        //   throw new Error(`API responded with status ${response.status}`)
        // }

        // Increment processed count
        processed++

        // Update progress for each object or every 10 objects
        if (processed % 10 === 0 || processed === total) {
          await redis.hset(`import:${jobId}`, {
            processed: processed.toString(),
          })
        }
      } catch (error) {
        console.error(`Error processing object ${i}:`, error)

        // Record failure
        failed++
        await redis.hset(`import:${jobId}`, {
          failed: failed.toString(),
        })

        // Store failure details
        await redis.rpush(
          `import:${jobId}:failures`,
          JSON.stringify({
            index: i,
            object: object,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
          })
        )
      }

      // Add a configurable delay between requests to avoid overwhelming the API
      // This can be adjusted via environment variable
      await new Promise((resolve) => setTimeout(resolve, requestDelay))
    }

    // Delete all chunks after processing to save memory
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      await redis.del(`import:${jobId}:chunk:${chunkIndex}`)
    }

    // Mark job as completed
    await redis.hset(`import:${jobId}`, {
      status: 'completed',
      completedAt: Date.now().toString(),
      processed: processed.toString(),
      failed: failed.toString(),
    })

    console.log(
      `Import job ${jobId} completed: ${processed} processed, ${failed} failed`
    )
  } catch (error) {
    console.error(`Error processing import job ${jobId}:`, error)

    // Mark job as failed
    await redis.hset(`import:${jobId}`, {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      failedAt: Date.now().toString(),
    })

    throw error
  }
}
