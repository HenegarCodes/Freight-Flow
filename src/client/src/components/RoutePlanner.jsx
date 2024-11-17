import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RoutePlanner = () => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [endCoordinates, setEndCoordinates] = useState(null);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState('');

  // Fetch coordinates for given address
  const fetchCoordinates = async (address, setCoordinates) => {
    try {
      const response = await fetch(`https://freight-flow.onrender.com/api/geocode?address=${encodeURIComponent(address)}`);
      if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`);
      const data = await response.json();
      console.log(`Coordinates for "${address}":`, data);
      setCoordinates([data.latitude, data.longitude]);
    } catch (error) {
      setError(`Error fetching coordinates for "${address}": ${error.message}`);
      console.error(error);
    }
  };

  // Fetch route from start to end coordinates
  const fetchRoute = async () => {
    if (startCoordinates && endCoordinates) {
      try {
        const response = await fetch(
          `https://freight-flow.onrender.com/api/route?start=${startCoordinates.join(',')}&end=${endCoordinates.join(',')}&profile=driving-hgv`
        );
        if (!response.ok) throw new Error(`Routing failed: ${response.statusText}`);
        const data = await response.json();
        console.log('Route data:', data);

        if (!data.features || data.features.length === 0) {
          throw new Error('No route data returned from ORS');
        }

        // Extract route geometry
        const routeCoordinates = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        console.log('Processed route coordinates:', routeCoordinates);
        setRoute(routeCoordinates);
      } catch (error) {
        setError(`Error fetching route: ${error.message}`);
        console.error(error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRoute([]); // Clear previous route
    await fetchCoordinates(startAddress, setStartCoordinates);
    await fetchCoordinates(endAddress, setEndCoordinates);
    fetchRoute();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Start Address:
          <input type="text" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
        </label>
        <label>
          End Address:
          <input type="text" value={endAddress} onChange={(e) => setEndAddress(e.target.value)} />
        </label>
        <button type="submit">Get Route</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <MapContainer
        center={startCoordinates || [40.7128, -74.0060]} // Default to NYC if no coordinates
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Show start and end markers */}
        {startCoordinates && <Marker position={startCoordinates} />}
        {endCoordinates && <Marker position={endCoordinates} />}

        {/* Display the route as a polyline */}
        {route.length > 0 && <Polyline positions={route} color="blue" weight={5} />}
      </MapContainer>
    </div>
  );
};

export default RoutePlanner;
