import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// ─── Generic validate middleware factory ───────────────────
// Usage: router.post('/register', validate(registerSchema), authController.register)
export const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error); // Passed to errorHandler which formats ZodError
      return;
    }
    req.body = result.data; // Replace with parsed+typed data
    next();
  };
