const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // or axios

router.get('/route', async (req, res) => {
  const { start, end, height, weight } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end locations are required' });
  }

  try {
    const ORS_API_KEY = process.env.ORS_API_KEY; // Ensure this is correctly set in Render
    const orsUrl = `https://api.openrouteservice.org/v2/directions/truck?api_key=${ORS_API_KEY}&start=${start}&end=${end}&maximum_height=${height}&maximum_weight=${weight}`;

    const response = await fetch(orsUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch route from ORS');
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching route:', error.message);
    res.status(500).json({ error: 'Failed to fetch route from backend' });
  }
});

module.exports = router;
