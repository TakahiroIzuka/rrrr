import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import Header from '@/components/Header'
import Breadcrumb from '@/components/Breadcrumb'
import Footer from '@/components/Footer'
import { fetchFacilitiesByPrefecture, fetchPrefectureById, fetchFacilitiesImages } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../../constants'

interface PrefecturePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PrefecturePage({ params }: PrefecturePageProps) {
  const { id } = await params

  // Get prefecture information
  const { prefecture, error: prefectureError } = await fetchPrefectureById(id)

  if (prefectureError || !prefecture) {
    notFound()
  }

  // Get facilities filtered by prefecture_id
  const { facilities, error } = await fetchFacilitiesByPrefecture(id, SERVICE_CODE)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Fetch images for all facilities
  const facilityIds = facilities?.map(f => f.id) || []
  const { imagesMap } = await fetchFacilitiesImages(facilityIds)

  const breadcrumbItems = [
    { label: 'トップ', href: `/${SERVICE_CODE}` },
    { label: prefecture.name }
  ]

  return (
    <>
      <Header
        labelText={prefecture.name}
        pageType="genre-top"
      />
      <div className="hidden md:block md:mt-0">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <HomeClient
        facilities={facilities || []}
        prefectureId={prefecture.id}
        prefectureName={prefecture.name}
        imagesMap={imagesMap}
      />
      <Footer pageType="genre-top" />
    </>
  )
}
