import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTripStarted, setIsTripStarted] = useState(false); // Controls trip start
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // Trigger geolocation and route tracking
  const handleStartTrip = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
        setIsTripStarted(true);
        startTracking();
      },
      (error) => {
        console.error('Error fetching current location:', error.message);
        setError('Failed to get current location. Please enable location services.');
      },
      { enableHighAccuracy: true }
    );
  };

  const startTracking = () => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);

        if (mapRef.current) {
          mapRef.current.panTo(location);
        }

        if (directionsResponse && !isOnRoute(location, directionsResponse)) {
          fetchRoute(); // Recalculate route if off track
        }
      },
      (error) => {
        console.error('Error updating location:', error.message);
        setError('Failed to update location.');
      },
      { enableHighAccuracy: true }
    );
  };

  const isOnRoute = (location, directions) => {
    if (!directions) return true;
    const steps = directions.routes[0].legs[0].steps;
    for (let step of steps) {
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(location.lat, location.lng),
        step.end_location
      );
      if (distance < 50) return true;
    }
    return false;
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
        drivingOptions: {
          departureTime: new Date(),
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
    setDirectionsResponse(null);
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }
    fetchRoute();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addStop = () => setStops([...stops, '']);
  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));

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
                onChange={(e) => {
                  const newStops = [...stops];
                  newStops[index] = e.target.value;
                  setStops(newStops);
                }}
                placeholder={`Enter stop ${index + 1} address`}
                required
              />
              <button type="button" onClick={() => removeStop(index)}>
                ✕
              </button>
            </label>
          </div>
        ))}
        <button type="button" onClick={addStop}>
          Add Stop
        </button>
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
        <button type="submit" disabled={loading || !isTripStarted}>
          Get Route
        </button>
      </form>

      <button onClick={handleStartTrip} disabled={isTripStarted}>
        Start Trip
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <div>Loading route...</div>}

      {isTripStarted && (
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
      )}

      {directionsResponse && (
        <div className="directions-display">
          <p>
            <strong>Current Step:</strong>{' '}
            {directionsResponse.routes[0].legs[0].steps[currentStepIndex]?.instructions.replace(
              /<b>/g,
              ''
            ).replace(/<\/b>/g, '')}
          </p>
          <button onClick={openModal}>View Full Directions</button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2>Turn-by-Turn Directions</h2>
        <ul>
          {directionsResponse &&
            directionsResponse.routes[0].legs[0].steps.map((step, index) => (
              <li key={index}>{step.instructions.replace(/<b>/g, '').replace(/<\/b>/g, '')}</li>
            ))}
        </ul>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default RoutePlanner;
