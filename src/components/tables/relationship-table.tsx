'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui'
import { MaterialRelationship } from '@/types'

interface RelationshipsTableProps {
  relationships: MaterialRelationship[]
  onRelationshipSelect?: (relationship: MaterialRelationship) => void
  selectedRelationship?: MaterialRelationship | null
  className?: string
}

export function RelationshipsTable({
  relationships,
  onRelationshipSelect,
  selectedRelationship,
  className = '',
}: RelationshipsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRelationships = relationships.filter(
    (rel) =>
      rel.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.object.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.processName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.unit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString()} ${unit}`
  }

  return (
    <>
      <div className="rounded-md border mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Process</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Input Material</TableHead>
              <TableHead className="text-center w-12"></TableHead>
              <TableHead>Output Material</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRelationships.length === 0 ? (
              <TableRow>
                <TableCell
                  // colSpan={6} // @ts-ignore
                  className="text-center py-8 text-muted-foreground"
                >
                  No relationships found
                </TableCell>
              </TableRow>
            ) : (
              filteredRelationships.map((relationship, index) => (
                <TableRow
                  key={`${relationship.subject.uuid}-${relationship.object.uuid}-${relationship.processName}-${relationship.quantity}-${relationship.unit}-${index}`}
                  className={`cursor-pointer transition-colors ${
                    selectedRelationship?.subject.uuid ===
                      relationship.subject.uuid &&
                    selectedRelationship?.object.uuid ===
                      relationship.object.uuid &&
                    selectedRelationship?.processName ===
                      relationship.processName
                      ? 'bg-muted/50 border-l-4 border-l-primary'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => onRelationshipSelect?.(relationship)}
                >
                  <TableCell>
                    {relationship.processName && (
                      <span className="text-sm font-medium">
                        {relationship.processName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <Badge variant="secondary">
                      {formatQuantity(relationship.quantity, relationship.unit)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {relationship.subject.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {relationship.subject.uuid}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {relationship.object.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {relationship.object.uuid}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Badge variant="outline" className="mt-4">
        {filteredRelationships.length} of {relationships.length}
      </Badge>
    </>
  )
}
