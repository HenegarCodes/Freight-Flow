import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RoutePlanner = () => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [endCoordinates, setEndCoordinates] = useState(null);
  const [route, setRoute] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isNavigating]);

  const fetchCoordinates = async (address, setCoordinates) => {
    try {
      const response = await fetch(`https://freight-flow.onrender.com/api/geocode?address=${encodeURIComponent(address)}`);
      if (!response.ok) throw new Error(`Error fetching coordinates: ${response.statusText}`);
      const data = await response.json();
      setCoordinates([data.latitude, data.longitude]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoute = async () => {
    if (startCoordinates && endCoordinates) {
      try {
        const response = await fetch(
          `https://freight-flow.onrender.com/api/route?start=${startCoordinates.join(',')}&end=${endCoordinates.join(',')}`
        );
        if (!response.ok) throw new Error(`Error fetching route: ${response.statusText}`);
        const data = await response.json();
        const routeCoordinates = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRoute(routeCoordinates);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchCoordinates(startAddress, setStartCoordinates);
    await fetchCoordinates(endAddress, setEndCoordinates);
    fetchRoute();
  };

  const startNavigation = () => {
    setIsNavigating(true);
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

      <button onClick={startNavigation} disabled={!route.length}>Start Navigation</button>

      <MapContainer
        center={startCoordinates || [40.7128, -74.0060]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {startCoordinates && <Marker position={startCoordinates} />}
        {endCoordinates && <Marker position={endCoordinates} />}
        {route.length > 0 && <Polyline positions={route} />}
        {userLocation && <Marker position={userLocation} />}
      </MapContainer>
    </div>
  );
};

export default RoutePlanner;
