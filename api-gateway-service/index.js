const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');


const app = express();
const port = 3000;
app.use(cors());

app.use('/api/auth', createProxyMiddleware({
  target: `http://localhost:3001/api/auth`,
  changeOrigin: true,
}));

app.listen(port, () => {
  console.log(`API Gateway Service running on port ${port}`);
});
