const express = require('express');
const router = express.Router();

const {
  createLoginToken,
  getLoginToken,
  resolveLoginToken,
  rejectLoginToken
} = require('../services/loginToken.service');

const { getGithubAuthUrl, getGithubUser } = require('../services/oauth-github.service');
const { createAccessToken, createRefreshToken } = require('../services/token.service');
const { getPermissionsByRoles } = require('../services/permissions.service');
const User = require('../models/User');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/ProjectAAP/web-client/main.html';

// Запуск авторизации
router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  if (!loginToken) return res.status(400).json({ error: 'loginToken required' });

  createLoginToken(loginToken);
  res.json({ url: getGithubAuthUrl(loginToken) });
});

// Проверка статуса
router.get('/status/:token', (req, res) => {
  const record = getLoginToken(req.params.token);
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (Date.now() > record.expiresAt) return res.status(410).json({ error: 'Expired' });
  if (record.status === 'rejected') return res.status(403).json({ error: 'Rejected' });
  if (record.status === 'pending') return res.json({ status: 'pending' });

  res.json(record.result);
});

// Callback от GitHub
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    rejectLoginToken(state);
    return res.send('<h2>Авторизация отклонена</h2>');
  }

  if (!code || !state) {
    return res.status(400).send('Invalid callback data');
  }

  try {
    const githubUser = await getGithubUser(code);

    let user = await User.findOne({
      $or: [
        { githubId: githubUser.id },
        { email: githubUser.email }
      ]
    });

    if (!user) {
      user = await User.create({
        email: githubUser.email,
        githubId: githubUser.id,
        name: githubUser.name,
        avatar: githubUser.avatar,
        roles: ['student']
      });
    } else if (!user.githubId) {
      user.githubId = githubUser.id;
      await user.save();
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
        permissions
      },
      { expiresIn: '15m' }
    );

    const refreshToken = await createRefreshToken(user, { expiresIn: '7d' });

    // 🔐 ВОТ ЗДЕСЬ — ГЛАВНОЕ
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    resolveLoginToken(state, { success: true });

    // 🔁 РЕДИРЕКТ НА ФРОНТ
    res.redirect('http://127.0.0.1:5500/ProjectAAP/web-client/main.html');

  } catch (err) {
    console.error('GitHub callback error:', err);
    rejectLoginToken(state);
    res.status(500).send('Authorization failed');
  }
});


module.exports = router;
