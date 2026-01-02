import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../../auth/components/LogoutButton';

const JagalSidebar = () => {
  const location = useLocation();
  const isActive = (to) => location.pathname.startsWith(to);
  return (
    <>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        <li>
          <Link to="/jagal/dashboard" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/dashboard') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-tachometer-alt mr-3"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/jagal/sapi" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/sapi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-cow mr-3"></i>
            <span>Data Sapi</span>
          </Link>
        </li>
        <li>
          <Link to="/jagal/daftar-ternak" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/daftar-ternak') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-plus-circle mr-3"></i>
            <span>Daftarkan Ternak</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/jagal/transaksi" 
            className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/transaksi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}
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
          <Link to="/jagal/penyembelihan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/penyembelihan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-cut mr-3"></i>
            <span>Penyembelihan</span>
          </Link>
        </li>
        <li>
          <Link to="/jagal/daging" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/daging') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-drumstick-bite mr-3"></i>
            <span>Data Daging</span>
          </Link>
        </li>
        <li>
          <Link to="/jagal/kesehatan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-stethoscope mr-3"></i>
            <span>Kesehatan Ternak</span>
          </Link>
        </li>
      </ul>

      <div className="pt-4 border-t">
        <ul className="space-y-2">
          <li>
            <Link to="/jagal/profil" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/profil') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
              <i className="fas fa-user mr-3"></i>
              <span>Profil</span>
            </Link>
          </li>
          <li>
            <Link to="/jagal/pengaturan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/jagal/pengaturan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
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

export default JagalSidebar;
