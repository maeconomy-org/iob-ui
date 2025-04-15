import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v7 as uuidv7 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a UUID v7 using the uuid package
 */
export function generateUUIDv7(): string {
  // give some properties so that the uuid is more unique as uuidv7 uses the current time
  return uuidv7()
}
