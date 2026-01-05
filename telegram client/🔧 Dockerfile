# Этап сборки
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go build -o server main.go

# Этап запуска
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 3415
CMD ["./server"]
