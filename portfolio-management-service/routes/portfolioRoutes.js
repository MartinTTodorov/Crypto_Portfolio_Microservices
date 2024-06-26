const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/', portfolioController.getAllPortfolios);

router.post('/users/:userId', portfolioController.createPortfolio);

router.get('/users/:userId', portfolioController.getPortfolio);



module.exports = router;
