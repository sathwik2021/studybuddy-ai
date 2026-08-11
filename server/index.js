import { Hono } from 'hono';
import { cors } from 'hono/cors';
import chatApp from './routes/chat.js';

const app = new Hono();

// CORS Middleware
app.use('*', async (c, next) => {
  const clientUrl = c.env?.CLIENT_URL || '*';
  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        clientUrl === '*' ||
        origin === clientUrl ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:4173' ||
        origin.endsWith('.pages.dev') ||
        origin.includes('localhost')
      ) {
        return origin;
      }
      return origin;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  return corsMiddleware(c, next);
});

// Health Check Endpoints
app.get('/health', (c) => c.json({ status: 'ok', service: 'StudyBuddy AI Worker' }));
app.get('/', (c) => c.json({ status: 'ok', service: 'StudyBuddy AI Worker' }));

// Mount /api routes
app.route('/api', chatApp);

// 404 Not Found Handler
app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404));

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
