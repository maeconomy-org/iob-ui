'use client'

import { useEffect } from 'react'
import { Plus, X, Upload, File } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'

import { generateUUIDv7 } from '@/lib/utils'
import {
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Textarea,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui'
import { PropertyField } from '@/components/forms'
import {
  objectSchema,
  ObjectFormValues,
  Property,
} from '@/lib/validations/object-model'

interface ObjectEditSheetProps {
  isOpen: boolean
  onClose: () => void
  object?: any
  availableModels: any[]
  availableObjects?: any[]
  mode: 'add' | 'edit'
  onSave?: (object: any) => void
}

export function ObjectEditSheet({
  isOpen,
  onClose,
  object,
  availableModels = [],
  availableObjects = [],
  mode,
  onSave,
}: ObjectEditSheetProps) {
  const isAddMode = mode === 'add'

  const form = useForm<ObjectFormValues>({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      uuid: '',
      name: '',
      abbreviation: '',
      version: '',
      description: '',
      parentUuid: '',
      properties: [],
      files: [],
      modelUuid: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'properties',
  })

  const {
    fields: fileFields,
    append: appendFile,
    remove: removeFile,
  } = useFieldArray({
    control: form.control,
    name: 'files',
  })

  // Initialize form data when editing an existing object
  useEffect(() => {
    if (object && mode === 'edit') {
      // Convert old property format to new format if needed
      const convertedProperties =
        object.properties?.map((prop: any) => {
          // Check if property is already in new format
          if (prop.values) {
            return prop
          }

          // Convert old format to new format
          return {
            uuid: prop.uuid || generateUUIDv7(),
            key: prop.key,
            values: [
              {
                uuid: generateUUIDv7(),
                value: prop.value,
                files: [],
              },
            ],
            files: [],
          }
        }) || []

      form.reset({
        uuid: object.uuid || generateUUIDv7(),
        name: object.name || '',
        abbreviation: object.abbreviation || '',
        version: object.version || '',
        description: object.description || '',
        parentUuid: object.parentUuid || '',
        properties:
          convertedProperties.length > 0
            ? convertedProperties
            : [createEmptyProperty()],
        files: object.files || [],
        modelUuid: object.modelUuid || '',
      })
    } else {
      // Reset form for new objects
      form.reset({
        uuid: generateUUIDv7(),
        name: '',
        abbreviation: '',
        version: '',
        description: '',
        parentUuid: '',
        properties: [createEmptyProperty()],
        files: [],
        modelUuid: '',
      })
    }
  }, [object, mode, isOpen, form])

  const createEmptyProperty = (): Property => {
    return {
      uuid: generateUUIDv7(),
      key: '',
      values: [
        {
          uuid: generateUUIDv7(),
          value: '',
          files: [],
        },
      ],
      files: [],
    }
  }

  const handleSubmit = (values: ObjectFormValues) => {
    if (onSave) {
      // Add timestamps
      const timestamp = new Date().toISOString()
      const updatedObject = {
        ...values,
        updatedAt: timestamp,
        createdAt: object?.createdAt || timestamp,
      }

      onSave(updatedObject)
    }
    onClose()
  }

  const handleModelSelect = (modelUuid: string) => {
    if (modelUuid === '_none') {
      form.setValue('modelUuid', '')
      return
    }

    const selectedModel = availableModels.find((m) => m.uuid === modelUuid)
    if (!selectedModel) return

    // Deep clone the model properties to avoid reference issues
    const clonedProperties = JSON.parse(
      JSON.stringify(selectedModel.properties || [])
    )

    // Generate new UUIDs for the cloned properties
    const newProperties = clonedProperties.map((prop: any) => {
      const newProp = {
        ...prop,
        uuid: generateUUIDv7(),
        values: (prop.values || [{ value: prop.value || '' }]).map(
          (val: any) => ({
            ...val,
            uuid: generateUUIDv7(),
          })
        ),
      }
      return newProp
    })

    // Update the form with model data
    form.reset({
      ...form.getValues(),
      name: selectedModel.name,
      abbreviation: selectedModel.abbreviation || '',
      version: selectedModel.version || '',
      description: selectedModel.description || '',
      properties:
        newProperties.length > 0 ? newProperties : [createEmptyProperty()],
      modelUuid: selectedModel.uuid,
    })
  }

  const addProperty = () => {
    append(createEmptyProperty())
  }

  const handleAddFile = () => {
    // In a real app, this would open a file picker
    appendFile({
      uuid: generateUUIDv7(),
      name: `File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <SheetHeader>
              <SheetTitle>
                {isAddMode ? 'Add Object' : 'Edit Object'}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4 py-6">
              {isAddMode && (
                <FormItem>
                  <FormLabel htmlFor="model">Object Model (Optional)</FormLabel>
                  <Select
                    value={form.watch('modelUuid') || '_none'}
                    onValueChange={handleModelSelect}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model to create instance from" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {availableModels.map((model) => (
                        <SelectItem key={model.uuid} value={model.uuid}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter object name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Parent Object</FormLabel>
                  <Select
                    value={form.watch('parentUuid') || '_none'}
                    onValueChange={(value) =>
                      form.setValue(
                        'parentUuid',
                        value === '_none' ? '' : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {availableObjects.map((obj) => (
                        <SelectItem key={obj.uuid} value={obj.uuid}>
                          {obj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="abbreviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abbreviation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Abbreviation (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="Version (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter object description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Files</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add File
                  </Button>
                </div>

                {fileFields.length > 0 ? (
                  <div className="space-y-2 border rounded-md p-2">
                    {fileFields.map((file, index) => (
                      <div
                        key={file.uuid}
                        className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded"
                      >
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({file.size})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No files attached
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Properties</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProperty}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <PropertyField
                      key={field.uuid}
                      control={form.control}
                      name={`properties.${index}`}
                      index={index}
                      onRemove={() => remove(index)}
                    />
                  ))}

                  {fields.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        No properties added yet
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addProperty}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Property
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <SheetFooter className="border-t pt-4">
              <div className="flex w-full justify-between items-center gap-2">
                <Button
                  className="w-full"
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button className="w-full" type="submit">
                  Save
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
