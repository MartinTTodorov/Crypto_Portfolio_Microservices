const express = require('express');
const bodyParser = require('body-parser');
const portfolioRoutes = require('./routes/portfolioRoutes');
const {connectRabbitMQ} = require('./connections/rabbitmq');
const dotenv = require('dotenv');

dotenv.config();


const app = express();
const PORT = process.env.SERVER_PORT;

app.use(bodyParser.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, async () => {
  console.log(`User Management Service running on port ${PORT}`);
  
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ in index.js:', error);
  }
});
