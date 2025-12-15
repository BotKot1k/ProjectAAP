const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const router = express.Router();

const loginStates = new Map();

// POST /login/start
router.post('/login/start', async (req, res) => {
  const { type, provider } = req.body;
  const chosenProvider = provider || type;

  if (!chosenProvider) {
    return res.status(400).json({ message: 'provider/type required' });
  }

  const loginToken = uuidv4();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  loginStates.set(loginToken, {
    status: 'pending',
    expiresAt
  });

  if (chosenProvider === 'github') {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&state=${loginToken}`;
    return res.json({ url, loginToken });
  }

  // Можно добавить другие провайдеры
  res.status(400).json({ message: 'Unknown provider' });
});

// GET /login/check/:state
router.get('/login/check/:state', async (req, res) => {
  const { state } = req.params;
  const record = loginStates.get(state);

  if (!record) return res.status(404).json({ message: 'Login token not found' });
  if (Date.now() > record.expiresAt) {
    loginStates.delete(state);
    return res.status(410).json({ message: 'Login token expired' });
  }
  if (record.status !== 'success') return res.json({ status: record.status });

  res.json({
    status: 'success',
    accessToken: record.accessToken,
    refreshToken: record.refreshToken
  });
});

// GET /oauth/github/callback
router.get('/oauth/github/callback', async (req, res) => {
  const { state, email } = req.query;
  const record = loginStates.get(state);
  if (!record) return res.status(400).send('Invalid state');

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, permissions: ['user'] });

  const accessToken = jwt.sign(
    { userId: user._id, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );

  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  record.status = 'success';
  record.accessToken = accessToken;
  record.refreshToken = refreshTokenValue;

  res.send('Login successful. You can return to the app.');
});

// POST /token/refresh
router.post('/token/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenDoc) return res.status(401).json({ message: 'Invalid refresh token' });
  if (tokenDoc.expiresAt < new Date()) {
    await tokenDoc.deleteOne();
    return res.status(401).json({ message: 'Refresh token expired' });
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) return res.status(401).json({ message: 'User not found' });

  await tokenDoc.deleteOne();

  const newAccessToken = jwt.sign(
    { userId: user._id, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );

  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// POST /logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  await RefreshToken.deleteOne({ token: refreshToken });
  res.json({ message: 'Logged out from all devices' });
});

module.exports = router;

router.post('/login/complete', async (req, res) => {
  const { loginToken, email } = req.body;
  const record = loginStates.get(loginToken);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: 'Login token invalid or expired' });
  }

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, permissions: ['user'] });

  const accessToken = jwt.sign(
    { userId: user._id, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1m' }
  );

  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  await RefreshToken.create({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  record.status = 'success';
  record.accessToken = accessToken;
  record.refreshToken = refreshTokenValue;

  res.json({ accessToken, refreshToken: refreshTokenValue });
});