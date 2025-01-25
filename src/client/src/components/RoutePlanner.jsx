import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './RoutePlanner.css';

// Load HERE Maps
const H = window.H;

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [directions, setDirections] = useState(null);
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
    // Initialize HERE Map
    const platform = new H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY, // Use Render environment variable
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 33.336675, lng: -111.792417 },
        zoom: 13,
      }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    map.addEventListener('tap', (evt) => {
      console.log(evt.type, evt.currentPointer);
    });

    return () => map.dispose();
  }, []);

  const fetchRoute = () => {
    const platform = new H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY, // Pull from Render
    });

    const routingService = platform.getRoutingService(null, 8);

    const waypoints = [
      { lat: currentLocation.lat, lng: currentLocation.lng },
      ...stops.map((stop) => ({ lat: stop.lat, lng: stop.lng })),
      { lat: endAddress.lat, lng: endAddress.lng },
    ];

    const truckOptions = {
      mode: 'fastest;truck',
      truck: {
        height: parseFloat(truckHeight),
        weight: parseFloat(truckWeight),
        trailers: 1,
        limitedWeight: true,
      },
      representation: 'overview',
    };

    routingService.calculateRoute(
      {
        mode: truckOptions.mode,
        waypoint0: `geo!${waypoints[0].lat},${waypoints[0].lng}`,
        waypoint1: `geo!${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`,
        truckOptions,
      },
      (result) => {
        if (result.response.route) {
          setDirections(result.response.route[0]);
        }
      },
      (err) => {
        console.error('Error fetching route:', err);
        setError('Failed to fetch route. Please check your input and try again.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
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

      <div className="map-container" ref={mapRef} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RoutePlanner;
