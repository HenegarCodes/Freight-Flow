const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  truckHeight: { type: Number },
  truckWeight: { type: Number },
  route: { type: Object, required: true }, // Save the full route object
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add user association
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
