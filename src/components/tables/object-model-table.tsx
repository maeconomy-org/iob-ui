import { PencilIcon, TrashIcon } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface ObjectModel {
  uuid: string
  name: string
  abbreviation: string
  version: string
  description: string
  creator: string
  createdAt: string
  updatedAt: string
  properties: any[]
}

interface ObjectModelsTableProps {
  models: ObjectModel[]
  onEdit: (model: ObjectModel) => void
  onDelete: (uuid: string) => void
}

export function ObjectModelsTable({
  models,
  onEdit,
  onDelete,
}: ObjectModelsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Abbreviation</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>UUID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.uuid}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>{model.abbreviation}</TableCell>
              <TableCell>{model.version}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {model.uuid}
              </TableCell>
              <TableCell>
                {new Date(model.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(model)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(model.uuid)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
