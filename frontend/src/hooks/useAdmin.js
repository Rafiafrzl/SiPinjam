import { useAuth } from '../context/AuthContext';

const useAdmin = () => {
  const { user, isAuthenticated, updateUser } = useAuth();

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return {
    isAdmin,
    admin: user,
    updateAdmin: updateUser,
    isAuthenticated
  };
};

export default useAdmin;