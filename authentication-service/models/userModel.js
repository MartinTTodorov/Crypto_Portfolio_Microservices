const db = require('../connections/db');

class User {
  constructor(id, username, password, salt, role) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.salt = salt;
    this.role = role;
  }

  static async create(username, password, salt, role) {
    const text = 'INSERT INTO users (username, password, salt, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [username, password, salt, role];
    try {
      const res = await db.query(text, values);
      const user = res.rows[0];
      return new User(user.id, user.username, user.password, user.salt, user.role);
    } catch (err) {
      throw new Error('Error creating user: ' + err.message);
    }
  }
  


  static async findByUsername(username) {
    const text = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    try {
      const res = await db.query(text, values);
      if (res.rows.length === 0) {
        return null;
      }
      const user = res.rows[0];
      return new User(user.id, user.username, user.password, user.salt);
    } catch (err) {
      throw new Error('Error fetching user: ' + err.message);
    }
  }
  
}

module.exports = User;
