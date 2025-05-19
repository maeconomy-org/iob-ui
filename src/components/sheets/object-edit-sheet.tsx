'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Upload, File, Loader2 } from 'lucide-react'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  toast,
} from '@/components/ui'
import { PropertyField } from '@/components/forms'
import {
  objectSchema,
  ObjectFormValues,
  Property,
} from '@/lib/validations/object-model'
import { useObjects } from '@/hooks'

interface ObjectEditSheetProps {
  isOpen: boolean
  onClose: () => void
  object?: any
  objectUuid?: string // Add objectUuid as an alternative to passing the full object
  availableModels: any[]
  availableObjects?: any[]
  mode: 'add' | 'edit'
  onSave?: (object: any, originalObject?: any) => void
}

export function ObjectEditSheet({
  isOpen,
  onClose,
  object,
  objectUuid,
  availableModels = [],
  availableObjects = [],
  mode,
  onSave,
}: ObjectEditSheetProps) {
  const isAddMode = mode === 'add'

  // Get object mutations from iob-client
  const { useFullObject } = useObjects()

  // Fetch full object data if objectUuid is provided
  const { data: fullObjectData, isLoading: isLoadingObject } = useFullObject(
    objectUuid || '',
    {
      enabled: !!objectUuid && isOpen && mode === 'edit',
    }
  )

  const [processedObject, setProcessedObject] = useState<any>(null)

  // Use either passed object or fetched object data
  const objectData = fullObjectData || object

  // Whether any operation is currently loading
  const isLoading = isLoadingObject

  const form = useForm<ObjectFormValues>({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      uuid: '',
      name: '',
      abbreviation: '',
      version: '',
      description: '',
      parentUuid: undefined,
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
    if (objectData && mode === 'edit') {
      console.log('Initializing form with object data:', objectData)

      // Process properties from the full object format
      let convertedProperties = []

      // Handle different property formats from the API
      if (objectData.properties) {
        // Check if we have the full object format with property groups
        if (
          Array.isArray(objectData.properties) &&
          objectData.properties.some((p: any) => p.property)
        ) {
          convertedProperties = objectData.properties.map((propGroup: any) => {
            // Extract property metadata from the first property item
            const propMeta = propGroup.property?.[0] || {}

            // Extract values
            const values =
              propGroup.values?.map((valueObj: any) => ({
                uuid: valueObj.value?.[0]?.uuid || generateUUIDv7(),
                value: valueObj.value?.[0]?.value || '',
                files: valueObj.files || [],
              })) || []

            return {
              uuid: propMeta.uuid || generateUUIDv7(),
              key: propMeta.key || '',
              label: propMeta.label || '',
              description: propMeta.description || '',
              type: propMeta.type || '',
              values:
                values.length > 0
                  ? values
                  : [
                      {
                        uuid: generateUUIDv7(),
                        value: '',
                        files: [],
                      },
                    ],
              files: propGroup.files || [],
            }
          })
        } else {
          // Handle simple property format
          convertedProperties = objectData.properties.map((prop: any) => {
            // Check if property is already in edit-friendly format
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
          })
        }
      }

      // Process files
      const processedFiles =
        objectData.files?.map((file: any) => ({
          uuid: file.uuid,
          name: file.name || file.label || 'File',
          size: file.size || '',
          uploadedAt: file.uploadedAt || new Date().toISOString(),
        })) || []

      // Get basic object data from the first object in the array if it exists
      const objectInfo = Array.isArray(objectData.object)
        ? objectData.object[0]
        : objectData

      const obj = {
        uuid: objectInfo.uuid || '',
        name: objectInfo.name || '',
        abbreviation: objectInfo.abbreviation || '',
        version: objectInfo.version || '',
        description: objectInfo.description || '',
        parentUuid: objectInfo.parentUuid || undefined,
        properties: convertedProperties.length > 0 ? convertedProperties : [],
        // files: processedFiles,
        modelUuid: objectInfo.modelUuid || '',
      }
      form.reset(obj)
      setProcessedObject(obj)
    } else if (isAddMode) {
      form.reset({
        uuid: '',
        name: '',
        abbreviation: '',
        version: '',
        description: '',
        parentUuid: undefined,
        properties: [],
        files: [],
      })
    }
  }, [objectData, mode, isOpen, form, isAddMode])

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

  const handleSubmit = async (values: ObjectFormValues) => {
    try {
      if (onSave) {
        onSave(values, processedObject)
      }

      onClose()
      form.reset()
    } catch (error: any) {
      console.error('Error saving object:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save object',
        variant: 'destructive',
      })
    }
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
      properties: newProperties.length > 0 ? newProperties : [],
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
        {isLoadingObject ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading object data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <SheetHeader>
                <SheetTitle>
                  {isAddMode ? 'Add Object' : 'Edit Object'}
                </SheetTitle>
                <SheetDescription>
                  {isAddMode
                    ? 'Create a new object with properties'
                    : 'Modify the object details and properties'}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 py-6">
                {/* {isAddMode && (
                  <FormItem>
                    <FormLabel htmlFor="model">
                      Object Model (Optional)
                    </FormLabel>
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
                )} */}

                <div className="grid grid-cols-1 gap-4">
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

                  {/* <FormItem>
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
                  </FormItem> */}
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

                {/* TODO: Update when we have proper file upload api */}
                {/* <div className="space-y-2">
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
                </div> */}

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
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                        {isAddMode ? 'Creating...' : 'Updating...'}
                      </>
                    ) : isAddMode ? (
                      'Create'
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  )
}
