const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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

  console.log('Login payload:', req.body); // Log received payload

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user); // Log user details from the database

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Log password comparison result

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: password mismatch' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// Auth Check Route
router.get('/check', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ isAuthenticated: true, userId: decoded.userId });
  } catch (error) {
    return res.json({ isAuthenticated: false });
  }
});


module.exports = router;
