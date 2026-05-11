# Trading Club - Архитектура

## 🎯 Обзор

Trading Club - это закрытое кроссплатформенное мобильное приложение для трейдеров с системой чатов и подпиской. Приложение работает без зависимостей от заблокированных в России сервисов.

## 🏗️ Компоненты системы

### Backend (Node.js + Express)

**Основные технологии:**
- Express.js - REST API
- Socket.io - Real-time сообщения
- PostgreSQL - База данных
- Redis - Кеш и очередь
- Drizzle ORM - ORM
- JWT - Аутентификация

**Главные файлы:**
- `src/index.ts` - Entry point сервера
- `src/config/database.ts` - PostgreSQL подключение
- `src/config/jwt.ts` - JWT генерация и проверка
- `src/routes/*.ts` - API маршруты
- `src/socket/index.ts` - Socket.io обработчики

### Frontend (React Native / Expo)

**Основные технологии:**
- React Native - Кроссплатформа (iOS/Android)
- Expo - Управление проектом
- Zustand - State management
- Axios - HTTP клиент
- Socket.io-client - WebSocket клиент

**Главные папки:**
- `app/screens/` - Экраны приложения
- `app/components/` - Компоненты
- `app/store/` - Zustand stores
- `app/services/` - API и Socket.io клиенты

## 📊 База данных

### Таблицы

**users**
- Пользователи приложения
- Поля: id, phone, displayName, role, isBlocked

**subscription_plans**
- Доступные тарифы подписки
- Поля: id, name, durationDays, price, description

**user_subscriptions**
- Активные подписки пользователей
- Поля: id, userId, planId, status, paymentScreenshotUrl, expiresAt

**chats**
- 8 каналов общения
- Поля: id, name, description, type (read_only/mutual), sortOrder

**messages**
- Сообщения в чатах
- Поля: id, chatId, userId, content, mediaUrl, mediaType, replyToId

**chat_participants**
- Участники чатов и их роли
- Поля: id, chatId, userId, role, isMuted

**push_tokens**
- Токены для push-уведомлений
- Поля: id, userId, token, platform, isActive

**otp_codes**
- Коды подтверждения по SMS
- Поля: id, phone, code, expiresAt, isUsed

**refresh_tokens**
- Refresh токены для JWT
- Поля: id, userId, token, expiresAt, isRevoked

## 🔐 Аутентификация

### Flow

1. **Пользователь вводит номер телефона**
   - `POST /api/auth/send-otp` - отправляет OTP код по SMS

2. **Пользователь вводит код**
   - `POST /api/auth/verify-otp` - проверяет код и выдает JWT

3. **Получение обновленного токена**
   - `POST /api/auth/refresh` - обновляет access token

### Токены

- **Access Token** - 30 дней, используется для API запросов
- **Refresh Token** - 90 дней, используется для обновления access token
- **OTP Code** - 10 минут, для подтверждения номера

## 💬 Real-time обмен сообщениями

### Socket.io события

**Клиент → Сервер:**
- `chat:join` - Присоединиться к чату
- `chat:leave` - Покинуть чат
- `chat:message` - Отправить сообщение
- `chat:typing` - Индикатор печатания

**Сервер → Клиент:**
- `chat:message` - Получить сообщение
- `user:typing` - Пользователь печатает
- `subscription:verified` - Подписка одобрена
- `notification:payment` - Требуется проверка платежа

## 💳 Система подписок

### Flow

1. **Пользователь выбирает тариф**
   - Видит список `subscription_plans`

2. **Пользователь загружает скрин чека**
   - `POST /api/subscriptions/upload-payment` - загружает скриншот в S3
   - Статус: `pending`

3. **Администратор проверяет платеж**
   - `GET /api/admin/pending-payments` - видит список платежей
   - `POST /api/admin/verify-payment/:id` - одобряет платеж
   - Статус: `verified` → `active`
   - Пользователю отправляется push-уведомление

4. **Пользователь получает доступ**
   - Подписка активна до `expiresAt`

## 🔔 Push-уведомления

**OneSignal** используется для отправки уведомлений:
- Новые сообщения в чатах
- Одобрение подписки
- Системные уведомления

## 📁 Структура файлов

```
trading-club/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── jwt.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── subscription.ts
│   │   │   └── admin.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── socket/
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── types/
│   │       └── index.ts
│   ├── docker/
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── app/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.tsx
│   ├── app.json
│   └── package.json
└── docs/
```

## 🚀 Development Workflow

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## 🔗 API Reference

Полная документация API находится в `docs/API.md`

## 📱 Развертывание

Инструкции по развертыванию на VPS находятся в `docs/DEPLOYMENT.md`

## 🛡️ Безопасность

- ✅ JWT для аутентификации
- ✅ HTTPS/SSL для всех соединений
- ✅ Rate limiting на API endpoints
- ✅ Input validation и SQL injection prevention
- ✅ CORS настроен правильно
- ✅ Sensitive данные в S3 с access control

## 📊 Масштабируемость

Архитектура спроектирована для:
- 100+ одновременных пользователей
- 1000+ сообщений в секунду
- Горизонтальное масштабирование через multiple backend instances
- Redis для session sharing между instances
