
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Signup Route
router.post('/signup', async (req, res) => {
    console.log('Signup endpoint hit');  // Check if route is hit
    console.log('Request body:', req.body); // Log request body
  
    const { username, email, password } = req.body;
    try {
        // checks for user exisiting already
      let user = await User.findOne({ email });
      if (user) {
        console.log('User already exists');
        return res.status(400).json({ msg: 'User already exists' });
      }
      //new user
      user = new User({ username, email, password });
      //save user
      await user.save();
      console.log('User saved successfully');  // Check if user is saved
      // JWT token generator
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

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and assign a token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, 
            maxAge: 3600000 // 1 hour
        });
        res.json({ message: 'Logged in successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
