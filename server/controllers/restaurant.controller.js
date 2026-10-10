// Haversine distance calculator in kilometers
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Map Google types to user-friendly cuisine categories and restaurant vs café distinction
function mapGoogleTypesToCuisine(types = [], primaryType = '') {
  const combined = [primaryType, ...types].filter(Boolean).map((t) => t.toLowerCase());

  const isCafe = combined.some((t) => t.includes('cafe') || t.includes('coffee') || t.includes('bakery'));
  const category = isCafe ? 'Café' : 'Restaurant';

  if (combined.some((t) => t.includes('indian'))) return { cuisine: 'Indian Cuisine', cuisineType: 'Indian', category };
  if (combined.some((t) => t.includes('italian') || t.includes('pizza') || t.includes('pasta'))) {
    return { cuisine: 'Italian & Pizzeria', cuisineType: 'Italian', category };
  }
  if (isCafe) return { cuisine: 'Café & Artisan Coffee', cuisineType: 'Café', category: 'Café' };
  if (
    combined.some(
      (t) =>
        t.includes('chinese') ||
        t.includes('japanese') ||
        t.includes('sushi') ||
        t.includes('asian') ||
        t.includes('thai')
    )
  ) {
    return { cuisine: 'Pan-Asian & Dim Sum', cuisineType: 'Pan-Asian', category };
  }
  if (
    combined.some((t) => t.includes('mexican') || t.includes('barbecue') || t.includes('steakhouse') || t.includes('french'))
  ) {
    return { cuisine: 'Continental & Grill', cuisineType: 'Continental', category };
  }
  if (combined.some((t) => t.includes('fast_food') || t.includes('hamburger') || t.includes('sandwich'))) {
    return { cuisine: 'Burgers & Quick Bites', cuisineType: 'Fast Food', category };
  }
  return { cuisine: 'Multicuisine Bistro', cuisineType: 'Continental', category };
}

// Convert price level to rupee signs and budget categories
function formatPriceLevel(priceLevel) {
  if (priceLevel === 1 || priceLevel === 'PRICE_LEVEL_INEXPENSIVE') return { price: '₹', budgetCategory: 'budget' };
  if (priceLevel === 2 || priceLevel === 'PRICE_LEVEL_MODERATE') return { price: '₹₹', budgetCategory: 'mid' };
  if (priceLevel === 3 || priceLevel === 'PRICE_LEVEL_EXPENSIVE') return { price: '₹₹₹', budgetCategory: 'fine_dining' };
  if (priceLevel === 4 || priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') return { price: '₹₹₹₹', budgetCategory: 'fine_dining' };
  return { price: '₹₹', budgetCategory: 'mid' };
}

/**
 * Controller: Get Nearby Restaurants & Cafes directly from Google Places API
 */
export async function getNearbyRestaurants(req, res) {
  try {
    const lat = parseFloat(req.query.lat || 12.9716);
    const lng = parseFloat(req.query.lng || req.query.lon || 77.5946);
    const radius = parseInt(req.query.radius || 5000, 10);
    const keyword = (req.query.keyword || req.query.cuisine || '').trim();

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      console.warn('[Zaika Server] Warning: GOOGLE_MAPS_API_KEY is not set in server/.env.');
      return res.status(200).json({
        success: true,
        source: 'google',
        count: 0,
        message: 'GOOGLE_MAPS_API_KEY is not set in server/.env. Please paste your key to fetch live data.',
        data: []
      });
    }

    let googlePlaces = [];
    let isGoogleSuccess = false;

    // 1. Primary: Use Places API (New)
    try {
      const hasSpecificKeyword = keyword && keyword.toLowerCase() !== 'all cuisines';
      let nRes;

      if (hasSpecificKeyword) {
        // Use text search for specific cuisine / keyword search
        const searchTextUrl = 'https://places.googleapis.com/v1/places:searchText';
        nRes = await fetch(searchTextUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.primaryType,places.types,places.regularOpeningHours,places.editorialSummary'
          },
          body: JSON.stringify({
            textQuery: `${keyword} in ${req.query.city || 'nearby'}`,
            locationBias: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: radius
              }
            },
            maxResultCount: 20
          })
        });
      } else {
        // Use searchNearby for proximity restaurant & cafe discovery
        const newNearbyUrl = 'https://places.googleapis.com/v1/places:searchNearby';
        nRes = await fetch(newNearbyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.primaryType,places.types,places.regularOpeningHours,places.editorialSummary'
          },
          body: JSON.stringify({
            includedTypes: ['restaurant', 'cafe', 'bakery', 'coffee_shop', 'fast_food_restaurant', 'bar'],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: { latitude: lat, longitude: lng },
                radius: radius
              }
            }
          })
        });
      }

      if (nRes && nRes.ok) {
        const nData = await nRes.json();
        if (Array.isArray(nData.places) && nData.places.length > 0) {
          isGoogleSuccess = true;
          googlePlaces = nData.places.map((p, index) => {
            const { cuisine, cuisineType, category } = mapGoogleTypesToCuisine(p.types, p.primaryType);
            const { price, budgetCategory } = formatPriceLevel(p.priceLevel);
            const pLat = p.location?.latitude || lat;
            const pLng = p.location?.longitude || lng;
            const dist = calculateHaversineKm(lat, lng, pLat, pLng);

            const photos = (p.photos || []).slice(0, 6).map(
              (ph) => `/api/restaurants/photo?name=${encodeURIComponent(ph.name)}&maxwidth=800`
            );

            return {
              id: p.id || `place-${index}`,
              googlePlaceId: p.id,
              name: p.displayName?.text || 'Restaurant',
              category,
              rating: p.rating || 4.2,
              userRatingsTotal: p.userRatingCount || 0,
              cuisine,
              cuisineType,
              description: p.editorialSummary?.text || p.formattedAddress || `Popular ${category.toLowerCase()} nearby`,
              offer: (p.rating || 4) >= 4.5 ? '⭐ Top Rated' : 'Popular Pick',
              price,
              budgetCategory,
              city: req.query.city || 'Local Area',
              locality: p.formattedAddress?.split(',')[0] || 'Nearby',
              lat: pLat,
              lon: pLng,
              distanceKm: dist,
              displayDistance: dist < 1 ? `${Math.round(dist * 1000)} m away` : `${dist.toFixed(1)} km away`,
              image: photos[0] || null,
              photos,
              isVeg: Boolean(p.types?.some((t) => t.includes('vegetarian') || t.includes('vegan'))),
              openNow: p.regularOpeningHours?.openNow ?? true
            };
          });
        }
      } else if (nRes) {
        const errJson = await nRes.json().catch(() => ({}));
        console.warn('[Google Places New] Warning:', errJson.error?.message || nRes.statusText);
      }
    } catch (newErr) {
      console.warn('[Google Places New Exception]:', newErr.message);
    }

    // 2. Fallback: Google Places API (Legacy Nearby Search)
    if (!isGoogleSuccess) {
      try {
        const keywordParam =
          keyword && keyword.toLowerCase() !== 'all cuisines'
            ? `&keyword=${encodeURIComponent(keyword)}`
            : `&keyword=${encodeURIComponent('restaurant cafe')}`;

        const legacyNearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}${keywordParam}&key=${apiKey}`;

        const gRes = await fetch(legacyNearbyUrl, { headers: { Accept: 'application/json' } });
        const gData = await gRes.json();

        if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
          isGoogleSuccess = true;
          googlePlaces = gData.results.map((p, index) => {
            const { cuisine, cuisineType, category } = mapGoogleTypesToCuisine(p.types);
            const { price, budgetCategory } = formatPriceLevel(p.price_level);
            const pLat = p.geometry?.location?.lat || lat;
            const pLng = p.geometry?.location?.lng || lng;
            const dist = calculateHaversineKm(lat, lng, pLat, pLng);

            const photos = (p.photos || []).slice(0, 6).map(
              (ph) => `/api/restaurants/photo?photo_reference=${ph.photo_reference}&maxwidth=800`
            );

            return {
              id: p.place_id || `place-${index}`,
              googlePlaceId: p.place_id,
              name: p.name,
              category,
              rating: p.rating || 4.2,
              userRatingsTotal: p.user_ratings_total || 0,
              cuisine,
              cuisineType,
              description: p.vicinity || `Popular ${category.toLowerCase()} in this locality`,
              offer: p.rating >= 4.5 ? '⭐ Top Rated' : 'Popular Pick',
              price,
              budgetCategory,
              city: req.query.city || 'Local Area',
              locality: p.vicinity?.split(',')[0] || 'Nearby',
              lat: pLat,
              lon: pLng,
              distanceKm: dist,
              displayDistance: dist < 1 ? `${Math.round(dist * 1000)} m away` : `${dist.toFixed(1)} km away`,
              image: photos[0] || null,
              photos,
              isVeg: Boolean(p.types?.some((t) => t.includes('vegetarian') || t.includes('vegan'))),
              openNow: p.opening_hours?.open_now ?? true
            };
          });
        }
      } catch (legErr) {
        console.warn('[Google Places Legacy Exception]:', legErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: 'google',
      count: googlePlaces.length,
      data: googlePlaces
    });
  } catch (error) {
    console.error('getNearbyRestaurants controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby restaurants & cafes from Google API',
      error: error.message
    });
  }
}

/**
 * Controller: Get Full Place Details with Google Reviews & Photos directly from Google Places API
 */
export async function getRestaurantDetails(req, res) {
  try {
    const placeId = req.params.id || req.query.place_id;
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'Place ID is required' });
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'GOOGLE_MAPS_API_KEY is not set in server/.env.'
      });
    }

    // 1. Primary: Places API (New) Place Details
    try {
      const newDetailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
      const nRes = await fetch(newDetailsUrl, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'id,displayName,rating,userRatingCount,formattedAddress,nationalPhoneNumber,websiteUri,photos,reviews,editorialSummary'
        }
      });

      if (nRes.ok) {
        const nData = await nRes.json();
        if (nData.id) {
          const photos = (nData.photos || []).slice(0, 10).map(
            (ph) => `/api/restaurants/photo?name=${encodeURIComponent(ph.name)}&maxwidth=1200`
          );

          const reviews = (nData.reviews || []).map((rev) => ({
            authorName: rev.authorAttribution?.displayName || 'Google Reviewer',
            authorPhoto: rev.authorAttribution?.photoUri || null,
            authorUri: rev.authorAttribution?.uri || null,
            rating: rev.rating || 5,
            relativeTime: rev.relativePublishTimeDescription || 'Recently',
            text: rev.text?.text || (typeof rev.text === 'string' ? rev.text : '')
          }));

          return res.status(200).json({
            success: true,
            source: 'google',
            data: {
              id: placeId,
              name: nData.displayName?.text || 'Restaurant',
              rating: nData.rating || 4.5,
              userRatingsTotal: nData.userRatingCount || reviews.length,
              address: nData.formattedAddress || '',
              phone: nData.nationalPhoneNumber || '',
              website: nData.websiteUri || '',
              editorialSummary: nData.editorialSummary?.text || '',
              photos,
              reviews
            }
          });
        }
      }
    } catch (newErr) {
      console.warn('[Place Details New Err]:', newErr.message);
    }

    // 2. Fallback: Legacy Place Details
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=name,rating,reviews,photos,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,editorial_summary,types&key=${apiKey}`;

      const gRes = await fetch(detailsUrl);
      const gData = await gRes.json();

      if (gData.status === 'OK' && gData.result) {
        const r = gData.result;
        const photos = (r.photos || []).slice(0, 10).map(
          (ph) => `/api/restaurants/photo?photo_reference=${ph.photo_reference}&maxwidth=1200`
        );

        const reviews = (r.reviews || []).map((rev) => ({
          authorName: rev.author_name || 'Google Reviewer',
          authorPhoto: rev.profile_photo_url || null,
          rating: rev.rating || 5,
          relativeTime: rev.relative_time_description || 'Recently',
          text: rev.text || ''
        }));

        return res.status(200).json({
          success: true,
          source: 'google',
          data: {
            id: placeId,
            name: r.name,
            rating: r.rating || 4.5,
            userRatingsTotal: r.user_ratings_total || reviews.length,
            address: r.formatted_address || '',
            phone: r.formatted_phone_number || '',
            website: r.website || '',
            editorialSummary: r.editorial_summary?.overview || '',
            photos,
            reviews
          }
        });
      }
    } catch (legErr) {
      console.warn('[Place Details Legacy Err]:', legErr.message);
    }

    return res.status(404).json({
      success: false,
      message: 'Place details not found from Google Places API'
    });
  } catch (error) {
    console.error('getRestaurantDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant details and reviews',
      error: error.message
    });
  }
}

/**
 * Controller: Proxy Restaurant Photo from Google Places
 */
export async function getRestaurantPhoto(req, res) {
  try {
    const { photo_reference, name, maxwidth = 800 } = req.query;

    if (!photo_reference && !name) {
      return res.status(400).send('photo_reference or name is required');
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';

    if (!apiKey) {
      return res.status(400).send('Google Maps API Key is not configured');
    }

    let photoUrl = '';
    if (name) {
      photoUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxwidth}&key=${apiKey}`;
    } else {
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(
        photo_reference
      )}&key=${apiKey}`;
    }

    const photoRes = await fetch(photoUrl);

    if (!photoRes.ok) {
      return res.status(photoRes.status).send('Failed to fetch photo from Google');
    }

    const contentType = photoRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const arrayBuffer = await photoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('getRestaurantPhoto error:', err);
    return res.status(500).send('Error streaming photo');
  }
}
