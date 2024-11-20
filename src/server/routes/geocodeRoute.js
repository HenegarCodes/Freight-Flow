
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { orsApiKey } = require('../config'); 

router.get('/geocode', async (req, res) => {
  const { address } = req.query;
  try {
    const response = await axios.get(`https://api.openrouteservice.org/geocode/search`, {
      params: {
        api_key: orsApiKey,
        text: address,
      },
    });
    const coordinates = response.data.features[0].geometry.coordinates;
    res.json({ latitude: coordinates[1], longitude: coordinates[0] });
  } catch (error) {
    console.error("Error fetching geocode data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
