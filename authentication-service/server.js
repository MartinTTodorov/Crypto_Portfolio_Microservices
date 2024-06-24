const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const client = require('prom-client');
const {connectRabbitMQ} = require('./connections/rabbitmq');

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Counter for total number of HTTP requests
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Histogram for request duration
const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5] // Define your own buckets based on your needs
});

// Gauge for failing requests
const failingRequests = new client.Gauge({
  name: 'http_failing_requests_total',
  help: 'Total number of failing HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to count requests and measure request duration
app.use((req, res, next) => {
  const end = requestDuration.startTimer();
  
  res.on('finish', () => {
    requestCounter.inc({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    end({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    
    if (res.statusCode >= 400) {
      failingRequests.inc({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    }
  });

  next();
});

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const server = app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ in index.js:', error);
  }
});

module.exports = server;
