import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '@aiuix/shared';
import { env } from '../config/env';

// ─── Custom AppError class ─────────────────────────────────
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── Global Error Handler ──────────────────────────────────
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void => {
  // Zod validation errors (from request body validation)
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.');
      details[key] = [...(details[key] || []), e.message];
    });
    res.status(400).json({ success: false, error: 'Validation failed', details });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Unknown errors — don't leak details in production
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development'
      ? (err instanceof Error ? err.message : 'Unknown error')
      : 'Internal server error',
  });
};
