'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { AUTH_ENDPOINT, AUTH_SESSION_KEY } from '@/constants'

// Certificate type definition
export interface Certificate {
  id: string
  subject: {
    commonName: string
    organization: string
    organizationalUnit?: string
    country?: string
    state?: string
    locality?: string
  }
  issuer: {
    commonName: string
    organization: string
  }
  validity: {
    notBefore: Date
    notAfter: Date
  }
  serialNumber: string
  status: 'valid' | 'expiring' | 'expired'
}

// Demo data
export const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    subject: {
      commonName: 'John Doe',
      organization: 'City Planning Department',
      organizationalUnit: 'Building Permits',
      country: 'US',
    },
    issuer: {
      commonName: 'Municipal CA',
      organization: 'City Government',
    },
    validity: {
      notBefore: new Date('2024-01-01'),
      notAfter: new Date('2024-12-31'),
    },
    serialNumber: '123456789',
    status: 'valid',
  },
  {
    id: 'cert2',
    subject: {
      commonName: 'Jane Smith',
      organization: 'Environmental Agency',
      organizationalUnit: 'Inspections',
      state: 'California',
    },
    issuer: {
      commonName: 'Government CA',
      organization: 'State Government',
    },
    validity: {
      notBefore: new Date('2024-01-01'),
      notAfter: new Date('2024-06-30'),
    },
    serialNumber: '987654321',
    status: 'expiring',
  },
]

// Context type
interface CertificateContextType {
  certificates: Certificate[]
  selectedCertificate: Certificate | null
  setSelectedCertificate: (cert: Certificate) => void
  getStatusColor: (status: string) => string
  isLoading: boolean
  error: string | null
  lastAuthSuccess: Date | null
  logout: () => void
}

// Create context
const CertificateContext = createContext<CertificateContextType | undefined>(
  undefined
)

// Provider component
export function CertificateProvider({ children }: { children: ReactNode }) {
  const [certificates, setCertificates] =
    useState<Certificate[]>(DEMO_CERTIFICATES)
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(DEMO_CERTIFICATES[0])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAuthSuccess, setLastAuthSuccess] = useState<Date | null>(null)

  // Simple logout function
  const logout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
  }

  // Helper function to get status color for the UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500'
      case 'expiring':
        return 'bg-yellow-500'
      case 'expired':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Try to load stored auth state on initialization
  useEffect(() => {
    try {
      const authData = sessionStorage.getItem(AUTH_SESSION_KEY)
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.authenticated && parsed.timestamp) {
          setLastAuthSuccess(new Date(parsed.timestamp))
        }
      }
    } catch (e) {
      console.error('Error reading stored auth status:', e)
    }
  }, [])

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        selectedCertificate,
        setSelectedCertificate,
        getStatusColor,
        isLoading,
        error,
        lastAuthSuccess,
        logout,
      }}
    >
      {children}
    </CertificateContext.Provider>
  )
}

// Custom hook to use the certificate context
export function useCertificate() {
  const context = useContext(CertificateContext)
  if (context === undefined) {
    throw new Error('useCertificate must be used within a CertificateProvider')
  }
  return context
}
