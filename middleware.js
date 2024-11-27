const jwt = require('jsonwebtoken');

// Middleware to check JWT
const checkJwt = (req, res, next) => {
  // Get token from Authorization header
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  // If token is not provided
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to the request object
    req.user = { id: decoded.id }; // Store the user ID from the decoded token
    
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = checkJwt;