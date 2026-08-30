import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Fallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

export default function AdminRoute({ children }) {
  const { user, isLoadingAuth, authChecked, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked || !isAuthenticated) {
    return <Fallback />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}