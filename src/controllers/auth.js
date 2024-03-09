const User = require('../models/user')
const jwt = require('jsonwebtoken');


exports.signup = async(req, res) => {
  const userFoundByEmail = await User.findOne({email: req.body.email});
  const userFoundByUsername = await User.findOne({username: req.body.username});

  if(userFoundByEmail || userFoundByUsername){
    return res.status(400).json({message: 'User already exists'});
  }else {
    try{const {firstName, lastName, username, password, email, adminPassword, role} = req.body;
    const newUser = new User({
      firstName,
      lastName,
      username,
      password,
      email
    });
    
    if(role){
      if(adminPassword == process.env.ADMIN_PASSWORD){
        newUser.role = role;
      }else {
        return res.status(400).json({message: "Wrong admin password"})
      }
    }
    const savedUser = await newUser.save();
    if(savedUser === newUser){
      return res.json({user: savedUser});
    }else{
      return res.status(400).json({message: 'Error saving the user'});
    }
  }catch(error){
    console.log(error);
    console.log('------------------------')
    console.log(error.errors)
    return res.status(400).json({message: 'Something went wrong', errors: error.errors})
  }
  }
}