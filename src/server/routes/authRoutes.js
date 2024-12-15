const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust the path if needed
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  console.log('Signup endpoint hit');  // Check if route is hit
  console.log('Request body:', req.body); // Log request body

  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Create new user
    user = new User({ username, email, password });
    // Save user
    await user.save();
    console.log('User saved successfully');  // Check if user is saved
    // Generate JWT token
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Error in signup:', err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth Check Route
router.get('/check', (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ isAuthenticated: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ isAuthenticated: true, userId: decoded.userId });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ isAuthenticated: false, message: 'Invalid token' });
  }
});

module.exports = router;
