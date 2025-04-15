'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Search, User, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useCertificate, Certificate } from '@/contexts/certificate-context'
import { SearchCommand } from '@/components/search-command'
import { APP_ACRONYM, NAV_ITEMS } from '@/constants'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    certificates,
    selectedCertificate,
    setSelectedCertificate,
    getStatusColor,
    logout,
  } = useCertificate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleLogout = () => {
    // Clear session storage
    logout()

    // Redirect to auth page
    router.push('/')
  }

  const handleCertificateChange = (cert: Certificate) => {
    setSelectedCertificate(cert)
  }

  const getFirstName = (name: string) => {
    return name.split(' ')[0]
  }

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/objects">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">{APP_ACRONYM}</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.path || pathname.startsWith(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="relative h-9 w-full md:w-40 lg:w-64 justify-between px-3"
              aria-label="Search"
            >
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                <span className="text-muted-foreground text-sm">Search...</span>
              </div>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span>/</span>
              </kbd>
            </Button>

            <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {selectedCertificate?.subject.commonName
                      ? getFirstName(selectedCertificate.subject.commonName)
                      : 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  {selectedCertificate?.subject.commonName || 'User'}
                </div>
                {certificates.length > 1 && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Available Certificates
                    </div>
                    {certificates.map((cert) => (
                      <DropdownMenuItem
                        key={cert.id}
                        onClick={() => handleCertificateChange(cert)}
                        className={`cursor-pointer ${selectedCertificate?.id === cert.id ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center w-full">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(cert.status)}`}
                          ></span>
                          <span className="font-medium py-0.5">
                            {cert.subject.commonName}
                          </span>
                          {selectedCertificate?.id === cert.id && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
