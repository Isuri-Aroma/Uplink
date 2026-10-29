import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirect to sign-in if not logged in
export function RequireAuth() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Checking your session…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Admin-only pages
export function RequireAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
