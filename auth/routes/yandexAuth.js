const express = require('express');
const { createLoginToken, getLoginToken, resolveLoginToken, rejectLoginToken } = require('../services/loginToken.service');
const { getYandexAuthUrl, handleYandexCallback } = require('../services/oauth-yandex.service');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('../services/token.service');

const router = express.Router();

/**
 * Начало входа через OAuth
 */
router.post('/start', (req, res) => {
  const { provider, loginToken } = req.body;

  createLoginToken(loginToken);

  if (provider === 'yandex') {
    return res.json({ url: getYandexAuthUrl(loginToken) });
  }

  res.status(400).json({ error: 'Unknown provider' });
});

/**
 * Проверка loginToken
 */
router.get('/status/:token', (req, res) => {
  const record = getLoginToken(req.params.token);

  if (!record) return res.status(404).json({ error: 'Not found' });
  if (Date.now() > record.expiresAt) return res.status(410).json({ error: 'Expired' });
  if (record.status === 'rejected') return res.status(403).json({ error: 'Rejected' });
  if (record.status === 'pending') return res.json({ status: 'pending' });

  res.json(record.result);
});

/**
 * Яндекс callback
 */
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Пользователь отказался
  if (error) {
    rejectLoginToken(state);
    return res.status(401).send(`
      <html>
        <body>
          <h2>Авторизация отклонена</h2>
          <p>${error_description || 'Вы отменили вход через Яндекс'}</p>
        </body>
      </html>
    `);
  }

  // Нет code или state
  if (!code || !state) {
    return res.status(400).send('Invalid callback data');
  }

  try {
    await handleYandexCallback(code, state);
    res.send(`
      <html>
        <body>
          <h2>Авторизация успешна</h2>
          <p>Вы можете вернуться в приложение</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Yandex callback error:', err);
    res.status(500).send('Authorization failed');
  }
});

/**
 * Обновление токенов
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
 * Logout
 */
router.post('/logout', async (req, res) => {
  await RefreshToken.deleteOne({ token: req.body.refreshToken });
  res.json({ ok: true });
});

module.exports = router;