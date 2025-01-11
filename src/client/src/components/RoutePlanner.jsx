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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  const addStop = () => setStops([...stops, '']);
  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));
  const handleStopChange = (index, value) => setStops(stops.map((stop, i) => (i === index ? value : stop)));

  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);

          if (mapRef.current) {
            mapRef.current.panTo(location);
          }
        },
        (error) => setError('Failed to get current location. Please enable location services.'),
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const fetchRoute = (notifyFasterRoute = false) => {
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
          if (notifyFasterRoute && directionsResponse) {
            const currentDuration = directionsResponse.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);
            const newDuration = result.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);

            if (newDuration < currentDuration) {
              if (window.confirm('A faster route is available. Do you want to update?')) {
                setDirectionsResponse(result);
              }
            }
          } else {
            setDirectionsResponse(result);
          }
          setError('');
          saveTrip(result);
        } else {
          setError('Failed to fetch route. Please try again.');
        }
      }
    );
  };

  const saveTrip = async (route) => {
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.userId;

    const optimizedRoute = {
      distance: route.routes[0].legs[0].distance.text,
      duration: route.routes[0].legs[0].duration.text,
      waypoints: route.routes[0].legs[0].steps.map((step) => ({
        start: step.start_location,
        end: step.end_location,
        instructions: step.instructions,
      })),
    };

    try {
      await axios.post(
        '/api/trips',
        { user: userId, start: currentLocation, end: endAddress, stops, truckHeight, truckWeight, route: optimizedRoute },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }
    fetchRoute();
  };

  const checkDeviation = () => {
    if (!directionsResponse) return;

    const routeLegs = directionsResponse.routes[0].legs;
    const routePoints = routeLegs.flatMap((leg) => leg.steps.map((step) => step.start_location));

    const distanceToRoute = Math.min(
      ...routePoints.map((point) =>
        google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
          new google.maps.LatLng(point.lat(), point.lng())
        )
      )
    );

    if (distanceToRoute > 50) fetchRoute(); // Recalculate route if deviation is significant
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (currentLocation && endAddress) fetchRoute(true); // Check for faster route
    }, 30000); // Check every 30 seconds

    const deviationCheckInterval = setInterval(checkDeviation, 10000); // Check for deviation every 10 seconds

    return () => {
      clearInterval(intervalId);
      clearInterval(deviationCheckInterval);
    };
  }, [currentLocation, endAddress, stops]);

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

      {directionsResponse && (
        <div className="directions-display">
          <p>
            <strong>Current Step:</strong>{' '}
            {directionsResponse.routes[0].legs[0].steps[currentStepIndex]?.instructions.replace(/<b>/g, '').replace(/<\/b>/g, '')}
          </p>
          <button onClick={() => setIsModalOpen(true)}>View Full Directions</button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="directions-modal">
        <h2>Turn-by-Turn Directions</h2>
        <ul>
          {directionsResponse?.routes[0].legs[0].steps.map((step, index) => (
            <li key={index}>{step.instructions.replace(/<b>/g, '').replace(/<\/b>/g, '')}</li>
          ))}
        </ul>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default RoutePlanner;
