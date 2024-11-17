// backend/routes/orsRoute.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { orsApiKey } = require('../config');

router.get('/route', async (req, res) => {
  const { start, end, profile } = req.query;
  console.log("ORS API Key:", orsApiKey);
  console.log("Start:", start, "End:", end, "Profile:", profile);

  try {
    // Construct the ORS URL with start and end directly in the URL
    const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${orsApiKey}&start=${start}&end=${end}`;
    console.log("Constructed ORS URL:", url);  // Log the constructed URL

    const response = await axios.get(url);
    console.log("OpenRouteService route response:", response.data);

    // Send the response data to the frontend
    res.json(response.data);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching route from ORS:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;
