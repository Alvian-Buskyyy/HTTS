import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './modules/auth/components/PrivateRoute';
import Unauthorized from './modules/common/components/Unauthorized';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import SignUp from './modules/auth/pages/SignUp';
import Login from './modules/auth/pages/Login';

// Landing page
import LandingPage from './modules/common/pages/LandingPage';

// Role-specific pages
import PeternakDashboard from './modules/peternak/pages/PeternakDashboard';
import PeternakTransaksi from './modules/peternak/pages/PeternakTransaksi';
import PeternakHealth from './modules/peternak/pages/PeternakHealth';
import PasarHewanPage from './modules/pasarHewan/pages/PasarHewanPage';
import JagalPage from './modules/jagal/pages/JagalPage';
// Legacy RphPage removed after adopting new modular RPH dashboard
import DistributorPage from './modules/distributor/pages/DistributorPage';
import HorecaPage from './modules/horeca/pages/HorecaPage';
// Regulator module pages
import RegulatorDashboard from './modules/regulator/pages/RegulatorDashboard';
import RegulatorMonitoring from './modules/regulator/pages/RegulatorMonitoring';
import RegulatorReport from './modules/regulator/pages/RegulatorReport';
import RegulatorEntities from './modules/regulator/pages/RegulatorEntities';
import RegulatorSapi from './modules/regulator/pages/RegulatorSapi';
import RegulatorDaging from './modules/regulator/pages/RegulatorDaging';
import RegulatorTransaksi from './modules/regulator/pages/RegulatorTransaksi';
import RegulatorItems from './modules/regulator/pages/RegulatorItems';
import RegulatorQR from './modules/regulator/pages/RegulatorQR';
import RegulatorProfile from './modules/regulator/pages/RegulatorProfile';
import RegulatorSettings from './modules/regulator/pages/RegulatorSettings';
// Admin module pages
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import AdminUsers from './modules/admin/pages/AdminUsers';
import AdminEntities from './modules/admin/pages/AdminEntities';
import AdminSapi from './modules/admin/pages/AdminSapi';
import AdminDaging from './modules/admin/pages/AdminDaging';
import AdminTransaksi from './modules/admin/pages/AdminTransaksi';
import AdminItems from './modules/admin/pages/AdminItems';
import AdminQR from './modules/admin/pages/AdminQR';
import AdminProfile from './modules/admin/pages/AdminProfile';
import AdminSettings from './modules/admin/pages/AdminSettings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route
        path="/peternak/*"
        element={
          <PrivateRoute roles={['peternak']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<PeternakDashboard />} />
                <Route path="/transaksi" element={<PeternakTransaksi />} />
                {/* Use absolute path to match sidebar link */}
                <Route path="/peternak/kesehatan" element={<PeternakHealth />} />
                {/* Add nested routes for peternak here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/pasar-hewan/*"
        element={
          <PrivateRoute roles={['pasarHewan']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<PasarHewanPage />} />
                {/* Add nested routes for pasar hewan here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/jagal/*"
        element={
          <PrivateRoute roles={['jagal']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<JagalPage />} />
                {/* Add nested routes for jagal here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

  {/* RPH modular routes now handled in App.jsx with role guard */}

      <Route
        path="/distributor/*"
        element={
          <PrivateRoute roles={['distributor']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DistributorPage />} />
                {/* Add nested routes for distributor here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/horeca/*"
        element={
          <PrivateRoute roles={['horeca']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<HorecaPage />} />
                {/* Add nested routes for horeca here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/regulator/*"
        element={
          <PrivateRoute roles={['REGULATOR']}>
            <Routes>
              <Route path="/" element={<RegulatorDashboard />} />
              <Route path="/dashboard" element={<RegulatorDashboard />} />
              <Route path="/monitoring" element={<RegulatorMonitoring />} />
              <Route path="/report" element={<RegulatorReport />} />
              <Route path="/entities" element={<RegulatorEntities />} />
              <Route path="/sapi" element={<RegulatorSapi />} />
              <Route path="/daging" element={<RegulatorDaging />} />
              <Route path="/transaksi" element={<RegulatorTransaksi />} />
              <Route path="/items" element={<RegulatorItems />} />
              <Route path="/qr" element={<RegulatorQR />} />
              <Route path="/profil" element={<RegulatorProfile />} />
              <Route path="/pengaturan" element={<RegulatorSettings />} />
            </Routes>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/entities" element={<AdminEntities />} />
              <Route path="/sapi" element={<AdminSapi />} />
              <Route path="/daging" element={<AdminDaging />} />
              <Route path="/transaksi" element={<AdminTransaksi />} />
              <Route path="/items" element={<AdminItems />} />
              <Route path="/qr" element={<AdminQR />} />
              <Route path="/profil" element={<AdminProfile />} />
              <Route path="/pengaturan" element={<AdminSettings />} />
            </Routes>
          </PrivateRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
