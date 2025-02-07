const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const csurf = require('csurf');
const session = require('express-session');

const app = express();
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: true } });
// This checks if the CSRF token in the request matches the one in stored cookies/session
app.use(cookieParser());
app.use(express.json());


const SECRET_KEY = 'HelloJi1eetewdfsd92$$44';

// Mock login route to issue JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Example authentication logic (replace with actual database validation)
  if (username === 'user' && password === 'password') {
    // Create JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    // Set JWT token in HttpOnly cookie
    res.cookie('authToken', token, { 
      httpOnly: true, 
      secure: true, 
      maxAge: 3600000, 
      // sameSite: Strict // 1 hour 
    });

    return res.json({ message: 'Login successful' });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify JWT token from cookies
const verifyJwt = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // Attach user data to request
    next();
  });
};

// Protect routes with CSRF token and JWT authentication
app.get('/protected', csrfProtection, verifyJwt, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user.username, // User from decoded JWT token
    csrfToken: req.csrfToken(), // Send CSRF token to client
  });
});
// we will use the csrf token generated from this protected route to access this submit form 
// Handle CSRF token validation
app.post('/submit', csrfProtection, verifyJwt, (req, res) => {
  res.json({ message: 'Form submitted successfully' });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



