import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import './RoutePlanner.css';

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
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
    // Check if HERE Maps script is loaded
    if (!window.H || !window.H.service) {
      console.error('HERE Maps script not loaded correctly. Ensure the <script> tags are present in index.html.');
      setError('HERE Maps script failed to load.');
      return;
    }

    // Initialize HERE Maps
    const platform = new window.H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 33.336675, lng: -111.792417 },
        zoom: 13,
      }
    );

    const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
    const ui = window.H.ui.UI.createDefault(map, defaultLayers);

    // Fetch user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          map.setCenter({ lat: latitude, lng: longitude });
          setError('');
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          if (err.code === 1) {
            // Permission denied
            setError('Please enable location services.');
            setIsLocationPromptOpen(true);
          } else if (err.code === 2) {
            setError('Unable to retrieve your location.');
          } else if (err.code === 3) {
            setError('Location request timed out.');
          }
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => map.dispose();
  }, []);

  const fetchRoute = () => {
    if (!window.H || !window.H.service) {
      setError('HERE Maps service is unavailable.');
      return;
    }

    const platform = new window.H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const routingService = platform.getRoutingService(null, 8);

    const waypoints = [
      `geo!${currentLocation?.lat},${currentLocation?.lng}`,
      ...stops.map((stop) => `geo!${stop}`),
      `geo!${endAddress}`,
    ];

    routingService.calculateRoute(
      {
        mode: 'fastest;truck',
        waypoint0: waypoints[0],
        waypoint1: waypoints[waypoints.length - 1],
        representation: 'overview',
        truck: {
          height: parseFloat(truckHeight),
          weight: parseFloat(truckWeight),
        },
      },
      (result) => {
        console.log('Route result:', result);
      },
      (err) => {
        console.error('Error fetching route:', err);
        setError('Failed to fetch route. Please try again.');
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
  
    if (!truckHeight || parseFloat(truckHeight) <= 0) {
      setError('Please provide a valid truck height.');
      return;
    }
  
    if (!truckWeight || parseFloat(truckWeight) <= 0) {
      setError('Please provide a valid truck weight.');
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
        <button type="submit">Fetch Route</button>
      </form>

      <Modal
        isOpen={isLocationPromptOpen}
        onRequestClose={() => setIsLocationPromptOpen(false)}
        contentLabel="Enable Location Services"
      >
        <h2>Enable Location Services</h2>
        <p>
          This app requires access to your location to provide accurate routing. Please enable location services in your browser or device settings.
        </p>
        <button onClick={() => setIsLocationPromptOpen(false)}>Close</button>
      </Modal>

      <div className="map-container" ref={mapRef} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RoutePlanner;
