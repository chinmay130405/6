const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware to parse JSON
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// In-memory user storage
const users = [];

// ==================== MIDDLEWARE ====================

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Attach user info (id, role) to request
    next();
  });
};

// Middleware to check user roles
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRole: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// ==================== ROUTES ====================

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Validate role
    const validRoles = ['admin', 'user'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: userRole
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Dashboard route - accessible to any authenticated user
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your dashboard!',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Admin route - accessible only to admin users
app.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({
    message: 'Welcome to the admin panel!',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    },
    allUsers: users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role
    }))
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'JWT Authentication API',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      dashboard: 'GET /dashboard (requires authentication)',
      admin: 'GET /admin (requires admin role)'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable routes:`);
  console.log(`  POST   /register`);
  console.log(`  POST   /login`);
  console.log(`  GET    /dashboard (protected)`);
  console.log(`  GET    /admin (admin only)`);
});
