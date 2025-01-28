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
  const [routeActive, setRouteActive] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  //const ORS_API_KEY = '5b3ce3597851110001cf62486b2de50d91c74f5a8a6483198b519885'; 

  // Fetch destination coordinates from address
  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch destination coordinates');
      }

      const data = await response.json();
      const coordinates = data.features[0].geometry.coordinates;
      console.log('Fetched Destination Coordinates:', coordinates);
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
      if (!currentLocation || !destinationCoordinates) {
        throw new Error('Current location or destination coordinates are missing.');
      }

      console.log('Fetching route...');
      console.log('Current Location:', currentLocation);
      console.log('Destination Coordinates:', destinationCoordinates);

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${ORS_API_KEY}&start=${currentLocation.lng},${currentLocation.lat}&end=${destinationCoordinates[0]},${destinationCoordinates[1]}&maximum_height=${truckHeight}&maximum_weight=${truckWeight}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch route from OpenRouteService');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data.features || data.features.length === 0) {
        setError('No valid route found. Adjust truck restrictions or check the destination.');
        return;
      }

      const coordinates = data.features[0].geometry.coordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));
      console.log('Route Coordinates:', coordinates);
      setRouteCoordinates(coordinates);
      setRouteActive(true); // Route is now active
    } catch (err) {
      console.error('Route fetching error:', err.message);
      setError(err.message || 'Failed to fetch route. Please try again.');
    }
  };

  // Save the route and mark it as completed
  const handleEndRoute = async () => {
    try {
      if (!routeCoordinates || routeCoordinates.length === 0) {
        throw new Error('No route available to save.');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Decode token to get userId 
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken?.userId;

      if (!userId) {
        throw new Error('Failed to retrieve user ID. Please log in again.');
      }

      // Assume distance and duration were calculated and stored when fetching the route
      const tripData = {
        user: userId,
        start: currentLocation, // Current starting location { lat, lng }
        end: endAddress, // User-provided destination address
        stops: [], // Add stops if applicable
        truckHeight: truckHeight.toString(),
        truckWeight: truckWeight.toString(),
        route: {
          coordinates: routeCoordinates, // The route coordinates array
          distance: `${(routeCoordinates.length * 1.609).toFixed(2)} mi`, // Replace with your actual distance calculation logic
          duration: `${(routeCoordinates.length * 2).toFixed(0)} mins`, // Replace with your actual duration calculation logic
        },
      };

      console.log('Trip Data Sent to Backend:', tripData);

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Backend Error:', error);
        throw new Error(error.error || 'Failed to save the trip');
      }

      alert('Route completed and saved successfully!');
      setRouteCoordinates([]); // Clear the map
      setRouteActive(false); // Reset the active route state
    } catch (err) {
      console.error('Error saving route:', err.message);
      setError(err.message || 'Failed to save the route.');
    }
  };

  // Live tracking: Update user's current location
  useEffect(() => {
    if (routeActive) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          console.log('Live Location Update:', location);
          setCurrentLocation(location);
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setError('Failed to track location.');
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId); // Cleanup
    }
  }, [routeActive]);

  // Trigger route fetching when destinationCoordinates is updated
  useEffect(() => {
    if (destinationCoordinates) {
      fetchORSRoute();
    }
  }, [destinationCoordinates]);

  // Request current location initially
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        console.log('Fetched Current Location:', location);
        setCurrentLocation(location);
      },
      (err) => {
        console.error('Geolocation error:', err.message);
        setError('Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const coordinates = await getCoordinatesFromAddress(endAddress);
      if (!coordinates) {
        throw new Error('Failed to fetch destination coordinates');
      }

      setDestinationCoordinates(coordinates);
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
        <button type="submit">Fetch Route</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {routeActive && (
        <button onClick={handleEndRoute} className="end-route-button">
          End Route
        </button>
      )}

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
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
