// services/permissions.service.js

// Все permissions системы (по ТЗ)
const ROLE_PERMISSIONS = {
  student: [
    // Пользователь
    'user:data:read',

    // Дисциплины
    'course:testList',
    'course:test:read',

    // Вопросы / ответы (только свои — логика отдельно)
    'quest:read',
    'answer:read',
    'answer:update',
    'answer:del'
  ],

  teacher: [
    // Пользователь
    'user:data:read',

    // Дисциплины
    'course:info:write',
    'course:testList',
    'course:test:read',
    'course:test:write',
    'course:test:add',
    'course:test:del',
    'course:userList',
    'course:user:add',
    'course:user:del',

    // Вопросы
    'quest:list:read',
    'quest:read',
    'quest:update',
    'quest:create',
    'quest:del',

    // Тесты
    'test:quest:add',
    'test:quest:del',
    'test:quest:update',
    'test:answer:read'
  ],

  admin: [
    // Пользователи
    'user:list:read',
    'user:fullName:write',
    'user:data:read',
    'user:roles:read',
    'user:roles:write',
    'user:block:read',
    'user:block:write',

    // Дисциплины
    'course:add',
    'course:del',
    'course:info:write',
    'course:testList',
    'course:test:read',
    'course:test:write',
    'course:test:add',
    'course:test:del',
    'course:userList',
    'course:user:add',
    'course:user:del',

    // Вопросы
    'quest:list:read',
    'quest:read',
    'quest:update',
    'quest:create',
    'quest:del',

    // Тесты
    'test:quest:add',
    'test:quest:del',
    'test:quest:update',
    'test:answer:read',

    // Ответы
    'answer:read',
    'answer:update',
    'answer:del'
  ]
};

// Собираем permissions из всех ролей пользователя
function getPermissionsByRoles(roles = []) {
  const permissions = new Set();

  roles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(p => permissions.add(p));
  });

  return Array.from(permissions);
}

module.exports = {
  ROLE_PERMISSIONS,
  getPermissionsByRoles
};
