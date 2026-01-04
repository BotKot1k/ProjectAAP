const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

function createAccessToken(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing!');
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: options.expiresIn || '15m'
    }
  );
}

async function createRefreshToken(user, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing!');
  }

  const expiresIn = options.expiresIn || '7d';

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );

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
