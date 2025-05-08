import * as z from 'zod'

export const propertyValueSchema = z.object({
  uuid: z.string(),
  value: z.string().min(1, 'Value is required'),
  files: z.array(z.any()),
})

export const propertySchema = z.object({
  uuid: z.string(),
  key: z.string().min(1, 'Property name is required'),
  values: z.array(propertyValueSchema),
  files: z.array(z.any()),
})

export const objectModelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().min(1, 'Description is required'),
  properties: z.array(propertySchema),
})

export const objectSchema = z.object({
  uuid: z.string(),
  name: z.string().min(1, 'Name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().min(1, 'Description is required'),
  parentUuid: z.string().optional(),
  properties: z.array(propertySchema),
  files: z.array(z.any()),
  modelUuid: z.string().optional(),
})

export type ObjectModelFormValues = z.infer<typeof objectModelSchema>
export type ObjectFormValues = z.infer<typeof objectSchema>
export type PropertyValue = z.infer<typeof propertyValueSchema>
export type Property = z.infer<typeof propertySchema>
