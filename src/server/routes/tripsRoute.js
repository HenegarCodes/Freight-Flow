const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes
const Trip = require('../models/Trip'); // Trip model


router.get('/', verifyToken, async (req, res) => {
  try {
    // Assuming your verifyToken middleware sets req.user.userId
    const userId = req.user.userId; 
    const trips = await Trip.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);
    res.json(trips); // Return the trips as JSON
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/recent', verifyToken, async (req, res) => {
  try {
    // Assuming your verifyToken middleware sets req.user.userId
    const userId = req.user.userId; 
    const trips = await Trip.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);
    res.json(trips); // Return the trips as JSON
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ error: 'Server error' });
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
