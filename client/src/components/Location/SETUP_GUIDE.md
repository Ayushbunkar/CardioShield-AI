# Risk-Based Smart Location Assistance - Setup Guide

## Overview

This feature provides intelligent location-based healthcare facility recommendations based on cardiovascular risk assessment results from the CardioShield AI model.

**🆓 100% FREE - No API Keys Required!**

Uses:
- **Leaflet + react-leaflet** for interactive maps
- **OpenStreetMap** for map tiles (free)
- **Overpass API** for healthcare facility search (free)
- **Google Maps URL redirect** for navigation (no API key needed)

## Folder Structure

```
client/src/
├── components/
│   └── Location/
│       ├── index.js              # Component exports
│       ├── RiskResultPage.jsx    # Main risk result page
│       ├── RiskMeter.jsx         # Animated circular risk meter
│       ├── PlaceCard.jsx         # Healthcare facility card
│       └── NearbyPlacesMap.jsx   # Leaflet/OpenStreetMap integration
├── hooks/
│   ├── useUserLocation.js        # Browser geolocation hook
│   └── useNearbyPlaces.js        # Overpass API hook (OSM places)
└── .env.example                  # Environment template
```

## Installation

### Step 1: Install Dependencies

```bash
cd client
npm install leaflet react-leaflet --legacy-peer-deps
```

### Step 2: Import Leaflet CSS

The CSS is already imported in `NearbyPlacesMap.jsx`:
```javascript
import 'leaflet/dist/leaflet.css';
```

### Step 3: That's It!

No API keys, no billing setup, no Cloud Console configuration needed!

## Usage

### Basic Integration

```jsx
import { RiskResultPage } from '../components/Location';

function AssessmentResults({ assessmentResult }) {
  const handleNewAssessment = () => {
    // Navigate back to assessment form
  };

  return (
    <RiskResultPage
      riskProbability={assessmentResult.probability}
      assessmentData={assessmentResult.data}
      onNewAssessment={handleNewAssessment}
    />
  );
}
```

### Using Individual Components

```jsx
import { RiskMeter, PlaceCard } from '../components/Location';
import useUserLocation from '../hooks/useUserLocation';
import useNearbyPlaces from '../hooks/useNearbyPlaces';

function CustomRiskDisplay({ probability }) {
  const riskLevel = probability > 70 ? 'HIGH' : probability >= 40 ? 'MEDIUM' : 'LOW';
  
  return <RiskMeter riskProbability={probability} riskLevel={riskLevel} />;
}
```

### Using Hooks Independently

```jsx
import useUserLocation from '../hooks/useUserLocation';
import useNearbyPlaces from '../hooks/useNearbyPlaces';

function LocationComponent() {
  const { location, requestLocation, loading } = useUserLocation();
  const { places, fetchNearbyPlaces, closestPlace } = useNearbyPlaces();

  const handleGetLocation = async () => {
    try {
      const coords = await requestLocation();
      // Fetch nearby hospitals (no map instance needed!)
      await fetchNearbyPlaces(null, coords, 'HIGH', 10000);
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={loading}>
        {loading ? 'Getting location...' : 'Find Nearby Hospitals'}
      </button>
      
      {places.map(place => (
        <div key={place.id}>
          {place.name} - {place.distanceText}
        </div>
      ))}
    </div>
  );
}
```

## Risk-Based Activation Logic

| Risk Level | Probability | Location Trigger | Places Shown |
|------------|-------------|------------------|--------------|
| HIGH       | > 70%       | Auto-triggered   | Hospitals, Clinics, Doctors |
| MEDIUM     | 40-70%      | Optional prompt  | Hospitals, Clinics, Pharmacies |
| LOW        | < 40%       | Not triggered    | None (healthy tips shown) |

## Features

### Core Features
- ✅ Animated circular risk meter with color-coded themes
- ✅ Risk-based location permission handling
- ✅ Leaflet + OpenStreetMap integration (FREE!)
- ✅ Overpass API for healthcare facility search (FREE!)
- ✅ Distance and travel time estimation
- ✅ Navigate button (opens Google Maps in new tab - no API needed)
- ✅ Closest facility highlighting
- ✅ Leaflet default marker icon fix for Vite

### UI/UX Features
- ✅ Glassmorphism design
- ✅ Framer Motion animations
- ✅ Emergency pulse animation for high risk
- ✅ Responsive layout
- ✅ Custom scrollbar styling
- ✅ Loading states and error handling

### Error Handling
- ✅ Permission denied handling
- ✅ Location unavailable handling
- ✅ API error handling
- ✅ No results found handling
- ✅ Retry functionality

## Navigation Button

The "Navigate" button in each popup/card opens Google Maps with directions:

```javascript
// URL format (no API key required!)
const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
window.open(url, '_blank');
```

This is a simple URL redirect that opens Google Maps in the user's browser - completely free!

## Customization

### Modifying Search Types

Edit `useNearbyPlaces.js`:

```javascript
export const HEALTHCARE_TYPES = {
  HIGH_RISK: ['hospital', 'clinic', 'doctors'],
  MEDIUM_RISK: ['hospital', 'clinic', 'doctors', 'pharmacy'],
  LOW_RISK: []
};
```

### Adjusting Search Radius

In `RiskResultPage.jsx`, modify the `fetchNearbyPlaces` call:

```javascript
// Change from 10000 (10km) to desired radius in meters
fetchNearbyPlaces(null, userLocation, riskLevel, 15000);
```

### Customizing Theme Colors

Edit the `themes` object in `RiskMeter.jsx` or `RiskResultPage.jsx`:

```javascript
const themes = {
  HIGH: {
    gradient: ['#7a1d1d', '#ff4d4d'],
    // ... other properties
  },
  // ...
};
```

### Custom Map Tiles

You can change the tile provider in `NearbyPlacesMap.jsx`:

```jsx
// Default OpenStreetMap
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; OpenStreetMap contributors'
/>

// CartoDB Dark (alternative dark theme)
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; OpenStreetMap, CartoDB'
/>

// MapTiler Streets (requires free API key)
<TileLayer
  url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_KEY"
  attribution='&copy; MapTiler'
/>
```

## Technologies Used

| Technology | Purpose | Cost |
|------------|---------|------|
| Leaflet | Interactive maps library | FREE |
| react-leaflet | React wrapper for Leaflet | FREE |
| OpenStreetMap | Map tile provider | FREE |
| Overpass API | Healthcare facility search | FREE |
| Google Maps URL | Navigation redirect | FREE |
| navigator.geolocation | Browser geolocation | FREE |

## Troubleshooting

### Leaflet markers not showing
The code includes the fix for Leaflet's default marker icon issue in Vite:

```javascript
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
```

### Overpass API timeout
If searches timeout, try:
1. Reduce the search radius
2. Use a different Overpass endpoint:
   ```javascript
   const OVERPASS_API_URL = 'https://overpass.kumi.systems/api/interpreter';
   ```

### No places found
- OpenStreetMap data coverage varies by region
- Try increasing search radius
- Check if area has healthcare facilities mapped

### Location permission denied
- The app handles this gracefully with appropriate error messages
- Users can click "Try Again" or enable manually in browser settings

## Comparison: Google Maps vs OpenStreetMap

| Feature | Google Maps | OpenStreetMap (This Implementation) |
|---------|-------------|-------------------------------------|
| API Key Required | ✅ Yes | ❌ No |
| Billing Setup | ✅ Required | ❌ Not needed |
| Monthly Cost | $200+ free tier, then billed | $0 always |
| Map Quality | Excellent | Very Good |
| Places Data | Comprehensive | Good (community-maintained) |
| Ratings | ✅ Available | ❌ Not available |
| Real-time Hours | ✅ Available | ❌ Limited |
| Navigation | API or URL | URL only (opens Google Maps) |

## Support

For issues specific to this feature:
1. Check browser console for JavaScript errors
2. Check Network tab for API failures
3. Verify Leaflet CSS is loaded
4. Test geolocation in browser dev tools
