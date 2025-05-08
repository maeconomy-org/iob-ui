import { useEffect } from 'react'
import { PlusIcon } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Button,
} from '@/components/ui'
import { generateUUIDv7 } from '@/lib/utils'
import { PropertyField } from '@/components/forms'
import {
  objectModelSchema,
  ObjectModelFormValues,
  Property,
} from '@/lib/validations/object-model'

interface ObjectModel {
  uuid: string
  name: string
  abbreviation: string
  version: string
  description: string
  creator: string
  createdAt: string
  updatedAt: string
  properties: Property[]
}

interface ObjectModelSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (model: ObjectModel) => void
  model?: ObjectModel | null
  isEditing?: boolean
}

export function ObjectModelSheet({
  open,
  onOpenChange,
  onSave,
  model = null,
  isEditing = false,
}: ObjectModelSheetProps) {
  const form = useForm<ObjectModelFormValues>({
    resolver: zodResolver(objectModelSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      version: '1.0',
      description: '',
      properties: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'properties',
  })

  // Initialize form when editing an existing model
  useEffect(() => {
    if (model && isEditing) {
      form.reset({
        name: model.name,
        abbreviation: model.abbreviation,
        version: model.version,
        description: model.description,
        properties: model.properties,
      })
    } else {
      form.reset({
        name: '',
        abbreviation: '',
        version: '1.0',
        description: '',
        properties: [],
      })
    }
  }, [model, isEditing, form])

  // Add a new property to the form
  const addProperty = () => {
    append({
      uuid: generateUUIDv7(),
      key: '',
      values: [
        {
          uuid: generateUUIDv7(),
          value: 'Variable',
          files: [],
        },
      ],
      files: [],
    })
  }

  // Handle form submission
  const onSubmit = (values: ObjectModelFormValues) => {
    const timestamp = new Date().toISOString()

    // Prepare the complete model object
    const completeModel: ObjectModel = {
      uuid: model?.uuid || generateUUIDv7(),
      ...values,
      creator: model?.creator || 'User',
      createdAt: model?.createdAt || timestamp,
      updatedAt: timestamp,
    }

    onSave(completeModel)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Object Model' : 'Add Object Model'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update an existing object model and its properties.'
              : 'Create a new object model by entering its details and properties.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            {/* Basic information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. School Building" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="abbreviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abbreviation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SB" {...field} />
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
                        <Input placeholder="e.g. 1.0" {...field} />
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
                        placeholder="Describe the object model..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Properties section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Properties</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProperty}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>

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
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add First Property
                  </Button>
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <SheetFooter>
              <Button type="submit">
                {isEditing ? 'Update Model' : 'Create Model'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
