const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

function createAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing!');
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

async function createRefreshToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing!');
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Сохраняем токен в базe

  await RefreshToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return token;
}

module.exports = {
  createAccessToken,
  createRefreshToken
};