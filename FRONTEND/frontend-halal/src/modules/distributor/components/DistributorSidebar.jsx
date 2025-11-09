import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../../auth/components/LogoutButton';

const DistributorSidebar = () => {
  const location = useLocation();
  const isActive = (to) => location.pathname.startsWith(to);
  return (
    <>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        <li>
          <Link to="/distributor/dashboard" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/distributor/dashboard') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
            <i className="fas fa-tachometer-alt mr-3"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/distributor/transaksi" 
            className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/distributor/transaksi') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}
            onClick={() => {
              localStorage.setItem('transactionAuth', 'true');
              localStorage.setItem('fromSidebar', 'true');
            }}
          >
            <i className="fas fa-exchange-alt mr-3"></i>
            <span>Transaksi</span>
          </Link>
        </li>
      </ul>
      <div className="pt-4 border-t">
        <ul className="space-y-2">
          <li>
            <Link to="/distributor/profil" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/distributor/profil') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
              <i className="fas fa-user mr-3"></i>
              <span>Profil</span>
            </Link>
          </li>
          <li>
            <Link to="/distributor/pengaturan" className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${isActive('/distributor/pengaturan') ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}>
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

export default DistributorSidebar;
