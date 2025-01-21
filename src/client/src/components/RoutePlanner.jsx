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
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

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
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);
          if (mapRef.current) mapRef.current.panTo(location);
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setError('Failed to get current location. Enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const fetchRoute = () => {
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }

    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: endAddress,
        waypoints: stops.map((stop) => ({ location: stop, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(), // Required for traffic-based adjustments
          trafficModel: 'optimistic', // Choose traffic model
        },
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          saveTrip(result);
          setError('');
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
      distance: route.routes[0].legs.reduce((sum, leg) => sum + parseFloat(leg.distance.text), 0).toFixed(2) + ' mi',
      duration: route.routes[0].legs.reduce((sum, leg) => sum + parseFloat(leg.duration.text), 0).toFixed(2) + ' mins',
      waypoints: route.routes[0].legs.flatMap((leg) =>
        leg.steps.map((step) => ({
          start: step.start_location,
          end: step.end_location,
          instructions: step.instructions,
        }))
      ),
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
        
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
    } catch (err) {
      console.error('Error saving trip:', err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    fetchRoute();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
                required
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

      {error && <p className="error">{error}</p>}
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
