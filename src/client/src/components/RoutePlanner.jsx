import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import './RoutePlanner.css';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 33.336675,
  lng: -111.792417,
};

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [endAddress, setEndAddress] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
  const watchId = useRef(null);
  const mapRef = useRef(null);

  // Fetch destination coordinates from address
  const getCoordinatesFromAddress = async (address) => {
    try {
      const ORS_API_KEY = 'your-ors-api-key-here';
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch destination coordinates');
      }

      const data = await response.json();
      const coordinates = data.features[0].geometry.coordinates;
      return [coordinates[0], coordinates[1]]; // lng, lat
    } catch (err) {
      console.error('Geocoding error:', err.message);
      setError('Failed to fetch destination coordinates.');
      return null;
    }
  };

  // Fetch route from OpenRouteService
  const fetchORSRoute = async () => {
    try {
      if (!destinationCoordinates || !currentLocation) {
        throw new Error('Current location or destination coordinates are missing.');
      }

      const ORS_API_KEY = 'your-ors-api-key-here';
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${ORS_API_KEY}&start=${currentLocation.lng},${currentLocation.lat}&end=${destinationCoordinates[0]},${destinationCoordinates[1]}&maximum_height=${truckHeight}&maximum_weight=${truckWeight}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route from OpenRouteService');
      }

      const data = await response.json();
      const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setRouteCoordinates(coordinates);
    } catch (err) {
      console.error('Route fetching error:', err.message);
      setError('Failed to fetch route. Please try again.');
    }
  };

  // Start continuous location tracking
  const startTracking = () => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCurrentLocation(newLocation);

          // Recalculate the route dynamically
          if (destinationCoordinates) {
            fetchORSRoute();
          }

          // Pan the map to the new location
          if (mapRef.current) {
            mapRef.current.panTo(newLocation);
          }
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setError('Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const location = { lat: latitude, lng: longitude };
            console.log('Fetched Current Location:', location);
            setCurrentLocation(location);
            setError(''); // Clear any previous errors
          },
          (err) => {
            console.error('Geolocation error:', err.message);
            switch (err.code) {
              case 1:
                setError(
                  'Location access denied. Please allow location access in your browser settings.'
                );
                break;
              case 2:
                setError('Location unavailable. Ensure GPS is enabled.');
                break;
              case 3:
                setError('Location request timed out. Please try again.');
                break;
              default:
                setError('Please enable location services.');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 0,
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    };
  
    fetchLocation();
  
    const interval = setInterval(fetchLocation, 30000); // Recheck every 30 seconds in case location updates are needed
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate fields
    if (!currentLocation) {
      setError('Current location is unavailable. Please enable location services.');
      return;
    }

    if (!endAddress || endAddress.trim() === '') {
      setError('Please provide a valid destination address.');
      return;
    }

    if (!truckHeight || parseFloat(truckHeight) <= 0) {
      setError('Please provide a valid truck height.');
      return;
    }

    if (!truckWeight || parseFloat(truckWeight) <= 0) {
      setError('Please provide a valid truck weight.');
      return;
    }

    try {
      // Fetch destination coordinates
      const coordinates = await getCoordinatesFromAddress(endAddress);
      if (!coordinates) {
        throw new Error('Failed to fetch destination coordinates');
      }

      setDestinationCoordinates(coordinates);

      // Start location tracking and fetch the initial route
      startTracking();
    } catch (err) {
      console.error('Error during route planning:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="route-planner">
      <form onSubmit={handleSubmit} className="route-form">
        <label>
          Destination Address:
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            placeholder="Enter destination address"
            required
          />
        </label>
        <label>
          Truck Height (ft):
          <input
            type="number"
            value={truckHeight}
            onChange={(e) => setTruckHeight(e.target.value)}
            placeholder="Enter truck height"
            required
          />
        </label>
        <label>
          Truck Weight (lbs):
          <input
            type="number"
            value={truckWeight}
            onChange={(e) => setTruckWeight(e.target.value)}
            placeholder="Enter truck weight"
            required
          />
        </label>
        <button type="submit">Start Trip</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} // Pulling Google Maps API key from .env
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || center}
          zoom={13}
          onLoad={(map) => (mapRef.current = map)}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {routeCoordinates.length > 0 && (
            <Polyline
              path={routeCoordinates}
              options={{
                strokeColor: '#ff0000',
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default RoutePlanner;
