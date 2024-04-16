const User = require('../models/user.js');
const userController = require('./userController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await userController.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Login failed' });
    }
    const hashedPassword = await bcrypt.hash(password, user.salt);

    if (hashedPassword === user.password) {
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '10h' 
        }
      );
      
      return res.status(200).json({ message: 'Login successful', token: token });
    } else {
      return res.status(401).json({ message: 'Login failed' });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};



exports.register = async (req, res) => {
  //All validations are inside the createUser
    const newUser = await userController.createUser(req, res);
};

exports.authenticateTokenAndRole = (role = null) => (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Access denied. You are not permitted to perform that action.' });
    }

    req.role = role;
    next();
  });
};
