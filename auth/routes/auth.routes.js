const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
  createLoginToken,
  getLoginToken,
  resolveLoginToken
} = require('../services/loginToken.service');
const {
  createAccessToken,
  createRefreshToken
} = require('../services/token.service');
const { getGithubAuthUrl } = require('../services/oauth.service');

const router = express.Router();

/**
 * ШАГ 1–2: начало входа
 */
router.post('/start', (req, res) => {
  const { provider, loginToken } = req.body;

  createLoginToken(loginToken);

  if (provider === 'github') {
    return res.json({
      url: getGithubAuthUrl(loginToken)
    });
  }

  res.status(400).json({ error: 'Unknown provider' });
});

/**
 * ШАГ 7: проверка login token
 */
router.get('/status/:token', (req, res) => {
  const record = getLoginToken(req.params.token);

  if (!record) return res.status(404).json({ error: 'Not found' });
  if (Date.now() > record.expiresAt)
    return res.status(410).json({ error: 'Expired' });
  if (record.status === 'rejected')
    return res.status(403).json({ error: 'Rejected' });
  if (record.status === 'pending')
    return res.json({ status: 'pending' });

  res.json(record.result);
});

/**
 * ШАГ 8: обновление токенов
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) return res.status(401).end();

  const user = await User.findById(stored.userId);

  await RefreshToken.deleteOne({ token: refreshToken });

  const newAccess = createAccessToken(user);
  const newRefresh = await createRefreshToken(user);

  res.json({ accessToken: newAccess, refreshToken: newRefresh });
});

/**
 * ШАГ 9: logout
 */
router.post('/logout', async (req, res) => {
  await RefreshToken.deleteOne({ token: req.body.refreshToken });
  res.json({ ok: true });
});

module.exports = router;