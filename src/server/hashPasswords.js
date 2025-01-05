const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
require('dotenv').config(); 

const hashPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await User.find({});
    console.log('Users found:', users);

    for (const user of users) {
      if (!user.password.startsWith('$2')) {
        // Check if password is not already hashed
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Password for user ${user.email} has been hashed.`);
      }
    }

    console.log('All passwords hashed successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error hashing passwords:', error.message);
    process.exit(1);
  }
};

hashPasswords();
