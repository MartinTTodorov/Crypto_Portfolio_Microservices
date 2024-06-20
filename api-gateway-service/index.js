const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 3000;

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

app.use('/api/portfolio', createProxyMiddleware({
  target: 'http://portfolio-service:3005', // Use service name
  changeOrigin: true,
  pathRewrite: {
    '': '/api/portfolio',
  },
}));

app.listen(port, () => {
  console.log(`API Gateway Service is running on port ${port}`);
});
