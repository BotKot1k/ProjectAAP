module.exports = function checkPermission(requiredPermissions = []) {
  return (req, res, next) => {
    if (!requiredPermissions.length) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every(p =>
      req.user.permissions.includes(p)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
