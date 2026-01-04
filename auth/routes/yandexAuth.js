const express = require('express');
const router = express.Router();

const {
  createLoginToken,
  getLoginToken,
  resolveLoginToken,
  rejectLoginToken
} = require('../services/loginToken.service');

const { getYandexAuthUrl, getYandexUser } = require('../services/oauth-yandex.service');
const { createAccessToken, createRefreshToken } = require('../services/token.service');
const { getPermissionsByRoles } = require('../services/permissions.service');
const User = require('../models/User');

router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  if (!loginToken) {
    return res.status(400).json({ error: 'loginToken required' });
  }

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
      <html><body>
        <h2>Авторизация отклонена</h2>
        <p>${error_description || 'Вы отменили вход через Яндекс'}</p>
      </body></html>
    `);
  }

  if (!code || !state) {
    return res.status(400).send('Invalid callback data');
  }

  try {
    const yandexUser = await getYandexUser(code);

    let user = await User.findOne({ yandexId: yandexUser.id });

    if (!user) {
      user = await User.create({
        email: yandexUser.email,
        yandexId: yandexUser.id,
        name: yandexUser.name,
        avatar: yandexUser.avatar,
        roles: ['student']
      });
    }

    if (user.blocked) {
      rejectLoginToken(state);
      return res.sendStatus(418);
    }

    const permissions = getPermissionsByRoles(user.roles);

    const accessToken = createAccessToken(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
        permissions,
        blocked: user.blocked
      },
      { expiresIn: '15m' }
    );

    const refreshToken = await createRefreshToken(user, {
      expiresIn: '7d'
    });

    resolveLoginToken(state, {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    });

    res.send(`
      <html><body>
        <h2>Авторизация успешна</h2>
        <p>Вы можете вернуться в приложение</p>
      </body></html>
    `);
  } catch (err) {
    console.error('Yandex callback error:', err);
    rejectLoginToken(state);
    res.status(500).send('Authorization failed');
  }
});

module.exports = router;
