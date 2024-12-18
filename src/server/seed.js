const mongoose = require('mongoose');
const Trip = require('./models/Trip'); // Adjust path as needed
require('dotenv').config(); // Load environment variables

const sampleTrips = [
  {
    user: '67624a1000bd5553325f244f', 
    start: '734 South Gilbert Road, Gilbert, AZ 85296',
    end: '4650 South Wildflower Drive, Chandler, AZ 85248',
    truckHeight: 13.5,
    truckWeight: 40000,
    route: {
      distance: '15.5 mi',
      duration: '20 mins',
      waypoints: [
        { start: { lat: 33.336675, lng: -111.792417 }, end: { lat: 33.237828, lng: -111.867848 }, instructions: 'Head south on Gilbert Rd' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: '123 Main St, Phoenix, AZ',
    end: '456 Central Ave, Scottsdale, AZ',
    truckHeight: 12,
    truckWeight: 38000,
    route: {
      distance: '22.1 mi',
      duration: '30 mins',
      waypoints: [
        { start: { lat: 33.448377, lng: -112.074037 }, end: { lat: 33.494170, lng: -111.926052 }, instructions: 'Take I-10 E to Scottsdale Rd' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: '1600 Amphitheatre Parkway, Mountain View, CA',
    end: '1 Infinite Loop, Cupertino, CA',
    truckHeight: 13,
    truckWeight: 42000,
    route: {
      distance: '9.5 mi',
      duration: '15 mins',
      waypoints: [
        { start: { lat: 37.421999, lng: -122.084057 }, end: { lat: 37.33182, lng: -122.03118 }, instructions: 'Take US-101 S to Cupertino' },
      ],
    },
    date: new Date(),
  },
  // Long-haul trips across states
  {
    user: '64b8ef6fef1234567890abcd',
    start: '500 South Capital of Texas Hwy, Austin, TX',
    end: '1600 Pennsylvania Ave NW, Washington, DC',
    truckHeight: 14,
    truckWeight: 45000,
    route: {
      distance: '1500 mi',
      duration: '22 hrs',
      waypoints: [
        { start: { lat: 30.2672, lng: -97.7431 }, end: { lat: 38.8977, lng: -77.0365 }, instructions: 'Take I-35 N and I-70 E to DC' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: 'Times Square, New York, NY',
    end: 'Golden Gate Bridge, San Francisco, CA',
    truckHeight: 13.6,
    truckWeight: 43000,
    route: {
      distance: '2900 mi',
      duration: '43 hrs',
      waypoints: [
        { start: { lat: 40.758, lng: -73.9855 }, end: { lat: 37.8199, lng: -122.4783 }, instructions: 'Take I-80 W across the US' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: 'Walt Disney World, Orlando, FL',
    end: 'Space Needle, Seattle, WA',
    truckHeight: 14,
    truckWeight: 46000,
    route: {
      distance: '3100 mi',
      duration: '48 hrs',
      waypoints: [
        { start: { lat: 28.3852, lng: -81.5639 }, end: { lat: 47.6205, lng: -122.3493 }, instructions: 'Take I-10 W to I-5 N' },
      ],
    },
    date: new Date(),
  },
  // More regional trips
  {
    user: '64b8ef6fef1234567890abcd',
    start: 'Las Vegas, NV',
    end: 'Grand Canyon, AZ',
    truckHeight: 12.5,
    truckWeight: 37000,
    route: {
      distance: '275 mi',
      duration: '4 hrs 15 mins',
      waypoints: [
        { start: { lat: 36.1699, lng: -115.1398 }, end: { lat: 36.1069, lng: -112.1129 }, instructions: 'Take US-93 S and AZ-64 E' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: 'Chicago, IL',
    end: 'Indianapolis, IN',
    truckHeight: 13,
    truckWeight: 40000,
    route: {
      distance: '180 mi',
      duration: '3 hrs',
      waypoints: [
        { start: { lat: 41.8781, lng: -87.6298 }, end: { lat: 39.7684, lng: -86.1581 }, instructions: 'Take I-65 S to Indianapolis' },
      ],
    },
    date: new Date(),
  },
  {
    user: '64b8ef6fef1234567890abcd',
    start: 'Houston, TX',
    end: 'Dallas, TX',
    truckHeight: 13.5,
    truckWeight: 41000,
    route: {
      distance: '239 mi',
      duration: '3 hrs 30 mins',
      waypoints: [
        { start: { lat: 29.7604, lng: -95.3698 }, end: { lat: 32.7767, lng: -96.797 }, instructions: 'Take I-45 N to Dallas' },
      ],
    },
    date: new Date(),
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Trip.deleteMany(); // Optional: Clears existing trips
    console.log('Cleared existing trips');

    await Trip.insertMany(sampleTrips);
    console.log('Inserted sample trips');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
