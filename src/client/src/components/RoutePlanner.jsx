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
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  // Fetch environment variables dynamically from the Render backend
  const fetchEnvVariables = async () => {
    const response = await fetch('/api/env'); // Assuming your backend exposes an `/api/env` endpoint
    const data = await response.json();
    return data;
  };

  const fetchORSRoute = async () => {
    try {
      const { ORS_API_KEY } = await fetchEnvVariables(); // Get ORS API key

      if (!currentLocation || !endAddress) {
        setError('Please provide both current location and destination.');
        return;
      }

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/truck?api_key=${ORS_API_KEY}&start=${currentLocation.lng},${currentLocation.lat}&end=${endAddress}&maximum_height=${truckHeight}&maximum_weight=${truckWeight}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route from OpenRouteService');
      }

      const data = await response.json();
      const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setRouteCoordinates(coordinates);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch route. Please try again.');
    }
  };

  useEffect(() => {
    // Request current location from the browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setError('Please enable location services.');
        }
      );
    }
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

    // Fetch the route
    await fetchORSRoute();
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

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} // Still coming from frontend env
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
