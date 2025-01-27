import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
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
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const addStop = () => setStops([...stops, '']);
  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };
  const removeStop = (index) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Error fetching location:', err.message);
          setError('Failed to fetch location. Please enable location services in your browser.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchRoute = () => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination: endAddress,
        waypoints: stops.map((stop) => ({ location: stop, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          setError('');
        } else {
          console.error('Error fetching route:', status);
          setError('Failed to fetch route. Please check your input and try again.');
        }
      }
    );
  };

  const handleSubmit = (e) => {
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

    if (stops.some((stop) => stop.trim() === '')) {
      setError('Please fill out all stop fields or remove empty stops.');
      return;
    }

    fetchRoute();
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
        {stops.map((stop, index) => (
          <div key={index} className="stop-field">
            <label>
              Stop {index + 1}:
              <input
                type="text"
                value={stop}
                onChange={(e) => handleStopChange(index, e.target.value)}
                placeholder={`Enter stop ${index + 1}`}
              />
              <button type="button" className="remove-stop" onClick={() => removeStop(index)}>
                ✕
              </button>
            </label>
          </div>
        ))}
        <button type="button" onClick={addStop}>
          Add Stop
        </button>
        <button type="submit" disabled={!currentLocation || loading}>
          Fetch Route
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <div className="spinner">Loading route...</div>}

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || center}
          zoom={13}
          onLoad={(map) => (mapRef.current = map)}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default RoutePlanner;
