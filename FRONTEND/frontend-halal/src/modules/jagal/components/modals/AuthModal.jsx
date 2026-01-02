import React from 'react';

const AuthModal = ({ 
  showAuthModal, 
  authCode, 
  setAuthCode, 
  authError, 
  handleAuthSubmit 
}) => {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Autentikasi Diperlukan</h2>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <i className="fas fa-lock text-primary"></i>
          </div>
        </div>
        <form onSubmit={handleAuthSubmit} className="p-6">
          <p className="text-gray-600 mb-4">
            Halaman transaksi memerlukan kode autentikasi untuk mengakses fitur ini. Silakan masukkan kode yang valid.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Autentikasi
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Masukkan kode autentikasi"
              autoFocus
            />
            {authError && (
              <p className="text-red-500 text-sm mt-2">{authError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primaryDark transition-colors"
          >
            Verifikasi
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
