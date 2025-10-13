/**
 * Service code constants
 */
export const SERVICE_CODES = {
  MEDICAL: 'medical',
  KUCHIKOMIRU: 'kuchikomiru',
  HOUSE_BUILDER: 'house-builder',
  VACATION_STAY: 'vacation-stay',
} as const

export type ServiceCode = typeof SERVICE_CODES[keyof typeof SERVICE_CODES]
