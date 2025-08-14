'use client'

import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'

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
import { objectSchema, ObjectFormValues } from '@/lib/validations/object-model'
import { HereAddressAutocomplete } from '@/components/ui'
import { useObjectOperations, useParentLookup } from '../hooks'
import { ParentSelector, type ParentObject } from './ParentSelector'

// Import utilities
import { createEmptyProperty } from '../utils'

interface ObjectAddSheetProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (object: any) => void
}

export function ObjectAddSheet({
  isOpen,
  onClose,
  onSave,
}: ObjectAddSheetProps) {
  const { createObject, isCreating } = useObjectOperations({
    isEditing: false,
    onRefetch: onSave ? () => onSave({}) : undefined, // Wrap onSave to match signature
  })

  const form = useForm<ObjectFormValues>({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      version: '',
      description: '',
      address: undefined,
      parents: [],
      properties: [],
      files: [],
      modelUuid: undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'properties',
  })

  // Watch address field for display
  const watchedAddress = form.watch('address')

  // Watch parent UUIDs field
  const watchedParents = form.watch('parents') || []

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: '',
        abbreviation: '',
        version: '',
        description: '',
        parents: [],
        properties: [],
        files: [],
        modelUuid: undefined,
      })
    }
  }, [isOpen, form])

  const handleSubmit = async (values: ObjectFormValues) => {
    const success = await createObject(values)

    if (success) {
      onClose()
      form.reset()
    }
  }

  const addProperty = () => {
    append(createEmptyProperty())
  }

  // Use the parent lookup hook to get full parent objects
  const selectedParents = useParentLookup(watchedParents)

  const handleParentsChange = (parents: ParentObject[]) => {
    form.setValue(
      'parents',
      parents.map((p) => p.uuid)
    )
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

              {/* Parent Objects Section */}
              <div className="space-y-4">
                <ParentSelector
                  selectedParents={selectedParents}
                  onParentsChange={handleParentsChange}
                  placeholder="Search for parent objects..."
                  maxSelections={50}
                />
              </div>

              <Separator />

              {/* Address Section */}
              <div className="space-y-4">
                <FormLabel>Address</FormLabel>

                <HereAddressAutocomplete
                  value={watchedAddress?.fullAddress || ''}
                  placeholder="Search for building address..."
                  onAddressSelect={(fullAddress, components) => {
                    form.setValue('address', { fullAddress, components })
                  }}
                />

                {watchedAddress?.components && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      📍 {watchedAddress.components.street}{' '}
                      {watchedAddress.components.houseNumber}
                    </div>
                    <div>
                      🏘️ {watchedAddress.components.city},{' '}
                      {watchedAddress.components.postalCode},{' '}
                      {watchedAddress.components.country}
                    </div>
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
                      key={field.uuid !== '' ? field.uuid : index}
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
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button className="w-full" type="submit" disabled={isCreating}>
                  {isCreating ? (
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
