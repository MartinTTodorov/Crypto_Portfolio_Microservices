// user-management-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const { connectRabbitMQ } = require('./connections/rabbitmq');
const dotenv = require('dotenv');
const client = require('prom-client');

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

app.listen(port, async () => {
  console.log(`User Management Service running on port ${port}`);

  try {
    await connectRabbitMQ();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ in index.js:', error);
  }
});
