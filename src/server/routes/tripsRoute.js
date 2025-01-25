const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip'); // Trip model
const verifyToken = require('../middleware/authMiddlewares');

router.get('/recent', verifyToken, async (req, res) => {
  try {
    console.log('Fetching trips for user ID:', req.user.userId);
    const trips = await Trip.find({ user: req.user.userId })
      .sort({ date: -1 })
      .limit(5);
    console.log('Fetched trips:', trips);
    res.json(trips);
  } catch (error) {
    console.error('Error fetching recent trips:', error.message);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});
router.get('/user', verifyToken, async (req, res) => {
  try {
    console.log('Request received for user trips');
    console.log('User ID from token:', req.user?.userId); // Debug token payload

    // Fetch trips associated with the user
    const trips = await Trip.find({ user: req.user.userId }).sort({ date: -1 }).limit(5);
    console.log('Fetched trips:', trips);

    res.json(trips); // Send trips back to the client
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    console.error('Stack Trace:', error.stack);
    res.status(500).json({ error: 'Server error while fetching trips' });
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

router.get('/history', (req, res) => {
  res.status(501).json({ message: 'Route history feature is under development.' });
});


module.exports = router;
