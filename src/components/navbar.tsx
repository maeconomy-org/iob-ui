'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { APP_ACRONYM, NAV_ITEMS } from '@/constants'
import { SearchCommand } from '@/components/search-command'

export default function Navbar() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
          </div>
        </div>
      </div>
    </header>
  )
}
