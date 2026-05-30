import { useState } from 'react';
import { api } from '@/services/api';
import { UIStyle, UITheme, UIFramework, GenerateUIResponseDTO } from '@aiuix/shared';

export interface GenerateFormState {
  prompt: string;
  style: UIStyle;
  theme: UITheme;
  framework: UIFramework;
  colorScheme: string;
}

const INITIAL: GenerateFormState = {
  prompt: '',
  style: 'minimal',
  theme: 'dark',
  framework: 'react',
  colorScheme: '',
};

export const useGenerate = () => {
  const [form, setForm] = useState<GenerateFormState>(INITIAL);
  const [result, setResult] = useState<GenerateUIResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = <K extends keyof GenerateFormState>(key: K, value: GenerateFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const generate = async () => {
    if (!form.prompt.trim() || form.prompt.length < 10) {
      setError('Prompt must be at least 10 characters');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.generate.ui({
        prompt: form.prompt,
        style: form.style,
        theme: form.theme,
        framework: form.framework,
        colorScheme: form.colorScheme || undefined,
      });
      if (res.data.success) {
        setResult((res.data as any).data);
      } else {
        setError((res.data as any).error);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(''); };

  return { form, setField, result, loading, error, generate, reset };
};
