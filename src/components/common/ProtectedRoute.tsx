import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAppContext();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};