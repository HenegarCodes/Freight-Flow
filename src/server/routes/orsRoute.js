
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { orsApiKey } = require('../config');

// Route endpoint to calculate a route between two coordinates
router.get('/route', async (req, res) => {
  const { start, end } = req.query;
  console.log("Start:", start, "End:", end); // Log coordinates to ensure they're in the correct format
  try {
    const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
      params: {
        api_key: orsApiKey,
        start,
        end,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching route:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;