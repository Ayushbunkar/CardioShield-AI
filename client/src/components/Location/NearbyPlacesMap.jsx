import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  Star, 
  Clock, 
  MapPin,
  Loader2,
  ExternalLink
} from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in Vite/Webpack
// This is required because Leaflet's default icons don't work properly with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Component to handle map view updates
 */
const MapController = ({ userLocation, places }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && places.length > 0) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...places.map(p => [p.lat, p.lng])
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [map, userLocation, places]);

  return null;
};

/**
 * Create custom marker icons
 */
const createCustomIcon = (color, size = 32) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

/**
 * Create user location marker icon
 */
const userLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
    </svg>
  `,
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

/**
 * NearbyPlacesMap component using Leaflet and OpenStreetMap
 * NO Google Maps API key required - completely free!
 * 
 * @param {Object} props
 * @param {Object} props.userLocation - User's location {lat, lng}
 * @param {Array} props.places - Array of places to display
 * @param {string} props.riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
 * @param {Function} props.onMapLoad - Callback when map is loaded
 * @param {Function} props.onGetDirections - Callback for directions
 * @param {Object} props.closestPlace - The closest place object
 */
const NearbyPlacesMap = ({
  userLocation,
  places = [],
  riskLevel = 'MEDIUM',
  onMapLoad,
  onGetDirections,
  closestPlace
}) => {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Marker colors based on risk level
  const markerColors = {
    HIGH: '#ff4d4d',
    MEDIUM: '#ffb347',
    LOW: '#28a745'
  };

  const markerColor = markerColors[riskLevel] || markerColors.MEDIUM;

  // Create memoized icons
  const placeIcon = useMemo(() => createCustomIcon(markerColor, 32), [markerColor]);
  const closestIcon = useMemo(() => createCustomIcon(markerColor, 40), [markerColor]);

  // Default center (Delhi, India - will be overridden by user location)
  const defaultCenter = useMemo(() => ({
    lat: 28.6139,
    lng: 77.2090
  }), []);

  // Handle map ready
  const handleMapReady = () => {
    setMapReady(true);
    if (onMapLoad) {
      onMapLoad(mapRef.current);
    }
  };

  /**
   * Generate Google Maps navigation URL
   * This uses only the URL redirect format - NO API key needed!
   */
  const getNavigationUrl = (lat, lng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // Handle navigate click - opens Google Maps in new tab
  const handleNavigate = (place) => {
    const url = getNavigationUrl(place.lat, place.lng);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render star rating
  const renderStars = (rating) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < fullStars 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Loading state
  if (!userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900/60 rounded-2xl backdrop-blur-xl border border-white/10">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Waiting for location...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative"
    >
      {/* Custom styles for markers */}
      <style>{`
        .custom-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .user-location-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 240px;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          background: #1a1a2e;
          font-family: inherit;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a {
          background: #1f2937 !important;
          color: white !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #374151 !important;
        }
      `}</style>

      <MapContainer
        center={[userLocation?.lat || defaultCenter.lat, userLocation?.lng || defaultCenter.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        whenReady={handleMapReady}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* OpenStreetMap Tile Layer - Completely FREE, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Controller for bounds fitting */}
        <MapController userLocation={userLocation} places={places} />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userLocationIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-3 text-center">
                <MapPin className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Healthcare facility markers */}
        {places.map((place) => {
          const isClosest = closestPlace && closestPlace.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={isClosest ? closestIcon : placeIcon}
              zIndexOffset={isClosest ? 999 : 1}
            >
              <Popup maxWidth={300}>
                <div className="p-4">
                  {/* Closest badge */}
                  {isClosest && (
                    <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">
                      Nearest Facility
                    </div>
                  )}

                  {/* Place name */}
                  <h3 className="font-bold text-gray-900 text-base mb-2 pr-4">
                    {place.name}
                  </h3>
                  
                  {/* Address */}
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                    <span>{place.address}</span>
                  </div>

                  {/* Rating */}
                  {place.rating && (
                    <div className="mb-2">
                      {renderStars(place.rating)}
                    </div>
                  )}

                  {/* Distance and time */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{place.distanceText}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>~{place.travelTime}</span>
                    </div>
                  </div>

                  {/* Navigate button - Opens Google Maps via URL (no API key) */}
                  <button
                    onClick={() => handleNavigate(place)}
                    className={`
                      w-full py-2.5 px-4 rounded-lg font-medium text-white
                      flex items-center justify-center gap-2
                      transition-all duration-200 shadow-md hover:shadow-lg
                      ${riskLevel === 'HIGH' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : riskLevel === 'MEDIUM'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-green-600 hover:bg-green-700'
                      }
                    `}
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Opens Google Maps in new tab
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map attribution overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-gray-400 text-xs py-1 px-2 z-[1000]">
        Map © <a href="https://www.openstreetmap.org/copyright" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> | Free & Open Source
      </div>
    </motion.div>
  );
};

export default NearbyPlacesMap;
