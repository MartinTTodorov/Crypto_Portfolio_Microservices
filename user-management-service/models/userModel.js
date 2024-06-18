const db = require('../db/db');

exports.createUser = async (name, phone, address) => {
  const query = 'INSERT INTO "usersdata" (name, phone, address) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, phone, address];
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.getUser = async (id) => {
  const query = 'SELECT * FROM "usersdata" WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

exports.updateUser = async (id, name, phone, address) => {
  const query = 'UPDATE "usersdata" SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING *';
  const values = [name, phone, address, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.deleteUser = async (id) => {
  const query = 'DELETE FROM "usersdata" WHERE id = $1 RETURNING *';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

exports.getAllUsers = async () => {
  try {
    const query = 'SELECT * FROM "usersdata"';
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Failed to get all users: ' + error.message);
  }
};

