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
    iconImagePath: '/medical/icon.png',
    footerImagePath: '/medical/default/logo_footer.png',
    buttonText: 'クリニック・施設の掲載リクエストはこちら',
    serviceName: 'メディカル',
  },
  [SERVICE_CODES.KUCHIKOMIRU]: {
    title: 'クチコミルランキング',
    iconImagePath: '/kuchikomiru/icon.png',
    footerImagePath: '/kuchikomiru/default/logo_footer.png',
    buttonText: '地域密着店舗・施設の掲載リクエストはこちら',
    serviceName: 'クチコミル',
  },
  [SERVICE_CODES.HOUSE_BUILDER]: {
    title: '住宅会社ランキング',
    iconImagePath: '/house-builder/icon.png',
    footerImagePath: '/house-builder/default/logo_footer.png',
    buttonText: '住宅会社の掲載リクエストはこちら',
    serviceName: '住宅会社',
  },
} as const
