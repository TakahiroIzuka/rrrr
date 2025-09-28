'use client'

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
  clinics?: Clinic[]
}

export default function MapPanel({ clinics = [] }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

  const center = useMemo(() => {
    if (clinics.length > 0) {
      const avgLat = clinics.reduce((sum, clinic) => sum + clinic.lat, 0) / clinics.length
      const avgLng = clinics.reduce((sum, clinic) => sum + clinic.lng, 0) / clinics.length
      return { lat: avgLat, lng: avgLng }
    }
    return { lat: 35.6762, lng: 139.6503 } // Tokyo default
  }, [clinics])

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

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured.')
      setIsLoading(false)
      return
    }

    if (!mapRef.current) return

    // Clear existing markers first
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    markersRef.current = []

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['maps', 'marker']
    })

    Promise.all([
      loader.importLibrary('maps'),
      loader.importLibrary('marker')
    ])
      .then(([{ Map }, { AdvancedMarkerElement }]) => {
        if (mapRef.current && !googleMapRef.current) {
          googleMapRef.current = new Map(mapRef.current, mapOptions)
        }

        // Always add markers when clinics data changes
        if (googleMapRef.current) {
          console.log('Creating markers for', clinics.length, 'clinics:')

          clinics.forEach((clinic, index) => {
            if (typeof clinic.lat !== 'number' || typeof clinic.lng !== 'number') {
              console.error(`Invalid coordinates for clinic ${clinic.name}:`, clinic.lat, clinic.lng)
              return
            }

            console.log(`Creating marker ${index + 1}:`, {
              id: clinic.id,
              name: clinic.name,
              lat: clinic.lat,
              lng: clinic.lng
            })

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
                top: 38%;
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
                top: 50%;
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

            markersRef.current.push(marker)
          })

          console.log(`Successfully created ${markersRef.current.length} markers`)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps.')
        setIsLoading(false)
      })

    return () => {
      // Clear markers
      markersRef.current.forEach((marker) => {
        marker.setMap(null)
      })
      markersRef.current = []

      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current)
        googleMapRef.current = null
      }
    }
  }, [apiKey, mapOptions, clinics])

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#dc2626',
        fontSize: '14px',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>⚠️</div>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          fontSize: '16px',
          color: '#666'
        }}>
          Loading Google Maps...
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100vh'
        }}
      />
    </div>
  )
}