'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { objectsData } from '@/lib/data'

interface Breadcrumb {
  name: string
  uuid: string
}

export default function Breadcrumbs() {
  const params = useParams()
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentName, setCurrentName] = useState<string>('')

  useEffect(() => {
    if (!params.uuid) return

    const currentUuid = params.uuid as string

    // Function to find the path to the current object
    const findPath = (
      objects: any[],
      path: Breadcrumb[] = []
    ): Breadcrumb[] | null => {
      for (const obj of objects) {
        // Check if this is the object we're looking for
        if (obj.uuid === currentUuid) {
          setCurrentName(obj.name)
          return path
        }

        // If this object has children, search them
        if (obj.children && obj.children.length > 0) {
          const newPath = [...path, { name: obj.name, uuid: obj.uuid }]
          const result = findPath(obj.children, newPath)
          if (result) return result
        }
      }

      return null
    }

    const path = findPath(objectsData)
    if (path) {
      setBreadcrumbs(path)
    }
  }, [params.uuid])

  return (
    <div className="flex items-center text-sm py-4 overflow-x-auto">
      <Link
        href="/objects"
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4 mr-3" />
      </Link>

      <ChevronRight className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.uuid} className="flex items-center">
          <Link
            href={`/objects/${crumb.uuid}`}
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            {crumb.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" />
        </div>
      ))}

      {currentName && (
        <span className="text-primary font-medium whitespace-nowrap">
          {currentName}
        </span>
      )}
    </div>
  )
}
