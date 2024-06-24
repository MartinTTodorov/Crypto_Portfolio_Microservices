const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const port = 3000;

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

app.use(cors());

// Proxy middleware for authentication service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://authentication:3001', // Use service name
  changeOrigin: true,
  pathRewrite: {
    '': '/api/auth', // Rewrite the path to include /api/auth in the target
  },
}));

// Proxy middleware for user management service
app.use('/api/users', createProxyMiddleware({
  target: 'http://user-management:3002', // Use service name
  changeOrigin: true,
  pathRewrite: {
    '': '/api/users', // Rewrite the path to include /api/users in the target
  },
}));

// Proxy middleware for portfolio service
app.use('/api/portfolio', createProxyMiddleware({
  target: 'http://portfolio-service:3005', // Use service name
  changeOrigin: true,
  pathRewrite: {
    '': '/api/portfolio',
  },
}));

// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`API Gateway Service is running on port ${port}`);
});
