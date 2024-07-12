const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

console.log(process.env.MONGO_URI); // This should output your MongoDB URI

// MongoDB connection
mongoose.connect("mongodb+srv://henegarlearnscode:Leishy415!@freightflow.j1xkvdl.mongodb.net/?retryWrites=true&w=majority&appName=FreightFlow")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));



// Define routes
app.get('/', (req, res) => {
  res.send('Hello from Freight Flow API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
