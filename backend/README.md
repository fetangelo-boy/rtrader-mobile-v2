# Trading Club Backend

Node.js + Express + PostgreSQL + Socket.io backend для мобильного приложения Trading Club.

## 🚀 Быстрый старт

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis
- npm или pnpm

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure .env with your settings
nano .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Docker Setup

```bash
cd docker

# Create .env file in docker folder
cp ../.env.example .env

# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app & Socket.io initialization
│   ├── config/
│   │   ├── database.ts       # Drizzle ORM setup
│   │   └── jwt.ts            # JWT utilities
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── chat.ts           # Chat endpoints
│   │   ├── subscription.ts    # Subscription endpoints
│   │   └── admin.ts          # Admin endpoints
│   ├── middleware/
│   │   └── auth.ts           # JWT & role verification
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── socket/
│   │   └── index.ts          # Socket.io event handlers
│   └── db/
│       ├── schema.ts         # Drizzle ORM schema
│       ├── migrations/       # Generated migrations
│       └── seeds/            # Seed scripts
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all accessible chats
- `GET /api/chats/:id/messages` - Get messages in chat

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `GET /api/subscriptions/my-subscription` - Get user's subscription
- `POST /api/subscriptions/upload-payment` - Upload payment screenshot

### Admin
- `GET /api/admin/pending-payments` - Get pending payments
- `POST /api/admin/verify-payment/:id` - Approve payment
- `POST /api/admin/reject-payment/:id` - Reject payment
- `GET /api/admin/stats` - Get statistics

## 🔌 Socket.io Events

### Client → Server
- `chat:join` - Join a chat room
- `chat:leave` - Leave a chat room
- `chat:message` - Send message
- `chat:typing` - Send typing indicator

### Server → Client
- `chat:message` - Receive message
- `user:typing` - User is typing
- `subscription:verified` - Subscription was approved
- `notification:payment` - Payment verification needed

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch
```

## 📊 Database

### Run migrations
```bash
npm run db:migrate
```

### Open Drizzle Studio (GUI)
```bash
npm run db:studio
```

### Seed database
```bash
npm run db:seed
```

## 🔐 Environment Variables

See `.env.example` for all required variables. Critical ones:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - Min 32 characters for security
- `JWT_REFRESH_SECRET` - Min 32 characters

## 🚢 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Using Docker
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 📝 Development Notes

- All database operations use Drizzle ORM for type safety
- JWT tokens expire in 30 days, refresh tokens in 90 days
- OTP codes valid for 10 minutes
- All authenticated endpoints require `Authorization: Bearer <token>` header
- Admin endpoints require `role: admin` in JWT payload

## 🐛 Troubleshooting

### Database connection error
- Check `DATABASE_URL` in .env
- Ensure PostgreSQL is running
- Verify credentials

### Socket.io connection issues
- Ensure CORS_ORIGIN is configured correctly
- Check WebSocket port (usually same as HTTP)
- Verify token in client handshake

### OTP delivery
- Currently logs to console in development
- Implement Twilio/SMS service in production

## 📚 Documentation

- Architecture: See `/docs/ARCHITECTURE.md`
- Database Schema: Check `src/db/schema.ts`
- Type definitions: See `src/types/index.ts`
