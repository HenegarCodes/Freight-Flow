const mongoose = require('mongoose');
const Trip = require('./models/Trip'); // Adjust path as needed
const User = require('./models/User');
require('dotenv').config(); // Load environment variables

const sampleUsers = [
  {
    username: 'spencer',
    email: 'spencerhenegar@example.com',
    password: 'Baxter48',
  },
  {
    username: 'testuser2',
    email: 'testuser2@example.com',
    password: 'password123',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Trip.deleteMany();
    console.log('Cleared existing trips');

    await User.deleteMany();
    console.log('Cleared existing users');

    // Insert sample users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log('Inserted sample users');

    // Assign user IDs to trips
    const tripsToInsert = [
      // Short trips
      {
        user: createdUsers[0]._id,
        start: '100 N Central Ave, Phoenix, AZ',
        end: '200 E Camelback Rd, Phoenix, AZ',
        truckHeight: 12.5,
        truckWeight: 30000,
        route: {
          distance: '3.5 mi',
          duration: '10 mins',
          waypoints: [
            { start: { lat: 33.448376, lng: -112.074036 }, end: { lat: 33.509086, lng: -112.070692 }, instructions: 'Head north on Central Ave' },
          ],
        },
        date: new Date(),
      },
      {
        user: createdUsers[1]._id,
        start: '250 W Southern Ave, Tempe, AZ',
        end: '123 S McClintock Dr, Tempe, AZ',
        truckHeight: 13,
        truckWeight: 28000,
        route: {
          distance: '2.5 mi',
          duration: '7 mins',
          waypoints: [
            { start: { lat: 33.3929, lng: -111.9431 }, end: { lat: 33.3924, lng: -111.9282 }, instructions: 'Head east on Southern Ave' },
          ],
        },
        date: new Date(),
      },
      // Regional trips
      {
        user: createdUsers[0]._id,
        start: '150 S Palm Canyon Dr, Palm Springs, CA',
        end: '450 E Tahquitz Canyon Way, Palm Springs, CA',
        truckHeight: 12,
        truckWeight: 35000,
        route: {
          distance: '8 mi',
          duration: '15 mins',
          waypoints: [
            { start: { lat: 33.8239, lng: -116.5466 }, end: { lat: 33.8222, lng: -116.5431 }, instructions: 'Take Tahquitz Canyon Way to destination' },
          ],
        },
        date: new Date(),
      },
      {
        user: createdUsers[1]._id,
        start: '350 S Coast Hwy, Laguna Beach, CA',
        end: '100 Pacific Coast Hwy, Huntington Beach, CA',
        truckHeight: 13.5,
        truckWeight: 40000,
        route: {
          distance: '15.8 mi',
          duration: '20 mins',
          waypoints: [
            { start: { lat: 33.5427, lng: -117.7854 }, end: { lat: 33.6595, lng: -117.9988 }, instructions: 'Follow CA-1 N' },
          ],
        },
        date: new Date(),
      },
      // Long-haul trips
      {
        user: createdUsers[0]._id,
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
      {
        user: createdUsers[1]._id,
        start: 'Seattle, WA',
        end: 'Portland, OR',
        truckHeight: 14,
        truckWeight: 45000,
        route: {
          distance: '180 mi',
          duration: '3 hrs',
          waypoints: [
            { start: { lat: 47.6062, lng: -122.3321 }, end: { lat: 45.5051, lng: -122.6750 }, instructions: 'Take I-5 S' },
          ],
        },
        date: new Date(),
      },
      {
        user: createdUsers[0]._id,
        start: 'Chicago, IL',
        end: 'Indianapolis, IN',
        truckHeight: 13,
        truckWeight: 40000,
        route: {
          distance: '180 mi',
          duration: '3 hrs',
          waypoints: [
            { start: { lat: 41.8781, lng: -87.6298 }, end: { lat: 39.7684, lng: -86.1581 }, instructions: 'Take I-65 S' },
          ],
        },
        date: new Date(),
      },
      // Cross-country trips
      {
        user: createdUsers[1]._id,
        start: 'New York, NY',
        end: 'Los Angeles, CA',
        truckHeight: 13.6,
        truckWeight: 43000,
        route: {
          distance: '2789 mi',
          duration: '40 hrs',
          waypoints: [
            { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 34.0522, lng: -118.2437 }, instructions: 'Take I-80 W to CA' },
          ],
        },
        date: new Date(),
      },
      {
        user: createdUsers[0]._id,
        start: 'Miami, FL',
        end: 'Atlanta, GA',
        truckHeight: 14,
        truckWeight: 46000,
        route: {
          distance: '664 mi',
          duration: '10 hrs',
          waypoints: [
            { start: { lat: 25.7617, lng: -80.1918 }, end: { lat: 33.7490, lng: -84.3880 }, instructions: 'Take I-95 N and I-75 N' },
          ],
        },
        date: new Date(),
      },
      {
        user: createdUsers[1]._id,
        start: 'Las Vegas, NV',
        end: 'Salt Lake City, UT',
        truckHeight: 14,
        truckWeight: 45000,
        route: {
          distance: '421 mi',
          duration: '6 hrs',
          waypoints: [
            { start: { lat: 36.1699, lng: -115.1398 }, end: { lat: 40.7608, lng: -111.8910 }, instructions: 'Take I-15 N' },
          ],
        },
        date: new Date(),
      },
    ];

    // Insert trips
    await Trip.insertMany(tripsToInsert);
    console.log('Inserted sample trips');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
