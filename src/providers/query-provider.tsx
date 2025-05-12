'use client'

import {
  useState,
  useEffect,
  PropsWithChildren,
  createContext,
  useContext,
} from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createClient } from 'iob-client'
import { API_CONFIG } from '@/lib/api-config'

// Create a context for the IoB client
type IobClientContextType = Awaited<ReturnType<typeof createClient>> | null
const IobClientContext = createContext<IobClientContextType>(null)

// Hook to use the IoB client
export function useIobClient() {
  const context = useContext(IobClientContext)
  if (!context) {
    throw new Error('useIobClient must be used within an IobClientProvider')
  }
  return context
}

export function QueryProvider({ children }: PropsWithChildren) {
  // Create React Query client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  // State for IoB client
  const [iobClient, setIobClient] = useState<IobClientContextType>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize the IoB client
  useEffect(() => {
    async function initClient() {
      try {
        const client = await createClient(API_CONFIG)
        setIobClient(client)
      } catch (err) {
        console.error('Failed to initialize IoB client:', err)
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to initialize IoB client')
        )
      } finally {
        setLoading(false)
      }
    }

    initClient()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Connecting to API...
      </div>
    )
  }

  // Show error state
  if (error || !iobClient) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-red-500">API Connection Error</p>
        <p>{error?.message || 'Failed to connect to the API'}</p>
      </div>
    )
  }

  return (
    <IobClientContext.Provider value={iobClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IobClientContext.Provider>
  )
}
