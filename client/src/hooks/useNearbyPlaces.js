import { useState, useCallback } from 'react';

/**
 * Overpass API endpoint (free, no API key required)
 * Uses OpenStreetMap data
 */
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Healthcare amenity types for different risk levels
 * These map to OpenStreetMap amenity tags
 */
export const HEALTHCARE_TYPES = {
  HIGH_RISK: ['hospital', 'clinic', 'doctors'],
  MEDIUM_RISK: ['hospital', 'clinic', 'doctors', 'pharmacy'],
  LOW_RISK: []
};

/**
 * Custom hook for fetching nearby healthcare facilities using OpenStreetMap Overpass API
 * Completely FREE - no API key required!
 * 
 * @returns {Object} Places state and methods
 */
const useNearbyPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closestPlace, setClosestPlace] = useState(null);

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lng1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lng2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Estimate travel time based on distance
   * Assumes average speed of 30 km/h in urban areas
   */
  const estimateTravelTime = (distanceKm) => {
    const avgSpeedKmH = 30;
    const timeHours = distanceKm / avgSpeedKmH;
    const timeMinutes = Math.round(timeHours * 60);
    
    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  /**
   * Build Overpass QL query for healthcare facilities
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radius - Search radius in meters
   * @param {string} riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
   */
  const buildOverpassQuery = (lat, lng, radius, riskLevel) => {
    const types = HEALTHCARE_TYPES[`${riskLevel}_RISK`] || HEALTHCARE_TYPES.MEDIUM_RISK;
    
    // Build query for multiple amenity types
    const amenityFilters = types.map(type => `node["amenity"="${type}"](around:${radius},${lat},${lng});`).join('\n');
    const wayFilters = types.map(type => `way["amenity"="${type}"](around:${radius},${lat},${lng});`).join('\n');
    
    // Also search for healthcare-specific tags
    const healthcareQuery = `
      node["healthcare"](around:${radius},${lat},${lng});
      way["healthcare"](around:${radius},${lat},${lng});
    `;

    return `
      [out:json][timeout:25];
      (
        ${amenityFilters}
        ${wayFilters}
        ${healthcareQuery}
      );
      out body center;
    `;
  };

  /**
   * Reverse geocode coordinates using Nominatim (free, no API key)
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CardioShield-AI/1.0'
          }
        }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const parts = [];
        
        // Build a readable address
        if (addr.house_number && addr.road) {
          parts.push(`${addr.house_number} ${addr.road}`);
        } else if (addr.road) {
          parts.push(addr.road);
        }
        
        if (addr.suburb || addr.neighbourhood || addr.quarter) {
          parts.push(addr.suburb || addr.neighbourhood || addr.quarter);
        }
        
        if (addr.city || addr.town || addr.village) {
          parts.push(addr.city || addr.town || addr.village);
        }
        
        if (addr.postcode) {
          parts.push(addr.postcode);
        }
        
        return parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',');
      }
      
      return null;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return null;
    }
  };

  /**
   * Fetch nearby healthcare facilities using Overpass API (OpenStreetMap)
   * 
   * @param {Object|null} map - Map instance (not used with Overpass, kept for API compatibility)
   * @param {Object} location - User location {lat, lng}
   * @param {string} riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
   * @param {number} radius - Search radius in meters (default: 10000 = 10km)
   * @returns {Promise<Array>} Array of places
   */
  const fetchNearbyPlaces = useCallback(async (map, location, riskLevel, radius = 10000) => {
    if (!location || riskLevel === 'LOW') {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const query = buildOverpassQuery(location.lat, location.lng, radius, riskLevel);
      
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();

      // Process results
      const processedPlaces = data.elements
        .map((element, index) => {
          // Get coordinates - handle both nodes and ways (ways have center)
          const lat = element.lat || element.center?.lat;
          const lng = element.lon || element.center?.lon;

          if (!lat || !lng) return null;

          const tags = element.tags || {};
          const name = tags.name || tags['name:en'] || getDefaultName(tags);
          
          // Skip if no name
          if (!name) return null;

          const distance = calculateDistance(
            location.lat,
            location.lng,
            lat,
            lng
          );

          return {
            id: `osm-${element.type}-${element.id}`,
            osmId: element.id,
            name: name,
            address: buildAddress(tags), // May be null, will be fetched later
            lat: lat,
            lng: lng,
            rating: null, // OSM doesn't have ratings
            userRatingsTotal: 0,
            distance: distance,
            distanceText: distance < 1 
              ? `${Math.round(distance * 1000)} m` 
              : `${distance.toFixed(1)} km`,
            travelTime: estimateTravelTime(distance),
            isOpen: null, // OSM doesn't have real-time opening status
            types: getPlaceTypes(tags),
            amenity: tags.amenity || tags.healthcare,
            phone: tags.phone || tags['contact:phone'],
            website: tags.website || tags['contact:website'],
            emergency: tags.emergency === 'yes'
          };
        })
        .filter(Boolean); // Remove null entries

      // Remove duplicates based on name and approximate location
      const uniquePlaces = processedPlaces.reduce((acc, place) => {
        const isDuplicate = acc.some(
          p => p.name === place.name && 
               Math.abs(p.lat - place.lat) < 0.001 && 
               Math.abs(p.lng - place.lng) < 0.001
        );
        if (!isDuplicate) {
          acc.push(place);
        }
        return acc;
      }, []);

      // Sort by distance
      uniquePlaces.sort((a, b) => a.distance - b.distance);

      // Filter to within radius
      const filteredPlaces = uniquePlaces.filter(
        place => place.distance <= radius / 1000
      );

      // Fetch addresses for places without address (limit to top 15 to avoid rate limiting)
      const placesToGeocode = filteredPlaces.slice(0, 15).filter(p => !p.address);
      
      if (placesToGeocode.length > 0) {
        // Batch reverse geocode with small delays to respect Nominatim rate limits
        const geocodePromises = placesToGeocode.map((place, index) => 
          new Promise(resolve => {
            setTimeout(async () => {
              const address = await reverseGeocode(place.lat, place.lng);
              resolve({ id: place.id, address });
            }, index * 200); // 200ms delay between each request
          })
        );
        
        const geocodedResults = await Promise.all(geocodePromises);
        
        // Update places with geocoded addresses
        geocodedResults.forEach(result => {
          const place = filteredPlaces.find(p => p.id === result.id);
          if (place && result.address) {
            place.address = result.address;
          }
        });
      }
      
      // Set fallback for any remaining places without address
      filteredPlaces.forEach(place => {
        if (!place.address) {
          place.address = 'Address not available';
        }
      });

      setPlaces(filteredPlaces);

      // Set closest place
      if (filteredPlaces.length > 0) {
        setClosestPlace(filteredPlaces[0]);
      } else {
        setClosestPlace(null);
      }

      setLoading(false);
      return filteredPlaces;

    } catch (err) {
      console.error('Error fetching nearby places:', err);
      setError({
        message: 'Failed to fetch nearby healthcare facilities. Please try again.',
        type: 'API_ERROR',
        details: err.message
      });
      setLoading(false);
      return [];
    }
  }, []);

  /**
   * Get default name based on amenity type
   */
  const getDefaultName = (tags) => {
    if (tags.amenity === 'hospital') return 'Hospital';
    if (tags.amenity === 'clinic') return 'Clinic';
    if (tags.amenity === 'doctors') return 'Doctor\'s Office';
    if (tags.amenity === 'pharmacy') return 'Pharmacy';
    if (tags.healthcare) return `Healthcare - ${tags.healthcare}`;
    return null;
  };

  /**
   * Build address string from OSM tags
   * Falls back to reverse geocoding via Nominatim if address not available
   */
  const buildAddress = (tags) => {
    const parts = [];
    
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    if (parts.length >= 2) {
      return parts.join(', ');
    }
    
    // Fallback to simpler address
    if (tags['addr:full']) return tags['addr:full'];
    if (tags.address) return tags.address;
    
    // If only postcode is available
    if (tags['addr:postcode']) return tags['addr:postcode'];
    
    return null; // Will be fetched via reverse geocoding
  };

  /**
   * Get place types from OSM tags
   */
  const getPlaceTypes = (tags) => {
    const types = [];
    if (tags.amenity) types.push(tags.amenity);
    if (tags.healthcare) types.push(tags.healthcare);
    if (tags.emergency === 'yes') types.push('emergency');
    if (tags.speciality) types.push(tags.speciality);
    return types;
  };

  /**
   * Fetch places with distance filter
   * Convenience method for filtering by distance
   * 
   * @param {Object} location - User location {lat, lng}
   * @param {string} riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
   * @param {number} maxDistanceKm - Maximum distance in kilometers
   */
  const fetchPlacesWithinDistance = useCallback(async (location, riskLevel, maxDistanceKm = 10) => {
    const radius = maxDistanceKm * 1000; // Convert to meters
    return fetchNearbyPlaces(null, location, riskLevel, radius);
  }, [fetchNearbyPlaces]);

  /**
   * Clear places data
   */
  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setClosestPlace(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Get Google Maps navigation URL (no API key needed - just URL redirect)
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   * @param {Object} userLocation - Optional user location for origin
   */
  const getNavigationUrl = useCallback((destLat, destLng, userLocation = null) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  }, []);

  return {
    places,
    loading,
    error,
    closestPlace,
    fetchNearbyPlaces,
    fetchPlacesWithinDistance,
    clearPlaces,
    getNavigationUrl,
    calculateDistance,
    estimateTravelTime
  };
};

export default useNearbyPlaces;
