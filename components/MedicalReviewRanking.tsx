import ReviewRanking from './ReviewRanking'

interface MedicalReviewRankingProps {
  variant?: 'mobile' | 'desktop'
}

export default function MedicalReviewRanking({ variant = 'desktop' }: MedicalReviewRankingProps) {
  return (
    <ReviewRanking
      variant={variant}
      serviceCode="medical"
      title="メディカルクチコミランキング"
      imagePath="/mrr/pin-profile.png"
    />
  )
}
