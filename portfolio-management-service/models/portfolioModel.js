const db = require('../connections/db');

const createPortfolio = async (userId, address, blockchain) => {
  const query = `
    INSERT INTO portfolios (user_id, address, blockchain, created_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [userId, address, blockchain];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const getPortfolio = async (userId) => {
  const query = `
    SELECT * FROM portfolios
    WHERE user_id = $1;
  `;
  const values = [userId];

  try {
    const { rows } = await db.query(query, values);
    return rows;
  } catch (error) {
    throw error;
  }
};

const getAllPortfolios = async () => {
  const query = `
    SELECT * FROM portfolios;
  `;

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  createPortfolio,
  getPortfolio,
  getAllPortfolios
};
