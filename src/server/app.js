const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const orsRoute = require('./routes/orsRoute');
const geocodeRoute = require('./routes/geocodeRoute');
const tripsRoute = require('./routes/tripsRoute'); 


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoute); 
app.use('/api', orsRoute);
app.use('/api', geocodeRoute);

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
  },
};

async function startApolloServer(typeDefs, resolvers) {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  return apolloServer;
}

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    startApolloServer(typeDefs, resolvers).then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL available at http://localhost:${PORT}/graphql`);
      });
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Default route
app.get('/', (req, res) => {
  res.send('Hello from Freight Flow API');
});
