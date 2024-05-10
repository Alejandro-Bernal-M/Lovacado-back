const jwt = require('jsonwebtoken');

exports.requireSignin = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
      
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'Invalid token' });
    }
  }
  return res.status(400).json({ message: 'Authorization required' });
}

exports.requireAdmin = async (req, res, next) => {
  if ( req.user.role === 'admin') {
    next();
  } else {
    return res.status(400).json({ message: 'Admin access denied' });
  }
}