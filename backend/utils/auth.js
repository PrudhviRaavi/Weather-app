const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

exports.hashPassword = async (password) => {
  return argon2.hash(password);
};

exports.comparePassword = async (password, hashedPassword) => {
  return argon2.verify(hashedPassword, password);
};
