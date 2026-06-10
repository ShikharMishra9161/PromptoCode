import { Request, Response, NextFunction } from 'express';
import { History } from '../models/History.model';
import { AppError } from '../middleware/errorHandler';
import { HistoryListResponseDTO, IHistory } from '@aiuix/shared';
import { trackDbRead, trackDbWrite } from '../utils/dbMetrics';

// ─── List paginated history for current user ───────────────
export const listHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: req.user._id };
    if (req.query.favorites === 'true') filter.isFavorite = true;

    const [items, total] = await Promise.all([
      History.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      History.countDocuments(filter),
    ]);
    trackDbRead(); // Track History.find
    trackDbRead(); // Track History.countDocuments

    const response: HistoryListResponseDTO = {
      items: items as unknown as IHistory[],
      total,
      page,
      limit,
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// ─── Delete a history entry ────────────────────────────────
export const deleteHistory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const entry = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Ensures users can only delete their own
    });
    trackDbWrite(); // Track the delete operation

    if (!entry) throw new AppError('History entry not found', 404);

    res.json({ success: true, data: null, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle favorite ───────────────────────────────────────
export const toggleFavorite = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const entry = await History.findOne({ _id: req.params.id, userId: req.user._id });
    trackDbRead(); // Track the findOne query
    if (!entry) throw new AppError('History entry not found', 404);

    entry.isFavorite = !entry.isFavorite;
    await entry.save();
    trackDbWrite(); // Track the save operation

    res.json({ success: true, data: null, message: `${entry.isFavorite ? 'Added to' : 'Removed from'} favorites` });
  } catch (error) {
    next(error);
  }
};
