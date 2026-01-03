require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// Проверяем JWT_SECRET сразу
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing! Set it in your .env file.');
  process.exit(1); // останавливаем сервер
}

// Импорт роутов после dotenv
const emailRoutes = require('./routes/emailAuth');
const githubRoutes = require('./routes/githubAuth');
const yandexRoutes = require('./routes/yandexAuth');
const codeRoutes = require('./routes/codeAuth');
// Подключаем роуты
app.use('/auth/code', codeRoutes);
app.use('/auth/email', emailRoutes);
app.use('/auth/github', githubRoutes);
app.use('/auth/yandex', yandexRoutes);

// Подключение к MongoDB и запуск сервера
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });
