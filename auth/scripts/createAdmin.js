require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { getPermissionsByRole } = require('../services/permissions.service');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@project.local';

  let user = await User.findOne({ email });

  if (user) {
    console.log('Админ уже существует');
    process.exit(0);
  }

  const role = 'admin';
  const permissions = getPermissionsByRole(role);

  await User.create({
    email,
    role,
    permissions,
    refreshTokens: []
  });

  console.log('Админ успешно создан');
  process.exit(0);
}

createAdmin();
