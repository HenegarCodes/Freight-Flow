import React, { useState, useEffect, useRef } from 'react';
import './RoutePlanner.css';

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError('');
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setError(
              'Location services are disabled. Please enable location services in your browser or device settings.'
            );
          } else {
            setError('Unable to retrieve your location. You can manually enter your starting point.');
          }
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchRoute = () => {
    if (!currentLocation && !manualLocation) {
      setError('Please provide your starting location.');
      return;
    }
    if (!endAddress) {
      setError('Please provide a destination address.');
      return;
    }

    // Call HERE API with either geolocation or manual location
    console.log('Fetching route...', {
      start: currentLocation || manualLocation,
      end: endAddress,
      stops,
      truckHeight,
      truckWeight,
    });

    setError('');
    // Add your HERE API logic here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRoute();
  };

  return (
    <div className="route-planner">
      <form onSubmit={handleSubmit} className="route-form">
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!currentLocation && (
          <>
            <label>
              Manual Starting Point:
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Enter your starting point"
              />
            </label>
            <p style={{ fontStyle: 'italic', color: 'gray' }}>
              Location services are disabled. Please manually enter your starting location.
            </p>
          </>
        )}

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

      <div className="map-container" ref={mapRef} />
    </div>
  );
};

export default RoutePlanner;
