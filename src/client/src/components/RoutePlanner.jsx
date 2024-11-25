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
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  // Fetch directions and initialize tracking
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
          startTracking(result.routes[0].legs[0]); // Start real-time tracking with the route
          saveTrip(result); // Save trip after fetching the route
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
    try {
      const response = await axios.post('/api/trips', {
        start: startAddress,
        end: endAddress,
        truckHeight,
        truckWeight,
        route,
      });
      console.log('Trip saved:', response.data);
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  // Start real-time tracking
  const startTracking = (routeLeg) => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };

          // Update the map center to user's current location
          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
          }

          // Optional: Calculate if user deviates from the route
          const distanceToNextStep = calculateDistanceToNextStep(userLocation, routeLeg);
          if (distanceToNextStep > 500) {
            // Recalculate the route if deviation exceeds threshold
            fetchRoute();
          }
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

  // Stop tracking when trip is finished
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Utility function to calculate distance to the next step
  const calculateDistanceToNextStep = (userLocation, routeLeg) => {
    const nextStep = routeLeg.steps[0].end_location; // Get the first step's end location
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userLocation.lat, userLocation.lng),
      new google.maps.LatLng(nextStep.lat(), nextStep.lng())
    );
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
    return () => stopTracking();
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
    </div>
  );
};

export default RoutePlanner;
