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
    headerImagePath: '/medical/default/logo_header.png',
    buttonText: 'クリニック・施設の掲載リクエストはこちら',
    serviceName: 'メディカル',
    genres: {
      'pilates': {
        lineColor: 'rgb(238, 154, 162)',
        color: 'rgb(238, 154, 162)',
      },
      'medical': {
        lineColor: 'rgb(172, 209, 230)',
        color: 'rgb(172, 209, 230)',
      },
      'surgery': {
        lineColor: 'rgb(172, 209, 230)',
        color: 'rgb(172, 209, 230)',
      },
      'dental': {
        lineColor: 'rgb(172, 209, 230)',
        color: 'rgb(172, 209, 230)',
      },
      'dermatology': {
        lineColor: 'rgb(220, 194, 219)',
        color: 'rgb(220, 194, 219)',
      },
    },
  },
  [SERVICE_CODES.KUCHIKOMIRU]: {
    title: 'クチコミルランキング',
    iconImagePath: '/kuchikomiru/icon.png',
    footerImagePath: '/kuchikomiru/default/logo_footer.png',
    headerImagePath: '/kuchikomiru/default/logo_header.png',
    buttonText: '地域密着店舗・施設の掲載リクエストはこちら',
    serviceName: 'クチコミル',
    genres: {
      'cosmetic-dermatology': {
        lineColor: 'rgb(220, 194, 219)',
        color: 'rgb(220, 194, 219)',
      },
      'wedding-venue': {
        lineColor: 'rgb(236, 106, 82)',
        color: 'rgb(236, 106, 82)',
      },
      'house-builder': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'vacation-stay': {
        lineColor: 'rgb(163, 151, 125)',
        color: 'rgb(163, 151, 125)',
      },
      'restaurant': {
        lineColor: 'rgb(236, 106, 82)',
        color: 'rgb(236, 106, 82)',
      },
    },
  },
  [SERVICE_CODES.HOUSE_BUILDER]: {
    title: '住宅会社ランキング',
    iconImagePath: '/house-builder/icon.png',
    footerImagePath: '/house-builder/default/logo_footer.png',
    headerImagePath: '/house-builder/default/logo_header.png',
    buttonText: '住宅会社の掲載リクエストはこちら',
    serviceName: '住宅会社',
    genres: {
      'house-maker-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'house-builder-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'first-class-architect-office-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'real-estate-company-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'koumuten-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
      'construction-company-term': {
        lineColor: 'rgb(248, 176, 66)',
        color: 'rgb(248, 176, 66)',
      },
    },
  },
} as const
