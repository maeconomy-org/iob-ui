export const API_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_API_URL || 'https://maeconomy.recheck.io:9443',
  uuidServiceBaseUrl:
    process.env.NEXT_PUBLIC_UUID_URL || 'https://maeconomy.recheck.io:8443',

  debug: {
    enabled: true,
    logLevel: 'debug',
  },
}
