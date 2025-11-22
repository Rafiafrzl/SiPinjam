import { useAuth } from '../context/AuthContext';

const useAdmin = () => {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return {
    isAdmin,
    user,
    isAuthenticated
  };
};

export default useAdmin;