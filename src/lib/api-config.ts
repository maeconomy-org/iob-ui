import { IOBClientConfig } from 'iob-client'

export const API_CONFIG: IOBClientConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_API_URL || 'https://maeconomy.recheck.io:9443',
  uuidServiceBaseUrl:
    process.env.NEXT_PUBLIC_UUID_URL || 'https://maeconomy.recheck.io:8443',

  debug: {
    enabled: true,
    logLevel: 'info',
    logToConsole: false,
  },
}
