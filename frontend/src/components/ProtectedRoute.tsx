import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
}
