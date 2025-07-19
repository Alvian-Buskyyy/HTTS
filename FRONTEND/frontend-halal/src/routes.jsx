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
import PasarHewanPage from './modules/pasarHewan/pages/PasarHewanPage';
import JagalPage from './modules/jagal/pages/JagalPage';
import RphPage from './modules/rph/pages/RphPage';
import DistributorPage from './modules/distributor/pages/DistributorPage';
import HorecaPage from './modules/horeca/pages/HorecaPage';
import RegulatorPage from './modules/regulator/pages/RegulatorPage';
import AdminPage from './modules/user/pages/AdminPage';

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

      <Route
        path="/rph/*"
        element={
          <PrivateRoute roles={['rph']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<RphPage />} />
                {/* Add nested routes for RPH here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

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
          <PrivateRoute roles={['regulator']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<RegulatorPage />} />
                {/* Add nested routes for regulator here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<AdminPage />} />
                {/* Add nested routes for admin here */}
              </Routes>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
