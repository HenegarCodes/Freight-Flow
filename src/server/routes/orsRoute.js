
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { orsApiKey } = require('../config');
const Trip = require('../models/Trip'); 


router.get('/geocode', async (req, res) => {
  const { address } = req.query;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Failed to fetch geocoding data.' });
    }
    const location = response.data.results[0].geometry.location;
    res.json({ latitude: location.lat, longitude: location.lng });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/route', async (req, res) => {
  const { start, end } = req.query;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Failed to fetch routing data.' });
    }
    res.json(response.data);
  } catch (error) {
    console.error('Routing error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
router.post('/trips', async (req, res) => {
  try {
    console.log('Request payload:', req.body);

    const { user, start, end, stops, truckHeight, truckWeight, route } = req.body;

    // Check for missing fields
    if (!user || !start || !end || !route) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTrip = new Trip({
      user,
      start,
      end,
      stops,
      truckHeight,
      truckWeight,
      route,
    });

    const savedTrip = await newTrip.save();
    console.log('Trip saved:', savedTrip);

    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error saving trip:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
