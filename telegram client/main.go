// ну это для начала чисто

package main

import (
	"bytes"
	"context"
	// "encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var rdb *redis.Client

// Конфигурация из .env
type Config struct {
	TGToken         string
	RedisAddr       string
	RedisPassword   string
	AuthServiceURL  string
	LogicServiceURL string
	BotPublicURL    string
	GitHubClientID  string
	YandexClientID  string
}

var config Config

func main() {
	if err := loadConfig(); err != nil {
		log.Fatal("Ошибка загрузки конфигурации:", err)
	}

	rdb = redis.NewClient(&redis.Options{
		Addr:     config.RedisAddr,
		Password: config.RedisPassword,
		DB:       0,
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("Ошибка подключения к Redis: %v", err)
	}

	bot, err := tgbotapi.NewBotAPI(config.TGToken)
	if err != nil {
		log.Panic(err)
	}

	log.Printf("Авторизован как %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message == nil {
			continue
		}

		chatID := update.Message.Chat.ID
		args := strings.Fields(update.Message.Text)
		if len(args) == 0 {
			continue
		}

		switch args[0] {
		case "/start":
			msg := tgbotapi.NewMessage(chatID, "Привет! Я ботGOтик. Используй /help для списка команд.")
			bot.Send(msg)

		case "/help":
			msg := tgbotapi.NewMessage(chatID,
				"Команды:\n"+
					"/login_yandex — начать авторизацию через Яндекс\n"+
					"/login_github — начать авторизацию через GitHub\n"+
					"/auth_check {код} — проверить статус авторизации\n"+
					"/me — показать информацию о текущем пользователе\n"+
					"/logout — выйти из системы\n"+
					"/users — показать список всех пользователей\n"+
					"/user {id} — информация о пользователе\n"+
					"/deluser {id} — удалить пользователя\n"+
					"/courses — список курсов\n"+
					"/course {id} — информация о курсе\n"+
					"/addcourse {json} — добавить курс\n"+
					"/delcourse {id} — удалить курс\n"+
					"/addtest {course_id} {json} — добавить тест\n"+
					"/deltest {course_id} {test_id} — удалить тест\n"+
					"/question {id} — информация о вопросе\n"+
					"/addquestion {json} — добавить вопрос\n"+
					"/delquestion {id} — удалить вопрос\n"+
					"/goat — козья команда 🐐")
			bot.Send(msg)

		case "/login_yandex":
			handleLogin(bot, chatID, "yandex")

		case "/login_github":
			handleLogin(bot, chatID, "github")

		case "/auth_check":
			if len(args) < 2 {
				msg := tgbotapi.NewMessage(chatID, "Использование: /auth_check {код}")
				bot.Send(msg)
				break
			}
			code := args[1]
			handleAuthCheck(bot, chatID, code)

		case "/me":
			handleMe(bot, chatID)

		case "/logout":
			handleLogout(bot, chatID)

		// --- Пользователи ---
		case "/users":
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/users?current_id=%d", config.LogicServiceURL, userID)
				resp, err := http.Get(url)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /users"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/user":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /user {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/user/%s?current_id=%d", config.LogicServiceURL, id, userID)
				resp, err := http.Get(url)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /user/"+id))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/deluser":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deluser {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/user/%s?current_id=%d", config.LogicServiceURL, id, userID)
				req, _ := http.NewRequest("DELETE", url, nil)
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления пользователя"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		// --- Курсы ---
		case "/courses":
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/courses?current_id=%d", config.LogicServiceURL, userID)
				resp, err := http.Get(url)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /courses"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/course":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /course {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/course/%s?current_id=%d", config.LogicServiceURL, id, userID)
				resp, err := http.Get(url)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /course/"+id))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/addcourse":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addcourse {json}"))
				break
			}
			jsonBody := strings.Join(args[1:], " ")
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/course?current_id=%d", config.LogicServiceURL, userID)
				resp, err := http.Post(url, "application/json", bytes.NewBuffer([]byte(jsonBody)))
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания курса"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/delcourse":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delcourse {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/course/%s?current_id=%d", config.LogicServiceURL, id, userID)
				req, _ := http.NewRequest("DELETE", url, nil)
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления курса"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		// --- Тесты ---
		case "/addtest":
			if len(args) < 3 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addtest {course_id} {json}"))
				break
			}
			courseID := args[1]
			jsonBody := strings.Join(args[2:], " ")
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/course/%s/test?current_id=%d", config.LogicServiceURL, courseID, userID)
				resp, err := http.Post(url, "application/json", bytes.NewBuffer([]byte(jsonBody)))
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания теста"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/deltest":
			if len(args) < 3 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deltest {course_id} {test_id}"))
				break
			}
			courseID := args[1]
			testID := args[2]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/course/%s/test/%s?current_id=%d", config.LogicServiceURL, courseID, testID, userID)
				req, _ := http.NewRequest("DELETE", url, nil)
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления теста"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		// --- Вопросы ---
		case "/question":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /question {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/question/%s?current_id=%d", config.LogicServiceURL, id, userID)
				resp, err := http.Get(url)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /question/"+id))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/addquestion":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addquestion {json}"))
				break
			}
			jsonBody := strings.Join(args[1:], " ")
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/question?current_id=%d", config.LogicServiceURL, userID)
				resp, err := http.Post(url, "application/json", bytes.NewBuffer([]byte(jsonBody)))
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания вопроса"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/delquestion":
			if len(args) < 2 {
				bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delquestion {id}"))
				break
			}
			id := args[1]
			handleWithUserID(bot, chatID, func(userID int) {
				url := fmt.Sprintf("%s/api/question/%s?current_id=%d", config.LogicServiceURL, id, userID)
				req, _ := http.NewRequest("DELETE", url, nil)
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления вопроса"))
					return
				}
				defer resp.Body.Close()
				body, _ := io.ReadAll(resp.Body)
				bot.Send(tgbotapi.NewMessage(chatID, string(body)))
			})

		case "/goat":
			bot.Send(tgbotapi.NewMessage(chatID, "привет ты коза🐐"))

		default:
			bot.Send(tgbotapi.NewMessage(chatID, "Нет такой команды. Используй /help для списка команд."))
		}
	}
}

// Загрузка конфигурации из .env файла
func loadConfig() error {
	if err := godotenv.Load(); err != nil {
		log.Println("Файл .env не найден, используются переменные окружения")
	}

	config = Config{
		TGToken:         getEnv("TG_BOT_TOKEN", ""),
		RedisAddr:       getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:   getEnv("REDIS_PASSWORD", ""),
		AuthServiceURL:  getEnv("AUTH_SERVICE_URL", "http://localhost:8080"),
		LogicServiceURL: getEnv("LOGIC_SERVICE_URL", "http://localhost:3415"),
		BotPublicURL:    getEnv("BOT_PUBLIC_URL", "http://localhost"),
		GitHubClientID:  getEnv("GITHUB_CLIENT_ID", ""),
		YandexClientID:  getEnv("YANDEX_CLIENT_ID", ""),
	}

	if config.TGToken == "" {
		return fmt.Errorf("TG_BOT_TOKEN не задан")
	}

	log.Println("Конфигурация загружена успешно")
	log.Printf("AuthServiceURL: %s", config.AuthServiceURL)
	log.Printf("LogicServiceURL: %s", config.LogicServiceURL)

	return nil
}

// Вспомогательная функция для получения переменных окружения
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// Генерация уникального state
func generateState(chatID int64) string {
	return fmt.Sprintf("tg_%d_%d", chatID, time.Now().UnixNano())
}

// Обработка авторизации
func handleLogin(bot *tgbotapi.BotAPI, chatID int64, platform string) {
	state := generateState(chatID)
	log.Printf("Начало авторизации для chatID=%d, platform=%s, state=%s", chatID, platform, state)

	err := rdb.SetEx(ctx, "auth_state:"+state, fmt.Sprintf("%d", chatID), 10*time.Minute).Err()
	if err != nil {
		msg := tgbotapi.NewMessage(chatID, "Ошибка при начале авторизации")
		_, sendErr := bot.Send(msg)
		if sendErr != nil {
			log.Printf("Ошибка отправки сообщения об ошибке Redis: %v", sendErr)
		}
		log.Printf("Ошибка Redis: %v", err)
		return
	}
	log.Printf("State сохранен в Redis: auth_state:%s -> %d", state, chatID)

	// Callback URL куда GitHub/Yandex перенаправит после авторизации с кодом
	redirectURI := fmt.Sprintf("%s/auth/%s/callback", config.AuthServiceURL, platform)
	
	// GitHub OAuth требует HTTPS или http://localhost для callback URL
	// Если используется http:// с IP или доменом (не localhost), GitHub вернет ошибку
	if strings.HasPrefix(redirectURI, "http://") && !strings.HasPrefix(redirectURI, "http://localhost") {
		log.Printf("⚠️ ВНИМАНИЕ: Используется http:// (не localhost). GitHub OAuth требует HTTPS или http://localhost")
		log.Printf("   Текущий redirect_uri: %s", redirectURI)
		log.Printf("   Для продакшена используйте HTTPS, для разработки - http://localhost:8080")
	}
	
	// Создаем URL напрямую на GitHub/Yandex OAuth страницу авторизации
	// После авторизации GitHub/Yandex перенаправит на redirectURI с параметром code
	var authURL string
	var clientID string
	
	switch platform {
	case "github":
		clientID = config.GitHubClientID
		if clientID == "" {
			msg := tgbotapi.NewMessage(chatID, "❌ GITHUB_CLIENT_ID не настроен. Обратитесь к администратору.")
			bot.Send(msg)
			log.Printf("Ошибка: GITHUB_CLIENT_ID не задан")
			return
		}
		// URL напрямую на GitHub OAuth страницу авторизации
		// https://github.com/login/oauth/authorize
		// После авторизации GitHub перенаправит на redirectURI с параметрами code и state
		authURL = fmt.Sprintf(
			"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&state=%s&scope=user:email",
			clientID,
			url.QueryEscape(redirectURI),
			url.QueryEscape(state),
		)
		log.Printf("GitHub auth URL создан:")
		log.Printf("  - client_id: %s", clientID)
		log.Printf("  - redirect_uri: %s", redirectURI)
		log.Printf("  - state: %s", state)
		log.Printf("  - Полный URL: %s", authURL)
	case "yandex":
		clientID = config.YandexClientID
		if clientID == "" {
			msg := tgbotapi.NewMessage(chatID, "❌ YANDEX_CLIENT_ID не настроен")
			bot.Send(msg)
			log.Printf("Ошибка: YANDEX_CLIENT_ID не задан")
			return
		}
		// URL напрямую на Yandex OAuth страницу авторизации
		authURL = fmt.Sprintf(
			"https://oauth.yandex.ru/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
			clientID,
			url.QueryEscape(redirectURI),
			url.QueryEscape(state),
		)
	default:
		msg := tgbotapi.NewMessage(chatID, "❌ Неподдерживаемая платформа")
		bot.Send(msg)
		log.Printf("Ошибка: неподдерживаемая платформа %s", platform)
		return
	}

	log.Printf("Создание сообщения с authURL: %s", authURL)

	// Используем strings.ToTitle для совместимости (или можно использовать strings.Title)
	platformTitle := strings.ToUpper(platform[:1]) + strings.ToLower(platform[1:])
	
	// Экранируем подчеркивания в URL для Markdown (Telegram парсит _ как форматирование)
	// Заменяем _ на \_ чтобы они отображались как обычные символы
	authURLEscaped := strings.ReplaceAll(authURL, "_", "\\_")
	stateEscaped := strings.ReplaceAll(state, "_", "\\_")
	
	msg := tgbotapi.NewMessage(chatID, fmt.Sprintf(
		"🔐 *Авторизация через %s*\n\n"+
			"1. Перейдите по ссылке:\n%s\n\n"+
			"2. Разрешите доступ\n\n"+
			"3. После авторизации вы получите код\n\n"+
			"4. Вернитесь и введите:\n`/auth_check %s`",
		platformTitle, authURLEscaped, stateEscaped))
	msg.ParseMode = "Markdown"
	
	sentMsg, err := bot.Send(msg)
	if err != nil {
		log.Printf("Ошибка отправки сообщения авторизации: %v", err)
		// Попробуем отправить без Markdown форматирования
		// В обычном тексте подчеркивания не парсятся, но оставляем оригинальные значения
		msgPlain := tgbotapi.NewMessage(chatID, fmt.Sprintf(
			"🔐 Авторизация через %s\n\n"+
				"1. Перейдите по ссылке:\n%s\n\n"+
				"2. Разрешите доступ\n\n"+
				"3. После авторизации вы получите код\n\n"+
				"4. Вернитесь и введите:\n/auth_check %s",
			platformTitle, authURL, state))
		_, err2 := bot.Send(msgPlain)
		if err2 != nil {
			log.Printf("Ошибка отправки простого сообщения: %v", err2)
		} else {
			log.Printf("Сообщение отправлено без Markdown")
		}
		return
	}
	log.Printf("Сообщение успешно отправлено, messageID=%d", sentMsg.MessageID)
}

// Проверка авторизации по state
func handleAuthCheck(bot *tgbotapi.BotAPI, chatID int64, state string) {
	// Проверяем, что state принадлежит этому пользователю
	storedChatID, err := rdb.Get(ctx, "auth_state:"+state).Result()
	if err == redis.Nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Неверный или просроченный код")
		bot.Send(msg)
		return
	} else if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при проверке кода")
		bot.Send(msg)
		log.Printf("Ошибка Redis: %v", err)
		return
	}

	if storedChatID != fmt.Sprintf("%d", chatID) {
		msg := tgbotapi.NewMessage(chatID, "❌ Этот код не предназначен для вас")
		bot.Send(msg)
		return
	}

	// Проверяем, завершена ли авторизация (backend должен сохранить user_id по ключу auth_result:{state})
	userIDStr, err := rdb.Get(ctx, "auth_result:"+state).Result()
	if err == redis.Nil {
		msg := tgbotapi.NewMessage(chatID, "⏳ Авторизация еще не завершена. Подождите несколько секунд и попробуйте снова.")
		bot.Send(msg)
		return
	} else if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при проверке результата авторизации")
		bot.Send(msg)
		log.Printf("Ошибка Redis: %v", err)
		return
	}

	// Сохраняем user_id для этого Telegram пользователя
	err = rdb.Set(ctx, fmt.Sprintf("user:%d", chatID), userIDStr, 0).Err()
	if err != nil {
		msg := tgbotapi.NewMessage(chatID, "⚠️ Авторизация прошла, но произошла ошибка сохранения")
		bot.Send(msg)
		log.Printf("Ошибка Redis: %v", err)
		return
	}

	// Очищаем временные данные
	rdb.Del(ctx, "auth_state:"+state)
	rdb.Del(ctx, "auth_result:"+state)

	msg := tgbotapi.NewMessage(chatID, fmt.Sprintf(
		"✅ *Авторизация успешно завершена!*\n\n"+
			"Ваш ID в системе: `%s`",
		userIDStr))
	msg.ParseMode = "Markdown"
	bot.Send(msg)
}

// Обработка команды /me
func handleMe(bot *tgbotapi.BotAPI, chatID int64) {
	userID, err := rdb.Get(ctx, fmt.Sprintf("user:%d", chatID)).Result()
	if err == redis.Nil {
		msg := tgbotapi.NewMessage(chatID,
			"🔒 Вы не авторизованы.\n\n"+
				"Используйте:\n"+
				"• /login_yandex — Яндекс\n"+
				"• /login_github — GitHub")
		bot.Send(msg)
		return
	} else if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при получении данных")
		bot.Send(msg)
		return
	}

	msg := tgbotapi.NewMessage(chatID, fmt.Sprintf(
		"👤 *Ваш профиль*\n\n"+
			"ID в системе: `%s`\n"+
			"Telegram ID: `%d`",
		userID, chatID))
	msg.ParseMode = "Markdown"
	bot.Send(msg)
}

// Обработка выхода из системы
func handleLogout(bot *tgbotapi.BotAPI, chatID int64) {
	err := rdb.Del(ctx, fmt.Sprintf("user:%d", chatID)).Err()
	if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при выходе из системы")
		bot.Send(msg)
		return
	}

	msg := tgbotapi.NewMessage(chatID, "✅ Вы успешно вышли из системы.")
	bot.Send(msg)
}

// Функция для выполнения команд с user_id
func handleWithUserID(bot *tgbotapi.BotAPI, chatID int64, action func(userID int)) {
	userIDStr, err := rdb.Get(ctx, fmt.Sprintf("user:%d", chatID)).Result()
	if err == redis.Nil {
		msg := tgbotapi.NewMessage(chatID,
			"🔒 Для использования этой команды нужно авторизоваться.\n\n"+
				"Используйте:\n"+
				"• /login_yandex — Яндекс\n"+
				"• /login_github — GitHub")
		bot.Send(msg)
		return
	} else if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при получении данных пользователя")
		bot.Send(msg)
		return
	}

	var userID int
	_, err = fmt.Sscanf(userIDStr, "%d", &userID)
	if err != nil {
		msg := tgbotapi.NewMessage(chatID, "❌ Ошибка при обработке ID пользователя")
		bot.Send(msg)
		return
	}

	action(userID)
}
