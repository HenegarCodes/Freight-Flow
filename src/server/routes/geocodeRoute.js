const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/geocode', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_API_KEY}&text=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data');
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Geocoding API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

module.exports = router;
