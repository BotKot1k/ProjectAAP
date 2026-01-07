require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@project.local';

    let user = await User.findOne({ email });

    if (user) {
      // если пользователь есть, но не админ — исправляем
      if (!user.roles.includes('admin')) {
        user.roles.push('admin');
        await user.save();
        console.log('Роль admin добавлена существующему пользователю');
      } else {
        console.log('Администратор уже существует');
      }
      process.exit(0);
    }

    await User.create({
      email,
      name: 'Administrator',
      roles: ['admin'],
      isEmailVerified: true
    });

    console.log('Администратор успешно создан');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка при создании администратора:', err);
    process.exit(1);
  }
}

createAdmin();

