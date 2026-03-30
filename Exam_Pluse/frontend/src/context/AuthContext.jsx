import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
import { API_BASE_URL as API } from '../config';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nqt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/exam/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem('nqt_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const refreshUser = async () => {
    if (token) {
      try {
        const r = await axios.get(`${API}/exam/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(r.data.user);
      } catch (e) {}
    }
  };

  const login = (tok, userData) => {
    localStorage.setItem('nqt_token', tok);
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nqt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
