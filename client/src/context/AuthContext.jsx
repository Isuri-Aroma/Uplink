import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true); // restoring saved session

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Check saved token on load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return setChecking(false);
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(signOut)
      .finally(() => setChecking(false));
  }, [signOut]);

  // Sign out on 401 from the API
  useEffect(() => {
    window.addEventListener('uplink:signed-out', signOut);
    return () => window.removeEventListener('uplink:signed-out', signOut);
  }, [signOut]);

  const signIn = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const value = { user, checking, signIn, signOut, isAdmin: user?.role === 'admin' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
