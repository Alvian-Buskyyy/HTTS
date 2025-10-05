import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const API_BASE = 'http://localhost:3000';

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-2 text-sm rounded-md border ${active? 'bg-primary text-white border-primary':'hover:bg-gray-50'}`}>{children}</button>
);

const RegulatorTransaksi = () => {
  const [tab, setTab] = useState('penyembelihan');
  const [rows1, setRows1] = useState([]);
  const [rows2, setRows2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/transaksiPenyembelihan`),
        fetch(`${API_BASE}/transaksiPenjualan`),
      ]);
      const j1 = await r1.json();
      const j2 = await r2.json();
      setRows1(Array.isArray(j1)? j1 : (j1?.data || []));
      setRows2(Array.isArray(j2)? j2 : (j2?.data || []));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const filterFn = (x) => !q || Object.values(x).some(v => (v+''||'').toLowerCase().includes(q.toLowerCase()));
  const f1 = useMemo(()=> rows1.filter(filterFn), [rows1, q]);
  const f2 = useMemo(()=> rows2.filter(filterFn), [rows2, q]);

  return (
    <DashboardLayout title="Data Transaksi" role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <TabButton active={tab==='penyembelihan'} onClick={()=>setTab('penyembelihan')}>Penyembelihan</TabButton>
            <TabButton active={tab==='penjualan'} onClick={()=>setTab('penjualan')}>Penjualan</TabButton>
          </div>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cari..." className="border rounded-md px-3 py-2 text-sm" />
            <button onClick={load} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"><i className="fas fa-rotate mr-1"></i>Refresh</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
        ) : tab==='penyembelihan' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Sapi</th>
                  <th className="px-4 py-2 text-left">Penyembelih</th>
                  <th className="px-4 py-2 text-left">Penerima</th>
                  <th className="px-4 py-2 text-left">CID</th>
                  <th className="px-4 py-2 text-left">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {f1.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-left text-primary font-medium">{r.id}</td>
                    <td className="px-4 py-2 text-left">{r.sapiId}</td>
                    <td className="px-4 py-2 text-left">{r.penyembelihType} - {r.penyembelihId}</td>
                    <td className="px-4 py-2 text-left">{r.penerimaType} - {r.penerimaId}</td>
                    <td className="px-4 py-2 text-left">
                      {r.cid ? (
                        <a className="text-blue-600 hover:underline" href={`https://ipfs.io/ipfs/${r.cid}`} target="_blank" rel="noreferrer">
                          {String(r.cid).slice(0,6)}...{String(r.cid).slice(-6)}
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-2 text-left">{new Date(r.timestamp).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {f1.length===0 && <tr><td className="px-4 py-4 text-gray-500" colSpan={6}>Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Jenis</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Penjual</th>
                  <th className="px-4 py-2 text-left">Pembeli</th>
                  <th className="px-4 py-2 text-left">CID</th>
                  <th className="px-4 py-2 text-left">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {f2.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-left text-primary font-medium">{r.id}</td>
                    <td className="px-4 py-2 text-left">{r.type}</td>
                    <td className="px-4 py-2 text-left">{r.jumlahQty}</td>
                    <td className="px-4 py-2 text-left">{r.penjualType} - {r.penjualId}</td>
                    <td className="px-4 py-2 text-left">{r.pembeliType} - {r.pembeliId}</td>
                    <td className="px-4 py-2 text-left">
                      {r.cid ? (
                        <a className="text-blue-600 hover:underline" href={`https://ipfs.io/ipfs/${r.cid}`} target="_blank" rel="noreferrer">
                          {String(r.cid).slice(0,6)}...{String(r.cid).slice(-6)}
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-2 text-left">{new Date(r.timestamp).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {f2.length===0 && <tr><td className="px-4 py-4 text-gray-500" colSpan={7}>Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegulatorTransaksi;
