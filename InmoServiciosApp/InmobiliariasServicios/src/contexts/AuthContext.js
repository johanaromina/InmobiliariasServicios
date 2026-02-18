import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadToken, signOut as authSignOut } from '../services/auth';
import { getCurrentUser } from '../services/profile';
import { checkNetworkConnectivity } from '../utils/networkCheck';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Verificar conectividad de red primero
      const networkCheck = await checkNetworkConnectivity();
      if (!networkCheck.connected) {
        console.warn('⚠️ Backend no disponible:', networkCheck.error);
        // Continuar con la verificación de auth aunque no haya red
      }
      
      const token = await loadToken();
      if (token) {
        setIsAuth(true);
        // Cargar datos del usuario desde el backend
        try {
          const me = await getCurrentUser();
          setUser(me);
        } catch (e) {
          console.warn('No se pudo cargar /auth/me, usando token solamente');
          setUser({ token });
        }
      } else {
        setIsAuth(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { signIn: authSignIn } = await import('../services/auth');
      const userData = await authSignIn(email, password);
      setUser(userData);
      setIsAuth(true);
      return userData;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      const { signUp: authSignUp } = await import('../services/auth');
      const newUser = await authSignUp(userData);
      setUser(newUser);
      setIsAuth(true);
      return newUser;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Aún así, limpiar el estado local
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuth,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
