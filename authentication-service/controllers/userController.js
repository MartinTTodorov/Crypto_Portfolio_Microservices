const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users: users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getUserByUsernameAndPassword = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createUser = async (req, res) => {
  const { email, password, name, region } = req.body;


  try {
    const saltRounds = 12; 
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    

    const newUser = new User({
      email,
      password: hashedPassword, 
      salt,
      name,
      region
    });
    
    const user = await newUser.save();
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h' 
      }
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: user,
        token: token
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.getUserByID = async (req, res) =>{
  const {id} = req.params;
  try{
    const user = await User.findOne({_id: id})

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user,
      },
    });

  }
  catch(error){
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });

  }
}

exports.getUserByIDDB = async(id) => {
  try{
    const requestedUser = User.findOne({_id:id});
    return requestedUser;
  }
  catch(error){
    throw(error);
  }
  
}




exports.getUserByEmail = async (email) => {

  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    return null; //User wasn't found
  }
};

exports.updateUserByID = async (req, res) => {

  const { id } = req.params;
  const updatedData = req.body;
  const forbiddenFields = ["_id", "role"];

  const invalidFields = Object.keys(updatedData).filter(
    (field) => forbiddenFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Forbidden fields provided for update',
      forbiddenFields: invalidFields,
    });
  }

  try {
    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};






