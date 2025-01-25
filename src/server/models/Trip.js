const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  stops: { type: [String], default: [] },
  route: {
    distance: { type: String },
    duration: { type: String },
    waypoints: [
      {
        start: { type: Object },
        end: { type: Object },
        instructions: { type: String },
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trip', TripSchema);

