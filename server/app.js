const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Apply CORS middleware
app.use(express.json()); // Middleware to parse JSON bodies

// Define routes for authentication
app.use('/api/auth', authRoutes);

// Define a simple GraphQL schema and resolver
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

// Function to start Apollo Server
async function startApolloServer(typeDefs, resolvers) {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app }); // Attach Apollo Server to Express app
  return apolloServer;
}

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start Apollo Server only after MongoDB connects
    startApolloServer(typeDefs, resolvers).then(apolloServer => {
      // Start the Express server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL available at http://localhost:${PORT}${apolloServer.graphqlPath}`);
      });
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('Hello from Freight Flow API');
});
