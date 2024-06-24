const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',      // process.env.DB_USER
  host: 'portfolio-db',  // process.env.DB_HOST
  database: 'portfolio_db', // process.env.DB_DATABASE
  password: 'stpt12',    // process.env.DB_PASSWORD
  port: 5432,            // process.env.DB_PORT
});

pool.on('connect', (client) => {
  console.log('Connected to the PostgreSQL database');

  // Create portfolios table if it doesn't exist
  client.query(`CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`)
  .then(() => console.log('Table portfolios created or already exists'))
  .catch(err => console.error('Error creating table:', err));
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
