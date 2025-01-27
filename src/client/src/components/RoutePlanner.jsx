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
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const fetchEnvVariables = async () => {
    const response = await fetch('/api/env');
    const data = await response.json();
    return data;
  };

  const fetchCoordinates = async (address, apiKey) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`
      );

      if (!response.ok) throw new Error('Failed to fetch coordinates');
      const data = await response.json();

      if (data.features.length === 0) {
        throw new Error('No coordinates found for this address');
      }

      return data.features[0].geometry.coordinates;
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to geocode the destination address. Please check and try again.');
      return null;
    }
  };

  const fetchORSRoute = async (destinationCoords) => {
    try {
      console.log('Current Location:', currentLocation);
      console.log('Destination Coordinates:', destinationCoords);
  
      const response = await fetch(
        `/api/route?start=${currentLocation.lng},${currentLocation.lat}&end=${destinationCoords[0]},${destinationCoords[1]}&height=${truckHeight}&weight=${truckWeight}`
      );
  
      console.log('ORS API Request:', response.url);
  
      if (!response.ok) {
        throw new Error('Failed to fetch route from backend');
      }
  
      const data = await response.json();
      console.log('ORS API Response:', data);
  
      const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setRouteCoordinates(coordinates);
    } catch (err) {
      console.error('Route fetching error:', err);
      setError('Failed to fetch the route. Please try again.');
    }
  };
  
  
  useEffect(() => {
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
  
    // Fetch destination coordinates
    const { ORS_API_KEY } = await fetchEnvVariables();
    const coords = await fetchCoordinates(endAddress, ORS_API_KEY);
  
    console.log('Destination Coordinates:', coords);
  
    if (!coords) {
      setError('Failed to fetch destination coordinates. Please check the address and try again.');
      return;
    }
  
    setDestinationCoords(coords); // Set state with valid coordinates
    console.log('Destination Coordinates Set:', coords);
  
    // Fetch the route
    await fetchORSRoute(coords); // Pass the coordinates to the route function
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
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
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
