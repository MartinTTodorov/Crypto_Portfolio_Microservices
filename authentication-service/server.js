const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const authRoutes = require('./routes/auth');
require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(passport.initialize());

mongoose.connect('mongodb://localhost:27017/authentication_service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
