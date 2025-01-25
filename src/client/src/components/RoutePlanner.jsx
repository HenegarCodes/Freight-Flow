import React, { useState, useEffect, useRef } from 'react';
const H = window.H;
import './RoutePlanner.css';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const RoutePlanner = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState([]);
  const [truckHeight, setTruckHeight] = useState('');
  const [truckWeight, setTruckWeight] = useState('');
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // To store the map instance
  const platformInstance = useRef(null); // To store the HERE Platform instance
  const directionsLayer = useRef(null); // To store the routing layer

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

  // Initialize the HERE Map
  useEffect(() => {
    platformInstance.current = new H.service.Platform({
      apikey: process.env.REACT_APP_HERE_API_KEY,
    });

    const defaultLayers = platformInstance.current.createDefaultLayers();
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

    mapInstance.current = map;

    return () => map.dispose(); // Cleanup the map instance on component unmount
  }, []);

  // Fetch the current location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          if (mapInstance.current) {
            mapInstance.current.setCenter({ lat: latitude, lng: longitude });
          }
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
  }, []);

  // Fetch Route
  const fetchRoute = () => {
    if (!currentLocation || !endAddress) {
      setError('Please provide all required fields.');
      return;
    }
    setError('');

    const routingService = platformInstance.current.getRoutingService(null, 8);
    const waypoints = [
      `geo!${currentLocation.lat},${currentLocation.lng}`,
      ...stops.map((stop) => `geo!${stop}`),
      `geo!${endAddress}`,
    ];

    const routingParams = {
      mode: 'fastest;truck',
      waypoint0: waypoints[0],
      waypoint1: waypoints[waypoints.length - 1],
      representation: 'display',
      truck: {
        height: truckHeight,
        weight: truckWeight,
        trailers: 1,
        limitedWeight: true,
      },
    };

    routingService.calculateRoute(routingParams, (result) => {
      if (result.response && result.response.route) {
        const route = result.response.route[0];

        // Add route to the map
        if (mapInstance.current) {
          if (directionsLayer.current) {
            mapInstance.current.removeObject(directionsLayer.current);
          }

          const linestring = new H.geo.LineString();
          route.shape.forEach((point) => {
            const [lat, lng] = point.split(',');
            linestring.pushLatLngAlt(parseFloat(lat), parseFloat(lng));
          });

          const routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 5 },
          });

          directionsLayer.current = routeLine;
          mapInstance.current.addObject(routeLine);

          // Adjust the map to the route
          mapInstance.current.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
        }
      } else {
        setError('No route found. Please check your inputs and try again.');
      }
    }, (error) => {
      console.error('Routing error:', error);
      setError('Failed to fetch route. Please check your input and try again.');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

      <div className="map-container" ref={mapRef} style={containerStyle} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RoutePlanner;
