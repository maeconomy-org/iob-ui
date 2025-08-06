import { IOBClientConfig } from 'iob-client'

export const API_CONFIG: IOBClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL || '',
  uuidServiceBaseUrl: process.env.NEXT_PUBLIC_UUID_API_URL || '',

  debug: {
    enabled: true,
    logLevel: 'info',
    logToConsole: false,
  },
}
