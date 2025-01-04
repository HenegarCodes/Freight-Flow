const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes
const Trip = require('../models/Trip'); // Trip model

// GET: Fetch 5 most recent trips for the logged-in user
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch the 5 most recent trips from MongoDB
    const trips = await Trip.find({ user: userId })
      .sort({ date: -1 }) // Sort by date descending
      .limit(5);

    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
});

router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from the token by verifyToken middleware
    const trips = await Trip.find({ user: userId }).sort({ date: -1 }).limit(5); // Fetch 5 most recent trips
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
