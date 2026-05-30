import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

import { authRouter } from './routes/auth.routes';
import { generateRouter } from './routes/generate.routes';
import { historyRouter } from './routes/history.routes';

export const createApp = (): Application => {
  const app = express();

  // ─── Security Middleware ───────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }));

  // ─── Rate Limiting ─────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ─── Body & Logging ────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ─── Health Check ──────────────────────────────────────────
  app.get('/api/health', (_, res) => {
    res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
  });

  // ─── Routes ────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/generate', generateRouter);
  app.use('/api/history', historyRouter);

  // ─── Error Handling ────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
