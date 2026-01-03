const axios = require('axios');
const { resolveLoginToken } = require('./loginToken.service');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('./token.service');

// Функция маппинга role → permissions
function getPermissionsByRole(role) {
  switch (role) {
    case 'admin': return ['read', 'write', 'delete'];
    case 'student': return ['read'];
    case 'teacher': return ['read', 'write'];
    default: return [];
  }
}

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;
const YANDEX_REDIRECT_URI = process.env.YANDEX_REDIRECT_URI || 'http://localhost:4000/auth/yandex/callback';

async function handleYandexCallback(code, state) {
  try {
    // 1. Получаем access token у Яндекса
    const tokenResponse = await axios.post(
      'https://oauth.yandex.ru/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: YANDEX_CLIENT_ID,
        client_secret: YANDEX_CLIENT_SECRET
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. Получаем информацию о пользователе
    const userResponse = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${accessToken}` },
      params: { format: 'json' }
    });

    const yandexUser = userResponse.data;

    // 3. Ищем пользователя в базе по yandexId или email
    let user = await User.findOne({ yandexId: yandexUser.id });

    if (!user) {
      if (yandexUser.default_email) {
        user = await User.findOne({ email: yandexUser.default_email });
      }
    }

    // 4. Создаём нового пользователя, если не найден
    if (!user) {
      let username = yandexUser.real_name || yandexUser.display_name || yandexUser.login;
      let email = yandexUser.default_email;

      // Если email нет → создаём анонимного пользователя
      if (!email) {
        const randomNum = Math.floor(Math.random() * 100000);
        username = `Аноним${randomNum}`;
        email = `anon${randomNum}@example.com`; // заглушка для email
      }

      user = new User({
        yandexId: yandexUser.id,
        email,
        name: username,
        avatar: yandexUser.default_avatar_id
          ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
          : null,
        isEmailVerified: !!yandexUser.default_email,
        role: 'student',
        permissions: getPermissionsByRole('student') // формируем разрешения
      });

      await user.save();
    } else {
      // 5. Обновляем данные существующего пользователя
      user.yandexId = yandexUser.id;
      user.name = yandexUser.real_name || yandexUser.display_name || yandexUser.login;
      user.avatar = yandexUser.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
        : user.avatar || '';
      user.isEmailVerified = yandexUser.default_email ? true : user.isEmailVerified;
      user.permissions = getPermissionsByRole(user.role); // обновляем permissions
      await user.save();
    }

    // 6. Генерация токенов
    const accessJWT = createAccessToken(user, { expiresIn: '1m' }); // 1 минута
    const refreshJWT = await createRefreshToken(user, { expiresIn: '7d' }); // 7 дней

    const tokenData = {
      accessToken: accessJWT,
      refreshToken: refreshJWT,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions
      }
    };

    // 7. Обновляем статус loginToken
    resolveLoginToken(state, tokenData);

  } catch (error) {
    console.error('Yandex OAuth error:', error.response?.data || error.message);
    throw new Error('Yandex authentication failed');
  }
}

module.exports = {
  handleYandexCallback
};
