import React, { useState, useEffect, useRef } from 'react';
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const recalculationIntervalRef = useRef(null);

  const addStop = () => {
    setStops([...stops, '']);
  };

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
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);

          if (mapRef.current) {
            mapRef.current.panTo(location);
          }
        },
        (error) => {
          console.error('Error fetching current location:', error.message);
          setError('Failed to get current location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (recalculationIntervalRef.current) {
        clearInterval(recalculationIntervalRef.current);
      }
    };
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
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'best_guess',
        },
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          setError('');
          saveTrip(result);
          startRecalculation(result);
        } else {
          console.error('Error fetching route:', status);
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
        {
          user: userId,
          start: currentLocation,
          end: endAddress,
          stops,
          truckHeight,
          truckWeight,
          route: optimizedRoute,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  const startRecalculation = (initialRoute) => {
    recalculationIntervalRef.current = setInterval(() => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentLocation,
          destination: endAddress,
          waypoints: stops.map((stop) => ({ location: stop, stopover: true })),
          travelMode: window.google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'best_guess',
          },
        },
        (newResult, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const newDuration = newResult.routes[0].legs[0].duration.value;
            const oldDuration = initialRoute.routes[0].legs[0].duration.value;
            if (newDuration < oldDuration) {
              setDirectionsResponse(newResult);
              setNotification('Route updated to save time!');
              setTimeout(() => setNotification(''), 5000);
            }
          }
        }
      );
    }, 120000); // Recalculate every 2 minutes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDirectionsResponse(null);
    if (!currentLocation) {
      setError('Current location is unavailable. Please try again.');
      return;
    }
    if (!endAddress) {
      setError('Please enter a valid destination address.');
      return;
    }
    fetchRoute();
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
        <button type="submit" disabled={!currentLocation || loading}>
          Start Trip
        </button>
      </form>

      {notification && <div className="notification">{notification}</div>}
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
                  {step.instructions.replace(/<b>/g, '').replace(/<\/b>/g, '')}
                </li>
              ))}
          </ul>
        </div>
        <button onClick={closeModal} className="close-modal-button">
          Close
        </button>
      </Modal>
    </div>
  );
};

export default RoutePlanner;
