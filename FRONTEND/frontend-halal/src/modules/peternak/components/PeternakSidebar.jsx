import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '../../auth/components/LogoutButton';

const PeternakSidebar = ({ activeSection, sidebarOpen, setSidebarOpen, inline = false }) => {
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = () => {
    // Clear session/local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('transactionAuth');
    localStorage.removeItem('showTransactionFromDashboard');
    // Redirect to login page
    navigate('/');
  };

  // Navigation items with their respective paths and icons
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', link: '/peternak/dashboard' },
    { id: 'sapi', label: 'Data Sapi', icon: 'fa-cow', link: '/peternak/sapi' },
    { id: 'daftar-ternak', label: 'Daftar Ternak', icon: 'fa-list-ul', link: '/peternak/daftar-ternak' },
    { id: 'transaksi', label: 'Transaksi', icon: 'fa-exchange-alt', link: '/peternak/transaksi' },
    { id: 'health', label: 'Kesehatan Ternak', icon: 'fa-stethoscope', link: '/peternak/kesehatan' },
  ];

  if (inline) {
    return (
      <>
        {/* Navigation */}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link 
                to={item.link}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition border-r-4 ${activeSection === item.id ? 'text-primary bg-primary/10 font-medium border-primary' : 'border-transparent'}`}
              >
                <i className={`fas ${item.icon} w-5`}></i>
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Additional Navigation Section - Inventory Management */}
        <div className="mt-6 px-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manajemen Ternak</h3>
          <ul className="mt-3 space-y-1">
            <li>
              <Link 
                to="/peternak/sapi/register"
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'register-sapi' ? 'text-primary bg-primaryLight font-medium' : ''}`}
              >
                <i className="fas fa-plus-circle w-5"></i>
                <span className="ml-2">Daftarkan Ternak Baru</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/peternak/kesehatan"
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'health' ? 'text-primary bg-primaryLight font-medium' : ''}`}
              >
                <i className="fas fa-stethoscope w-5"></i>
                <span className="ml-2">Kesehatan Ternak</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Additional Navigation Section - Reports */}
        <div className="mt-6 px-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Laporan</h3>
          <ul className="mt-3 space-y-1">
            <li>
              <Link 
                to="/peternak/transaksi?tab=history"
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'transaction-history' ? 'text-primary bg-primaryLight font-medium' : ''}`}
              >
                <i className="fas fa-history w-5"></i>
                <span className="ml-2">Riwayat Transaksi</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom: Profile, Settings, Logout */}
  <div className="p-4 border-t space-y-1">
          <Link 
            to="/peternak/profil"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'profil' ? 'text-primary bg-primaryLight font-medium' : ''}`}
          >
            <i className="fas fa-user-circle w-5"></i>
            <span className="ml-2">Profil</span>
          </Link>
          <Link 
            to="/peternak/pengaturan"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'pengaturan' ? 'text-primary bg-primaryLight font-medium' : ''}`}
          >
            <i className="fas fa-cog w-5"></i>
            <span className="ml-2">Pengaturan</span>
          </Link>
          <LogoutButton />
        </div>
      </>
    );
  }

  return (
    <div className={`bg-white shadow-sm fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center py-6 border-b">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <i className="fas fa-leaf"></i>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-semibold text-gray-800">HATS</h1>
            <p className="text-xs text-gray-500">Halal Traceability System</p>
          </div>
        </div>
        
        {/* User Info - Mobile Only */}
        <div className="lg:hidden flex items-center p-4 border-b">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <i className="fas fa-user"></i>
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-gray-800">Peternakan Makmur Sejahtera</h2>
            <p className="text-xs text-gray-500">Peternak</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="ml-auto text-gray-500 lg:hidden focus:outline-none"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link 
                  to={item.link}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition ${activeSection === item.id ? 'text-primary bg-primaryLight font-medium border-r-4 border-primary' : ''}`}
                >
                  <i className={`fas ${item.icon} w-5`}></i>
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Additional Navigation Section - Inventory Management */}
          <div className="mt-6 px-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manajemen Ternak</h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link 
                  to="/peternak/sapi/register"
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'register-sapi' ? 'text-primary bg-primaryLight font-medium' : ''}`}
                >
                  <i className="fas fa-plus-circle w-5"></i>
                  <span className="ml-2">Daftarkan Ternak Baru</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/peternak/kesehatan"
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'health' ? 'text-primary bg-primaryLight font-medium' : ''}`}
                >
                  <i className="fas fa-stethoscope w-5"></i>
                  <span className="ml-2">Kesehatan Ternak</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Navigation Section - Reports */}
          <div className="mt-6 px-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Laporan</h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link 
                  to="/peternak/transaksi?tab=history"
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'transaction-history' ? 'text-primary bg-primaryLight font-medium' : ''}`}
                >
                  <i className="fas fa-history w-5"></i>
                  <span className="ml-2">Riwayat Transaksi</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* Bottom: Profile, Settings, Logout */}
  <div className="p-4 border-t space-y-1">
          <Link 
            to="/peternak/profil"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'profil' ? 'text-primary bg-primaryLight font-medium' : ''}`}
          >
            <i className="fas fa-user-circle w-5"></i>
            <span className="ml-2">Profil</span>
          </Link>
          <Link 
            to="/peternak/pengaturan"
            className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === 'pengaturan' ? 'text-primary bg-primaryLight font-medium' : ''}`}
          >
            <i className="fas fa-cog w-5"></i>
            <span className="ml-2">Pengaturan</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default PeternakSidebar;
