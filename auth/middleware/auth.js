const jwt = require('jsonwebtoken');

function authMiddleware(requiredPermissions = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is missing');
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions || []
      };

      //  Проверка permissions
      if (requiredPermissions.length > 0) {
        const hasAll = requiredPermissions.every(p =>
          req.user.permissions.includes(p)
        );

        if (!hasAll) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = authMiddleware;
