import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';

// Transaksi Daging Distributor: mirroring RphTransaksiDaging but using distributor context
const DistributorTransaksiDaging = () => {
  const [daging, setDaging] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dagingId: '', qty: 1, buyerName: '', buyerType: '', date: '', notes: '' });

  useEffect(()=>{
    try { setDaging(JSON.parse(localStorage.getItem('rphDagingLocal')||'[]')); } catch { setDaging([]); }
    try { setTransactions(JSON.parse(localStorage.getItem('distributorTransaksiDaging')||'[]')); } catch { setTransactions([]); }
  },[]);

  const persist = (rows) => localStorage.setItem('distributorTransaksiDaging', JSON.stringify(rows));

  const submit = (e) => {
    e.preventDefault();
    if(!form.dagingId) return;
    const next = [{
      id: 'DD-' + Date.now(),
      dagingId: form.dagingId,
      qty: Number(form.qty)||1,
      buyerName: form.buyerName,
      buyerType: form.buyerType,
      date: form.date || new Date().toISOString().split('T')[0],
      notes: form.notes,
      status: 'pending'
    }, ...transactions];
    setTransactions(next);
    persist(next);
    setShowForm(false);
    setForm({ dagingId:'', qty:1, buyerName:'', buyerType:'', date:'', notes:'' });
  };

  return (
    <DashboardLayout title="Transaksi Daging" role="DISTRIBUTOR" customSidebar={<DistributorSidebar /> }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Daftar Transaksi Daging</h1>
          <button onClick={()=>setShowForm(true)} className="px-3 py-2 bg-primary text-white rounded text-sm"><i className="fas fa-plus mr-2"></i>Transaksi Baru</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Daging</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Pembeli</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-primary">{t.id}</td>
                  <td className="px-4 py-2">{t.dagingId}</td>
                  <td className="px-4 py-2">{t.qty}</td>
                  <td className="px-4 py-2">{t.buyerName}</td>
                  <td className="px-4 py-2">{t.date}</td>
                  <td className="px-4 py-2"><span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">{t.status}</span></td>
                </tr>
              ))}
              {transactions.length===0 && <tr><td colSpan={6} className="px-4 py-6 text-gray-500">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowForm(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Buat Transaksi Daging</h3>
                <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Daging</label>
                    <select value={form.dagingId} onChange={e=>setForm(prev=>({...prev, dagingId:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="">Pilih daging</option>
                      {daging.map(d => <option key={d.dagingId} value={d.dagingId}>{d.dagingId} - {d.sapiId} ({d.berat} kg)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Jumlah</label>
                    <input type="number" min="1" value={form.qty} onChange={e=>setForm(prev=>({...prev, qty:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Nama Pembeli</label>
                    <input value={form.buyerName} onChange={e=>setForm(prev=>({...prev, buyerName:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" placeholder="Nama pembeli" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Tipe Pembeli</label>
                    <select value={form.buyerType} onChange={e=>setForm(prev=>({...prev, buyerType:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="">Pilih tipe</option>
                      <option value="HOREKA">HOREKA</option>
                      <option value="END_CUSTOMER">End Customer</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-600">Catatan</label>
                    <textarea value={form.notes} onChange={e=>setForm(prev=>({...prev, notes:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="Catatan tambahan" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DistributorTransaksiDaging;
