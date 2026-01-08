FROM golang:1.25-alpine

WORKDIR /app

COPY . .

RUN go mod download

# Просто запускаем через go run
CMD ["go", "run", "main.go"]
