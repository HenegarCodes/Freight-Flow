const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/route', async (req, res) => {
  const { start, end, height, weight } = req.query;

  const ORS_API_KEY = process.env.ORS_API_KEY;

  try {
    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/truck`,
      {
        params: {
          api_key: ORS_API_KEY,
          start,
          end,
          maximum_height: height,
          maximum_weight: weight,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching route from ORS:', err.message);
    res.status(500).json({ error: 'Failed to fetch route from ORS' });
  }
});

module.exports = router;
