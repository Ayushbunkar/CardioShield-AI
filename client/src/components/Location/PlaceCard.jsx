import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Clock, 
  Navigation, 
  Phone,
  ExternalLink,
  Ambulance,
  Building2,
  Stethoscope
} from 'lucide-react';

/**
 * Place card component for displaying healthcare facility information
 * 
 * @param {Object} props
 * @param {Object} props.place - Place data object
 * @param {string} props.riskLevel - 'HIGH', 'MEDIUM', or 'LOW'
 * @param {Function} props.onGetDirections - Callback for getting directions
 * @param {boolean} props.isClosest - Whether this is the closest place
 * @param {number} props.index - Animation index
 */
const PlaceCard = ({ 
  place, 
  riskLevel = 'MEDIUM', 
  onGetDirections, 
  isClosest = false,
  index = 0 
}) => {
  // Theme colors based on risk level
  const themes = {
    HIGH: {
      accentColor: 'bg-red-500',
      accentText: 'text-red-400',
      borderColor: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/50',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      closestBg: 'bg-red-500/20',
      icon: Ambulance
    },
    MEDIUM: {
      accentColor: 'bg-amber-500',
      accentText: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/50',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      closestBg: 'bg-amber-500/20',
      icon: Stethoscope
    },
    LOW: {
      accentColor: 'bg-green-500',
      accentText: 'text-green-400',
      borderColor: 'border-green-500/30',
      hoverBorder: 'hover:border-green-500/50',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      closestBg: 'bg-green-500/20',
      icon: Building2
    }
  };

  const theme = themes[riskLevel] || themes.MEDIUM;
  const IconComponent = theme.icon;

  const handleDirectionsClick = () => {
    if (onGetDirections) {
      onGetDirections(place);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars 
                ? 'fill-yellow-400 text-yellow-400' 
                : i === fullStars && hasHalfStar
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">
          {rating.toFixed(1)} ({place.userRatingsTotal})
        </span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl bg-gray-900/60 
        border ${theme.borderColor} ${theme.hoverBorder}
        shadow-xl hover:shadow-2xl
        transition-all duration-300
        ${isClosest ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-opacity-50' : ''}
      `}
      style={isClosest ? { ringColor: theme.accentColor.replace('bg-', '') } : {}}
    >
      {/* Closest badge */}
      {isClosest && (
        <div className={`absolute top-0 right-0 ${theme.closestBg} px-3 py-1 rounded-bl-xl`}>
          <span className={`text-xs font-semibold ${theme.accentText}`}>
            Nearest
          </span>
        </div>
      )}

      {/* Emergency indicator for high risk */}
      {riskLevel === 'HIGH' && (
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-xl ${theme.accentColor}
            flex items-center justify-center shadow-lg
          `}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          {/* Title and address */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {place.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              <MapPin className="w-3 h-3 inline-block mr-1" />
              {place.address}
            </p>
          </div>
        </div>

        {/* Rating */}
        {place.rating && (
          <div className="mt-4">
            {renderStars(place.rating)}
          </div>
        )}

        {/* Distance and time info */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Navigation className="w-4 h-4" />
            <span className="text-sm font-medium">{place.distanceText}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm">~{place.travelTime}</span>
          </div>
          {place.isOpen !== null && (
            <div className={`flex items-center gap-1 ${place.isOpen ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${place.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs">{place.isOpen ? 'Open' : 'Closed'}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDirectionsClick}
            className={`
              flex-1 flex items-center justify-center gap-2
              ${theme.buttonBg} text-white
              py-3 px-4 rounded-xl font-medium
              transition-colors duration-200
              shadow-lg hover:shadow-xl
            `}
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </motion.button>

          {place.phone && (
            <motion.a
              href={`tel:${place.phone}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="
                flex items-center justify-center
                bg-gray-700 hover:bg-gray-600 text-white
                py-3 px-4 rounded-xl
                transition-colors duration-200
              "
            >
              <Phone className="w-4 h-4" />
            </motion.a>
          )}

          <motion.a
            href={`https://www.google.com/maps/place/?q=place_id:${place.id}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="
              flex items-center justify-center
              bg-gray-700 hover:bg-gray-600 text-white
              py-3 px-4 rounded-xl
              transition-colors duration-200
            "
          >
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceCard;
