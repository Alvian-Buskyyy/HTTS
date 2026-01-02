import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import AdminUsers from "./modules/admin/pages/AdminUsers";
import AdminEntities from "./modules/admin/pages/AdminEntities";
import AdminSapi from "./modules/admin/pages/AdminSapi";
import AdminDaging from "./modules/admin/pages/AdminDaging";
import AdminTransaksi from "./modules/admin/pages/AdminTransaksi";
import AdminItems from "./modules/admin/pages/AdminItems";
import AdminQR from "./modules/admin/pages/AdminQR";
import AdminProfile from "./modules/admin/pages/AdminProfile";
import AdminSettings from "./modules/admin/pages/AdminSettings";
import Unauthorized from "./pages/Unauthorized";
import PrivateRoute from "./components/PrivateRoute";
import PeternakDashboard from "./modules/peternak/pages/PeternakDashboard";
import PeternakTransaksi from "./modules/peternak/pages/PeternakTransaksi";
import PeternakSapi from "./modules/peternak/pages/PeternakSapi";
import PeternakProfil from "./modules/peternak/pages/PeternakProfil";
import PeternakHealth from "./modules/peternak/pages/PeternakHealth";
import PeternakDaftarTernak from "./modules/peternak/pages/PeternakDaftarTernak";
import PeternakSettings from "./modules/peternak/pages/PeternakSettings";

// Import PasarHewan Components
import PasarHewanPage from "./modules/pasarHewan/pages/PasarHewanPage";
import PasarHewanDashboard from "./modules/pasarHewan/pages/PasarHewanDashboard";
import PasarHewanTernak from "./modules/pasarHewan/pages/PasarHewanTernak";
import PasarHewanTransfer from "./modules/pasarHewan/pages/PasarHewanTransfer";
import PasarHewanHealth from "./modules/pasarHewan/pages/PasarHewanHealth";
import PasarHewanProfile from "./modules/pasarHewan/pages/PasarHewanProfile";
import PasarHewanSettings from "./modules/pasarHewan/pages/PasarHewanSettings";

// Jagal pages
import JagalDashboard from "./modules/jagal/pages/JagalDashboard";
import JagalSapi from "./modules/jagal/pages/JagalSapi";
import JagalDaging from "./modules/jagal/pages/JagalDaging";
import JagalTransaksi from "./modules/jagal/pages/JagalTransaksi";
import JagalTransaksiPenyembelihan from "./modules/jagal/pages/JagalTransaksiPenyembelihan";
import JagalHealth from "./modules/jagal/pages/JagalHealth";
import JagalProfil from "./modules/jagal/pages/JagalProfil";
import JagalSettings from "./modules/jagal/pages/JagalSettings";
import JagalDaftarTernak from "./modules/jagal/pages/JagalDaftarTernak";

// RPH pages (mengadopsi struktur Jagal)
import RphDashboard from "./modules/rph/pages/RphDashboard";
import RphSapi from "./modules/rph/pages/RphSapi";
import RphProfil from "./modules/rph/pages/RphProfil";
import RphSettings from "./modules/rph/pages/RphSettings";
import RphOperasi from "./modules/rph/pages/RphOperasi";
import RphVerifikasiSehat from "./modules/rph/pages/RphVerifikasiSehat";
import RphVerifikasiHalal from "./modules/rph/pages/RphVerifikasiHalal";
import RphTransaksi from "./modules/rph/pages/RphTransaksi";
import RphProsesPenyembelihan from "./modules/rph/pages/RphProsesPenyembelihan";

// Distributor pages (adopsi struktur RPH)
import DistributorDashboard from "./modules/distributor/pages/DistributorDashboard";
import DistributorTransaksi from "./modules/distributor/pages/DistributorTransaksi";
import DistributorProfil from "./modules/distributor/pages/DistributorProfil";
import DistributorSettings from "./modules/distributor/pages/DistributorSettings";

import { useEffect, useState } from "react";

// Regulator pages
import RegulatorDashboard from "./modules/regulator/pages/RegulatorDashboard";
import RegulatorMonitoring from "./modules/regulator/pages/RegulatorMonitoring";
import RegulatorReport from "./modules/regulator/pages/RegulatorReport";
import RegulatorEntities from "./modules/regulator/pages/RegulatorEntities";
import RegulatorSapi from "./modules/regulator/pages/RegulatorSapi";
import RegulatorDaging from "./modules/regulator/pages/RegulatorDaging";
import RegulatorTransaksi from "./modules/regulator/pages/RegulatorTransaksi";
import RegulatorItems from "./modules/regulator/pages/RegulatorItems";
import RegulatorChecklist from "./modules/regulator/pages/RegulatorChecklist";
import RegulatorQR from "./modules/regulator/pages/RegulatorQR";
import RegulatorProfile from "./modules/regulator/pages/RegulatorProfile";
import RegulatorSettings from "./modules/regulator/pages/RegulatorSettings";
import RegulatorVerifikasiHalal from "./modules/regulator/pages/RegulatorVerifikasiHalal";

function App() {
  // State untuk menyimpan status autentikasi dan user info
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Periksa token dan status autentikasi saat aplikasi dimuat
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
          return;
        }

        // Parse user data
        const user = JSON.parse(savedUser);

        // Validasi token dengan backend (opsional)
        const response = await fetch("http://localhost:3000/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setAuth({
            isAuthenticated: true,
            user,
            loading: false,
          });
        } else {
          // Token tidak valid, hapus dari localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error validating authentication:", error);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
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
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/entities"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminEntities />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/sapi"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminSapi />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/daging"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminTransaksi />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/qr"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminQR />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakTransaksi />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/sapi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakSapi />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/sapi/register"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakSapi initialSection="register" />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/daftar-ternak"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakDaftarTernak />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakProfil />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/kesehatan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakHealth />
            </PrivateRoute>
          }
        />

        <Route
          path="/peternak/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PETERNAK"]}>
              <PeternakSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan/ternak"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanTernak />
            </PrivateRoute>
          }
        />

        

        <Route
          path="/pasarhewan/transfer"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanTransfer />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan/settings"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan/health"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanHealth />
            </PrivateRoute>
          }
        />

        <Route
          path="/pasarhewan/profile"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanProfile />
            </PrivateRoute>
          }
        />

        {/* Legacy route - keep temporarily during migration */}
        <Route
          path="/pasarhewan/activities"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PASAR_HEWAN"]}>
              <PasarHewanDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/distributor"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "DISTRIBUTOR"]}>
              <DistributorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/distributor/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "DISTRIBUTOR"]}>
              <DistributorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/distributor/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "DISTRIBUTOR"]}>
              <DistributorTransaksi />
            </PrivateRoute>
          }
        />
        {/* Redirect legacy distributor transaksi-daging to transaksi */}
        <Route path="/distributor/transaksi-daging" element={<Navigate to="/distributor/transaksi" replace />} />
        <Route
          path="/distributor/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "DISTRIBUTOR"]}>
              <DistributorProfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/distributor/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "DISTRIBUTOR"]}>
              <DistributorSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/horeca"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "HOREKA"]}>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Halaman HoReCa</h1>
                <p className="text-gray-600">Selamat datang di dashboard HoReCa. Anda telah berhasil login!</p>
              </div>
            </PrivateRoute>
          }
        />

        {/* Regulator routes */}
        <Route
          path="/regulator"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/monitoring"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorMonitoring />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/report"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/entities"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorEntities />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/sapi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorSapi />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/daging"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorDaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorTransaksi />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/items"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/checklist"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorChecklist />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/qr"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorQR />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/verifikasi-halal"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorVerifikasiHalal />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulator/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "REGULATOR"]}>
              <RegulatorSettings />
            </PrivateRoute>
          }
        />

        {/* Jagal routes */}
        <Route
          path="/jagal"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/sapi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalSapi />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/daftar-ternak"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalDaftarTernak />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalTransaksi />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/penyembelihan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalTransaksiPenyembelihan />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/daging"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalDaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/kesehatan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalHealth />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalProfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/jagal/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "JAGAL"]}>
              <JagalSettings />
            </PrivateRoute>
          }
        />

        {/* RPH routes */}
        <Route
          path="/rph"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/sapi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphSapi />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/profil"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphProfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/pengaturan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/operasi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphOperasi />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/proses-penyembelihan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphProsesPenyembelihan />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/transaksi"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphTransaksi />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/proses-penyembelihan"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphProsesPenyembelihan />
            </PrivateRoute>
          }
        />
        {/* Redirect legacy RPH transaksi-daging to transaksi */}
        <Route path="/rph/transaksi-daging" element={<Navigate to="/rph/transaksi" replace />} />
        <Route
          path="/rph/verifikasi-sehat"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphVerifikasiSehat />
            </PrivateRoute>
          }
        />
        <Route
          path="/rph/verifikasi-halal"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "RPH"]}>
              <RphVerifikasiHalal />
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
              <a href="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primaryDark transition duration-300">
                Kembali ke Beranda
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
