import React, { useState } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './RoutePlanner.css'; // For styling (spinner, sidebar, etc.)


const containerStyle = {
  width: '100%',
  height: '400px',
};

console.log("Google Maps API Key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

const RoutePlanner = () => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidAddress = (address) => address && address.trim().length > 5;

  const fetchRoute = () => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: startAddress,
        destination: endAddress,
        waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'pessimistic',
        },
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          setError('');
        } else {
          console.error('Error fetching route:', status);
          setError('Failed to fetch route. Please try again.');
        }
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDirectionsResponse(null); // Clear previous route
    if (!isValidAddress(startAddress) || !isValidAddress(endAddress)) {
      setError('Please enter valid addresses for both start and end locations.');
      return;
    }
    fetchRoute();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Start Address:
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
          />
        </label>
        <label>
          End Address:
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
          />
        </label>
        <button type="submit">Get Route</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <div className="spinner">Loading route...</div>}

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: 33.336675, lng: -111.792417 }}
          zoom={13}
          onClick={(e) =>
            setWaypoints((prev) => [...prev, { lat: e.latLng.lat(), lng: e.latLng.lng() }])
          }
        >
          {waypoints.map((point, index) => (
            <Marker
              key={index}
              position={point}
              draggable={true}
              onDragEnd={(e) =>
                setWaypoints((prev) =>
                  prev.map((wp, i) =>
                    i === index
                      ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
                      : wp
                  )
                )
              }
            />
          ))}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default RoutePlanner;
