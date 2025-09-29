'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AUTH_SESSION_KEY } from '@/constants'

// Auth data type
interface AuthData {
  authenticated: boolean
  timestamp: number
  certCommonName?: string
  certFingerprint?: string
  userUuid?: string
  certValidFrom?: string // Certificate validity start date
  certValidTo?: string // Certificate validity end date
  certSerialNumber?: string // Certificate serial number
}

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean
  certCommonName: string | undefined
  certFingerprint: string | undefined
  userUuid: string | undefined
  certValidFrom: string | undefined
  certValidTo: string | undefined
  certSerialNumber: string | undefined
  login: (authData: AuthData) => void
  logout: () => void
  checkAuth: () => boolean
}

// Default auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  certCommonName: undefined,
  certFingerprint: undefined,
  userUuid: undefined,
  certValidFrom: undefined,
  certValidTo: undefined,
  certSerialNumber: undefined,
  login: () => {},
  logout: () => {},
  checkAuth: () => false,
})

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [certCommonName, setCertCommonName] = useState<string | undefined>(
    undefined
  )
  const [certFingerprint, setCertFingerprint] = useState<string | undefined>(
    undefined
  )
  const [userUuid, setUserUuid] = useState<string | undefined>(undefined)
  const [certValidFrom, setCertValidFrom] = useState<string | undefined>(
    undefined
  )
  const [certValidTo, setCertValidTo] = useState<string | undefined>(undefined)
  const [certSerialNumber, setCertSerialNumber] = useState<string | undefined>(
    undefined
  )

  // Public pages that don't require authentication
  const publicPages = ['/', '/help', '/terms', '/privacy']
  const isPublicPage = publicPages.includes(pathname)

  // Check authentication status on mount
  useEffect(() => {
    const authenticated = checkAuth()

    // If not authenticated and not on a public page, redirect to login
    if (!authenticated && !isPublicPage) {
      router.push('/')
    }
  }, [pathname, router, isPublicPage])

  // Check authentication from session storage
  const checkAuth = (): boolean => {
    try {
      const authData = sessionStorage.getItem(AUTH_SESSION_KEY)
      if (authData) {
        const parsed = JSON.parse(authData) as AuthData
        if (parsed.authenticated && parsed.timestamp) {
          const authTime = new Date(parsed.timestamp)
          const now = new Date()
          // If authenticated within the 12 hours, consider it valid
          if (now.getTime() - authTime.getTime() < 12 * 60 * 60 * 1000) {
            setIsAuthenticated(true)
            setCertCommonName(parsed.certCommonName)
            setCertFingerprint(parsed.certFingerprint)
            setUserUuid(parsed.userUuid)
            setCertValidFrom(parsed.certValidFrom)
            setCertValidTo(parsed.certValidTo)
            setCertSerialNumber(parsed.certSerialNumber)
            return true
          }
        }
      }
    } catch (e) {
      console.error('Error reading auth status:', e)
    }

    setIsAuthenticated(false)
    setCertCommonName(undefined)
    setCertFingerprint(undefined)
    setUserUuid(undefined)
    setCertValidFrom(undefined)
    setCertValidTo(undefined)
    setCertSerialNumber(undefined)
    return false
  }

  // Login function
  const login = (authData: AuthData) => {
    // Store auth data in session storage
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authData))
    setIsAuthenticated(true)
    setCertCommonName(authData.certCommonName)
    setCertFingerprint(authData.certFingerprint)
    setUserUuid(authData.userUuid)
    setCertValidFrom(authData.certValidFrom)
    setCertValidTo(authData.certValidTo)
    setCertSerialNumber(authData.certSerialNumber)
  }

  // Logout function
  const logout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setIsAuthenticated(false)
    setCertCommonName(undefined)
    setCertFingerprint(undefined)
    setUserUuid(undefined)
    setCertValidFrom(undefined)
    setCertValidTo(undefined)
    setCertSerialNumber(undefined)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        certCommonName,
        certFingerprint,
        userUuid,
        certValidFrom,
        certValidTo,
        certSerialNumber,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
