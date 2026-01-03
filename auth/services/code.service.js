const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { resolveLoginToken } = require('./loginToken.service');

const CODE_EXPIRY_MS = 60 * 1000; // 1 минута
const codes = {}; // словарь: code -> { loginToken, expiresAt }

/**
 * Генерация случайного 5-6 значного кода и сохранение в словарь
 */
function generateCode(loginToken) {
  const code = Math.floor(10000 + Math.random() * 900000).toString(); // 5-6 цифр
  const expiresAt = Date.now() + CODE_EXPIRY_MS;

  codes[code] = { loginToken, expiresAt };

  return code;
}

/**
 * Проверка кода и refreshToken
 * @param {string} code 
 * @param {string} refreshToken 
 * @returns loginToken для дальнейшей авторизации
 */
function verifyCode(code, refreshToken, JWT_SECRET) {
  const record = codes[code];

  if (!record) {
    throw new Error('Code not found');
  }

  if (Date.now() > record.expiresAt) {
    delete codes[code];
    throw new Error('Code expired');
  }

  // Проверка JWT refreshToken
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    // Удаляем код после успешной проверки
    delete codes[code];
    return { loginToken: record.loginToken, email: decoded.email };
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
}

module.exports = {
  generateCode,
  verifyCode
};
