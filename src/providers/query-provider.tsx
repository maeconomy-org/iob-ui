'use client'

import {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createClient } from 'iob-client'
import { API_CONFIG } from '@/lib/api-config'

// Global singleton cache
let cachedClientPromise: Promise<
  Awaited<ReturnType<typeof createClient>>
> | null = null

const IobClientContext = createContext<Awaited<
  ReturnType<typeof createClient>
> | null>(null)

export function useIobClient() {
  const context = useContext(IobClientContext)
  if (!context) {
    throw new Error('useIobClient must be used within an IobClientProvider')
  }
  return context
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  const [client, setClient] = useState<Awaited<
    ReturnType<typeof createClient>
  > | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    // Use cached promise or start new one
    if (!cachedClientPromise) {
      cachedClientPromise = createClient(API_CONFIG)
    }

    cachedClientPromise
      .then((c) => {
        if (isMounted) setClient(c)
      })
      .catch((err) => {
        if (isMounted)
          setError(
            err instanceof Error ? err : new Error('Failed to init client')
          )
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-red-500">API Connection Error</p>
        <p>{error.message}</p>
        <button
          onClick={() => {
            cachedClientPromise = null
            window.location.reload()
          }}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!client) {
    // Optionally: Replace with Suspense fallback
    return null // Or a subtle spinner
  }

  return (
    <IobClientContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </IobClientContext.Provider>
  )
}
