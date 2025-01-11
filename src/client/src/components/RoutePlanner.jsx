import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker, TrafficLayer } from '@react-google-maps/api';
import Modal from 'react-modal';
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
  const [stops, setStops] = useState([]); // Holds additional stops
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const bottomRef = useRef(null); // Reference to scroll to the bottom of the page

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
        },
        (error) => setError('Failed to track location. Please enable location services.'),
        { enableHighAccuracy: true }
      );
    }

    // Scroll to the bottom section
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const validateFields = () => {
    if (!currentLocation || !endAddress || !truckHeight || !truckWeight) {
      setError('Please provide all required fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDirectionsResponse(null);
    if (validateFields()) {
      fetchRoute();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
                placeholder={`Enter stop ${index + 1} address`}
                required
              />
              <button
                type="button"
                className="remove-stop"
                onClick={() => removeStop(index)}
              >
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

      <div>
        {isTracking ? (
          <button onClick={stopTracking} className="stop-tracking">
            End Trip
          </button>
        ) : (
          <button onClick={startTracking} className="start-tracking">
            Begin Trip
          </button>
        )}
      </div>

      {directionsResponse && (
        <div>
          <button onClick={openModal}>View Turn-by-Turn Directions</button>
        </div>
      )}

      <div ref={bottomRef}>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="directions-modal"
          overlayClassName="modal-overlay"
          contentLabel="Turn-by-Turn Directions"
        >
          <div className="modal-header">
            <h2>Turn-by-Turn Directions</h2>
            <button onClick={closeModal} className="close-button">
              &times;
            </button>
          </div>
          <div className="modal-content">
  <ul className="directions-list">
    {directionsResponse &&
      directionsResponse.routes[0].legs[0].steps.map((step, index) => (
        <li key={index} className="direction-item">
          {step.instructions.replace(/<[^>]+>/g, '')}
        </li>
      ))}
  </ul>
</div>
          <button onClick={closeModal} className="close-modal-button">
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default RoutePlanner;
