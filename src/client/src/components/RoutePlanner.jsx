import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './RoutePlanner.css';

// HERE Maps SDK Loader
const H = window.H;

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [route, setRoute] = useState(null);
  const [map, setMap] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [error, setError] = useState('');
  const mapContainerRef = useRef(null);

  // Initialize HERE Maps
  useEffect(() => {
    const platform = new H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const defaultLayers = platform.createDefaultLayers();
    const mapInstance = new H.Map(
      mapContainerRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 33.336675, lng: -111.792417 }, // Default center
        zoom: 13,
      }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance));
    const ui = H.ui.UI.createDefault(mapInstance, defaultLayers);

    setPlatform(platform);
    setMap(mapInstance);

    // Cleanup on unmount
    return () => {
      mapInstance.dispose();
    };
  }, []);

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

  // Fetch current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => setError('Failed to fetch current location.')
      );
    } else {
      setError('Geolocation not supported.');
    }
  }, []);

  const fetchRoute = () => {
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }

    const routingService = platform.getRoutingService();

    const routeRequestParams = {
      mode: 'fastest;truck',
      waypoint0: `${currentLocation.lat},${currentLocation.lng}`, // Start point
      waypoint1: endAddress, // Destination
      // Add intermediate stops if any
      ...(stops.length && {
        via: stops.map((stop, index) => `via${index}=${stop}`).join('&'),
      }),
      truckHeight,
      truckWeight,
      departure: 'now',
    };

    routingService.calculateRoute(
      routeRequestParams,
      (result) => {
        if (result.response) {
          const route = result.response.route[0];
          renderRouteOnMap(route);
          saveTrip(route);
        } else {
          setError('Failed to fetch route.');
        }
      },
      (error) => {
        console.error('Error fetching route:', error);
        setError('Error fetching route.');
      }
    );
  };

  const renderRouteOnMap = (route) => {
    const lineString = new H.geo.LineString();
    route.shape.forEach((point) => {
      const [lat, lng] = point.split(',');
      lineString.pushLatLngAlt(lat, lng);
    });

    const routeLine = new H.map.Polyline(lineString, {
      style: { lineWidth: 5, strokeColor: 'blue' },
    });

    map.addObject(routeLine);
    map.getViewModel().setLookAtData({
      bounds: routeLine.getBoundingBox(),
    });

    setRoute(route);
  };

  const saveTrip = async (route) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/trips',
        {
          start: currentLocation,
          end: endAddress,
          stops,
          truckHeight,
          truckWeight,
          route: {
            distance: route.summary.distance,
            duration: route.summary.travelTime,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Trip saved successfully.');
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
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
              <button type="button" onClick={() => removeStop(index)}>
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
        <button type="submit">Get Route</button>
      </form>

      {error && <p className="error">{error}</p>}
      <div ref={mapContainerRef} className="map-container"></div>
    </div>
  );
};

export default RoutePlanner;
