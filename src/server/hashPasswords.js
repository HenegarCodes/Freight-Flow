const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config(); // Load environment variables

async function hashOldPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch all users from the database
    const users = await User.find();
    console.log(`Found ${users.length} users in the database`);

    for (let user of users) {
      if (!user.password.startsWith('$2a$')) {
        // Password is not hashed
        console.log(`Hashing password for user: ${user.email}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Update the user password
        user.password = hashedPassword;
        await user.save();
        console.log(`Password updated for user: ${user.email}`);
      } else {
        console.log(`Password already hashed for user: ${user.email}`);
      }
    }

    // Close the database connection
    mongoose.connection.close();
    console.log('Password hashing complete. Database connection closed.');
  } catch (error) {
    console.error('Error hashing passwords:', error.message);
    mongoose.connection.close();
  }
}

hashOldPasswords();
