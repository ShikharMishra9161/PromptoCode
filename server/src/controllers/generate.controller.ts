import { Request, Response, NextFunction } from 'express';
import { generateUI } from '../services/gemini.service';
import { History } from '../models/History.model';
import { AppError } from '../middleware/errorHandler';
import { GenerateUIInput } from '../validators/schemas';
import { GenerateUIResponseDTO } from '@aiuix/shared';
import { trackDbWrite } from '../utils/dbMetrics';

export const generateUIController = async (
  req: Request<{}, {}, GenerateUIInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const input = req.body;

    // ─── Call AI service ───────────────────────────────
    const { code, explanation, tokensUsed } = await generateUI(input);

    // ─── Persist to history ────────────────────────────
    const historyEntry = await History.create({
      userId: req.user._id,
      prompt: input.prompt,
      style: input.style,
      theme: input.theme,
      framework: input.framework,
      colorScheme: input.colorScheme,
      generatedCode: code,
      explanation,
      tokensUsed,
    });
    trackDbWrite(); // Track the History.create operation

    // ─── Return typed response ─────────────────────────
    const response: GenerateUIResponseDTO = {
     id: String(historyEntry._id),
      code,
      explanation,
      tokensUsed,
      generatedAt: historyEntry.createdAt.toISOString(),
    };

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};
