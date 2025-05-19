'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'

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
} from '@/components/ui'
import { PropertyField } from '@/components/forms'
import {
  objectSchema,
  ObjectFormValues,
  Property,
} from '@/lib/validations/object-model'
import { useObjects } from '@/hooks'

interface ObjectAddSheetProps {
  isOpen: boolean
  onClose: () => void
  availableModels: any[]
  availableObjects?: any[]
  onSave?: (object: any) => void
}

export function ObjectAddSheet({
  isOpen,
  onClose,
  availableModels = [],
  availableObjects = [],
  onSave,
}: ObjectAddSheetProps) {
  // Whether any operation is currently loading
  const [isLoading, setIsLoading] = useState(false)

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

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        uuid: '',
        name: '',
        abbreviation: '',
        version: '',
        description: '',
        parentUuid: undefined,
        properties: [],
        files: [],
        modelUuid: '',
      })
    }
  }, [isOpen, form])

  const createEmptyProperty = (): Property => {
    return {
      uuid: '',
      key: '',
      values: [
        {
          uuid: '',
          value: '',
          files: [],
        },
      ],
      files: [],
    }
  }

  const handleSubmit = async (values: ObjectFormValues) => {
    try {
      setIsLoading(true)
      if (onSave) {
        onSave(values)
      }

      onClose()
      form.reset()
    } catch (error: any) {
      console.error('Error creating object:', error)
      toast.error(error.message || 'Failed to create object')
    } finally {
      setIsLoading(false)
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
        uuid: '',
        values: (prop.values || [{ value: prop.value || '' }]).map(
          (val: any) => ({
            ...val,
            uuid: '',
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <SheetHeader>
              <SheetTitle>Add Object</SheetTitle>
              <SheetDescription>
                Create a new object with properties
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-6">
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
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
