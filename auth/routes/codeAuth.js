const express = require('express');
const router = express.Router();

const { generateCode, verifyCode } = require('../services/code.service');
const { createAccessToken, createRefreshToken } = require('../services/token.service');
const { resolveLoginToken } = require('../services/loginToken.service');
const User = require('../models/User');
const { getPermissionsByRoles } = require('../services/permissions.service');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/ProjectAAP/web-client/main.html';
const JWT_SECRET = process.env.JWT_SECRET;

// Генерация кода
router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  if (!loginToken) return res.status(400).json({ error: 'loginToken required' });

  const code = generateCode(loginToken);

  resolveLoginToken(loginToken, {
    status: 'pending',
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  res.json({ code });
});

// Проверка кода
router.post('/verify', async (req, res) => {
  const { code, refreshToken } = req.body;
  if (!code || !refreshToken) return res.status(400).json({ error: 'code and refreshToken required' });

  try {
    const { loginToken, email } = verifyCode(code, refreshToken, JWT_SECRET);

    let user = await User.findOne({ email });

    if (!user) {
      const randomNum = Math.floor(Math.random() * 100000);
      user = await User.create({
        email,
        name: `Аноним${randomNum}`,
        roles: ['student']
      });
    }

    if (user.blocked) return res.sendStatus(418);

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

    const newRefreshToken = await createRefreshToken(user, { expiresIn: '7d' });

    resolveLoginToken(loginToken, {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    });

    // Страница "Авторизация успешна" с редиректом
    res.send(`
      <html>
        <body>
          <h2>Авторизация успешна</h2>
          <p>Вы будете перенаправлены на основной сайт...</p>
          <script>
            const accessToken = "${accessToken}";
            const refreshToken = "${newRefreshToken}";
            setTimeout(() => {
              window.location.href = "${FRONTEND_URL}";
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Code verify error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
