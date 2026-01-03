// Универсальный словарь loginToken
const loginTokens = {};

/**
 * Создаёт запись loginToken со статусом pending
 */
function createLoginToken(token) {
  loginTokens[token] = {
    status: 'pending',
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 минут
    result: null
  };
}

/**
 * Получение информации о токене
 */
function getLoginToken(token) {
  return loginTokens[token];
}

/**
 * Разрешение токена с результатом
 */
function resolveLoginToken(token, result) {
  if (!loginTokens[token]) return;
  loginTokens[token] = {
    ...loginTokens[token],
    status: 'success',
    result
  };
}

/**
 * Отклонение токена
 */
function rejectLoginToken(token) {
  if (!loginTokens[token]) return;
  loginTokens[token] = {
    ...loginTokens[token],
    status: 'rejected'
  };
}

module.exports = {
  loginTokens,
  createLoginToken,
  getLoginToken,
  resolveLoginToken,
  rejectLoginToken
};
