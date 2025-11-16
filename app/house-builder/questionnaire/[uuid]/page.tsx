import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import QuestionnaireForm from '@/components/QuestionnaireForm'
import { fetchFacilityByUuid } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../../constants'
import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'

interface QuestionnairePageProps {
  params: Promise<{
    uuid: string
  }>
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { uuid } = await params

  const { facility, error } = await fetchFacilityByUuid(uuid, SERVICE_CODE)

  if (error || !facility) {
    notFound()
  }

  // Get genre color from REVIEW_RANKING_CONFIG
  const config = REVIEW_RANKING_CONFIG[SERVICE_CODE]
  const genreCode = facility.genre?.code
  const genreColor = genreCode && config.genres?.[genreCode]
    ? config.genres[genreCode].color
    : config.color

  return (
    <>
      <Header pageType="detail" />

      <main className="min-h-screen pt-16 md:pt-0" style={{ backgroundColor: 'rgb(242, 240, 236)' }}>
        <div className="pb-2.5 md:pb-32">
          <QuestionnaireForm
            facilityName={facility.name}
            genreColor={genreColor}
            serviceCode={SERVICE_CODE}
          />
        </div>
      </main>

      <Footer backgroundColor="rgb(254, 246, 228)" />
    </>
  )
}
