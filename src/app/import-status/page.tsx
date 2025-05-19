'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart,
  RefreshCcw,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useImportStatus } from '@/hooks'

export default function ImportStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  const {
    status,
    loading,
    error,
    refresh,
    isAutoRefreshing,
    toggleAutoRefresh,
  } = useImportStatus(jobId)
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Check if we should redirect to objects page after completion
  useEffect(() => {
    if (status?.status === 'completed') {
      // If there's a redirect param, redirect to objects after 3 seconds
      const shouldRedirect = searchParams.get('redirect') === 'true'
      if (shouldRedirect) {
        const timer = setTimeout(() => {
          router.push('/objects')
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [status, router, searchParams])

  // Format the created date if available
  const formattedCreatedAt = status?.createdAt
    ? new Date(status.createdAt).toLocaleString()
    : 'N/A'

  // Format the completed date if available
  const formattedCompletedAt = status?.completedAt
    ? new Date(status.completedAt).toLocaleString()
    : 'N/A'

  // Calculate elapsed time
  const calculateElapsedTime = () => {
    if (!status?.createdAt) return 'N/A'

    const start = new Date(status.createdAt).getTime()
    const end = status.completedAt
      ? new Date(status.completedAt).getTime()
      : Date.now()

    const elapsedMs = end - start

    // Format elapsed time
    if (elapsedMs < 1000) {
      return `${elapsedMs}ms`
    } else if (elapsedMs < 60000) {
      return `${Math.floor(elapsedMs / 1000)}s`
    } else {
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.floor((elapsedMs % 60000) / 1000)
      return `${minutes}m ${seconds}s`
    }
  }

  // Calculate estimated completion time based on current processing rate
  const calculateETA = () => {
    if (
      !status ||
      status.processed === 0 ||
      status.status === 'completed' ||
      !status.createdAt
    ) {
      return 'N/A'
    }

    // Get time elapsed so far
    const start = new Date(status.createdAt).getTime()
    const now = Date.now()
    const elapsedMs = now - start

    // Calculate processing rate (items per ms)
    const rate = status.processed / elapsedMs

    // Estimate remaining time
    const remaining = status.total - status.processed
    const estimatedRemainingMs = remaining / rate

    // Format estimated time
    if (estimatedRemainingMs < 1000) {
      return 'Less than a second'
    } else if (estimatedRemainingMs < 60000) {
      return `${Math.floor(estimatedRemainingMs / 1000)} seconds`
    } else if (estimatedRemainingMs < 3600000) {
      return `${Math.floor(estimatedRemainingMs / 60000)} minutes`
    } else {
      const hours = Math.floor(estimatedRemainingMs / 3600000)
      const minutes = Math.floor((estimatedRemainingMs % 3600000) / 60000)
      return `${hours}h ${minutes}m`
    }
  }

  // Determine the status color and icon
  const getStatusDetails = () => {
    if (!status) return { color: 'default', icon: null, text: 'Unknown' }

    switch (status.status) {
      case 'pending':
        return {
          color: 'warning',
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Pending',
        }
      case 'receiving':
        return {
          color: 'warning',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Receiving Data',
        }
      case 'processing':
        return {
          color: 'default',
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Processing',
        }
      case 'completed':
        return {
          color: 'success',
          icon: <CheckCircle2 className="h-4 w-4" />,
          text: 'Completed',
        }
      case 'failed':
        return {
          color: 'destructive',
          icon: <XCircle className="h-4 w-4" />,
          text: 'Failed',
        }
      default:
        return {
          color: 'default',
          icon: null,
          text: status.status,
        }
    }
  }

  const statusDetails = getStatusDetails()

  if (!jobId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Import Status</CardTitle>
            <CardDescription>No job ID provided</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please provide a job ID to view the import status.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/import">
              <Button>Go to Import</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (loading && !status) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Import Status</CardTitle>
            <CardDescription>Loading status for job {jobId}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !status) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Import Status</CardTitle>
            <CardDescription>Error retrieving status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/import">
              <Button variant="outline">Go to Import</Button>
            </Link>
            <Button onClick={refresh}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import Status</CardTitle>
              <CardDescription>Job ID: {jobId}</CardDescription>
            </div>
            <Badge
              variant={statusDetails.color as any}
              className="flex items-center gap-1"
            >
              {statusDetails.icon}
              <span>{statusDetails.text}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {status && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-medium">
                    {status.processed} / {status.total} objects
                    {status.failed > 0 && ` (${status.failed} failed)`}
                  </span>
                </div>
                <Progress
                  value={(status.processed / (status.total || 1)) * 100}
                  className="h-2"
                />

                {/* Estimated completion info */}
                {['processing', 'receiving'].includes(status.status) && (
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>ETA: {calculateETA()}</span>
                    <span>
                      {Math.round(
                        (status.processed / (status.total || 1)) * 100
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Started:</dt>
                      <dd>{formattedCreatedAt}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Completed:</dt>
                      <dd>{formattedCompletedAt}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Elapsed Time:</dt>
                      <dd>{calculateElapsedTime()}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Results</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Total Objects:</dt>
                      <dd>{status.total}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Processed:</dt>
                      <dd>{status.processed}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Failed:</dt>
                      <dd>{status.failed}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {status.status === 'failed' && status.error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md">
                  <h4 className="text-sm font-medium mb-1">Error:</h4>
                  <p className="text-sm">{status.error}</p>
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Link href="/import">
              <Button variant="outline">Back to Import</Button>
            </Link>
            {status?.status === 'completed' && (
              <Link href="/objects">
                <Button>View Objects</Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAutoRefresh}
              className={isAutoRefreshing ? 'text-primary' : ''}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={refresh}>Refresh Status</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
