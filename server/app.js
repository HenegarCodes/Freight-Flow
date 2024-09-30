const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
//import Radar from '@radarlabs/radar';

//Radar.initialize('prj_live_sk_d13b51ccc234caf4ea4d0c92f065fcd5ca67036d');

const app = express();
const PORT = process.env.PORT || 5001;

// Allow requests from the frontend on Vercel
// CORS Configuration
const corsOptions = {
  origin: 'https://freight-flow.vercel.app',  // Allow only your Vercel frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,  // If you need to allow cookies
  optionsSuccessStatus: 204,
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Other middleware (like body parsers, etc.)
app.use(express.json());

// Your routes
app.use('/api/auth', require('./routes/authRoutes'));



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

// Create and apply the Apollo Server as middleware to the Express application
async function startApolloServer(typeDefs, resolvers) {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  return apolloServer;
}
//mongodb+srv://henegarlearnscode:Leishy415!@freightflow.j1xkvdl.mongodb.net/FreightFlow?retryWrites=true&w=majority&appName=FreightFlow
// MongoDB connection process.env.MONGO_URI
mongoose.connect(process.env.MONGO_URI)
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
  .catch(err => console.log(err));

// Define a basic Express route
app.get('/', (req, res) => {
  res.send('Hello from Freight Flow API');
});
