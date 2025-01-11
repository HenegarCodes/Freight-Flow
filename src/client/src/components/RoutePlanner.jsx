import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker, TrafficLayer } from '@react-google-maps/api';
import Modal from 'react-modal';
import axios from 'axios';
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  const addStop = () => setStops([...stops, '']);
  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));
  const handleStopChange = (index, value) => setStops(stops.map((stop, i) => (i === index ? value : stop)));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => setError('Failed to get current location. Please enable location services.'),
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const startTracking = () => {
    setIsTracking(true);
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);

          if (mapRef.current) {
            mapRef.current.panTo(location);
          }

          checkDeviation(location);
        },
        (error) => setError('Failed to track location. Please enable location services.'),
        { enableHighAccuracy: true }
      );
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };

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
          setError('Failed to fetch route. Please try again.');
        }
      }
    );
  };

  const checkDeviation = (userLocation) => {
    if (!directionsResponse) return;

    const routeLegs = directionsResponse.routes[0].legs;
    const routePoints = routeLegs.flatMap((leg) => leg.steps.map((step) => step.start_location));

    const distanceToRoute = Math.min(
      ...routePoints.map((point) =>
        google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(userLocation.lat, userLocation.lng),
          new google.maps.LatLng(point.lat(), point.lng())
        )
      )
    );

    if (distanceToRoute > 50) {
      console.log('Recalculating route due to deviation...');
      fetchRoute();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDirectionsResponse(null);
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }
    fetchRoute();
  };

  return (
    <div className="route-planner">
      <form onSubmit={handleSubmit} className="route-form">
        <label>
          Destination Address:
          <input type="text" value={endAddress} onChange={(e) => setEndAddress(e.target.value)} required />
        </label>
        {stops.map((stop, index) => (
          <div key={index} className="stop-field">
            <label>
              Stop {index + 1}:
              <input
                type="text"
                value={stop}
                onChange={(e) => handleStopChange(index, e.target.value)}
                required
              />
              <button type="button" onClick={() => removeStop(index)}>✕</button>
            </label>
          </div>
        ))}
        <button type="button" onClick={addStop}>
          Add Stop
        </button>
        <label>
          Truck Height (ft):
          <input type="number" value={truckHeight} onChange={(e) => setTruckHeight(e.target.value)} required />
        </label>
        <label>
          Truck Weight (lbs):
          <input type="number" value={truckWeight} onChange={(e) => setTruckWeight(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          Get Route
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
          <TrafficLayer />
          {currentLocation && <Marker position={currentLocation} />}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </LoadScript>

      {isTracking ? (
        <button onClick={stopTracking} className="stop-tracking">
          Stop Tracking
        </button>
      ) : (
        <button onClick={startTracking} className="start-tracking">
          Begin Trip
        </button>
      )}

      {directionsResponse && (
        <div className="directions-display">
          <p>
            <strong>Next Step:</strong>{' '}
            {directionsResponse.routes[0].legs[0].steps[currentStepIndex]?.instructions.replace(/<b>/g, '').replace(/<\/b>/g, '') || 'You are approaching your destination.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
