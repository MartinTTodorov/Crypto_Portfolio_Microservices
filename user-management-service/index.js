const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const app = express();
const cors = require('cors');
const port = process.env.PORT;


const dotenv = require('dotenv');
dotenv.config();

const corsOptions = {
  origin: 'http://localhost:3100', // Replace with your frontend URL
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use('/api/users', userRoutes);


app.listen(port, () => {
  console.log(`User Management Service running on port ${port}`);
});
