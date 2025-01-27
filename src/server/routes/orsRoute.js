const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Fetch route from OpenRouteService
router.get('/ors-route', async (req, res) => {
  const { start, end, truckHeight, truckWeight } = req.query;

  if (!start || !end || !truckHeight || !truckWeight) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${ORS_API_KEY}&start=${start}&end=${end}&maximum_height=${truckHeight}&maximum_weight=${truckWeight}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch route from OpenRouteService');
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching route:', err.message);
    res.status(500).json({ error: 'Failed to fetch route from OpenRouteService' });
  }
});

module.exports = router;
