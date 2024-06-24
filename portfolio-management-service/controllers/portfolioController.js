const portfolioModel = require('../models/portfolioModel');

const createPortfolio = async (req, res, next) => {
  const { userId } = req.params;
  const { address, blockchain } = req.body;

  try {
    const portfolio = await portfolioModel.createPortfolio(userId, address, blockchain);
    res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
};

const getPortfolio = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const portfolio = await portfolioModel.getPortfolio(userId);
    res.status(200).json(portfolio);
  } catch (error) {
    next(error);
  }
};

const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await getAllPortfolios();
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createPortfolio,
  getPortfolio,
  getAllPortfolios
};
