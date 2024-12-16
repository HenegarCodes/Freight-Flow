import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import Modal from 'react-modal';
import axios from 'axios';
import { debounce, throttle } from '../utils/debounceThrottle'; // Import the utilities
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
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // Test Debounce for Input Changes
  const handleInputChange = debounce((value) => {
    console.log(`Debounced input: ${value}`);
  }, 500);

  const onAddressChange = (e) => {
    setEndAddress(e.target.value);
    handleInputChange(e.target.value);
  };

  // Test Throttle for Location Updates
  const throttledUpdateLocation = throttle((location) => {
    console.log('Throttled location update:', location);
  }, 2000);

  // Fetch the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);

          throttledUpdateLocation(location); // Test throttling here

          if (mapRef.current) {
            mapRef.current.panTo(location);
          }

          updateCurrentStep(location); // Update steps based on location
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
    };
  }, []);

  const fetchRoute = () => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination: endAddress,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          setError('');
          saveTrip(result);
        } else {
          console.error('Error fetching route:', status);
          setError('Failed to fetch route. Please try again.');
        }
      }
    );
  };

  const saveTrip = async (route) => {
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
      const response = await axios.post(`/api/trips`, {
        start: currentLocation,
        end: endAddress,
        truckHeight,
        truckWeight,
        route: optimizedRoute,
      });
      console.log('Trip saved:', response.data);
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  const updateCurrentStep = (userLocation) => {
    if (!directionsResponse) return;

    const steps = directionsResponse.routes[0].legs[0].steps;
    for (let i = 0; i < steps.length; i++) {
      const stepStart = steps[i].start_location;
      const stepEnd = steps[i].end_location;
      const distanceToStart = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        new google.maps.LatLng(stepStart.lat(), stepStart.lng())
      );
      const distanceToEnd = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        new google.maps.LatLng(stepEnd.lat(), stepEnd.lng())
      );

      if (distanceToStart < 50 || distanceToEnd < 50) {
        setCurrentStepIndex(i);
        break;
      }
    }
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
            onChange={onAddressChange} // Use debounced change handler
            placeholder="Enter destination address"
          />
        </label>
        <label>
          Truck Height (ft):
          <input
            type="number"
            value={truckHeight}
            onChange={(e) => setTruckHeight(e.target.value)}
            placeholder="Enter truck height"
          />
        </label>
        <label>
          Truck Weight (lbs):
          <input
            type="number"
            value={truckWeight}
            onChange={(e) => setTruckWeight(e.target.value)}
            placeholder="Enter truck weight"
          />
        </label>
        <button type="submit" disabled={!currentLocation || loading}>
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
          <p>
            <strong>Next Step:</strong>{' '}
            {directionsResponse.routes[0].legs[0].steps[currentStepIndex + 1]?.instructions.replace(
              /<b>/g,
              ''
            ).replace(/<\/b>/g, '') || 'You are approaching your destination.'}
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
