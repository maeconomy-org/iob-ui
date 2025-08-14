import { Control, useFieldArray, useFormContext } from 'react-hook-form'
import { PlusIcon, XIcon } from 'lucide-react'

import { generateUUIDv7 } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

interface PropertyFieldProps {
  control: Control<any>
  name: string
  index: number
  onRemove: () => void
}

export function PropertyField({
  control,
  name,
  index,
  onRemove,
}: PropertyFieldProps) {
  const { setValue, getValues } = useFormContext()
  const valuesName = `${name}.values`
  const filesName = `${name}.files`

  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: valuesName,
  })

  const {
    fields: fileFields,
    append: appendFile,
    remove: removeFile,
  } = useFieldArray({
    control,
    name: filesName,
  })

  const handleAddValue = () => {
    appendValue({
      uuid: '',
      value: '',
      files: [],
    })
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

  const handleAddValueFile = (valueIndex: number) => {
    // Get the current form values
    const valueFilePath = `${valuesName}.${valueIndex}.files`
    const currentFiles = getValues(valueFilePath) || []

    // Create the new file object
    const newFile = {
      uuid: generateUUIDv7(),
      name: `Value-File-${Math.floor(Math.random() * 1000)}.pdf`,
      size: `${Math.floor(Math.random() * 1000)}KB`,
      uploadedAt: new Date().toISOString(),
    }

    // Update the form value using setValue
    setValue(valueFilePath, [...currentFiles, newFile], {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`property-${index}`} className="text-sm">
              Property Name
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRemove}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={control}
            name={`${name}.key`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id={`property-${index}`}
                    placeholder="e.g. Total Floors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Property Values</Label>

        {valueFields.map((valueField, valueIndex) => (
          <div key={valueField.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`${valuesName}.${valueIndex}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1 m-0">
                    <FormControl>
                      <Input placeholder="Enter property value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TODO: Update when we have proper file upload api */}
              {/* <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddValueFile(valueIndex)}
                title="Add file to value"
              >
                <Upload className="h-4 w-4" />
              </Button> */}

              {valueFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeValue(valueIndex)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* TODO: Update when we have proper file upload api */}
            {/* <Controller
              control={control}
              name={`${valuesName}.${valueIndex}.files`}
              render={({ field }) => (
                <>
                  {field.value && field.value.length > 0 && (
                    <div className="ml-2 space-y-1 text-sm">
                      {field.value.map((file: any, fileIndex: number) => (
                        <div
                          key={`file-${fileIndex}`}
                          className="flex items-center justify-between p-1 hover:bg-muted/50 rounded"
                        >
                          <div className="flex items-center">
                            <File className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              const newFiles = [...field.value]
                              newFiles.splice(fileIndex, 1)
                              field.onChange(newFiles)
                            }}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            /> */}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={handleAddValue}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Another Value
        </Button>
      </div>

      {/* TODO: Update when we have proper file upload api */}
      {/* <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm">Property Files</Label>
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

        <Controller
          control={control}
          name={filesName}
          render={({ field }) => (
            <>
              {field.value && field.value.length > 0 ? (
                <div className="space-y-1">
                  {field.value.map((file: any, fileIndex: number) => (
                    <div
                      key={`property-file-${fileIndex}`}
                      className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded"
                    >
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          const newFiles = [...field.value]
                          newFiles.splice(fileIndex, 1)
                          field.onChange(newFiles)
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No files attached to this property
                </div>
              )}
            </>
          )}
        />
      </div> */}
    </div>
  )
}
