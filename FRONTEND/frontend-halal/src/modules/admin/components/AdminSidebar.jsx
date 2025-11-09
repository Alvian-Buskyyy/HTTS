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

const AdminSidebar = () => {
  return (
    <>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        <li>
          <NavLink to="/admin/dashboard" icon="fas fa-tachometer-alt" label="Dashboard" />
        </li>
        <li>
          <NavLink to="/admin/users" icon="fas fa-users" label="Users" />
        </li>
        <li>
          <NavLink to="/admin/entities" icon="fas fa-building" label="Entitas" />
        </li>
        <li>
          <NavLink to="/admin/sapi" icon="fas fa-cow" label="Sapi" />
        </li>
        <li>
          <NavLink to="/admin/daging" icon="fas fa-drumstick-bite" label="Daging" />
        </li>
        <li>
          <NavLink to="/admin/transaksi" icon="fas fa-exchange-alt" label="Transaksi" />
        </li>
        <li className="pt-2">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Master</p>
        </li>
        <li>
          <NavLink to="/admin/items" icon="fas fa-list-check" label="Item Sehat & Halal" />
        </li>
        <li>
          <NavLink to="/admin/qr" icon="fas fa-qrcode" label="QR" />
        </li>
      </ul>
      <div className="pt-4 border-t">
        <ul className="space-y-2">
          <li>
            <NavLink to="/admin/profil" icon="fas fa-user" label="Profil" />
          </li>
          <li>
            <NavLink to="/admin/pengaturan" icon="fas fa-cog" label="Pengaturan" />
          </li>
          <li>
            <LogoutButton />
          </li>
        </ul>
      </div>
    </>
  );
};

export default AdminSidebar;
