const express = require('express');
const userController = require('../controllers/authController');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/users', userController.getAllUsers);


module.exports = router;
