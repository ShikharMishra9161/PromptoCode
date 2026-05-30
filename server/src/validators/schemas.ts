import { z } from 'zod';

// ─── Auth Validators ───────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── UI Generation Validator ───────────────────────────────
export const generateUISchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(1000, 'Prompt must not exceed 1000 characters'),
  style: z.enum(['minimal', 'glassmorphism', 'neumorphic', 'brutalist', 'material'], {
    errorMap: () => ({ message: 'Invalid style option' }),
  }),
  theme: z.enum(['light', 'dark', 'auto']),
  framework: z.enum(['react', 'html', 'vue']),
  colorScheme: z.string().optional(),
});

// ─── Infer TS types directly from Zod (no duplication) ────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateUIInput = z.infer<typeof generateUISchema>;
