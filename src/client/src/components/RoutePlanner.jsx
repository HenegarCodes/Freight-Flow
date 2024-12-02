import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
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
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Track current step
  const [isNavigating, setIsNavigating] = useState(false); // Track navigation state
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // Fetch directions and prepare navigation
  const fetchRoute = () => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: startAddress,
        destination: endAddress,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          console.log(result);
          saveTrip(result); // Save the trip after fetching the route
          setError('');
        } else {
          console.error('Error fetching route:', status);
          setError('Failed to fetch route. Please try again.');
        }
      }
    );
  };

  // Save the trip to the backend
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
      const response = await axios.post(`https://freight-flow.onrender.com/api/trips`, {
        start: startAddress,
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

  // Start navigation
  const startNavigation = () => {
    if (!directionsResponse) {
      setError('No route to navigate. Fetch a route first.');
      return;
    }

    setCurrentStepIndex(0); // Start from the first step
    setIsNavigating(true);
    startRealTimeTracking();
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    stopRealTimeTracking();
  };

  // Start real-time tracking
  const startRealTimeTracking = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };

          // Update the map center to user's current location
          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
          }

          // Move to the next step if the user reaches the current step's end location
          handleStepProgress(userLocation);
        },
        (error) => {
          console.error('Error with geolocation:', error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Stop real-time tracking
  const stopRealTimeTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Handle step progress
  const handleStepProgress = (userLocation) => {
    const steps = directionsResponse.routes[0].legs[0].steps;
    const currentStep = steps[currentStepIndex];
    const nextStep = steps[currentStepIndex + 1];

    // Calculate distance to the current step's end location
    const distanceToCurrentStepEnd = calculateDistanceToNextStep(
      userLocation,
      currentStep.end_location
    );

    if (distanceToCurrentStepEnd < 50 && nextStep) {
      // Move to the next step
      setCurrentStepIndex(currentStepIndex + 1);
      speakStep(nextStep.instructions); // Provide spoken directions for the next step
    }
  };

  // Calculate distance to the next step
  const calculateDistanceToNextStep = (userLocation, stepLocation) => {
    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
      stepLocation
    );
  };

  // Provide spoken directions for a step
  const speakStep = (instruction) => {
    const utterance = new SpeechSynthesisUtterance(instruction);
    speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDirectionsResponse(null); // Clear previous route
    if (!startAddress || !endAddress) {
      setError('Please enter valid start and end addresses.');
      return;
    }
    fetchRoute();
  };

  useEffect(() => {
    // Cleanup tracking on component unmount
    return () => stopRealTimeTracking();
  }, []);

  return (
    <div className="route-planner">
      <form onSubmit={handleSubmit} className="route-form">
        <label>
          Start Address:
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="Enter starting address"
          />
        </label>
        <label>
          End Address:
          <input
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
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
        <button type="submit">Get Route</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <div className="spinner">Loading route...</div>}

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={(map) => (mapRef.current = map)} // Save map reference
        >
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </LoadScript>

      {directionsResponse && (
        <div className="navigation-controls">
          {!isNavigating ? (
            <button onClick={startNavigation}>Start Trip</button>
          ) : (
            <button onClick={stopNavigation}>Stop Trip</button>
          )}
          <p>
            Current Step: {directionsResponse.routes[0].legs[0].steps[currentStepIndex]?.instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
