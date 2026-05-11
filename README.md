# Trading Club Mobile App - V2

Закрытое кроссплатформенное мобильное приложение для трейдеров с системой чатов и подпиской.

## 📱 О проекте

- **Платформа:** iOS + Android (React Native / Expo)
- **Backend:** Node.js + Express + PostgreSQL
- **Real-time:** Socket.io + Redis
- **Аутентификация:** OTP + SMS + JWT
- **Подписки:** Ручная верификация платежей админом
- **Чаты:** 8 каналов (read-only и mutual)
- **Работа:** Россия без VPN ✅

## 🏗️ Структура проекта

```
trading-club/
├── backend/              # Node.js + Express сервер
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── config/       # Конфигурация
│   │   ├── routes/       # API маршруты
│   │   ├── controllers/  # Обработчики запросов
│   │   ├── services/     # Бизнес-логика
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript типы
│   │   └── socket/       # Socket.io обработчики
│   ├── db/
│   │   ├── schema.ts     # Drizzle ORM схема
│   │   ├── migrations/   # Миграции БД
│   │   └── seeds/        # Seed данные
│   ├── docker/           # Docker конфигурация
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── drizzle.config.ts
├── mobile/               # React Native (Expo) приложение
│   ├── app/
│   │   ├── screens/      # Экраны приложения
│   │   ├── components/   # Компоненты
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API клиент, Socket.io
│   │   ├── store/        # Zustand store
│   │   └── index.tsx
│   ├── app.json          # Expo конфигурация
│   └── package.json
└── docs/                 # Документация
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

## 🚀 Быстрый старт

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

## 📋 Фазы разработки

- **Phase 1:** Backend setup (PostgreSQL, Express, Auth)
- **Phase 2:** Subscription system и payment uploads
- **Phase 3:** React Native фронтенд
- **Phase 4:** Admin features
- **Phase 5:** Testing и deployment

## 🔐 Архитектура

Смотри `/docs/ARCHITECTURE.md` для подробного описания.

## 📝 Лицензия

Proprietary - Trading Club
