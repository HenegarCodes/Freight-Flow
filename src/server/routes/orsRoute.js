const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/geocode', async (req, res) => {
  const { text } = req.query;
  const ORS_API_KEY = process.env.ORS_API_KEY;

  if (!ORS_API_KEY) {
    return res.status(500).json({ error: 'Missing ORS API Key in the backend' });
  }

  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
    text
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error from ORS API: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching from ORS API:', err.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

module.exports = router;
