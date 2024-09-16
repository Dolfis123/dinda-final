import React from 'react';
import { Navigate } from 'react-router-dom';

// Mendefinisikan tipe props untuk komponen ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  role: string; // Properti role di sini
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Ambil role dari localStorage atau state management

  // Jika tidak ada token atau role tidak cocok, arahkan ke halaman lain
  if (!token || userRole !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>; // Jika valid, render child component
};

export default ProtectedRoute;
