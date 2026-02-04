# Threads Scraper - Next.js Service

TypeScript-based scraping service для извлечения постов из Threads.net с использованием Next.js 16, Playwright и современного стека.

## 🚀 Быстрый старт

### Установка

```bash
# Установить зависимости
npm install

# Установить Playwright браузер
npx playwright install chromium

# Запустить dev сервер
npm run dev
```

Сервис будет доступен на `http://localhost:3000`

### Использование API

#### Scrape поста

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.threads.net/t/C8H5FiCtESk/",
    "includeReplies": true,
    "maxReplies": 50,
    "postCount": 10
  }'
```

#### Health check

```bash
curl http://localhost:3000/api/health
```

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts       # POST /api/scrape
│   │   └── health/route.ts       # GET /api/health
│   └── page.tsx                   # Документация API
├── lib/
│   ├── scraper/
│   │   ├── threadsScraper.ts     # Главный сервис
│   │   ├── browser.ts            # Playwright manager
│   │   └── parser.ts             # Парсер данных
│   ├── utils/
│   │   ├── nested-lookup.ts      # Поиск в JSON
│   │   ├── validators.ts         # URL validation
│   │   └── errors.ts             # Custom errors
│   └── config.ts                 # Конфигурация
└── types/
    ├── threads.ts                # Types для постов
    └── api.ts                    # API types
```

## 🛠 Технологии

- **Next.js 16.1.6** - Framework с App Router
- **TypeScript 5** - Типизация
- **Playwright** - Browser automation
- **Zod** - Schema validation
- **Vitest** - Unit Testing
- **Tailwind CSS 4** - Стилизация

## ⚙️ Конфигурация

Создайте `.env.local`:

```bash
NODE_ENV=development
SCRAPER_TIMEOUT=30000
SCRAPER_HEADLESS=true
```

## 📚 API Документация

### POST /api/scrape

**Request:**

```typescript
{
  url: string;              // Threads URL
  includeReplies?: boolean; // default: true
  maxReplies?: number;      // limit ответов
  postCount?: number;       // limit постов (profile mode)
  timeout?: number;         // timeout в ms, max 60000
}
```

**Response (Success - 200):**

```typescript
{
  success: true,
  data: {
    thread: ThreadPost,
    replies: ThreadPost[],
    metadata: {
      scrapedAt: string,
      url: string,
      replyCount: number,
      processingTime: number
    }
  }
}
```

**Response (Error - 4xx/5xx):**

```typescript
{
  success: false,
  error: {
    code: ErrorCode,
    message: string,
    details?: any
  }
}
```

### Error Codes

- `INVALID_URL` (400) - Невалидный URL
- `DATA_NOT_FOUND` (404) - Пост не найден или приватный
- `PARSE_ERROR` (500) - Ошибка парсинга
- `TIMEOUT` (504) - Превышен timeout
- `BROWSER_ERROR` (500) - Ошибка браузера

## 🚀 Deployment

### Vercel

```bash
npm run build
```

Деплой на Vercel работает автоматически при push в main branch.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🔮 Будущие фичи

- [ ] Dashboard UI для мониторинга
- [ ] Batch processing API endpoint
- [ ] Rate limiting middleware
- [ ] PostgreSQL для persistence
- [ ] BullMQ для queue system
- [ ] Redis caching
- [ ] API key authentication

## ⚠️ Ограничения

1. **Browser dependency** - Playwright загружает ~170MB Chromium
2. **Rate limits** - Threads может блокировать частые запросы
3. **Public posts only** - Без auth доступны только публичные посты
4. **Structure changes** - Threads может изменить структуру данных

## 🛡️ Best Practices

### Избежание блокировок

- Добавьте случайные задержки между запросами
- Используйте прокси для географического распределения
- Ротируйте User-Agent
- Не делайте более 10 запросов в минуту

### Production tips

- Используйте headless: true
- Настройте proper error monitoring
- Добавьте retry logic для failed requests
- Кешируйте результаты (Redis)

## 📝 License

MIT
