import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '../config/env';
import { GenerateUIInput } from '../validators/schemas';
import { AppError } from '../middleware/errorHandler';

// ─── Singleton Gemini client ───────────────────────────────
let model: GenerativeModel;

const getModel = (): GenerativeModel => {
  if (!model) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  }
  return model;
};

// ─── Prompt builder ────────────────────────────────────────
const buildPrompt = (input: GenerateUIInput): string => {
  const frameworkInstructions: Record<string, string> = {
    react: 'Generate a complete React functional component using TypeScript. Use Tailwind CSS for styling. Export as default.',
    html: 'Generate complete, standalone HTML with embedded CSS in a <style> tag. No external dependencies.',
    vue: 'Generate a single-file Vue 3 component using <template>, <script setup lang="ts">, and <style scoped>.',
  };

  const styleGuide: Record<string, string> = {
    minimal: 'Clean, lots of whitespace, simple typography, no decorative elements, muted palette.',
    glassmorphism: 'Frosted glass effect with backdrop-filter blur, semi-transparent backgrounds, subtle borders.',
    neumorphic: 'Soft UI with embossed/debossed shadows, same-color backgrounds, gentle depth.',
    brutalist: 'Bold borders, high contrast, raw typography, stark layout, no softening.',
    material: 'Google Material Design 3 principles: elevation, ripples, contained/outlined/text button hierarchy.',
  };

  return `You are an expert UI developer. Generate a production-quality UI component.

REQUIREMENTS:
- Framework: ${input.framework}
- Style: ${input.style} — ${styleGuide[input.style]}
- Theme: ${input.theme}
- Color scheme preference: ${input.colorScheme ?? 'choose an appropriate palette'}

USER PROMPT:
${input.prompt}

IMPLEMENTATION RULES:
${frameworkInstructions[input.framework]}
- The component must be complete and immediately usable
- Use realistic placeholder data (names, emails, etc.) — no "Lorem ipsum"
- Make it visually polished and pixel-perfect
- Handle basic interactive states (hover, focus, active)
- Accessibility: use semantic HTML, aria labels where needed

RESPONSE FORMAT (respond ONLY with valid JSON, no markdown, no backticks):
{
  "code": "<the complete component code as a single string>",
  "explanation": "<2-3 sentences describing key design decisions and how to use the component>"
}`;
};

// ─── Generation result type ────────────────────────────────
export interface GenerationResult {
  code: string;
  explanation: string;
  tokensUsed: number;
}

// ─── Main generate function ────────────────────────────────
export const generateUI = async (input: GenerateUIInput): Promise<GenerationResult> => {
  const prompt = buildPrompt(input);

  let raw: string;
  let tokensUsed = 0;

  try {
    const result = await getModel().generateContent(prompt);
    const response = result.response;
    raw = response.text();
    tokensUsed = response.usageMetadata?.totalTokenCount ?? 0;
  } catch (error) {
    throw new AppError('AI generation failed. Please try again.', 503);
  }

  // ─── Parse JSON response ──────────────────────────────
  try {
    // Strip markdown fences if Gemini wraps anyway
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned) as { code: string; explanation: string };

    if (!parsed.code || !parsed.explanation) {
      throw new Error('Missing required fields in AI response');
    }

    return { code: parsed.code, explanation: parsed.explanation, tokensUsed };
  } catch {
    throw new AppError('AI returned an invalid response format. Please retry.', 502);
  }
};
