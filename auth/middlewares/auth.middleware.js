// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    //  Только данные из токена
    req.user = {
      id: payload.id,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || []
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
