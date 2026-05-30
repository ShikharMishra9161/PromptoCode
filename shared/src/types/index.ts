// ============================================================
// @aiuix/shared — Single Source of Truth for all DTOs
// Both client and server import from here — no drift possible
// ============================================================

// ─── User ───────────────────────────────────────────────────
export interface IUser {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: IUser;
  token: string;
}

// ─── UI Generation ──────────────────────────────────────────
export type UIStyle = 'minimal' | 'glassmorphism' | 'neumorphic' | 'brutalist' | 'material';
export type UITheme = 'light' | 'dark' | 'auto';
export type UIFramework = 'react' | 'html' | 'vue';

export interface GenerateUIRequestDTO {
  prompt: string;
  style: UIStyle;
  theme: UITheme;
  framework: UIFramework;
  colorScheme?: string;
}

export interface GenerateUIResponseDTO {
  id: string;
  code: string;
  explanation: string;
  tokensUsed: number;
  generatedAt: string;
}

// ─── History ────────────────────────────────────────────────
export interface IHistory {
  _id: string;
  userId: string;
  prompt: string;
  style: UIStyle;
  theme: UITheme;
  framework: UIFramework;
  generatedCode: string;
  explanation: string;
  tokensUsed: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface HistoryListResponseDTO {
  items: IHistory[];
  total: number;
  page: number;
  limit: number;
}

// ─── API Response Wrapper ────────────────────────────────────
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
