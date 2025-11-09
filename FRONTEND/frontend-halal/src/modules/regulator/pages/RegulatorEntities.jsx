import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const API_BASE = 'http://localhost:3000';
const sections = [
  { key:'peternak', title:'Peternak', url:'/peternak' },
  { key:'pasarHewan', title:'Pasar Hewan', url:'/pasarHewan' },
  { key:'jagal', title:'Jagal', url:'/jagal' },
  { key:'rph', title:'RPH', url:'/rph' },
  { key:'distributor', title:'Distributor', url:'/distributor' },
  { key:'horeka', title:'Horeka', url:'/horeka' },
  { key:'regulator', title:'Regulator', url:'/regulator' },
];

const RegulatorEntities = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ (async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const results = {};
    for(const s of sections){
      try {
        const r = await fetch(`${API_BASE}${s.url}`, { headers });
        const j = await r.json();
        results[s.key] = Array.isArray(j)? j : (j?.data || []);
      } catch {
        results[s.key] = [];
      }
    }
    setData(results);
    setLoading(false);
  })(); }, []);

  return (
    <DashboardLayout title="Data Entitas" role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sections.map(sec => (
            <div key={sec.key} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-building text-primary"></i> {sec.title}
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{(data[sec.key]||[]).length} data</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {(data[sec.key]||[]).slice(0,10).map((row) => (
                  <div key={row.id} className="py-2 border-b last:border-b-0">
                    <div className="text-sm font-medium text-gray-800">{row.nama || row.namaUsaha || row.id}</div>
                    <div className="text-[11px] text-gray-500">{row.alamat || row.instansi || '-'}</div>
                  </div>
                ))}
                {(data[sec.key]||[]).length === 0 && <div className="text-sm text-gray-500">Tidak ada data</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RegulatorEntities;
