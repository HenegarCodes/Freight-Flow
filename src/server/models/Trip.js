const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  start: { type: String, required: true },
  end: { type: String, required: true },
  truckHeight: { type: Number },
  truckWeight: { type: Number },
  route: { type: Object, required: true }, // Save the full route object
  date: { type: Date, default: Date.now }, // Timestamp for trip
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
