'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

import { useCommonApi } from '@/hooks/api'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/contexts/auth-context'
import { APP_ACRONYM, APP_DESCRIPTION, APP_NAME } from '@/constants'

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [status, setStatus] = useState<
    'idle' | 'authorizing' | 'success' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const { useRequestCertificate } = useCommonApi()
  const requestCertificate = useRequestCertificate()

  // Check if we're already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setStatus('success')
      router.push('/objects')
    }
  }, [isAuthenticated, router])

  const handleAuthorize = async () => {
    setStatus('authorizing')
    setError(null)

    try {
      // Initiate auth flow
      const response = await requestCertificate.mutateAsync()
      console.log('Response:', response)

      if (response.uuid.status !== 200 || response.base.status !== 200) {
        throw new Error('Authorization failed')
      }

      // Extract username from the response
      const certFingerprint = response.base.data?.certFingerprint
      const certCommonName = response.base.data?.certCommonName
      // If we get here, certificate was accepted
      setStatus('success')

      // Login using auth context
      login({
        authenticated: true,
        timestamp: Date.now(),
        certFingerprint,
        certCommonName,
      })

      // Redirect to main app
      router.push('/objects')
    } catch (err) {
      console.log('Error:', err)
      setStatus('error')
      setError(
        'Authorization failed. Please ensure you have a valid certificate.'
      )
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to {APP_ACRONYM}</h1>
          <p className="mt-2 text-gray-600">
            {APP_NAME} - {APP_DESCRIPTION}
          </p>
        </div>

        <Card className="p-6 bg-white shadow-lg rounded-lg">
          <div className="space-y-6">
            {status === 'idle' && (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    To access the system, you need a valid certificate. Click
                    the button below to start the authorization process.
                  </p>
                  <Button
                    onClick={handleAuthorize}
                    className="w-full py-6 text-lg"
                    variant="default"
                  >
                    Authorize with Certificate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {status === 'authorizing' && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p>Please select your certificate when prompted...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6 text-center">
                <div className="bg-green-50 p-4 rounded-md text-green-600 flex items-center justify-center">
                  <Check className="h-5 w-5 mr-2" />
                  Successfully authenticated with certificate
                </div>
                <p className="text-sm text-gray-600">
                  You are being redirected to the application...
                </p>
                <Button
                  onClick={() => router.push('/objects')}
                  className="w-full py-6 text-lg"
                  variant="default"
                >
                  Open Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md text-red-600">
                  {error || 'Authentication failed'}
                </div>
                <Button
                  onClick={handleAuthorize}
                  className="w-full"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-center text-sm">
          <Link
            href="/help"
            className="text-primary hover:text-primary/80 flex items-center"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Need help with certificates?
          </Link>
        </div>
      </div>
    </div>
  )
}
