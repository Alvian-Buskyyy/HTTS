import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-3 rounded-md transition-all duration-200 flex items-center border border-red-200"
    >
      <i className="fas fa-sign-out-alt mr-1.5"></i>
      <span className="hidden md:inline font-medium">Logout</span>
    </button>
  );
};

export default LogoutButton;
