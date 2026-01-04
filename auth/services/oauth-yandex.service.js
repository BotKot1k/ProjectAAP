const axios = require('axios');

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;
const YANDEX_REDIRECT_URI =
  process.env.YANDEX_REDIRECT_URI || 'http://localhost:4000/auth/yandex/callback';

function getYandexAuthUrl(loginToken) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: YANDEX_CLIENT_ID,
    redirect_uri: YANDEX_REDIRECT_URI,
    state: loginToken,
    scope: 'login:email login:info'
  });

  return `https://oauth.yandex.ru/authorize?${params.toString()}`;
}

async function getYandexUser(code) {
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

  const userResponse = await axios.get(
    'https://login.yandex.ru/info',
    {
      headers: { Authorization: `OAuth ${accessToken}` },
      params: { format: 'json' }
    }
  );

  const y = userResponse.data;

  return {
    id: y.id,
    email: y.default_email,
    name: y.real_name || y.display_name || y.login,
    avatar: y.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${y.default_avatar_id}/islands-200`
      : null,
    isEmailVerified: !!y.default_email
  };
}

module.exports = {
  getYandexAuthUrl,
  getYandexUser
};
