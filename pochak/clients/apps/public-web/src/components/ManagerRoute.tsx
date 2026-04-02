import { Navigate, useLocation } from 'react-router-dom';

export default function ManagerRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  try {
    const user = JSON.parse(localStorage.getItem('pochak_user') || '{}');
    const role = user.role || 'USER';
    if (role !== 'MANAGER' && role !== 'ADMIN') {
      return <Navigate to="/home" state={{ from: location }} replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
