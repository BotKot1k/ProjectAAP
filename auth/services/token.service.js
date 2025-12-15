const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );
}

async function createRefreshToken(user) {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
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