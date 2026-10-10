import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { POPULAR_FOOD_HUBS } from '../constants/locations'

export default function LocationPickerModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [gpsError, setGpsError] = useState('')

  // Selected preview location before confirmation
  const [previewLocation, setPreviewLocation] = useState(() => {
    return (
      currentLocation || {
        name: 'Bengaluru',
        formattedAddress: 'Bengaluru, Karnataka, India',
        city: 'Bengaluru',
        lat: 12.9716,
        lon: 77.5946,
        isCurrentLocation: false,
      }
    )
  })

  // Recent locations stored in localStorage
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('zaika_recent_locations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Leaflet map container ref and map instance ref
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  // Reverse geocoding helper using Nominatim
  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      )
      if (!res.ok) return
      const data = await res.json()

      const area =
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.road ||
        data.address?.residential ||
        data.address?.village ||
        data.address?.town ||
        'Selected Point'

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.county ||
        data.address?.state_district ||
        'Bengaluru'

      setPreviewLocation({
        name: area,
        formattedAddress: data.display_name || `${area}, ${city}`,
        city: city,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        isCurrentLocation: false,
      })
    } catch (e) {
      console.warn('Reverse geocode error:', e)
    }
  }, [])

  // Initialize or re-center Leaflet Map
  useEffect(() => {
    if (!isOpen) return

    // Small delay to ensure modal DOM is mounted and sized
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return

      if (!mapInstanceRef.current) {
        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          center: [previewLocation.lat, previewLocation.lon],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        })

        // Standard OpenStreetMap Tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map)

        // Custom Zaika Crimson Pin Marker
        const customPinIcon = L.divIcon({
          className: 'zaika-custom-map-marker',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; items-center; justify-content: center; transform: translate(-18px, -36px);">
              <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 14px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px);"></div>
              <svg width="34" height="42" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#85312C"/>
                <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
              </svg>
            </div>
          `,
          iconSize: [36, 42],
          iconAnchor: [18, 42],
        })

        const marker = L.marker([previewLocation.lat, previewLocation.lon], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map)

        // Allow clicking on the map to reposition pin
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng
          marker.setLatLng([lat, lng])
          reverseGeocode(lat, lng)
        })

        // Drag marker to reposition
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          reverseGeocode(pos.lat, pos.lng)
        })

        mapInstanceRef.current = map
        markerRef.current = marker
      } else {
        // Re-center existing map instance
        mapInstanceRef.current.invalidateSize()
        mapInstanceRef.current.setView([previewLocation.lat, previewLocation.lon], 14)
        if (markerRef.current) {
          markerRef.current.setLatLng([previewLocation.lat, previewLocation.lon])
        }
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [isOpen, previewLocation.lat, previewLocation.lon, reverseGeocode])

  // Update map view when preview location changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([previewLocation.lat, previewLocation.lon], 15, {
        duration: 1.2,
      })
      markerRef.current.setLatLng([previewLocation.lat, previewLocation.lon])
    }
  }, [previewLocation.lat, previewLocation.lon])

  // Clean up Leaflet on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle Search Input Change
  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const q = query.trim().toLowerCase()
    const localMatches = POPULAR_FOOD_HUBS.filter(
      (hub) =>
        hub.name.toLowerCase().includes(q) ||
        hub.formattedAddress.toLowerCase().includes(q) ||
        hub.city.toLowerCase().includes(q)
    )
    setSearchResults(localMatches)
  }

  // Handle Debounced Nominatim Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      return
    }

    const q = searchQuery.trim().toLowerCase()
    const localMatches = POPULAR_FOOD_HUBS.filter(
      (hub) =>
        hub.name.toLowerCase().includes(q) ||
        hub.formattedAddress.toLowerCase().includes(q) ||
        hub.city.toLowerCase().includes(q)
    )

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=in&addressdetails=1&limit=5`,
          {
            headers: { 'Accept-Language': 'en' },
          }
        )
        if (res.ok) {
          const data = await res.json()
          const nominatimResults = data.map((item) => {
            const shortName =
              item.address?.suburb ||
              item.address?.neighbourhood ||
              item.address?.amenity ||
              item.address?.road ||
              item.name ||
              item.display_name.split(',')[0]

            const cityName =
              item.address?.city ||
              item.address?.town ||
              item.address?.state_district ||
              'India'

            return {
              id: `nom_${item.place_id}`,
              name: shortName,
              formattedAddress: item.display_name,
              city: cityName,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              type: item.type ? `${item.type.replace('_', ' ')}` : 'Location',
            }
          })

          setSearchResults(() => {
            const combined = [...localMatches]
            for (const n of nominatimResults) {
              if (
                !combined.some(
                  (c) =>
                    Math.abs(c.lat - n.lat) < 0.005 &&
                    Math.abs(c.lon - n.lon) < 0.005
                )
              ) {
                combined.push(n)
              }
            }
            return combined
          })
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // "Use Current Location" (Google Maps GPS Location Detection)
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    setIsDetectingGps(true)
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode user coordinates
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
            }
          )

          let locationName = 'Current Location'
          let fullAddress = 'Near your current GPS coordinates'
          let detectedCity = 'Bengaluru'

          if (res.ok) {
            const data = await res.json()
            const area =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.road ||
              data.address?.residential ||
              'Current Location'
            detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              'Bengaluru'

            locationName = `${area}, ${detectedCity}`
            fullAddress = data.display_name || `${area}, ${detectedCity}`
          }

          const detected = {
            name: locationName,
            formattedAddress: fullAddress,
            city: detectedCity,
            lat: latitude,
            lon: longitude,
            isCurrentLocation: true,
          }

          setPreviewLocation(detected)
          setSearchQuery('')
          setSearchResults([])
        } catch {
          // Fallback if reverse geocode is slow
          setPreviewLocation({
            name: 'Your Current Location',
            formattedAddress: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            city: 'Bengaluru',
            lat: latitude,
            lon: longitude,
            isCurrentLocation: true,
          })
        } finally {
          setIsDetectingGps(false)
        }
      },
      (error) => {
        setIsDetectingGps(false)
        console.warn('Geolocation error:', error)
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please enable it in browser or select below.')
        } else if (error.code === error.TIMEOUT) {
          setGpsError('GPS request timed out. Please select your locality below.')
        } else {
          setGpsError('Unable to detect current location. Please search manually.')
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 60000 }
    )
  }

  // Choose a search result or chip
  const handleSelectLocationItem = (item) => {
    setPreviewLocation({
      name: item.name,
      formattedAddress: item.formattedAddress,
      city: item.city,
      lat: item.lat,
      lon: item.lon,
      isCurrentLocation: false,
    })
    setSearchQuery('')
    setSearchResults([])
  }

  // Final confirmation
  const handleConfirmLocation = () => {
    try {
      const updatedRecent = [
        previewLocation,
        ...recentLocations.filter(
          (r) =>
            r.name !== previewLocation.name &&
            r.formattedAddress !== previewLocation.formattedAddress
        ),
      ].slice(0, 5)

      setRecentLocations(updatedRecent)
      localStorage.setItem('zaika_recent_locations', JSON.stringify(updatedRecent))
    } catch (e) {
      console.warn(e)
    }

    onSelectLocation(previewLocation)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FAF1E8] text-[#85312C] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900 leading-tight">
                Select Your Dining Location
              </h3>
              <p className="text-xs text-neutral-500">
                Discover curated restaurants and dishes nearby
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* SEARCH & GPS CONTROLS */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-neutral-200/60 shrink-0 space-y-3">
          {/* SEARCH INPUT */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search for area, street, landmark, or city..."
              className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#85312C] focus:ring-2 focus:ring-[#85312C]/15 transition-all shadow-2xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* USE CURRENT LOCATION BUTTON (GOOGLE MAP GPS) */}
          <button
            onClick={handleDetectCurrentLocation}
            disabled={isDetectingGps}
            className="w-full flex items-center justify-between bg-white hover:bg-neutral-50 border border-neutral-200/90 hover:border-[#85312C]/40 rounded-xl p-3 text-left transition-all group shadow-2xs cursor-pointer disabled:opacity-75"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-[#85312C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {isDetectingGps ? (
                  <svg className="animate-spin w-4 h-4 text-[#85312C]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[#85312C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-[#85312C] block">
                  {isDetectingGps ? 'Locating your position...' : 'Use Current Location'}
                </span>
                <span className="text-xs text-neutral-500">
                  Using GPS for accurate nearby restaurant recommendations
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#85312C] bg-[#FAF1E8] px-2.5 py-1 rounded-full group-hover:bg-[#85312C] group-hover:text-white transition-colors">
              GPS
            </span>
          </button>

          {/* GPS Error Message */}
          {gpsError && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* MODAL BODY (SEARCH RESULTS OR MAP & CHIPS) */}
        <div className="flex-1 overflow-y-auto min-h-[300px] flex flex-col">
          {/* SEARCH SUGGESTIONS DROPDOWN (WHEN USER TYPES) */}
          {searchQuery.trim().length > 0 ? (
            <div className="p-4 space-y-1.5 flex-1">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-neutral-100 text-xs text-neutral-500">
                <span>Matching Locations ({searchResults.length})</span>
                {isSearching && <span className="animate-pulse text-[#85312C]">Searching...</span>}
              </div>

              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectLocationItem(item)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#FAF1E8]/50 border border-transparent hover:border-[#85312C]/20 transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-[#85312C] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-neutral-900 group-hover:text-[#85312C] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] bg-neutral-100 group-hover:bg-[#FAF1E8] text-neutral-600 px-2 py-0.5 rounded-full shrink-0">
                          {item.city}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {item.formattedAddress}
                      </p>
                    </div>
                  </button>
                ))
              ) : !isSearching ? (
                <div className="text-center py-8 text-neutral-400">
                  <p className="text-sm">No exact locations found for &quot;{searchQuery}&quot;</p>
                  <p className="text-xs mt-1">Try searching a major area or city like &quot;Indiranagar&quot; or &quot;Bandra&quot;</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative w-full h-[360px] sm:h-[420px] bg-neutral-100">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Map Overlay Badge */}
              <div className="absolute top-3 left-3 z-1000 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-neutral-200/80 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-neutral-800">
                  {previewLocation.name}
                </span>
                <span className="text-neutral-400">({previewLocation.city})</span>
              </div>

              {/* Re-center GPS button on Map */}
              <button
                onClick={handleDetectCurrentLocation}
                title="Recenter to my GPS location"
                className="absolute bottom-3 right-3 z-1000 bg-white hover:bg-neutral-50 text-[#85312C] p-2.5 rounded-xl shadow-md border border-neutral-200 cursor-pointer transition-transform active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                  />
                </svg>
              </button>

              {/* Hint banner */}
              <div className="absolute bottom-3 left-3 z-1000 bg-black/65 text-white text-[11px] px-2.5 py-1 rounded-md pointer-events-none backdrop-blur-xs">
                Click or drag pin to fine-tune location
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONFIRMATION ACTION */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Selected Location
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-neutral-900 truncate">
                {previewLocation.name}
              </span>
              <span className="text-xs text-neutral-500 truncate">
                ({previewLocation.city})
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            className="bg-[#85312C] hover:bg-[#702622] text-white px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-2"
          >
            <span>Confirm Location</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
