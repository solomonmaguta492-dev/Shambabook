import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/* Pages like /login and /register are only for people who are logged out */
function PublicOnlyRoute() {
  const { user } = useAuth();
  const location = useLocation();

  /* Already logged in: go to the page they wanted, or the dashboard */
  if (user) {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
