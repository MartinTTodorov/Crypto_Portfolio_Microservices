const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use('/api/auth', authRoutes);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
