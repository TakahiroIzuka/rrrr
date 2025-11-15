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

/**
 * Review ranking configuration for each service
 */
export const REVIEW_RANKING_CONFIG = {
  [SERVICE_CODES.MEDICAL]: {
    title: 'メディカルクチコミランキング',
    imagePath: '/medical/icon.png',
    buttonText: 'クリニックの掲載リクエストはこちら',
  },
  [SERVICE_CODES.KUCHIKOMIRU]: {
    title: 'クチコミルランキング',
    imagePath: '/kuchikomiru/icon.png',
    buttonText: '施設の掲載リクエストはこちら',
  },
} as const
