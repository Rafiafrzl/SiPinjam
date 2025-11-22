import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userToken = localStorage.getItem('user_token') || localStorage.getItem('token');
      const userData = localStorage.getItem('user_user') || localStorage.getItem('user');

      if (userToken && userData) {
        const storedUser = JSON.parse(userData);

        if (storedUser && (storedUser.role === 'user' || storedUser.role === 'admin')) {
          setUser(storedUser);
          return;
        }
      }

      // Clear invalid data
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_user');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.warn('Error checking user logged in:', error);
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_user');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    if (!userData.role || (userData.role !== 'user' && userData.role !== 'admin')) {
      throw new Error('Invalid user credentials');
    }

    localStorage.setItem('user_token', token);
    localStorage.setItem('user_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_user');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    if (!userData.role || (userData.role !== 'user' && userData.role !== 'admin')) {
      throw new Error('Invalid user data');
    }
    localStorage.setItem('user_user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isUser: user?.role === 'user',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider };
