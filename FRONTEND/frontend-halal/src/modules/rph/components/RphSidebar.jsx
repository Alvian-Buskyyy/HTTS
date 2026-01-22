import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../../auth/components/LogoutButton';

const RphSidebar = () => {
  const location = useLocation();
  const isActive = (to) => location.pathname.startsWith(to);
  return (
    <>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        <li>
          <Link to="/rph/dashboard" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/dashboard') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-tachometer-alt mr-3"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/rph/sapi" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/sapi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-cow mr-3"></i>
            <span>Data Sapi</span>
          </Link>
        </li>
        <li>
          <Link to="/rph/proses-penyembelihan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/proses-penyembelihan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-clipboard-check mr-3"></i>
            <span>Proses Penyembelihan</span>
          </Link>
        </li>
        <li>
          <Link to="/rph/operasi" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/operasi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-cut mr-3"></i>
            <span>Operasi Pemotongan</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/rph/transaksi" 
            className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/transaksi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}
            onClick={() => {
              localStorage.setItem('transactionAuth', 'true');
              localStorage.setItem('fromSidebar', 'true');
            }}
          >
            <i className="fas fa-exchange-alt mr-3"></i>
            <span>Transaksi</span>
          </Link>
        </li>
        <li className="pt-2">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Verifikasi</p>
        </li>
        <li>
          <Link to="/rph/verifikasi-sehat" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/verifikasi-sehat') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-heartbeat mr-3"></i>
            <span>Verifikasi Sehat</span>
          </Link>
        </li>
        <li>
          <Link to="/rph/verifikasi-halal" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/verifikasi-halal') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-check-circle mr-3"></i>
            <span>Verifikasi Halal</span>
          </Link>
        </li>
        <li className="pt-2">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tracking</p>
        </li>
        <li>
          <Link to="/rph/tracking" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/tracking') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-qrcode mr-3"></i>
            <span>QR Tracking</span>
          </Link>
        </li>
        <li>
          {/* Kesehatan digabung ke Verifikasi Sehat - link dihapus */}
        </li>
      </ul>
      <div className="pt-4 border-t">
        <ul className="space-y-2">
          <li>
            <Link to="/rph/profil" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/profil') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
              <i className="fas fa-user mr-3"></i>
              <span>Profil</span>
            </Link>
          </li>
          <li>
            <Link to="/rph/pengaturan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/rph/pengaturan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
              <i className="fas fa-cog mr-3"></i>
              <span>Pengaturan</span>
            </Link>
          </li>
          <li>
            <LogoutButton />
          </li>
        </ul>
      </div>
    </>
  );
};

export default RphSidebar;
