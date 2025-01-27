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
  const routeLayerRef = useRef(null);

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

    // Add map interactions
    const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
    window.H.ui.UI.createDefault(map, defaultLayers);

    // Save map reference for later use
    routeLayerRef.current = map;

    return () => map.dispose();
  }, []);

  const fetchRoute = async () => {
    if (!window.H || !window.H.service) {
      setError('HERE Maps service is unavailable.');
      return;
    }

    const platform = new window.H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const geocodingService = platform.getSearchService();
    const routingService = platform.getRoutingService(null, 8);

    try {
      // Geocode endAddress to coordinates
      const endLocation = await geocodeAddress(geocodingService, endAddress);
      const waypoints = [
        `geo!${currentLocation?.lat},${currentLocation?.lng}`,
        ...stops.map((stop) => `geo!${stop}`),
        `geo!${endLocation.lat},${endLocation.lng}`,
      ];

      // Fetch route from HERE Routing API
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
          if (result?.routes?.length > 0) {
            renderRoute(result.routes[0]);
            setError('');
          } else {
            setError('No route found. Please check your inputs.');
          }
        },
        (err) => {
          console.error('Error fetching route:', err);
          setError('Failed to fetch route. Please try again.');
        }
      );
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process your request. Please check your inputs and try again.');
    }
  };

  const geocodeAddress = (geocodingService, address) => {
    return new Promise((resolve, reject) => {
      geocodingService.geocode(
        { q: address },
        (result) => {
          if (result?.items?.length > 0) {
            const location = result.items[0].position;
            resolve(location);
          } else {
            reject(new Error('Failed to geocode address.'));
          }
        },
        (err) => reject(err)
      );
    });
  };

  const renderRoute = (route) => {
    if (!routeLayerRef.current) {
      setError('Map is not initialized.');
      return;
    }

    // Clear existing routes
    routeLayerRef.current.getObjects().forEach((object) => routeLayerRef.current.removeObject(object));

    // Add route to the map
    const lineString = new window.H.geo.LineString();
    route.sections.forEach((section) => {
      section.polyline.split(',').forEach((point, index) => {
        if (index % 2 === 0) {
          lineString.pushLatLngAlt(parseFloat(point), parseFloat(section.polyline.split(',')[index + 1]));
        }
      });
    });

    const routeLine = new window.H.map.Polyline(lineString, {
      style: { strokeColor: '#FF0000', lineWidth: 4 },
    });

    routeLayerRef.current.addObject(routeLine);
    routeLayerRef.current.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
