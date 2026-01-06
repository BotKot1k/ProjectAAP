// ну это для начала чисто

package main

import (
    "bytes"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "strings"
    "context"

    tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
    "github.com/redis/go-redis/v9"
    "github.com/joho/godotenv"
)




































































































































































































































































var ctx = context.Background()
var rdb *redis.Client

func main() {
    // Загружаем .env
    err := godotenv.Load()
    if err != nil {
        log.Println("⚠️ .env не найден, используем системные переменные")
    }

    tgToken := os.Getenv("TG_BOT_TOKEN")
    if tgToken == "" {
        log.Fatal("❌ TG_BOT_TOKEN не задан в .env")
    }

    nginxToken := os.Getenv("NGINX_TOKEN")

    bot, err := tgbotapi.NewBotAPI(tgToken)
    if err != nil {
        log.Panic(err)
    }

    rdb = redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })

    u := tgbotapi.NewUpdate(0)
    u.Timeout = 60
    updates := bot.GetUpdatesChan(u)

    for update := range updates {
        if update.Message == nil {
            continue
        }

        chatID := update.Message.Chat.ID
        text := update.Message.Text
        args := strings.Split(text, " ")

        switch args[0] {
        // --- Системные команды ---
        case "/start":
            bot.Send(tgbotapi.NewMessage(chatID, "Привет! Я бот. Используй /help, чтобы увидеть список команд."))

        case "/help":
            bot.Send(tgbotapi.NewMessage(chatID,
                "Доступные команды:\n" +
                    "/login {username} {password}\n" +
                    "/logout\n" +
                    "/check\n" +
                    "/browser\n" +
                    "/users, /user {id}, /adduser {json}, /deluser {id}\n" +
                    "/courses, /course {id}, /addcourse {json}, /delcourse {id}\n" +
                    "/coursetests {course_id}, /addtest {course_id} {json}, /deltest {course_id} {test_id}\n" +
                    "/question {id}, /addquestion {json}, /delquestion {id}, /updatequestion {id} {json}\n" +
                    "/grade {id}, /addgrade {json}, /answers {test_id}\n" +
                    "/expel {user_id}\n" +
                    "/goat"))

        case "/browser":
            // Вставь сюда свой URL
            bot.Send(tgbotapi.NewMessage(chatID, "Открой сайт по ссылке: https://example.com"))

        // --- Авторизация ---
        case "/login":
            if len(args) < 3 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /login {username} {password}"))
                break
            }
            username := args[1]
            password := args[2]
            body := []byte(fmt.Sprintf(`{"username":"%s","password":"%s"}`, username, password))
            resp, err := apiRequest("POST", apiBase+"/api/auth/login", body, "", nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка авторизации"))
                break
            }
            defer resp.Body.Close()
            tokenBytes, _ := io.ReadAll(resp.Body)
            token := strings.TrimSpace(string(tokenBytes))
            if token == "" {
                bot.Send(tgbotapi.NewMessage(chatID, "Пустой токен. Проверь API."))
                break
            }
            rdb.Set(ctx, fmt.Sprintf("token:%d", chatID), token, 0)
            bot.Send(tgbotapi.NewMessage(chatID, "Авторизация успешна ✅"))

        case "/logout":
            rdb.Del(ctx, fmt.Sprintf("token:%d", chatID))
            // Необязательный вызов API для выхода
            _, _ = apiRequest("POST", apiBase+"/api/auth/logout", nil, "", nginxToken)
            bot.Send(tgbotapi.NewMessage(chatID, "Вы вышли из системы ❌"))

        case "/check":
            token, err := getToken(chatID)
            if err != nil || token == "" {
                bot.Send(tgbotapi.NewMessage(chatID, "Нет токена, вы аноним 👤"))
                break
            }
            resp, err := apiRequest("GET", apiBase+"/api/auth/me", nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка проверки токена"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Пользователи ---
        case "/users":
            token, err := getToken(chatID)
            if err != nil || token == "" {
                bot.Send(tgbotapi.NewMessage(chatID, "Сначала авторизуйтесь через /login"))
                break
            }
            resp, err := apiRequest("GET", apiBase+"/api/users", nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /users"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/user":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /user {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/user/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /user"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/adduser":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /adduser {json}"))
                break
            }
            token, _ := getToken(chatID)
            jsonBody := strings.Join(args[1:], " ")
            resp, err := apiRequest("POST", apiBase+"/api/user", []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /adduser"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/deluser":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deluser {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("DELETE", apiBase+"/api/user/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления пользователя"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Курсы ---
        case "/courses":
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/courses", nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /courses"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/course":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /course {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/course/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /course"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))
        case "/addcourse":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addcourse {json}"))
                break
            }
            jsonBody := strings.Join(args[1:], " ")
            token, _ := getToken(chatID)
            resp, err := apiRequest("POST", apiBase+"/api/course", []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания курса"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/delcourse":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delcourse {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("DELETE", apiBase+"/api/course/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления курса"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Тесты ---
        case "/coursetests":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /coursetests {course_id}"))
                break
            }
            courseID := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/course/"+courseID+"/tests", nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /coursetests"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/addtest":
            if len(args) < 3 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addtest {course_id} {json}"))
                break
            }
            courseID := args[1]
            jsonBody := strings.Join(args[2:], " ")
            token, _ := getToken(chatID)
            resp, err := apiRequest("POST", apiBase+"/api/course/"+courseID+"/test", []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /addtest"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/deltest":
            if len(args) < 3 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deltest {course_id} {test_id}"))
                break
            }
            courseID := args[1]
            testID := args[2]
            token, _ := getToken(chatID)
            resp, err := apiRequest("DELETE", apiBase+"/api/course/"+courseID+"/test/"+testID, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /deltest"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Вопросы ---
        case "/question":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /question {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/question/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /question"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/addquestion":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addquestion {json}"))
                break
            }
            jsonBody := strings.Join(args[1:], " ")
            token, _ := getToken(chatID)
            resp, err := apiRequest("POST", apiBase+"/api/question", []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /addquestion"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/delquestion":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delquestion {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("DELETE", apiBase+"/api/question/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /delquestion"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/updatequestion":
            if len(args) < 3 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /updatequestion {id} {json}"))
                break
            }
            id := args[1]
            jsonBody := strings.Join(args[2:], " ")
            token, _ := getToken(chatID)
            resp, err := apiRequest("PUT", apiBase+"/api/question/"+id, []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /updatequestion"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Оценки и ответы ---
        case "/grade":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /grade {id}"))
                break
            }
            id := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/grade/"+id, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /grade"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/addgrade":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addgrade {json}"))
                break
            }
            jsonBody := strings.Join(args[1:], " ")
            token, _ := getToken(chatID)
            resp, err := apiRequest("POST", apiBase+"/api/grade", []byte(jsonBody), token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /addgrade"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/answers":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /answers {test_id}"))
                break
            }
            testID := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("GET", apiBase+"/api/test/"+testID+"/answers", nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /answers"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Админ/санкции ---
        case "/expel":
            if len(args) < 2 {
                bot.Send(tgbotapi.NewMessage(chatID, "Использование: /expel {user_id}"))
                break
            }
            userID := args[1]
            token, _ := getToken(chatID)
            resp, err := apiRequest("POST", apiBase+"/api/expel/"+userID, nil, token, nginxToken)
            if err != nil {
                bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /expel"))
                break
            }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/goat":
            bot.Send(tgbotapi.NewMessage(chatID, "Привет, ты коза 🐐"))

        default:
            bot.Send(tgbotapi.NewMessage(chatID,
                "Неизвестная команда \n" +
                "Используй /help для списка доступных команд."))
        }
    }
}
