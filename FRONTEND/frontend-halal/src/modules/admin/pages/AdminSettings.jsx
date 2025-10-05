import React, { useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';

const AdminSettings = () => {
  const [apiBase, setApiBase] = useState(localStorage.getItem('apiBase') || 'http://localhost:3000');

  const save = () => {
    localStorage.setItem('apiBase', apiBase);
    alert('Disimpan. Muat ulang aplikasi untuk menerapkan.');
  };

  return (
    <DashboardLayout title="Pengaturan" role="ADMIN" customSidebar={<AdminSidebar /> }>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-xl space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">API Base URL</label>
          <input value={apiBase} onChange={e=>setApiBase(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <p className="text-xs text-gray-500 mt-1">Ubah bila backend berjalan di host/port berbeda.</p>
        </div>
        <button onClick={save} className="px-4 py-2 bg-primary text-white rounded-md">Simpan</button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
