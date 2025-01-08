const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip'); // Adjust the path if needed

(async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  try {
    // Replace this with an actual user ID from your database
    const userId = '677ec1f41610ddd34299118a';
    console.log('Fetching trips for user ID:', userId);

    // Query the database for trips associated with the user
    const trips = await Trip.find({ user: userId }).sort({ date: -1 }).limit(5);

    console.log('Fetched trips:', trips); // Output fetched trips
  } catch (error) {
    console.error('Error fetching trips:', error.message); // Log error message
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})();
