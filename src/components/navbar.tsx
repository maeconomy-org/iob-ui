'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Search,
  UserCircle,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  CopyButton,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { APP_ACRONYM, NAV_ITEMS } from '@/constants'
import { SearchCommand } from '@/components/search-command'
import { useAuth } from '@/contexts/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { certCommonName, certFingerprint, logout } = useAuth()

  // Function to format fingerprint for display (truncate)
  const formatFingerprint = (fingerprint: string) => {
    if (!fingerprint) return ''
    return fingerprint.length > 24
      ? `${fingerprint.slice(0, 24)}...`
      : fingerprint
  }

  return (
    <header className="border-b bg-white top-0 z-10">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/objects">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">{APP_ACRONYM}</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:cursor-pointer hover:text-primary',
                    pathname === item.path || pathname.startsWith(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Button - Fixed centering */}
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="relative h-9 md:w-40 md:px-3 lg:w-64 justify-between"
              aria-label="Search"
            >
              <div className="flex items-center justify-center">
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline text-muted-foreground text-sm">
                  Search...
                </span>
              </div>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span>/</span>
              </kbd>
            </Button>

            {/* User Profile Dropdown - Hidden on Mobile */}
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3"
                  >
                    <UserCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium max-w-32 truncate">
                      {certCommonName || 'User'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium leading-none">
                        {certCommonName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Certificate Authentication
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Certificate Fingerprint */}
                  {certFingerprint && (
                    <DropdownMenuItem
                      className="flex flex-col items-start p-3"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-medium text-muted-foreground">
                          Certificate Fingerprint
                        </span>
                        <CopyButton
                          text={certFingerprint}
                          className="h-6 w-6 p-0"
                        />
                      </div>
                      <code className="text-xs rounded w-full block truncate">
                        {formatFingerprint(certFingerprint)}
                      </code>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>{APP_ACRONYM}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="px-4 mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-md border">
                      <UserCircle className="h-5 w-5 text-gray-500" />
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          {certCommonName || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Certificate Authentication
                        </span>
                      </div>
                    </div>

                    {/* Mobile Certificate Fingerprint */}
                    {certFingerprint && (
                      <div className="mt-3 p-3 rounded-md border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Certificate Fingerprint
                          </span>
                          <CopyButton
                            text={certFingerprint}
                            className="h-6 w-6 p-0"
                          />
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                          {certFingerprint}
                        </code>
                      </div>
                    )}
                  </div>
                  <nav className="flex flex-col">
                    {NAV_ITEMS.map((item) => (
                      <SheetClose asChild key={item.path}>
                        <Link
                          href={item.path}
                          className={cn(
                            'flex items-center py-3 px-4 hover:bg-muted',
                            pathname === item.path ||
                              pathname.startsWith(item.path)
                              ? 'bg-muted text-primary font-medium'
                              : 'text-foreground'
                          )}
                        >
                          {item.name}
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="mt-4 px-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        logout()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
          </div>
        </div>
      </div>
    </header>
  )
}
