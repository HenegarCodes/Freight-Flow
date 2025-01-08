const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }], // Reference trips 
}, { timestamps: true });

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password is not modified

  if (!this.password.startsWith('$2')) { // Check if the password is already hashed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});


// Middleware to clean up trips on user deletion
userSchema.pre('remove', async function (next) {
  const Trip = require('./Trip'); // Import the Trip model
  await Trip.deleteMany({ user: this._id }); // Delete trips associated with this user
  next();
});

// Instance method for password comparison
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for dynamically populating user trips 
userSchema.virtual('userTrips', {
  ref: 'Trip', // Reference the Trip model
  localField: '_id', // User ID in the User schema
  foreignField: 'user', // Field in the Trip schema that references the user
});

const User = mongoose.model('User', userSchema);
module.exports = User;
