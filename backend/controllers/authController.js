const db = require('../database');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with UUID
    const userId = uuidv4();
    db.prepare(
      'INSERT INTO users (id, email, password, username) VALUES (?, ?, ?, ?)'
    ).run(userId, email, hashedPassword, username);

    const user = db.prepare('SELECT id, email, username FROM users WHERE id = ?').get(userId);
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  // Token is stateless, logout handled on frontend by removing token
  res.json({ message: 'Logged out successfully' });
};
