// user-management-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const { connectRabbitMQ } = require('./connections/rabbitmq'); // Import RabbitMQ connection
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT;

const corsOptions = {
  origin: 'http://localhost:3100',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

app.listen(port, async () => {
  console.log(`User Management Service running on port ${port}`);
  
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ in index.js:', error);
  }
});
