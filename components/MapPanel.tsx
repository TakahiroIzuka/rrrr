'use client'

import React, { useEffect, useRef, useMemo, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Facility } from '@/types/facility'
import { MAP_PIN_IMAGES } from '@/lib/constants'

interface MapPanelProps {
  allFacilities: Facility[]
  filteredFacilities: Facility[]
  onFacilitySelect?: (facilityId: number | null) => void
}

const MapPanel = React.memo(function MapPanel({ allFacilities, filteredFacilities, onFacilitySelect }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const markersMapRef = useRef<Map<number, google.maps.Marker>>(new Map())
  const loaderRef = useRef<Loader | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

  const center = useMemo(() => {
    if (allFacilities.length > 0) {
      const validFacilities = allFacilities.filter(facility => facility.detail?.lat && facility.detail?.lng)
      if (validFacilities.length > 0) {
        const avgLat = validFacilities.reduce((sum, facility) => sum + (facility.detail?.lat || 0), 0) / validFacilities.length
        const avgLng = validFacilities.reduce((sum, facility) => sum + (facility.detail?.lng || 0), 0) / validFacilities.length
        return { lat: avgLat, lng: avgLng }
      }
    }
    return { lat: 35.6762, lng: 139.6503 } // Tokyo default
  }, [allFacilities])

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

  // Create all markers once from allFacilities
  useEffect(() => {
    if (!googleMapRef.current || !isMapInitialized || !loaderRef.current || allFacilities.length === 0) return

    // If markers are already created, don't recreate them
    if (markersMapRef.current.size === allFacilities.length) return

    loaderRef.current.importLibrary('marker')
      .then(({ AdvancedMarkerElement }) => {
        allFacilities.forEach((facility) => {
          // Skip if facility_detail is missing
          if (!facility.detail) {
            console.warn(`Facility ${facility.id} has no facility_detail`)
            return
          }

          if (typeof facility.detail.lat !== 'number' || typeof facility.detail.lng !== 'number') {
            console.error(`Invalid coordinates for facility ${facility.detail.name}:`, facility.detail.lat, facility.detail.lng)
            return
          }

          // Skip if marker already exists
          if (markersMapRef.current.has(facility.id)) return

          // Select pin image based on genre_id and focus state
          const getPinImage = (genre_id: number, isFocused: boolean): string => {
            if (!isFocused) return MAP_PIN_IMAGES.unfocus

            switch (genre_id) {
              case 1: return MAP_PIN_IMAGES.pilates
              case 2: return MAP_PIN_IMAGES.medical
              case 5: return MAP_PIN_IMAGES.purple
              default: return MAP_PIN_IMAGES.medical
            }
          }

          // Create custom HTML marker element
          const markerDiv = document.createElement('div')
          markerDiv.style.cssText = `
            position: relative;
            display: inline-block;
          `

          // Create marker elements once
          const imgElement = document.createElement('img')
          imgElement.style.cssText = `
            position: relative;
            width: 42px;
            display: block;
          `
          imgElement.src = getPinImage(facility.genre_id, true)

          const starElement = document.createElement('p')
          starElement.style.cssText = `
            position: absolute;
            top: 42%;
            left: 0;
            font-size: 0.6rem;
            width: 42px;
            text-align: center;
            font-family: Kosugi Maru, sans-serif;
            color: #a69a7e !important;
            z-index: 1;
            margin: 0;
          `
          starElement.textContent = facility.detail?.star !== null ? facility.detail?.star?.toString() : ''

          const reviewElement = document.createElement('p')
          reviewElement.style.cssText = `
            position: absolute;
            top: 58%;
            left: 0;
            font-size: 1.0rem;
            width: 42px;
            text-align: center;
            font-family: Kosugi Maru, sans-serif;
            color: #a69a7e !important;
            z-index: 1;
            margin: 0;
          `
          reviewElement.textContent = facility.detail?.user_review_count?.toString() || '0'

          markerDiv.appendChild(imgElement)
          markerDiv.appendChild(starElement)
          markerDiv.appendChild(reviewElement)

          const updateMarkerContent = (isFocused: boolean = true) => {
            // Only update the image source, don't recreate elements
            imgElement.src = getPinImage(facility.genre_id, isFocused)
          }

          // Initial marker content
          updateMarkerContent(true)

          const marker = new AdvancedMarkerElement({
            position: { lat: facility.detail.lat, lng: facility.detail.lng },
            map: googleMapRef.current,
            title: facility.detail?.name,
            content: markerDiv
          })

          // Store update function on marker for later use
          marker.updateContent = updateMarkerContent

          marker.addListener('click', () => {
            setSelectedFacilityId(currentSelectedId => {
              const newSelectedId = currentSelectedId === facility.id ? null : facility.id
              // Use setTimeout to avoid setState during render
              setTimeout(() => {
                onFacilitySelect?.(newSelectedId)
              }, 0)
              return newSelectedId
            })
          })

          markersMapRef.current.set(facility.id, marker)
        })
      })
      .catch((err) => {
        console.error('Error loading markers:', err)
      })
  }, [allFacilities, isMapInitialized])

  // Combined effect for marker visibility and appearance updates
  useEffect(() => {
    if (!googleMapRef.current || !isMapInitialized || markersMapRef.current.size === 0) return

    const filteredIds = new Set(filteredFacilities.map(facility => facility.id))

    // Use requestAnimationFrame to batch all marker updates together
    requestAnimationFrame(() => {
      markersMapRef.current.forEach((marker, facilityId) => {
        const shouldShow = filteredIds.has(facilityId)
        const isCurrentlyVisible = marker.map !== null

        // Update visibility first
        if (shouldShow && !isCurrentlyVisible) {
          marker.map = googleMapRef.current
        } else if (!shouldShow && isCurrentlyVisible) {
          marker.map = null
        }

        // Update appearance only for visible markers
        if (marker.updateContent && marker.map !== null) {
          const isFocused = selectedFacilityId === null || selectedFacilityId === facilityId
          marker.updateContent(isFocused)
        }
      })
    })
  }, [filteredFacilities, selectedFacilityId, isMapInitialized])

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