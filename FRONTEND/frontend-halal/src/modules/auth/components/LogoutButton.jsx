import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Redirect to login page
    navigate('/');
    setShowConfirm(false);
  };

  return (
    <>
      <button 
        onClick={handleLogout}
        className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-3 rounded-md transition-all duration-200 flex items-center border border-red-200"
      >
        <i className="fas fa-sign-out-alt mr-1.5"></i>
        <span className="hidden md:inline font-medium">Logout</span>
      </button>

      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Konfirmasi Logout</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Apakah Anda yakin ingin keluar?</p>
            </div>
            <div className="p-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => setShowConfirm(false)}>Batal</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={confirmLogout}>Keluar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default LogoutButton;
