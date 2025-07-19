import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-600 text-xl mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link to="/" className="inline-block bg-primary hover:bg-primaryDark text-white font-medium rounded-lg px-5 py-3 transition duration-300">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
