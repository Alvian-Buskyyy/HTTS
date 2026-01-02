import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../../auth/components/LogoutButton';

const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
  className={`flex items-center p-2 rounded-lg text-gray-800 hover:bg-primaryLight hover:text-primary border-r-4 ${active ? 'bg-primary/10 text-primary border-primary' : 'border-transparent'}`}
    >
      <i className={`${icon} mr-3`}></i>
      <span>{label}</span>
    </Link>
  );
};

const RegulatorSidebar = () => (
  <>
    <ul className="space-y-2 flex-1 overflow-y-auto">
      <li>
        <NavLink to="/regulator/dashboard" icon="fas fa-tachometer-alt" label="Dashboard" />
      </li>
      <li>
        <NavLink to="/regulator/monitoring" icon="fas fa-route" label="Monitoring Rantai Pasok" />
      </li>
      <li>
        <NavLink to="/regulator/report" icon="fas fa-file-alt" label="Monthly Report" />
      </li>
      <li>
        <NavLink to="/regulator/entities" icon="fas fa-building" label="Data Entitas" />
      </li>
      <li>
        <NavLink to="/regulator/sapi" icon="fas fa-cow" label="Data Sapi" />
      </li>
      <li>
        <NavLink to="/regulator/daging" icon="fas fa-drumstick-bite" label="Data Daging" />
      </li>
      <li>
        <NavLink to="/regulator/transaksi" icon="fas fa-exchange-alt" label="Data Transaksi" />
      </li>
      <li>
        <NavLink to="/regulator/items" icon="fas fa-list-check" label="Master Item" />
      </li>
      <li>
        <NavLink to="/regulator/checklist" icon="fas fa-clipboard-check" label="Checklist Halal" />
      </li>
      <li>
        <NavLink to="/regulator/verifikasi-halal" icon="fas fa-shield-halved" label="Verifikasi Halal" />
      </li>
      <li>
        <NavLink to="/regulator/qr" icon="fas fa-qrcode" label="QR Records" />
      </li>
    </ul>
    <div className="pt-4 border-t">
      <ul className="space-y-2">
        <li>
          <NavLink to="/regulator/profil" icon="fas fa-user" label="Profil" />
        </li>
        <li>
          <NavLink to="/regulator/pengaturan" icon="fas fa-cog" label="Pengaturan" />
        </li>
        <li>
          <LogoutButton />
        </li>
      </ul>
    </div>
  </>
);

export default RegulatorSidebar;
