const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes
const Trip = require('../models/Trip'); // Trip model



router.get('/recent', async (req, res) => {
  try {
    const userId = req.user?.id; // Extract from middleware or request (JWT payload)
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const trips = await Trip.find({ user: userId }) // Fetch trips for the logged-in user
      .sort({ date: -1 }) // Most recent first
      .limit(5); // Limit to 5 trips

    res.json(trips);
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});



router.get('/user', verifyToken, async (req, res) => {
  try {
    console.log('Fetching trips for user:', req.user.userId); // Debugging log
    const trips = await Trip.find({ user: req.user.userId }).sort({ date: -1 }).limit(5);
    console.log('Fetched trips from database:', trips); // Debugging log
    res.json(trips); // Return trips as an array
  } catch (error) {
    console.error('Error fetching trips:', error.message); // Debugging log
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/trips', async (req, res) => {
  try {
      const userId = req.user.userId; // Extract user ID from the token payload
      const trips = await Trip.find({ user: userId }); // Query trips for the logged-in user
      res.json(trips); // Send trips back to the client
  } catch (error) {
      console.error('Error fetching trips:', error);
      res.status(500).json({ error: 'Server error while fetching trips' });
  }
});

module.exports = router;
