const express = require('express');
const axios = require('axios');
const router = express.Router();

// OpenRouteService API endpoint
const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions/driving-hgv';

router.post('/ors', async (req, res) => {
  try {
    // Get request data from the frontend
    const { start, end, stops, truckHeight } = req.body;

    // Build waypoints for ORS API
    const waypoints = [`${start.lat},${start.lng}`, ...stops, `${end.lat},${end.lng}`];

    // Construct the request payload
    const payload = {
      coordinates: waypoints.map((waypoint) =>
        waypoint.split(',').map((coord) => parseFloat(coord))
      ),
      elevation: false,
      extra_info: ['truckRestrictions'],
      options: {
        truck: {
          height: parseFloat(truckHeight),
        },
      },
    };

    // Make the request to ORS
    const orsResponse = await axios.post(ORS_API_URL, payload, {
      headers: {
        Authorization: process.env.ORS_API_KEY, // Use Render to securely inject the API key
        'Content-Type': 'application/json',
      },
    });

    // Send the ORS response back to the frontend
    res.json(orsResponse.data);
  } catch (err) {
    console.error('Error in /api/ors:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch route from OpenRouteService' });
  }
});

module.exports = router;
