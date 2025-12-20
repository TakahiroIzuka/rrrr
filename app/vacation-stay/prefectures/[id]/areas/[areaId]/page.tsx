import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import { fetchFacilitiesByArea, fetchAreaById, fetchFacilitiesImages } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../../../../constants'

interface AreaPageProps {
  params: Promise<{
    id: string
    areaId: string
  }>
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { id: prefectureId, areaId } = await params

  // Get area information
  const { area, error: areaError } = await fetchAreaById(areaId)

  if (areaError || !area) {
    notFound()
  }

  // Verify that the area belongs to the prefecture in the URL
  const areaPrefecture = area.prefecture as unknown as { id: number } | null
  if (areaPrefecture && areaPrefecture.id !== parseInt(prefectureId)) {
    notFound()
  }

  // Get facilities filtered by area_id
  const { facilities, error } = await fetchFacilitiesByArea(areaId, SERVICE_CODE)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Fetch images for all facilities
  const facilityIds = facilities?.map(f => f.id) || []
  const { imagesMap } = await fetchFacilitiesImages(facilityIds)

  // Cast area to include lat/lng (guaranteed by NOT NULL constraint)
  const areaWithCoords = area as unknown as { id: number; name: string; lat: number; lng: number }

  return (
    <HomeClient
      facilities={facilities || []}
      areaId={area.id}
      areaName={area.name}
      imagesMap={imagesMap}
      initialCenter={{ lat: areaWithCoords.lat, lng: areaWithCoords.lng }}
      initialZoom={13}
    />
  )
}
