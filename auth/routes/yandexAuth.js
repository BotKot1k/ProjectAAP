const express = require('express');
const router = express.Router();
const { createLoginToken, getLoginToken, resolveLoginToken, rejectLoginToken } = require('../services/loginToken.service');
const { getYandexAuthUrl, handleYandexCallback } = require('../services/oauth-yandex.service');

router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  if (!loginToken) return res.status(400).json({ error: 'loginToken required' });

  createLoginToken(loginToken);

  res.json({ url: getYandexAuthUrl(loginToken) });
});

router.get('/status/:token', (req, res) => {
  const record = getLoginToken(req.params.token);
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (Date.now() > record.expiresAt) return res.status(410).json({ error: 'Expired' });
  if (record.status === 'rejected') return res.status(403).json({ error: 'Rejected' });
  if (record.status === 'pending') return res.json({ status: 'pending' });

  res.json(record.result);
});

router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    rejectLoginToken(state);
    return res.send(`
      <html>
        <body>
          <h2>Авторизация отклонена</h2>
          <p>${error_description || 'Вы отменили вход через Яндекс'}</p>
        </body>
      </html>
    `);
  }

  if (!code || !state) return res.status(400).send('Invalid callback data');

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

module.exports = router;
