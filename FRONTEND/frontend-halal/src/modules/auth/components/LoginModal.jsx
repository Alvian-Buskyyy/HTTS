import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';

const LoginModal = ({ onClose }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
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
      
      // Use the login function from AuthContext
      login(data.user, data.token);
      
      // Redirect berdasarkan role user
      const roleRedirectMap = {
        'ADMIN': '/admin',
        'PETERNAK': '/peternak',
        'PASAR_HEWAN': '/pasarhewan/dashboard',
        'JAGAL': '/jagal',
        'RPH': '/rph',
        'DISTRIBUTOR': '/distributor',
        'HOREKA': '/horeca',
        'REGULATOR': '/regulator'
      };
      
      const redirectPath = roleRedirectMap[data.user.role] || '/';
      navigate(redirectPath);
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleOutsideClick}>
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <img src="/img/logo.png" alt="Logo" className="h-12 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800">Login</h2>
              <p className="text-gray-600">Masuk ke akun Anda</p>
            </div>

            {loginError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 py-2 px-3 rounded-md">
                <p>{loginError}</p>
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs text-primary hover:underline">Lupa password?</a>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
