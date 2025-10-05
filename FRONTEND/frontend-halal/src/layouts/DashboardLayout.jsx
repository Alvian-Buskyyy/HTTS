import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../modules/auth/components/LogoutButton';
import AuthContext from '../context/AuthContext';

const DashboardLayout = ({ children, title, role: explicitRole, customSidebar }) => {
  const { auth } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = auth.user;
  const role = explicitRole || user?.role || 'USER';
  const basePath = role === 'PETERNAK' 
    ? '/peternak' 
    : role === 'RPH' 
      ? '/rph' 
      : role === 'PASAR_HEWAN'
        ? '/pasarhewan'
        : `/${(role || '').toLowerCase()}`;
  const location = useLocation();
  const isActive = (to) => location.pathname.startsWith(to);

  const roleNiceLabel = (r) => ({
    PETERNAK: 'Peternak',
    PASAR_HEWAN: 'Pasar Hewan',
    JAGAL: 'Jagal',
    RPH: 'RPH',
    DISTRIBUTOR: 'Distributor',
    HOREKA: 'Horeka',
    REGULATOR: 'Regulator',
  }[r] || r || '');

  // Derive active section name for all roles
  const activeSectionName = (() => {
    const path = location.pathname.replace(basePath, '') || '/dashboard';
    // Common
    if (path.startsWith('/dashboard') || path === '/') return 'Dashboard';
    if (path.startsWith('/profil') || path.startsWith('/profile')) return 'Profil';
    if (path.startsWith('/pengaturan') || path.startsWith('/settings')) return 'Pengaturan';
    // Role-specific
    if (role === 'PASAR_HEWAN') {
      if (path.startsWith('/ternak')) return 'Inventaris';
      if (path.startsWith('/transfer')) return 'Transfer';
      if (path.startsWith('/health')) return 'Verifikasi Kesehatan';
      return title || roleNiceLabel(role);
    }
    if (role === 'PETERNAK') {
      if (path.startsWith('/sapi')) return 'Data Sapi';
      if (path.startsWith('/daftar-ternak')) return 'Daftarkan Ternak';
      if (path.startsWith('/transaksi')) return 'Transaksi';
      if (path.startsWith('/kesehatan')) return 'Kesehatan';
      return title || roleNiceLabel(role);
    }
    if (role === 'RPH') {
      if (path.startsWith('/penyembelihan')) return 'Penyembelihan';
      if (path.startsWith('/daging')) return 'Daging';
      if (path.includes('verifikasi')) return 'Verifikasi';
      return title || roleNiceLabel(role);
    }
    if (role === 'JAGAL') {
      if (path.startsWith('/transaksi')) return 'Transaksi';
      if (path.startsWith('/health') || path.includes('kesehatan')) return 'Kesehatan';
      return title || roleNiceLabel(role);
    }
    if (role === 'REGULATOR') {
      if (path.includes('/entities') || path.includes('/entitas')) return 'Data Entitas';
      if (path.includes('/sapi')) return 'Data Sapi';
      if (path.includes('/daging')) return 'Data Daging';
      if (path.includes('/transaksi')) return 'Data Transaksi';
      if (path.includes('/items')) return 'Master Item';
      if (path.includes('/qr')) return 'Data QR';
      return title || roleNiceLabel(role);
    }
    return title || roleNiceLabel(role);
  })();
  
  // Set document title when component mounts or title changes
  useEffect(() => {
    const baseTitle = "HATS - Halal Traceability System";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Global top bar removed across roles; date/title/profile moved into content bar */}

      {/* Sidebar Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <div className={`bg-white w-64 shadow-lg fixed md:static inset-y-0 left-0 transform z-40 transition duration-300 mt-0 h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <nav className="p-4 h-full flex flex-col border-r border-gray-100">
          {/* Sidebar header for clarity (system + role) */}
          <div className="mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fas fa-shield-halved text-xl"></i>
            </div>
            <div className="text-left w-full">
              <div className="text-xl font-extrabold text-blue-600 tracking-wide">HTTS</div>
              <div className="text-[11px] text-gray-500">Halal Traceability • {roleNiceLabel(role)}</div>
            </div>
          </div>
          {customSidebar ? (
            // Wrap custom sidebars in a flex column so their internal ul.flex-1 + bottom section pin correctly
            <div className="flex-1 flex flex-col min-h-0">{customSidebar}</div>
          ) : (
            <>
              <ul className="space-y-2 flex-1 overflow-y-auto">
                <li>
                  <Link to={`${basePath}/dashboard`} className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive(`${basePath}/dashboard`) ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                    <i className="fas fa-tachometer-alt mr-3"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                
                {role === 'PETERNAK' && (
                  <>
                    <li>
                      <Link to="/peternak/sapi" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/peternak/sapi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-cow mr-3"></i>
                        <span>Data Sapi</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/peternak/daftar-ternak" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/peternak/daftar-ternak') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-plus-circle mr-3"></i>
                        <span>Daftarkan Ternak</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/peternak/transaksi" 
                        className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/peternak/transaksi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}
                        onClick={() => {
                          localStorage.setItem('transactionAuth', 'true');
                          localStorage.setItem('fromSidebar', 'true');
                        }}
                      >
                        <i className="fas fa-exchange-alt mr-3"></i>
                        <span>Transaksi</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/peternak/kesehatan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/peternak/kesehatan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-stethoscope mr-3"></i>
                        <span>Kesehatan Ternak</span>
                      </Link>
                    </li>
                  </>
                )}
                
                {role === 'RPH' && (
                  <>
                    <li>
                      <Link to="/rph/penyembelihan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/penyembelihan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-cut mr-3"></i>
                        <span>Penyembelihan</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/rph/daging" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/daging') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-drumstick-bite mr-3"></i>
                        <span>Daging</span>
                      </Link>
                    </li>
                  </>
                )}

                {role === 'PASAR_HEWAN' && (
                  <>
                    <li>
                      <Link to="/pasarhewan/ternak" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/pasarhewan/ternak') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-box-archive mr-3"></i>
                        <span>Inventaris</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/pasarhewan/transfer" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/pasarhewan/transfer') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-right-left mr-3"></i>
                        <span>Transfer</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/pasarhewan/health" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/pasarhewan/health') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                        <i className="fas fa-clipboard-check mr-3"></i>
                        <span>Verifikasi Kesehatan</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Bottom section: Profil, Pengaturan, Logout */}
              <div className="pt-4 border-t">
                <ul className="space-y-2">
                  {role === 'PASAR_HEWAN' ? (
                    <>
                      <li>
                        <Link to="/pasarhewan/profile" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/pasarhewan/profile') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                          <i className="fas fa-user mr-3"></i>
                          <span>Profil</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/pasarhewan/settings" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/pasarhewan/settings') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                          <i className="fas fa-cog mr-3"></i>
                          <span>Pengaturan</span>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to={`/${role.toLowerCase()}/profil`} className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive(`/${role.toLowerCase()}/profil`) ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                          <i className="fas fa-user mr-3"></i>
                          <span>Profil</span>
                        </Link>
                      </li>
                      <li>
                        <Link to={`/${role.toLowerCase()}/pengaturan`} className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive(`/${role.toLowerCase()}/pengaturan`) ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
                          <i className="fas fa-cog mr-3"></i>
                          <span>Pengaturan</span>
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <LogoutButton />
                  </li>
                </ul>
              </div>
            </>
          )}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
  <main className={`flex-1 overflow-y-auto px-4 md:px-6 pt-6 pb-8`}>
          {/* Extra top info bar for PASAR_HEWAN */}
          {
            <div className="grid grid-cols-3 items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-700 justify-self-start">
                <button className="md:hidden text-gray-500 hover:text-primary" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
                  <i className="fas fa-bars"></i>
                </button>
                <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="text-center justify-self-center">
                <div className="text-xl md:text-2xl font-bold text-blue-600">{activeSectionName}</div>
              </div>
              <div className="flex items-center gap-3 justify-self-end">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">{user ? user.username : 'User'}</div>
                </div>
                <div className="w-9 h-9 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center text-white shadow">
                  {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </div>
          }

          {/* No separate section title; combined in the info bar */}

          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
