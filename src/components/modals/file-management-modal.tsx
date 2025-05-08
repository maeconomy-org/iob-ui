'use client'

import { useState } from 'react'
import { FileText, FileUp, File, X, Plus, Upload } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { generateUUIDv7 } from '@/lib/utils'

interface FileManagementModalProps {
  object: any
  isOpen: boolean
  onClose: () => void
  onSave: (object: any) => void
}

export function FileManagementModal({
  object,
  isOpen,
  onClose,
  onSave,
}: FileManagementModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  if (!object) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    // Simulate upload
    setIsUploading(true)

    // Fake upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)

        // Add the file to the object
        const newFile = {
          uuid: generateUUIDv7(),
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size),
          description: fileDescription,
          type: selectedFile.type,
          uploadedAt: new Date().toISOString(),
        }

        const updatedFiles = [...(object.files || []), newFile]
        onSave({ ...object, files: updatedFiles })

        // Reset form
        setSelectedFile(null)
        setFileDescription('')
        setUploadProgress(0)
        setIsUploading(false)
      }
    }, 300)
  }

  const handleDeleteFile = (fileIndex: number) => {
    const updatedFiles = [...object.files]
    updatedFiles.splice(fileIndex, 1)
    onSave({ ...object, files: updatedFiles })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Manage Files</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="flex gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <Label htmlFor="file-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="file-description"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Enter file description"
                  />

                  {isUploading && (
                    <div className="space-y-1">
                      <div className="text-sm">
                        Uploading: {uploadProgress}%
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {object.files && object.files.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Files</h3>
                {object.files.map((file: any, index: number) => (
                  <div
                    key={file.uuid || index}
                    className="flex items-center justify-between border p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {file.size} • {formatDate(file.uploadedAt)}
                        </div>
                        {file.description && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {file.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Files</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This object doesn't have any files attached. Upload files to
                  keep track of documents, images, and other materials related
                  to this object.
                </p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
