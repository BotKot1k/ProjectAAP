Readme for the Telegram bot
Этот бот — интерфейс к учебной платформе, написанный на Go. Он обрабатывает команды в Telegram, связывается с модулем авторизации для входа через Яндекс и GitHub, хранит состояния и данные пользователей в Redis, и проксирует запросы к бекенду логики (пользователи, курсы, тесты, вопросы). Проект упакован в Docker и запускается вместе с Redis через docker-compose.

Возможности
Авторизация: вход через Яндекс или GitHub через внешний модуль авторизации.

Состояние: хранит auth state и user_id в Redis.

Профиль: команды для просмотра и выхода — /me, /logout.

Пользователи: /users, /user {id}, /deluser {id}.

Курсы: /courses, /course {id}, /addcourse {json}, /delcourse {id}.

Тесты: /addtest {course_id} {json}, /deltest {course_id} {test_id}.

Вопросы: /question {id}, /addquestion {json}, /delquestion {id}.

Базовые команды: /start, /help, и одна козья команда /goat.

Требования
Docker Engine и Docker Compose

Токен Telegram‑бота

Доступные сервисы авторизации и логики (либо на хосте, либо в Docker‑сети)

Конфигурация
Создайте файл .env в корне проекта:

env
# Токен Telegram бота (обязательно)
TG_BOT_TOKEN=<ваш_токен>

# Настройки Redis (внутри Docker сети)
REDIS_ADDR=redis:6379
REDIS_PASSWORD=

# URL сервисов
# Если сервисы auth и logic запущены на хосте:
AUTH_SERVICE_URL=http://host.docker.internal:8080
LOGIC_SERVICE_URL=http://localhost:3415

# Если auth и logic тоже в Docker:
# AUTH_SERVICE_URL=http://auth:8080
# LOGIC_SERVICE_URL=http://logic:3415

BOT_PUBLIC_URL=http://localhost
Запуск
Вариант 1: Docker Compose (бот + Redis)
bash
docker-compose up --build
Стек поднимает два контейнера: bot и redis. Бот читает конфиг из .env, подключается к Redis по адресу redis:6379, и начинает ловить апдейты.

Вариант 2: Только Docker (если Redis на хосте)
Собрать образ:

bash
docker build -t telegram-bot .
Запустить:

bash
docker run --name telegram-bot --env-file .env telegram-bot
Если Redis не в Docker, укажите REDIS_ADDR=host.docker.internal:6379 (Windows/Mac) или используйте --network host (Linux).

Структура проекта
main.go — точка входа; обработка команд Telegram, интеграция с Redis, вызовы к сервисам auth и logic.

.env — конфиг окружения.

Dockerfile — многоэтапная сборка Go‑бинарника.

docker-compose.yml — минимальный стек: бот и Redis.

Dockerfile
dockerfile
# Этап сборки
FROM golang:1.25 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod tidy
COPY . .
RUN go build -o bot main.go

# Этап запуска
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/bot .
CMD ["./bot"]
Команды бота
Базовые: /start, /help, /goat

Авторизация: /login_yandex, /login_github, /auth_check {код}

Профиль: /me, /logout

Пользователи: /users, /user {id}, /deluser {id}

Курсы: /courses, /course {id}, /addcourse {json}, /delcourse {id}

Тесты: /addtest {course_id} {json}, /deltest {course_id} {test_id}

Вопросы: /question {id}, /addquestion {json}, /delquestion {id}

Примечания
Бот не выполняет авторизацию самостоятельно — он перенаправляет пользователя и взаимодействует с внешним модулем авторизации. После подтверждения получает user_id и сохраняет его в Redis.

Все действия, требующие идентификации, проверяют наличие user:{chat_id} в Redis. Если пользователь не авторизован, бот предлагает /login_yandex или /login_github.

Для работы с курсами/тестами/вопросами бот проксирует запросы на logic_service_url, добавляя current_id.

Диагностика
Если контейнер бота не стартует с ошибкой “stat ./bot: no such file or directory”, проверьте:

успешность сборки (go build -o bot main.go в Dockerfile),

версию Go в go.mod и базовом образе (golang:1.25),

что COPY --from=builder /app/bot . присутствует.

Если бот не видит Redis, убедитесь, что:

в .env REDIS_ADDR=redis:6379,

сервис redis в Compose поднят,

сети совпадают и сервисы в одной сети.
