import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('careflow_token');
    const savedUser = localStorage.getItem('careflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('careflow_token');
        localStorage.removeItem('careflow_user');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (authData) => {
    const { token: jwtToken, user: userProfile } = authData;
    setToken(jwtToken);
    setUser(userProfile);
    localStorage.setItem('careflow_token', jwtToken);
    localStorage.setItem('careflow_user', JSON.stringify(userProfile));
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('careflow_token');
    localStorage.removeItem('careflow_user');
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
