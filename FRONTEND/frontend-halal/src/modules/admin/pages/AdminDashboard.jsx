import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';
import SupplyChainTracker from '../../peternak/components/SupplyChainTracker';

const API_BASE = 'http://localhost:3000';

const Stat = ({ icon, title, value, color = 'text-blue-600 bg-blue-100' }) => (
  <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4 border border-gray-100">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <i className={`${icon} text-xl`}></i>
    </div>
    <div className="text-left">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ users: 0, sapi: 0, daging: 0, tPenyembelihan: 0, tPenjualan: 0 });
  const [error, setError] = useState('');
  const [cattleOptions, setCattleOptions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Minimal fetches. If endpoints unavailable, fall back to 0.
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const safeFetch = async (url) => {
          try { const r = await fetch(url, { headers }); if (!r.ok) throw new Error('x'); const j = await r.json(); return Array.isArray(j) ? j.length : (j?.data?.length || 0); } catch { return 0; }
        };
        const [users, sapi, daging, tPenyembelihan, tPenjualan] = await Promise.all([
          safeFetch(`${API_BASE}/users`),
          safeFetch(`${API_BASE}/sapi`),
          safeFetch(`${API_BASE}/daging`),
          safeFetch(`${API_BASE}/transaksiPenyembelihan`),
          safeFetch(`${API_BASE}/transaksiPenjualan`),
        ]);
        setCounts({ users, sapi, daging, tPenyembelihan, tPenjualan });
        // Ambil sebagian data sapi untuk tracker rantai pasok
        try {
          const listRes = await fetch(`${API_BASE}/sapi`, { headers });
          if (listRes.ok) {
            const list = await listRes.json();
            const arr = (Array.isArray(list) ? list : (list?.data || []))
              .slice(0, 20)
              .map(s => ({ id: s.id }));
            setCattleOptions(arr);
          }
        } catch {}
      } catch (e) {
        setError('Gagal memuat ringkasan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout role="ADMIN" customSidebar={<AdminSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-2 p-4 md:p-6 space-y-8">
          {/* Header rata kiri */}
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Ringkasan sistem dan pantauan rantai pasok secara realtime.</p>
          </div>
          {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            <Stat icon="fas fa-users" title="Users" value={counts.users} color="text-purple-600 bg-purple-100" />
            <Stat icon="fas fa-cow" title="Sapi" value={counts.sapi} color="text-green-600 bg-green-100" />
            <Stat icon="fas fa-drumstick-bite" title="Daging" value={counts.daging} color="text-rose-600 bg-rose-100" />
            <Stat icon="fas fa-cut" title="Penyembelihan" value={counts.tPenyembelihan} color="text-yellow-700 bg-yellow-100" />
            <Stat icon="fas fa-exchange-alt" title="Penjualan" value={counts.tPenjualan} color="text-blue-600 bg-blue-100" />
          </div>

          {/* Live supply chain tracker */}
          <SupplyChainTracker cattleOptions={cattleOptions} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-clipboard-list text-primary"></i> Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[{to:'/admin/users',icon:'fa-users',t:'Kelola Users'},{to:'/admin/entities',icon:'fa-building',t:'Kelola Entitas'},{to:'/admin/items',icon:'fa-list-check',t:'Master Item'},{to:'/admin/sapi',icon:'fa-cow',t:'Data Sapi'},{to:'/admin/transaksi',icon:'fa-exchange-alt',t:'Data Transaksi'},{to:'/admin/qr',icon:'fa-qrcode',t:'QR Records'}].map(x=> (
                <a key={x.to} href={x.to} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <i className={`fas ${x.icon}`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{x.t}</p>
                      <p className="text-xs text-gray-500">Navigasi cepat</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
