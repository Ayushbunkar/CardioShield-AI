import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  XCircle,
  ChevronDown,
  Heart,
  Activity,
  Ambulance,
  Building2,
  Stethoscope,
  Navigation,
  Star
} from 'lucide-react';

// Import custom components
import RiskMeter from './RiskMeter';
import PlaceCard from './PlaceCard';
import NearbyPlacesMap from './NearbyPlacesMap';

// Import custom hooks
import useUserLocation from '../../hooks/useUserLocation';
import useNearbyPlaces from '../../hooks/useNearbyPlaces';

/**
 * Risk classification based on probability
 * @param {number} probability - Risk probability (0-100)
 * @returns {string} Risk level
 */
const classifyRisk = (probability) => {
  if (probability > 70) return 'HIGH';
  if (probability >= 40) return 'MEDIUM';
  return 'LOW';
};

/**
 * RiskResultPage - Main component for displaying risk assessment results
 * with location-based healthcare facility recommendations
 * 
 * @param {Object} props
 * @param {number} props.riskProbability - Risk probability from AI model (0-100)
 * @param {Object} props.assessmentData - Additional assessment data
 * @param {Function} props.onNewAssessment - Callback to start new assessment
 */
const RiskResultPage = ({ 
  riskProbability = 50, 
  assessmentData = {},
  onNewAssessment 
}) => {
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [showPlacesList, setShowPlacesList] = useState(true);
  const mapContainerRef = useRef(null);

  // Custom hooks
  const {
    location: userLocation,
    error: locationError,
    loading: locationLoading,
    permissionStatus,
    requestLocation,
    getDirectionsUrl
  } = useUserLocation({ autoRequest: false });

  const {
    places,
    loading: placesLoading,
    error: placesError,
    closestPlace,
    fetchNearbyPlaces,
    clearPlaces
  } = useNearbyPlaces();

  // Theme configurations
  const themes = {
    HIGH: {
      bgGradient: 'from-red-950 via-gray-950 to-gray-950',
      headerBg: 'bg-gradient-to-r from-red-900/50 to-red-800/30',
      accentColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/20',
      icon: ShieldAlert,
      iconBg: 'bg-red-500/20',
      title: 'High Cardiovascular Risk Detected',
      subtitle: 'Immediate medical attention is strongly recommended'
    },
    MEDIUM: {
      bgGradient: 'from-amber-950 via-gray-950 to-gray-950',
      headerBg: 'bg-gradient-to-r from-amber-900/50 to-amber-800/30',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20',
      title: 'Moderate Risk Level',
      subtitle: 'Preventive screening is advised'
    },
    LOW: {
      bgGradient: 'from-green-950 via-gray-950 to-gray-950',
      headerBg: 'bg-gradient-to-r from-green-900/50 to-green-800/30',
      accentColor: 'text-green-400',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/20',
      icon: ShieldCheck,
      iconBg: 'bg-green-500/20',
      title: 'Low Risk - Stay Healthy',
      subtitle: 'Continue maintaining your healthy lifestyle'
    }
  };

  // Classify risk on mount/probability change
  useEffect(() => {
    const level = classifyRisk(riskProbability);
    setRiskLevel(level);

    // Auto-trigger location for high risk
    if (level === 'HIGH') {
      requestLocation().catch(() => {});
    }
    // Show optional prompt for medium risk
    else if (level === 'MEDIUM') {
      setShowLocationPrompt(true);
    }
  }, [riskProbability]);

  // Fetch nearby places when location is available
  // Note: With Leaflet + Overpass API, we don't need a map instance
  useEffect(() => {
    if (userLocation && riskLevel !== 'LOW') {
      fetchNearbyPlaces(null, userLocation, riskLevel, 10000);
    }
  }, [userLocation, riskLevel]);

  // Handle map load
  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  // Handle get directions
  const handleGetDirections = useCallback((place) => {
    const url = getDirectionsUrl(place.lat, place.lng);
    if (url) {
      window.open(url, '_blank');
    }
  }, [getDirectionsUrl]);

  // Handle location permission request
  const handleRequestLocation = async () => {
    setShowLocationPrompt(false);
    try {
      await requestLocation();
    } catch (error) {
      console.error('Location request failed:', error);
    }
  };

  // Skip location for medium risk
  const handleSkipLocation = () => {
    setShowLocationPrompt(false);
  };

  // Retry fetching places
  const handleRetryPlaces = () => {
    if (userLocation) {
      clearPlaces();
      fetchNearbyPlaces(null, userLocation, riskLevel, 10000);
    }
  };

  const theme = themes[riskLevel];
  const IconComponent = theme.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} text-white relative`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {riskLevel === 'HIGH' && (
          <>
            <motion.div
              className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
        {riskLevel === 'MEDIUM' && (
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        )}
        {riskLevel === 'LOW' && (
          <motion.div
            className="absolute top-1/3 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme.headerBg} backdrop-blur-xl border-b ${theme.borderColor} sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme.iconBg}`}>
                <Heart className={`w-6 h-6 ${theme.accentColor}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CardioShield AI</h1>
                <p className="text-sm text-gray-400">Risk Assessment Result</p>
              </div>
            </div>
            {onNewAssessment && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewAssessment}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>New Assessment</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Risk Summary Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className={`rounded-3xl backdrop-blur-xl bg-gray-900/60 border ${theme.borderColor} shadow-2xl ${theme.glowColor} overflow-hidden`}>
            <div className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Risk Meter */}
                <div className="flex-shrink-0">
                  <RiskMeter riskProbability={riskProbability} riskLevel={riskLevel} />
                </div>

                {/* Risk Details */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                      <IconComponent className={`w-6 h-6 ${theme.accentColor}`} />
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-bold ${theme.accentColor}`}>
                      {theme.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-lg mb-6">
                    {theme.subtitle}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <Activity className="w-5 h-5 text-blue-400 mb-2" />
                      <p className="text-2xl font-bold text-white">{riskProbability}%</p>
                      <p className="text-xs text-gray-500">Risk Score</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <Building2 className="w-5 h-5 text-purple-400 mb-2" />
                      <p className="text-2xl font-bold text-white">{places.length}</p>
                      <p className="text-xs text-gray-500">Nearby Centers</p>
                    </div>
                    {closestPlace && (
                      <div className="bg-gray-800/50 rounded-xl p-4 col-span-2 md:col-span-1">
                        <Navigation className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{closestPlace.distanceText}</p>
                        <p className="text-xs text-gray-500">Nearest Facility</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hospital List Section */}
              {places.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      Nearby Healthcare Facilities
                    </h3>
                    <span className="text-sm text-gray-400">{places.length} found</span>
                  </div>
                  
                  {/* Scrollable Hospital List */}
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {places.map((place, index) => {
                      const isClosest = closestPlace && closestPlace.id === place.id;
                      const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                      
                      return (
                        <motion.div
                          key={place.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-4 p-4 rounded-xl bg-gray-800/40 border transition-all hover:bg-gray-800/60 ${
                            isClosest 
                              ? 'border-green-500/50 ring-1 ring-green-500/30' 
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          {/* Index/Badge */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isClosest 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {isClosest ? <Star className="w-4 h-4 fill-green-400" /> : index + 1}
                          </div>

                          {/* Hospital Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium truncate">{place.name}</h4>
                              {isClosest && (
                                <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                                  NEAREST
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm truncate mt-0.5">{place.address}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Navigation className="w-3 h-3" />
                                {place.distanceText}
                              </span>
                              <span>~{place.travelTime}</span>
                              {place.amenity && (
                                <span className="capitalize px-1.5 py-0.5 rounded bg-gray-700/50">
                                  {place.amenity}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Navigate Button */}
                          <a
                            href={navigateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              riskLevel === 'HIGH'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : riskLevel === 'MEDIUM'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </a>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loading Places */}
              {placesLoading && (
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-3" />
                  <span className="text-gray-400">Searching for nearby hospitals...</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Location Permission Prompt for Medium Risk */}
        <AnimatePresence>
          {showLocationPrompt && riskLevel === 'MEDIUM' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className={`rounded-2xl backdrop-blur-xl bg-amber-900/20 border border-amber-500/30 p-6`}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/20">
                    <MapPin className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-amber-300">
                      Find Nearby Healthcare Facilities?
                    </h3>
                    <p className="text-amber-400/70 text-sm mt-1">
                      We can show you preventive care centers and diagnostic labs near you.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRequestLocation}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Enable Location
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSkipLocation}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors"
                    >
                      Skip
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Error */}
        <AnimatePresence>
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="rounded-2xl backdrop-blur-xl bg-red-900/20 border border-red-500/30 p-6">
                <div className="flex items-center gap-4">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-300">Location Error</h3>
                    <p className="text-red-400/70 text-sm">{locationError.message}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestLocation}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Try Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map and Places Section - Only for HIGH and MEDIUM risk with location */}
        {riskLevel !== 'LOW' && userLocation && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {riskLevel === 'HIGH' ? (
                  <Ambulance className={`w-6 h-6 ${theme.accentColor}`} />
                ) : (
                  <Stethoscope className={`w-6 h-6 ${theme.accentColor}`} />
                )}
                <h2 className="text-xl font-bold text-white">
                  {riskLevel === 'HIGH' 
                    ? 'Emergency Cardiac Care Centers' 
                    : 'Nearby Healthcare Facilities'}
                </h2>
              </div>
              {placesError && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetryPlaces}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </motion.button>
              )}
            </div>

            {/* Map and Places Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Map Container */}
              <div 
                ref={mapContainerRef}
                className="h-[400px] lg:h-[500px] rounded-2xl overflow-hidden"
              >
                {locationLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900/60 rounded-2xl backdrop-blur-xl border border-white/10">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                      <p className="text-gray-400">Getting your location...</p>
                    </div>
                  </div>
                ) : (
                  <NearbyPlacesMap
                    userLocation={userLocation}
                    places={places}
                    riskLevel={riskLevel}
                    onMapLoad={handleMapLoad}
                    onGetDirections={handleGetDirections}
                    closestPlace={closestPlace}
                  />
                )}
              </div>

              {/* Places List */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPlacesList(!showPlacesList)}
                >
                  <span className="text-gray-400 text-sm">
                    {places.length} facilities found within 10 km
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${showPlacesList ? 'rotate-180' : ''}`}
                  />
                </div>

                <AnimatePresence>
                  {showPlacesList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                      {placesLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                      ) : placesError ? (
                        <div className="text-center py-12">
                          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                          <p className="text-gray-400">Failed to load nearby facilities</p>
                          <p className="text-gray-500 text-sm mt-1">{placesError.message}</p>
                        </div>
                      ) : places.length === 0 ? (
                        <div className="text-center py-12">
                          <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No healthcare facilities found nearby</p>
                          <p className="text-gray-500 text-sm mt-1">Try expanding your search radius</p>
                        </div>
                      ) : (
                        places.slice(0, 10).map((place, index) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            riskLevel={riskLevel}
                            onGetDirections={handleGetDirections}
                            isClosest={closestPlace && closestPlace.id === place.id}
                            index={index}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}

        {/* Low Risk - Healthy Lifestyle Tips */}
        {riskLevel === 'LOW' && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className={`rounded-3xl backdrop-blur-xl bg-gray-900/60 border ${theme.borderColor} p-8`}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                Maintain Your Heart Health
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Regular Exercise', desc: '30 minutes of moderate activity daily', icon: '🏃' },
                  { title: 'Balanced Diet', desc: 'Focus on fruits, vegetables, and whole grains', icon: '🥗' },
                  { title: 'Routine Checkups', desc: 'Annual health screenings recommended', icon: '🩺' }
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-green-900/20 rounded-2xl p-6 border border-green-500/20"
                  >
                    <span className="text-3xl mb-4 block">{tip.icon}</span>
                    <h4 className="text-lg font-semibold text-green-300 mb-2">{tip.title}</h4>
                    <p className="text-gray-400 text-sm">{tip.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default RiskResultPage;
