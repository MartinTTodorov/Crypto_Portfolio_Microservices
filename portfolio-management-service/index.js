const express = require('express');
const bodyParser = require('body-parser');
const portfolioRoutes = require('./routes/portfolioRoutes');
const { connectRabbitMQ } = require('./connections/rabbitmq');
const dotenv = require('dotenv');
const client = require('prom-client');

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3005;

app.use(bodyParser.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5]
});

const failingRequests = new client.Gauge({
  name: 'http_failing_requests_total',
  help: 'Total number of failing HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, async () => {
  console.log(`Portfolio Management Service is running on port ${PORT}`);

  try {
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ in index.js:', error);
  }
});
