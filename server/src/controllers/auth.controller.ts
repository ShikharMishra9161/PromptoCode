import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/schemas';
import { AuthResponseDTO, IUser } from '@aiuix/shared';
import { trackDbRead, trackDbWrite } from '../utils/dbMetrics';

// ─── Token factory ─────────────────────────────────────────
const signToken = (id: string): string =>
  jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

const toUserDTO = (user: any): IUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

// ─── Register ──────────────────────────────────────────────
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    trackDbRead(); // Track the findOne query
    if (existing) throw new AppError('Email already in use', 409);

    const user = await User.create({ name, email, password });
    trackDbWrite(); // Track the create operation
    const token = signToken(user._id.toString());

    const response: AuthResponseDTO = { user: toUserDTO(user), token };
    res.status(201).json({ success: true, data: response, message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    trackDbRead(); // Track the findByEmail query
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id.toString());
    const response: AuthResponseDTO = { user: toUserDTO(user), token };
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// ─── Get current user ──────────────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    res.json({ success: true, data: { user: toUserDTO(req.user) } });
  } catch (error) {
    next(error);
  }
};
