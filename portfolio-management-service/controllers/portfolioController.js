const Portfolio = require('../models/portfolio');

const createPortfolio = async (req, res) => {
  const { userId } = req.body;
  
  try {
    
    const portfolio = await Portfolio.create({ userId, addresses: [] });
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Error creating the portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addAddress = async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;

  try {
   
    let portfolio = await Portfolio.findOne({ where: { userId } });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    
    portfolio = await portfolio.update({ addresses: [...portfolio.addresses, address] });
    res.json(portfolio);
  } catch (error) {
    console.error('Error adding the address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    
    let portfolio = await Portfolio.findOne({ where: { userId } });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    
    portfolio = await portfolio.update({ addresses: portfolio.addresses.filter(a => a !== addressId) });
    res.json(portfolio);
  } catch (error) {
    console.error('Error removing address1:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPortfolio = async (req, res) => {
  const { userId } = req.params;

  try {
    
    const portfolio = await Portfolio.findOne({ where: { userId } });
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPortfolio,
  addAddress,
  removeAddress,
  getPortfolio
};
