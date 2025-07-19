import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginModal = ({ isVisible, onClose, modalRef }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Login form handling
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (!email || !password) {
      setLoginError('Harap isi email dan kata sandi.');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Panggil API untuk login
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal masuk. Silakan coba lagi.');
      }
      
      // Simpan token dan informasi user ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect berdasarkan role user
      const roleRedirectMap = {
        'ADMIN': '/admin',
        'PETERNAK': '/peternak/dashboard',
        'PASAR_HEWAN': '/pasarhewan/dashboard',
        'JAGAL': '/jagal',
        'RPH': '/rph',
        'DISTRIBUTOR': '/distributor',
        'HOREKA': '/horeca',
        'REGULATOR': '/regulator'
      };
      
      const redirectUrl = roleRedirectMap[data.user.role] || '/';
      window.location.href = redirectUrl;
      
    } catch (error) {
      setLoginError(error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  // Using React Portal would be better, but for now we'll use a high z-index
  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)'}} className="flex items-center justify-center z-[9999]">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="w-8"></div> {/* Spacer to balance the close button */}
            <h3 className="text-2xl font-bold text-gray-900 text-center flex-grow">Masuk</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 w-8">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form onSubmit={handleLoginSubmit}>
            {loginError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{loginError}</span>
              </div>
            )}
            <div className="mb-4 text-left">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input type="email" name="email" id="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-gray-700 mb-2" htmlFor="password">Kata Sandi</label>
              <input type="password" name="password" id="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button 
              type="submit" 
              className={`w-full bg-primary hover:bg-primaryDark text-white font-bold py-2 px-4 rounded-lg transition duration-300 mb-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
            <div className="text-center">
              <a href="#" className="text-primary hover:underline">Lupa kata sandi?</a>
            </div>
          </form>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <p className="text-center text-gray-600">Belum punya akun? <Link to="/signup" className="text-primary font-medium hover:underline">Daftar</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
