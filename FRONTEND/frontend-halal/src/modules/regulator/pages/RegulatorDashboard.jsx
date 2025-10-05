import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';
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

const RegulatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ sapi: 0, daging: 0, tPenyembelihan: 0, tPenjualan: 0 });
  const [cattleOptions, setCattleOptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const safeFetch = async (url) => {
          try { const r = await fetch(url); if (!r.ok) throw new Error('x'); const j = await r.json(); return Array.isArray(j) ? j.length : (j?.data?.length || 0); } catch { return 0; }
        };
        const [sapi, daging, tPenyembelihan, tPenjualan] = await Promise.all([
          safeFetch(`${API_BASE}/sapi`),
          safeFetch(`${API_BASE}/daging`),
          safeFetch(`${API_BASE}/transaksiPenyembelihan`),
          safeFetch(`${API_BASE}/transaksiPenjualan`),
        ]);
        setCounts({ sapi, daging, tPenyembelihan, tPenjualan });
        // Ambil sebagian data sapi untuk tracker rantai pasok
        try {
          const listRes = await fetch(`${API_BASE}/sapi`);
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
    <DashboardLayout role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-2 p-4 md:p-6 space-y-8">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Regulator</h1>
            <p className="text-sm text-gray-500">Pantau sistem rantai pasok halal secara realtime.</p>
          </div>
          {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Stat icon="fas fa-cow" title="Sapi" value={counts.sapi} color="text-green-600 bg-green-100" />
            <Stat icon="fas fa-drumstick-bite" title="Daging" value={counts.daging} color="text-rose-600 bg-rose-100" />
            <Stat icon="fas fa-cut" title="Penyembelihan" value={counts.tPenyembelihan} color="text-yellow-700 bg-yellow-100" />
            <Stat icon="fas fa-exchange-alt" title="Penjualan" value={counts.tPenjualan} color="text-blue-600 bg-blue-100" />
          </div>
          <SupplyChainTracker cattleOptions={cattleOptions} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegulatorDashboard;
