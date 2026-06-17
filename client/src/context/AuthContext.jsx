import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, loginWithGoogle, registerUser, getMyProfile } from '../api/auth.api.js';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
//    Wrap your entire app with this so every component
//    can access the auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // On app load, if a token exists in localStorage,
  // fetch the user profile to restore the session
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const data = await getMyProfile();
          setUser(data.user);
        } catch {
          // Token is invalid or expired — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [token]);

  // ── login ──────────────────────────────────────────────────
  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ── Google login ───────────────────────────────────────────
  const loginWithGoogleToken = async (idToken) => {
    const data = await loginWithGoogle(idToken);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ── register ───────────────────────────────────────────────
  const register = async (userData) => {
    const data = await registerUser(userData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ── logout ─────────────────────────────────────────────────
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle: loginWithGoogleToken,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'Admin',
    isStudent: user?.role === 'Student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook — use this in any component instead of
//    useContext(AuthContext) directly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};