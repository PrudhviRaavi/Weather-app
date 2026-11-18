const db = require('../database');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const userExists = await db.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with UUID
    const user = await db.user.create({
      data: { email, password: hashedPassword, username },
      select: { id: true, email: true, username: true }
    });
    const token = generateToken(user.id);

    res.cookie('token', token, authCookieOptions);
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.cookie('token', token, authCookieOptions);
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
};
