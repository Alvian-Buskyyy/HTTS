import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const API_BASE = 'http://localhost:3000';

const RegulatorItems = () => {
  const [tab, setTab] = useState('halal');
  const [halal, setHalal] = useState([]);
  const [sehat, setSehat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ nama:'', kategori:'ANTEMORTEM', deskripsi:'' });

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/itemHalalSehat`),
        fetch(`${API_BASE}/itemSehat`),
      ]);
      setHalal(await r1.json());
      setSehat(await r2.json());
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const create = async () => {
    if(!newItem.nama.trim()) return;
    setLoading(true);
    try {
      const endpoint = tab==='halal' ? 'itemHalalSehat' : 'itemSehat';
      const body = tab==='halal' ? newItem : { nama:newItem.nama, deskripsi:newItem.deskripsi };
      const r = await fetch(`${API_BASE}/${endpoint}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
      if(!r.ok) throw new Error('Gagal menambah item');
      await load();
      setNewItem({ nama:'', kategori:'ANTEMORTEM', deskripsi:'' });
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  const ItemsList = ({ items, cols }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
            {cols.map((c,i)=> <th key={i} className="px-4 py-2 text-left">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(it => (
            <tr key={it.id}>
              <td className="px-4 py-2 text-primary font-medium">{it.nama}</td>
              {it.kategori && <td className="px-4 py-2">{it.kategori}</td>}
              <td className="px-4 py-2">{it.deskripsi || '-'}</td>
            </tr>
          ))}
          {items.length===0 && <tr><td className="px-4 py-4 text-gray-500" colSpan={cols.length}>Tidak ada data</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout title="Master Item" role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={()=>setTab('halal')} className={`px-3 py-2 text-sm rounded-md border ${tab==='halal'?'bg-primary text-white border-primary':'hover:bg-gray-50'}`}>Item Halal</button>
            <button onClick={()=>setTab('sehat')} className={`px-3 py-2 text-sm rounded-md border ${tab==='sehat'?'bg-primary text-white border-primary':'hover:bg-gray-50'}`}>Item Sehat</button>
          </div>
          <button onClick={load} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"><i className="fas fa-rotate mr-1"></i>Refresh</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
            ) : tab==='halal' ? (
              <ItemsList items={halal} cols={["Nama","Kategori","Deskripsi"]} />
            ) : (
              <ItemsList items={sehat} cols={["Nama","Deskripsi"]} />
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-semibold mb-2">Tambah Item</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nama</label>
                <input value={newItem.nama} onChange={e=>setNewItem(prev=>({...prev, nama:e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              {tab==='halal' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                  <select value={newItem.kategori} onChange={e=>setNewItem(prev=>({...prev, kategori:e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="ANTEMORTEM">ANTEMORTEM</option>
                    <option value="POSTMORTEM">POSTMORTEM</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>
                <textarea rows={3} value={newItem.deskripsi} onChange={e=>setNewItem(prev=>({...prev, deskripsi:e.target.value}))} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <button onClick={create} disabled={loading || !newItem.nama} className="w-full bg-primary text-white rounded-md py-2 disabled:opacity-60">Tambah</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegulatorItems;
