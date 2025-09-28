'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { useEffect, useRef, useMemo, useState } from 'react'

export default function FullScreenMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

  const center = useMemo(() => ({ lat: 35.6762, lng: 139.6503 }), []) // Tokyo

  const mapOptions = useMemo((): google.maps.MapOptions => ({
    center,
    zoom: 10,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    clickableIcons: false,
    ...(mapId && { mapId })
  }), [center, mapId])

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.')
      setIsLoading(false)
      return
    }

    if (!mapRef.current) return

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['maps']
    })

    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        if (mapRef.current && !googleMapRef.current) {
          googleMapRef.current = new Map(mapRef.current, mapOptions)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps. Please check your API key and network connection.')
        setIsLoading(false)
      })

    return () => {
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current)
        googleMapRef.current = null
      }
    }
  }, [apiKey, mapOptions])

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#333',
        fontSize: '16px',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {error}
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          fontSize: '18px',
          color: '#666'
        }}>
          Loading Google Maps...
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100vw',
          height: '100dvh'
        }}
      />
    </>
  )
}