import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from './api';

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('medicare_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth init failed", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    const userWithToken = { ...userData, token };
    localStorage.setItem('medicare_user', JSON.stringify(userWithToken));
    localStorage.setItem('medicare_token', token);
    setUser(userWithToken);
  };

  const logout = () => {
    localStorage.removeItem('medicare_user');
    localStorage.removeItem('medicare_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};