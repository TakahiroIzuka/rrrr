'use client'

import React from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { useEffect, useRef, useMemo, useState } from 'react'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  prefecture: string
  area: string
  genre_id: number
}

interface MapPanelProps {
  allClinics: Clinic[]
  filteredClinics: Clinic[]
}

const MapPanel = React.memo(function MapPanel({ allClinics, filteredClinics }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const markersMapRef = useRef<Map<number, google.maps.Marker>>(new Map())
  const loaderRef = useRef<Loader | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

  const center = useMemo(() => {
    if (allClinics.length > 0) {
      const avgLat = allClinics.reduce((sum, clinic) => sum + clinic.lat, 0) / allClinics.length
      const avgLng = allClinics.reduce((sum, clinic) => sum + clinic.lng, 0) / allClinics.length
      return { lat: avgLat, lng: avgLng }
    }
    return { lat: 35.6762, lng: 139.6503 } // Tokyo default
  }, [allClinics])

  const mapOptions = useMemo((): google.maps.MapOptions => ({
    center,
    zoom: 6,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    ...(mapId && { mapId })
  }), [center, mapId])

  // Initialize map once
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured.')
      setIsLoading(false)
      return
    }

    if (!mapRef.current || isMapInitialized) return

    // Create loader only once with all required libraries
    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['maps', 'marker']
      })
    }

    Promise.all([
      loaderRef.current.importLibrary('maps'),
      loaderRef.current.importLibrary('marker')
    ])
      .then(([{ Map }]) => {
        if (mapRef.current && !googleMapRef.current) {
          googleMapRef.current = new Map(mapRef.current, mapOptions)
          setIsMapInitialized(true)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps.')
        setIsLoading(false)
      })

    return () => {
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current)
        googleMapRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [apiKey, mapOptions])

  // Create all markers once from allClinics
  useEffect(() => {
    if (!googleMapRef.current || !isMapInitialized || !loaderRef.current || allClinics.length === 0) return

    // If markers are already created, don't recreate them
    if (markersMapRef.current.size === allClinics.length) return

    loaderRef.current.importLibrary('marker')
      .then(({ AdvancedMarkerElement }) => {
        allClinics.forEach((clinic) => {
          if (typeof clinic.lat !== 'number' || typeof clinic.lng !== 'number') {
            console.error(`Invalid coordinates for clinic ${clinic.name}:`, clinic.lat, clinic.lng)
            return
          }

          // Skip if marker already exists
          if (markersMapRef.current.has(clinic.id)) return

          // Select pin image based on genre_id
          const getPinImage = (genre_id: number): string => {
            switch (genre_id) {
              case 1: // ピラティス
                return '/images/pin_pilates.png'
              case 2: // 内科系
                return '/images/pin_medical.png'
              case 5: // 皮膚科系
                return '/images/pin_purple.png'
              default:
                return '/images/pin_medical.png' // デフォルト
            }
          }

          // Create custom HTML marker element
          const markerDiv = document.createElement('div')
          markerDiv.style.cssText = `
            position: relative;
            display: inline-block;
          `

          markerDiv.innerHTML = `
            <img src="${getPinImage(clinic.genre_id)}" style="
              position: relative;
              width: 42px;
              display: block;
            ">
            <p style="
              position: absolute;
              top: 42%;
              left: 0;
              font-size: 0.6rem;
              width: 42px;
              text-align: center;
              font-family: 'Kosugi Maru', sans-serif;
              color: #a69a7e !important;
              z-index: 1;
              margin: 0;
            ">${clinic.star !== null ? clinic.star : ''}</p>
            <p style="
              position: absolute;
              top: 58%;
              left: 0;
              font-size: 1.0rem;
              width: 42px;
              text-align: center;
              font-family: 'Kosugi Maru', sans-serif;
              color: #a69a7e !important;
              z-index: 1;
              margin: 0;
            ">${clinic.user_review_count}</p>
          `

          const marker = new AdvancedMarkerElement({
            position: { lat: clinic.lat, lng: clinic.lng },
            map: googleMapRef.current,
            title: clinic.name,
            content: markerDiv
          })

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${clinic.name}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📍 ${clinic.prefecture} ${clinic.area}</p>
                ${clinic.star !== null ?
                  `<p style="margin: 0; font-size: 12px;">⭐ ${clinic.star} (${clinic.user_review_count}件)</p>` :
                  `<p style="margin: 0; font-size: 12px; color: #999;">⭐ レビューなし</p>`
                }
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker)
          })

          markersMapRef.current.set(clinic.id, marker)
        })
      })
      .catch((err) => {
        console.error('Error loading markers:', err)
      })
  }, [allClinics, isMapInitialized])

  // Show/hide markers based on filteredClinics
  useEffect(() => {
    if (!googleMapRef.current || !isMapInitialized || markersMapRef.current.size === 0) return

    const filteredIds = new Set(filteredClinics.map(clinic => clinic.id))

    // Only update markers that need to change state
    markersMapRef.current.forEach((marker, clinicId) => {
      const shouldShow = filteredIds.has(clinicId)
      const isCurrentlyVisible = marker.map !== null

      // Only change marker visibility if needed
      if (shouldShow && !isCurrentlyVisible) {
        marker.map = googleMapRef.current
      } else if (!shouldShow && isCurrentlyVisible) {
        marker.map = null
      }
    })
  }, [filteredClinics, isMapInitialized])

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 text-red-600 text-sm text-center p-5 box-border">
        <div>
          <div className="text-base mb-2">⚠️</div>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white bg-opacity-90 z-[1000] text-base text-gray-600">
          Loading Google Maps...
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full"
      />
    </div>
  )
})

export default MapPanel