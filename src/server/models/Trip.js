const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Object, required: true },
  end: { type: String, required: true },
  stops: { type: [String], default: [] },
  truckHeight: { type: String },
  truckWeight: { type: String },
  route: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
