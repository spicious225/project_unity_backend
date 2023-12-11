require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;
const cors = require('cors'); // Import CORS package

app.use(express.json()); // Middleware to parse JSON request bodies
const uri = process.env.REMOTE_MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const databaseName = process.env.REMOTE_MONGODB_DATABASE;

app.use(cors({ origin: '*' }));
app.use(express.json()); // Middleware to parse JSON request bodies

async function connectToDatabase() {
  try {
      await client.connect();
      console.log('Successfully connected to MongoDB');
      return client.db(databaseName);
  } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Exit if cannot connect
  }
}

// Start the server and connect to the database
async function startServer() {
  const database = await connectToDatabase();

  // Define collections here
  const scoreCollection = database.collection('scores');


  // Define routes
  app.get('/', (req, res) => {
      res.send('Hello World!');
  });

  app.post('/submitScore', async (req, res) => {
    try {
        console.log('Received submitScore request:', req.body);
        const { initials, time, kills } = req.body; 
        const result = await scoreCollection.insertOne({ initials, time, kills });
        console.log('Score submitted:', result);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in submitScore:', error.message);
        res.status(500).json({ error: error.message });
    }
});


  app.get('/scores', async (req, res) => {
    try {
    
        const scores = await scoreCollection.find({}).sort({ kills: -1 }).toArray();
        res.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error.message);
        res.status(500).json({ error: error.message });
    }
});



  // Start listening for requests
  app.listen(port, () => {
      console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
  


