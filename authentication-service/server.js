const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const client = require('prom-client');

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
  });
  next();
});

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;
