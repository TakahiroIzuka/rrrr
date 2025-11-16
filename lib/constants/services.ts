/**
 * Service code constants
 */
export const SERVICE_CODES = {
  MEDICAL: 'medical',
  HOUSE_BUILDER: 'house-builder',
  VACATION_STAY: 'vacation-stay',
} as const

export type ServiceCode = typeof SERVICE_CODES[keyof typeof SERVICE_CODES]

/**
 * Review ranking configuration for each service
 */
export const REVIEW_RANKING_CONFIG = {
  [SERVICE_CODES.MEDICAL]: {
    buttonText: 'クリニック・施設の掲載リクエストはこちら',
    copyRightText: 'Medical Review Ranking.',
    lineColor: 'rgb(165, 153, 126)',
    color: 'rgb(165, 153, 126)',
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
  [SERVICE_CODES.HOUSE_BUILDER]: {
    buttonText: '住宅会社の掲載リクエストはこちら',
    copyRightText: 'House Builder Review Ranking.',
    lineColor: 'rgb(248, 176, 66)',
    color: 'rgb(248, 176, 66)',
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
  [SERVICE_CODES.VACATION_STAY]: {
    buttonText: '宿泊施設の掲載リクエストはこちら',
    copyRightText: 'Vacation Stay Review Ranking.',
    lineColor: 'rgb(165, 153, 126)',
    color: 'rgb(165, 153, 126)',
    genres: {},
  },
} as const
