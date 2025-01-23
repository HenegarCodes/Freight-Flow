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

router.get('/history', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('Authorization token missing');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    console.log('User ID from token:', userId); // Debug log to verify decoding

    // Fetch trip history from the database
    const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });

    if (!trips || trips.length === 0) {
      console.log('No trip history found for this user.');
      return res.status(404).json({ error: 'No trip history found.' });
    }

    console.log('Fetched trip history:', trips); // Log the fetched trips
    res.json(trips);
  } catch (err) {
    console.error('Error fetching trip history:', err); // Detailed error log
    res.status(500).json({ error: 'Failed to fetch trip history' });
  }
});

module.exports = router;
