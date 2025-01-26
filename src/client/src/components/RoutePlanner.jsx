import React, { useState, useEffect, useRef } from 'react';
import './RoutePlanner.css';

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
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
    if (!window.H || !window.H.service) {
      console.error('HERE Maps script not loaded correctly. Ensure the <script> tags are present in index.html.');
      setError('HERE Maps script failed to load.');
      return;
    }

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
            setError('Please enable location services.');
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
  
    // Ensure `endAddress` is geocoded into latitude and longitude
    const geocodeService = platform.getGeocodingService();
    geocodeService.geocode(
      { searchText: endAddress },
      (result) => {
        if (!result.Response.View.length) {
          setError('Invalid destination address. Please try again.');
          return;
        }
  
        const destinationCoords = result.Response.View[0].Result[0].Location.DisplayPosition;
  
        const waypoints = [
          `geo!${currentLocation?.lat},${currentLocation?.lng}`,
          ...stops.map((stop) => `geo!${stop}`),
          `geo!${destinationCoords.Latitude},${destinationCoords.Longitude}`,
        ];
  
        // Call the routing service
        routingService.calculateRoute(
          {
            mode: 'fastest;truck',
            ...waypoints.reduce((acc, waypoint, index) => {
              acc[`waypoint${index}`] = waypoint;
              return acc;
            }, {}),
            representation: 'overview',
            truckHeight: parseFloat(truckHeight),
            truckWeight: parseFloat(truckWeight),
          },
          (result) => {
            if (result.response && result.response.route) {
              console.log('Route result:', result.response.route);
            } else {
              setError('No route found. Please check your inputs.');
            }
          },
          (err) => {
            console.error('Error fetching route:', err);
            setError('Failed to fetch route. Please try again.');
          }
        );
      },
      (err) => {
        console.error('Geocoding error:', err);
        setError('Failed to geocode destination address. Please try again.');
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

      <div className="map-container" ref={mapRef} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RoutePlanner;
