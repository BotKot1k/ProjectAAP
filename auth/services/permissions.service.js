const ROLE_PERMISSIONS = {
  student: [
    'profile:read',
    'tests:read',
    'tests:submit'
  ],
  admin: [
    'profile:read',
    'tests:read',
    'tests:submit',
    'tests:create',
    'tests:edit',
    'users:manage'
  ]
};

function getPermissionsByRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

module.exports = {
  getPermissionsByRole
};
