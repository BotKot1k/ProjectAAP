const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { createAccessToken, createRefreshToken } = require('../services/token.service');

const router = express.Router();

/**
 * Пример: регистрация пользователя по email
 */
router.post('/register', async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ error: 'User already exists' });

  user = await User.create({ email });

  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email } });
});

/**
 * Пример: login по email
 */
router.post('/login', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email } });
});

module.exports = router;

router.get('/status/:token', (req, res) => {
  const record = getLoginToken(req.params.token);
  if (!record) return res.status(404).json({ error: 'Not found' });

  if (Date.now() > record.expiresAt) return res.status(410).json({ error: 'Expired' });
  if (record.status === 'rejected') return res.status(403).json({ error: 'Rejected' });
  if (record.status === 'pending') return res.json({ status: 'pending' });

  res.json(record.result);
});

router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  createLoginToken(loginToken);
  res.json({ loginToken });
});
