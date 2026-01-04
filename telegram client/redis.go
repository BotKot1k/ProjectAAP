// это есть в 'main.go', но изначально кусок предпологалось держать отдельно,
// возможно я его потом снова вырву потому что не вайб всех коз в одном загоне или как говорят.
package main

import (
    "context"
    "fmt"
    "github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var rdb *redis.Client

func InitRedis() {
    rdb = redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "",
        DB:       0,
    })

    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        panic(err)
    }
    fmt.Println("Redis connected:", pong)
}

func SetToken(chatID int64, token string) error {
    return rdb.Set(ctx, fmt.Sprintf("chat:%d", chatID), token, 0).Err()
}

func GetToken(chatID int64) (string, error) {
    return rdb.Get(ctx, fmt.Sprintf("chat:%d", chatID)).Result()
}

func DelToken(chatID int64) error {
    return rdb.Del(ctx, fmt.Sprintf("chat:%d", chatID)).Err()
}
