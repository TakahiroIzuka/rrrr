import ReviewRanking from './ReviewRanking'

interface KuchikomiruReviewRankingProps {
  variant?: 'mobile' | 'desktop'
}

export default function KuchikomiruReviewRanking({ variant = 'desktop' }: KuchikomiruReviewRankingProps) {
  return (
    <ReviewRanking
      variant={variant}
      serviceCode="kuchikomiru"
      title="クチコミルランキング"
      imagePath="/kuchikomiru/pin-profile.png"
    />
  )
}
