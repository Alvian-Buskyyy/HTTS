import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import SignUp from './pages/SignUp'
import AdminPage from './pages/AdminPage'
import Unauthorized from './pages/Unauthorized'
import PrivateRoute from './components/PrivateRoute'
import PeternakDashboard from './modules/peternak/pages/PeternakDashboard'
import PeternakTransaksi from './modules/peternak/pages/PeternakTransaksi'
import PeternakSapi from './modules/peternak/pages/PeternakSapi'
import PeternakProfil from './modules/peternak/pages/PeternakProfil'
import PeternakDaftarTernak from './modules/peternak/pages/PeternakDaftarTernak'

// Import PasarHewan Components
import PasarHewanPage from './modules/pasarHewan/pages/PasarHewanPage'
import PasarHewanDashboard from './modules/pasarHewan/pages/PasarHewanDashboard'
import PasarHewanTernak from './modules/pasarHewan/pages/PasarHewanTernak'
import PasarHewanTransfer from './modules/pasarHewan/pages/PasarHewanTransfer'
import PasarHewanHealth from './modules/pasarHewan/pages/PasarHewanHealth'
import PasarHewanProfile from './modules/pasarHewan/pages/PasarHewanProfile'
import PasarHewanSettings from './modules/pasarHewan/pages/PasarHewanSettings'

import { useEffect, useState } from 'react'

function App() {
  // State untuk menyimpan status autentikasi dan user info
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Periksa token dan status autentikasi saat aplikasi dimuat
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false
          });
          return;
        }
        
        // Parse user data
        const user = JSON.parse(savedUser);
        
        // Validasi token dengan backend (opsional)
        const response = await fetch('http://localhost:3000/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setAuth({
            isAuthenticated: true,
            user,
            loading: false
          });
        } else {
          // Token tidak valid, hapus dari localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error validating authentication:', error);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };
    
    checkAuthStatus();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/peternak" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/peternak/dashboard" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/peternak/transaksi" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakTransaksi />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/peternak/sapi" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakSapi />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/peternak/sapi/register" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakSapi initialSection="register" />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/peternak/daftar-ternak" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakDaftarTernak />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/peternak/profil" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PETERNAK']}>
              <PeternakProfil />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/dashboard" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/ternak" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanTernak />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/transfer" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanTransfer />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/settings" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanSettings />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/health" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanHealth />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/pasarhewan/profile" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanProfile />
            </PrivateRoute>
          } 
        />
        
        {/* Legacy route - keep temporarily during migration */}
        <Route 
          path="/pasarhewan/activities" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'PASAR_HEWAN']}>
              <PasarHewanDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/rph" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'RPH']}>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Halaman RPH</h1>
                <p className="text-gray-600">Selamat datang di dashboard RPH. Anda telah berhasil login!</p>
              </div>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/distributor" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'DISTRIBUTOR']}>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Halaman Distributor</h1>
                <p className="text-gray-600">Selamat datang di dashboard distributor. Anda telah berhasil login!</p>
              </div>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/horeca" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'HOREKA']}>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Halaman HoReCa</h1>
                <p className="text-gray-600">Selamat datang di dashboard HoReCa. Anda telah berhasil login!</p>
              </div>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/regulator" 
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'REGULATOR']}>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Halaman Regulator</h1>
                <p className="text-gray-600">Selamat datang di dashboard regulator. Anda telah berhasil login!</p>
              </div>
            </PrivateRoute>
          } 
        />

        {/* Fallback Route - 404 Not Found */}
        <Route 
          path="*" 
          element={
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Halaman tidak ditemukan</p>
              <a href="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primaryDark transition duration-300">Kembali ke Beranda</a>
            </div>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
