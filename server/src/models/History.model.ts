import mongoose, { Document, Schema, Types } from 'mongoose';
import { UIStyle, UITheme, UIFramework } from '@aiuix/shared';

// ─── Interface ─────────────────────────────────────────────
export interface IHistoryDocument extends Document {
  userId: Types.ObjectId;
  prompt: string;
  style: UIStyle;
  theme: UITheme;
  framework: UIFramework;
  colorScheme?: string;
  generatedCode: string;
  explanation: string;
  tokensUsed: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────
const historySchema = new Schema<IHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    style: {
      type: String,
      enum: ['minimal', 'glassmorphism', 'neumorphic', 'brutalist', 'material'],
      required: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      required: true,
    },
    framework: {
      type: String,
      enum: ['react', 'html', 'vue'],
      required: true,
    },
    colorScheme: {
      type: String,
    },
    generatedCode: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        ret.userId = ret.userId.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ───────────────────────────────────────────────
// Compound index for paginated user history queries
historySchema.index({ userId: 1, createdAt: -1 });
// For favorites filter
historySchema.index({ userId: 1, isFavorite: 1 });

export const History = mongoose.model<IHistoryDocument>('History', historySchema);
