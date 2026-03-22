import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { BASE_URL, API_ENDPOINTS } from '@/constants/api';

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
};

type SignupData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'e_books_jwt';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Token saqlash
  const saveToken = async (newToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  // Token o'chirish
  const removeToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  // Check-auth — app ochilganda ishlaydi
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.CHECK_AUTH}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setToken(storedToken);
      } else {
        // Token eskirgan yoki noto'g'ri
        await removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      await removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || 'Login xatosi';
        Toast.show({
          type: 'error',
          text1: 'Xatolik',
          text2: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        });
        return false;
      }

      // Backend { user, token } qaytaradi — lekin token cookie'da, response body'da user
      // Agar token response'da bo'lsa, uni saqlaymiz
      if (data.token) {
        await saveToken(data.token);
      }

      setUser(data.id ? data : data.user || data);
      Toast.show({
        type: 'success',
        text1: 'Muvaffaqiyatli!',
        text2: 'Tizimga muvaffaqiyatli kirdingiz ✅',
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Xatolik',
        text2: 'Serverga ulanib bo\'lmadi. Internet aloqangizni tekshiring.',
      });
      return false;
    }
  };

  // Signup
  const signup = async (signupData: SignupData): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || 'Signup xatosi';
        Toast.show({
          type: 'error',
          text1: 'Xatolik',
          text2: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        });
        return false;
      }

      if (data.token) {
        await saveToken(data.token);
      }

      setUser(data.id ? data : data.user || data);
      Toast.show({
        type: 'success',
        text1: 'Muvaffaqiyatli!',
        text2: 'Siz muvaffaqiyatli ro\'yxatdan o\'tdingiz ✅',
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      Toast.show({
        type: 'error',
        text1: 'Xatolik',
        text2: 'Serverga ulanib bo\'lmadi. Internet aloqangizni tekshiring.',
      });
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (e) {
      // Logout so'rovi muvaffaqiyatsiz bo'lsa ham, local tokenni o'chiramiz
    }
    await removeToken();
    setUser(null);
    Toast.show({
      type: 'success',
      text1: 'Chiqish',
      text2: 'Hisobdan muvaffaqiyatli chiqdingiz',
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Required by expo-router (all files inside app/ need a default export)
export default function AuthContextRoute() {
  return null;
}
