import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@aiuix/shared';
import { api } from '@/services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      api.auth.getMe()
        .then(res => {
          if (res.data.success) setUser((res.data as any).data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.data.success) {
      const { user, token } = (res.data as any).data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
    } else {
      throw new Error((res.data as any).error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    if (res.data.success) {
      const { user, token } = (res.data as any).data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
    } else {
      throw new Error((res.data as any).error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
