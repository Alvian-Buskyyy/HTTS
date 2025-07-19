import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from '../modules/auth/components/LogoutButton';
import AuthContext from '../context/AuthContext';

const DashboardLayout = ({ children, title, role: explicitRole }) => {
  const { auth } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = auth.user;
  const role = explicitRole || user?.role || 'USER';
  
  // Set document title when component mounts or title changes
  useEffect(() => {
    const baseTitle = "HATS - Halal Traceability System";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-md fixed w-full z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <button className="md:hidden mr-4 text-gray-500 hover:text-primary focus:outline-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex items-center">
              <i className="fas fa-shield-halved text-primary text-2xl mr-2"></i>
              <div className="hidden md:block">
                <span className="text-lg font-bold text-primary">Halalan Thoyyiban</span>
                <div className="text-xs text-gray-500">Halal Traceability System</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center text-white mr-2 shadow-md">
                {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="font-medium">{user ? user.username : 'User'}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <div className={`bg-white w-64 shadow-lg fixed md:static inset-y-0 left-0 transform z-40 transition duration-300 mt-16 h-[calc(100%-4rem)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to={`/${role.toLowerCase()}/dashboard`} className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                <i className="fas fa-tachometer-alt mr-3"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            
            {role === 'PETERNAK' && (
              <>
                <li>
                  <Link to="/peternak/sapi" className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                    <i className="fas fa-cow mr-3"></i>
                    <span>Data Sapi</span>
                  </Link>
                </li>
                <li>
                  <Link to="/peternak/daftar-ternak" className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                    <i className="fas fa-plus-circle mr-3"></i>
                    <span>Daftarkan Ternak</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/peternak/transaksi" 
                    className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary"
                    onClick={() => {
                      localStorage.setItem('transactionAuth', 'true');
                      localStorage.setItem('fromSidebar', 'true');
                    }}
                  >
                    <i className="fas fa-exchange-alt mr-3"></i>
                    <span>Transaksi</span>
                  </Link>
                </li>
              </>
            )}
            
            {role === 'RPH' && (
              <>
                <li>
                  <Link to="/rph/penyembelihan" className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                    <i className="fas fa-cut mr-3"></i>
                    <span>Penyembelihan</span>
                  </Link>
                </li>
                <li>
                  <Link to="/rph/daging" className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                    <i className="fas fa-drumstick-bite mr-3"></i>
                    <span>Daging</span>
                  </Link>
                </li>
              </>
            )}
            
            {/* Menu umum untuk semua role */}
            <li>
              <Link to={`/${role.toLowerCase()}/profil`} className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                <i className="fas fa-user mr-3"></i>
                <span>Profil</span>
              </Link>
            </li>
            <li>
              <Link to={`/${role.toLowerCase()}/pengaturan`} className="flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary">
                <i className="fas fa-cog mr-3"></i>
                <span>Pengaturan</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 px-4 md:px-6 py-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-blue-600">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
