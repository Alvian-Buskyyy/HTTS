import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE = 'http://localhost:3000';

const AdminQR = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/qr`);
      const j = await r.json();
      setRows(Array.isArray(j)? j : (j?.data || []));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const filtered = useMemo(()=> rows.filter(x => !q || (x.sapiId||'').toLowerCase().includes(q.toLowerCase()) || (x.dagingId||'').toLowerCase().includes(q.toLowerCase())), [rows, q]);

  return (
    <DashboardLayout title="Data QR" role="ADMIN" customSidebar={<AdminSidebar /> }>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">QR Records</h2>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cari Sapi/Daging ID" className="border rounded-md px-3 py-2 text-sm" />
            <button onClick={load} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"><i className="fas fa-rotate mr-1"></i>Refresh</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Sapi ID</th>
                  <th className="px-4 py-2 text-left">Daging ID</th>
                  <th className="px-4 py-2 text-left">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-primary font-medium">{r.id}</td>
                    <td className="px-4 py-2">{r.sapiId || '-'}</td>
                    <td className="px-4 py-2">{r.dagingId || '-'}</td>
                    <td className="px-4 py-2"><a className="text-blue-600 hover:underline" href={r.urlQR} target="_blank" rel="noreferrer">{r.urlQR}</a></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td className="px-4 py-4 text-gray-500" colSpan={4}>Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminQR;
