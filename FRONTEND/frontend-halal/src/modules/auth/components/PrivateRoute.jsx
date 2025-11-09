import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';

/**
 * Komponen PrivateRoute untuk melindungi rute yang membutuhkan autentikasi
 * dan memeriksa role user yang sesuai
 */
const PrivateRoute = ({ children, roles = [] }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const { isAuthenticated, user, loading } = auth;
  
  // Tampilkan loading indicator selama proses pengecekan
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Jika user tidak terautentikasi, redirect ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Jika role dibatasi dan user tidak memiliki role yang sesuai
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Jika semua persyaratan terpenuhi, tampilkan konten rute
  return children;
};

export default PrivateRoute;
