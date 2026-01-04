// ну это для начала чисто

package main

import (
	"context"
	"fmt"
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var rdb *redis.Client

// Инициализация Redis
func InitRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // если Redis в Docker без пароля
		Password: "",               // если есть пароль
		DB:       0,
	})

	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}
	fmt.Println("Redis connected:", pong)
}

// Сохранение токена
func SetToken(chatID int64, token string) error {
	return rdb.Set(ctx, fmt.Sprintf("chat:%d", chatID), token, 0).Err()
}

// Получение токена
func GetToken(chatID int64) (string, error) {
	return rdb.Get(ctx, fmt.Sprintf("chat:%d", chatID)).Result()
}

// Удаление токена
func DelToken(chatID int64) error {
	return rdb.Del(ctx, fmt.Sprintf("chat:%d", chatID)).Err()
}

func main() {
	InitRedis() // подключаем Redis

	bot, err := tgbotapi.NewBotAPI("8569049400:AAFQmGvxNsT4GikqgFXgaIfaCu3Pyj0OKFw") // токен от BotFather в кавычках
	if err != nil {
		log.Panic(err)
	}

	bot.Debug = true
	log.Printf("Authorized on account %s", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message != nil {
			chatID := update.Message.Chat.ID
			text := update.Message.Text

			switch text {
			case "/login":
				SetToken(chatID, "ACCESS_TOKEN_EXAMPLE")
				bot.Send(tgbotapi.NewMessage(chatID, "Вы авторизованы ✅"))

			case "/logout":
				DelToken(chatID)
				bot.Send(tgbotapi.NewMessage(chatID, "Вы вышли из системы ❌"))

			case "/check":
				token, err := GetToken(chatID)
				if err != nil {
					bot.Send(tgbotapi.NewMessage(chatID, "Нет токена, вы аноним"))
				} else {
					bot.Send(tgbotapi.NewMessage(chatID, "Ваш токен: "+token))
				}
			
			case "/users": 
				bot.Send(tgbotapi.NewMessage(chatID, "Список пользователей: user1, user2, user3")) 
			
			case "/courses": 
				bot.Send(tgbotapi.NewMessage(chatID, "Список курсов: course1, course2")) 
				
			case "/tests": 
				bot.Send(tgbotapi.NewMessage(chatID, "Список тестов: test1, test2")) 
				
			case "/questions": 
				bot.Send(tgbotapi.NewMessage(chatID, "Список вопросов: question1, question2")) 
				
			case "/goat": 
				bot.Send(tgbotapi.NewMessage(chatID, "привет ты коза🐐")) 
				
			case "/help": 
				bot.Send(tgbotapi.NewMessage(chatID, "Доступные команды:\n" + 
				"/login — авторизация\n" + "/logout — выход\n" + 
				"/check — проверить токен\n" + "/users — список пользователей\n" +
				"/courses — список курсов\n" + "/tests — список тестов\n" + 
				"/questions — список вопросов\n"))
			
			case "/start": 
				bot.Send(tgbotapi.NewMessage(chatID, "Привет! Я бот 🤖. Используй /help для списка команд."))


			default:
				bot.Send(tgbotapi.NewMessage(chatID, "Нет такой команды "))
			}

		}
	}
}

