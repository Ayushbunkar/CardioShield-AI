import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling browser geolocation
 * Supports risk-based activation logic
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRequest - Whether to automatically request location
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {boolean} options.highAccuracy - Use high accuracy mode (default: true)
 * @returns {Object} Location state and methods
 */
const useUserLocation = (options = {}) => {
  const {
    autoRequest = false,
    timeout = 10000,
    highAccuracy = true
  } = options;

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => {
          setPermissionStatus(result.state);
        };
      }).catch(() => {
        // Permissions API not supported, fallback to prompt
        setPermissionStatus('prompt');
      });
    }
  }, []);

  // Auto request location if enabled
  useEffect(() => {
    if (autoRequest && permissionStatus !== 'denied') {
      requestLocation();
    }
  }, [autoRequest]);

  /**
   * Request user's current location
   * @returns {Promise<{lat: number, lng: number}>}
   */
  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = {
          code: 0,
          message: 'Geolocation is not supported by your browser',
          type: 'NOT_SUPPORTED'
        };
        setError(err);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      const geolocationOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: timeout,
        maximumAge: 60000 // Cache location for 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(coords);
          setLoading(false);
          setPermissionStatus('granted');
          resolve(coords);
        },
        (err) => {
          let errorInfo;
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorInfo = {
                code: err.code,
                message: 'Location permission denied. Please enable location access in your browser settings.',
                type: 'PERMISSION_DENIED'
              };
              setPermissionStatus('denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorInfo = {
                code: err.code,
                message: 'Location information is unavailable. Please try again.',
                type: 'POSITION_UNAVAILABLE'
              };
              break;
            case err.TIMEOUT:
              errorInfo = {
                code: err.code,
                message: 'Location request timed out. Please try again.',
                type: 'TIMEOUT'
              };
              break;
            default:
              errorInfo = {
                code: err.code,
                message: 'An unknown error occurred while getting location.',
                type: 'UNKNOWN'
              };
          }
          setError(errorInfo);
          setLoading(false);
          reject(errorInfo);
        },
        geolocationOptions
      );
    });
  }, [highAccuracy, timeout]);

  /**
   * Clear location data and errors
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {number} lat1 - Latitude of first point
   * @param {number} lng1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lng2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
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
  }, []);

  /**
   * Get directions URL to a destination
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   * @returns {string|null} Google Maps directions URL
   */
  const getDirectionsUrl = useCallback((destLat, destLng) => {
    if (!location) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destLat},${destLng}&travelmode=driving`;
  }, [location]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestLocation,
    clearLocation,
    calculateDistance,
    getDirectionsUrl,
    isSupported: !!navigator.geolocation
  };
};

export default useUserLocation;
