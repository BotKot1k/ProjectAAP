const jwt = require('jsonwebtoken');

const CODE_EXPIRY_MS = 60 * 1000; // 1 минута
const codes = {}; // code -> { loginToken, expiresAt }

function generateCode(loginToken) {
  const code = Math.floor(10000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + CODE_EXPIRY_MS;

  codes[code] = { loginToken, expiresAt };
  return code;
}

function verifyCode(code, refreshToken, JWT_SECRET) {
  const record = codes[code];
  if (!record) {
    throw new Error('Code not found');
  }

  if (Date.now() > record.expiresAt) {
    delete codes[code];
    throw new Error('Code expired');
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    delete codes[code];
    return {
      loginToken: record.loginToken,
      email: decoded.email
    };
  } catch {
    throw new Error('Invalid refresh token');
  }
}

module.exports = {
  generateCode,
  verifyCode
};
