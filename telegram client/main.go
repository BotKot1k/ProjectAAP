// ну это для начала чисто

package main

import (
    "bytes"
    "fmt"
    "io"
    "log"
    "net/http"
    "strings"

    tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func main() {
    bot, err := tgbotapi.NewBotAPI("8569049400:AAFQmGvxNsT4GikqgFXgaIfaCu3Pyj0OKFw")
    if err != nil {
        log.Panic(err)
    }

    bot.Debug = true
    log.Printf("Authorized on account %s", bot.Self.UserName)

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
        // --- Пользователи ---
        case "/users":
            resp, err := http.Get("http://localhost:3415/api/users")
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /users")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/user":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /user {id}")); break }
            id := args[1]
            resp, err := http.Get("http://localhost:3415/api/user/" + id)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /user/"+id)); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/deluser":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deluser {id}")); break }
            id := args[1]
            req, _ := http.NewRequest("DELETE", "http://localhost:3415/api/user/"+id, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления пользователя")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Курсы ---
        case "/courses":
            resp, err := http.Get("http://localhost:3415/api/courses")
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /courses")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/course":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /course {id}")); break }
            id := args[1]
            resp, err := http.Get("http://localhost:3415/api/course/" + id)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /course/"+id)); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/addcourse":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addcourse {json}")); break }
            jsonBody := strings.Join(args[1:], " ")
            resp, err := http.Post("http://localhost:3415/api/course", "application/json", bytes.NewBuffer([]byte(jsonBody)))
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания курса")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/delcourse":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delcourse {id}")); break }
            id := args[1]
            req, _ := http.NewRequest("DELETE", "http://localhost:3415/api/course/"+id, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления курса")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Тесты ---
        case "/addtest":
            if len(args) < 3 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addtest {course_id} {json}")); break }
            courseID := args[1]
            jsonBody := strings.Join(args[2:], " ")
            url := fmt.Sprintf("http://localhost:3415/api/course/%s/test", courseID)
            resp, err := http.Post(url, "application/json", bytes.NewBuffer([]byte(jsonBody)))
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания теста")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/deltest":
            if len(args) < 3 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /deltest {course_id} {test_id}")); break }
            courseID := args[1]; testID := args[2]
            url := fmt.Sprintf("http://localhost:3415/api/course/%s/test/%s", courseID, testID)
            req, _ := http.NewRequest("DELETE", url, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления теста")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        // --- Вопросы ---
        case "/question":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /question {id}")); break }
            id := args[1]
            resp, err := http.Get("http://localhost:3415/api/question/" + id)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка /question/"+id)); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/addquestion":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /addquestion {json}")); break }
            jsonBody := strings.Join(args[1:], " ")
            resp, err := http.Post("http://localhost:3415/api/question", "application/json", bytes.NewBuffer([]byte(jsonBody)))
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка создания вопроса")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/delquestion":
            if len(args) < 2 { bot.Send(tgbotapi.NewMessage(chatID, "Использование: /delquestion {id}")); break }
            id := args[1]
            req, _ := http.NewRequest("DELETE", "http://localhost:3415/api/question/"+id, nil)
            resp, err := http.DefaultClient.Do(req)
            if err != nil { bot.Send(tgbotapi.NewMessage(chatID, "Ошибка удаления вопроса")); break }
            defer resp.Body.Close()
            body, _ := io.ReadAll(resp.Body)
            bot.Send(tgbotapi.NewMessage(chatID, string(body)))

        case "/goat":
            bot.Send(tgbotapi.NewMessage(chatID, "привет ты коза🐐"))

        case "/help":
            bot.Send(tgbotapi.NewMessage(chatID,
                "Команды:\n" +
                    "/users, /user {id}, /deluser {id}\n" +
                    "/courses, /course {id}, /addcourse {json}, /delcourse {id}\n" +
                    "/addtest {course_id} {json}, /deltest {course_id} {test_id}\n" +
                    "/question {id}, /addquestion {json}, /delquestion {id}\n"))

        case "/start":
            bot.Send(tgbotapi.NewMessage(chatID, "Привет! Я ботGOтик. Используй /help для списка команд."))

        default:
				bot.Send(tgbotapi.NewMessage(chatID, "Нет такой команды "))
			}

		}
}
