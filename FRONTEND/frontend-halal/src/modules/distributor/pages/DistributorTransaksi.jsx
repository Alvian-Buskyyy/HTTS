import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';

const DistributorTransaksi = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [filter, setFilter] = useState('all');
  const [dagingList, setDagingList] = useState([]);
  const [dagingTx, setDagingTx] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dagingId:'', qty:1, date:'', notes:'', buyerType:'', buyerId:'', buyerName:'' });

  // Dynamic entity options similar to RPH
  const [entityOptions, setEntityOptions] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState('');

  useEffect(()=>{
    try { setDagingList(JSON.parse(localStorage.getItem('rphDagingLocal')||'[]')); } catch { setDagingList([]); }
    try { setDagingTx(JSON.parse(localStorage.getItem('distributorTransaksiDaging')||'[]')); } catch { setDagingTx([]); }
  },[]);

  useEffect(()=>{
    const API_BASE = 'http://localhost:3000';
    const fetchAllEntities = async () => {
      try {
        setEntitiesLoading(true); setEntitiesError('');
        const endpoints = [
          { url: `${API_BASE}/peternak`, type: 'PETERNAK', nameKey: 'nama' },
          { url: `${API_BASE}/pasarHewan`, type: 'PASAR_HEWAN', nameKey: 'nama' },
          { url: `${API_BASE}/jagal`, type: 'JAGAL', nameKey: 'nama' },
          { url: `${API_BASE}/rph`, type: 'RPH', nameKey: 'nama' },
          { url: `${API_BASE}/distributor`, type: 'DISTRIBUTOR', nameKey: 'namaUsaha' },
          { url: `${API_BASE}/horeka`, type: 'HOREKA', nameKey: 'nama' },
          { url: `${API_BASE}/endCustomer`, type: 'END_CUSTOMER', nameKey: 'nama' },
        ];
        const results = await Promise.allSettled(endpoints.map(async ep => {
          const res = await fetch(ep.url);
          if(!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return data.map(item => ({ id:item.id, name:item[ep.nameKey] || item.nama || item.namaUsaha || '—', type: ep.type }));
        }));
        const combined = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value).sort((a,b)=> a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        setEntityOptions(combined);
      } catch(e) {
        setEntitiesError('Gagal memuat entitas');
      } finally {
        setEntitiesLoading(false);
      }
    };
    fetchAllEntities();
  },[]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!form.dagingId) return;
    const payload = { id:'DTX-'+Date.now(), ...form, qty: Number(form.qty)||1, date: form.date || new Date().toISOString().split('T')[0], status:'pending', verificationStatus:'waiting_buyer' };
    const updated = [payload, ...dagingTx];
    setDagingTx(updated);
    localStorage.setItem('distributorTransaksiDaging', JSON.stringify(updated));
    setShowForm(false);
    setForm({ dagingId:'', qty:1, date:'', notes:'', buyerType:'', buyerId:'', buyerName:'' });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID');
  const list = dagingTx.filter(t=> filter==='all'? true : t.status===filter);
  const getStatusBadge = (s)=> s==='verified'? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>: s==='pending'? <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu</span>: <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{s}</span>;

  const truncateCid = (cid, left=8, right=8) => {
    if(!cid) return '';
    return cid.length > left + right ? `${cid.slice(0,left)}...${cid.slice(-right)}` : cid;
  };

  // Verification (buyer side) for Distributor sending to HOREKA
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const handleRequestVerification = (id) => {
    const tx = dagingTx.find(t=>t.id===id);
    if(!tx) return;
    setVerifyingTx(tx);
    setVerifyCode(''); setVerifyError(''); setVerifySuccess('');
    if(!tx.verify || !tx.verify.code){
      const code = (Math.floor(100000 + Math.random() * 900000)).toString();
      const updated = dagingTx.map(t=> t.id===id? { ...t, verify:{ sellerSigned:true, buyerSigned:false, code }, verificationStatus:'waiting_buyer' }: t);
      setDagingTx(updated); localStorage.setItem('distributorTransaksiDaging', JSON.stringify(updated));
      setVerifyingTx({ ...tx, verify:{ sellerSigned:true, buyerSigned:false, code }});
    }
    setShowVerifyModal(true);
  };
  const handleCopyCode = async () => {
    if(!verifyingTx?.verify?.code) return; try{ await navigator.clipboard.writeText(verifyingTx.verify.code); setVerifySuccess('Kode disalin'); setTimeout(()=>setVerifySuccess(''),1200);}catch{ setVerifyError('Gagal menyalin'); setTimeout(()=>setVerifyError(''),1500);} }
  const handleConfirm = () => {
    if(!verifyingTx) return; const expected = verifyingTx.verify?.code||''; if(verifyCode.trim()!==expected){ setVerifyError('Kode tidak cocok'); return; }
    const updated = dagingTx.map(t=> t.id===verifyingTx.id? { ...t, verificationStatus:'verified', status:'verified', verify:{ ...(t.verify||{}), buyerSigned:true }, blockchainHash: t.blockchainHash || '0x'+Math.random().toString(16).slice(2,10)+'...'+Math.random().toString(16).slice(2,10) }: t);
    setDagingTx(updated); localStorage.setItem('distributorTransaksiDaging', JSON.stringify(updated)); setVerifySuccess('Terverifikasi'); setTimeout(()=>{ setShowVerifyModal(false); setVerifyingTx(null); setVerifyCode(''); setVerifySuccess(''); }, 900);
  };
  const handleReject = () => { if(!verifyingTx) return; if(!window.confirm('Tolak verifikasi transaksi ini?')) return; const updated = dagingTx.map(t=> t.id===verifyingTx.id? { ...t, verificationStatus:'rejected' }: t); setDagingTx(updated); localStorage.setItem('distributorTransaksiDaging', JSON.stringify(updated)); setShowVerifyModal(false); setVerifyingTx(null); setVerifyCode(''); setVerifyError(''); setVerifySuccess(''); };

  return (
    <DashboardLayout title="Transaksi" role="DISTRIBUTOR" customSidebar={<DistributorSidebar /> }>
      <div className="mt-4 min-h-[70vh] overflow-y-auto pr-1">
        <div className="flex border-b border-gray-200 mb-8 gap-2">
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'sales' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => setActiveTab('sales')}>Transaksi Penjualan</button>
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'verification' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => setActiveTab('verification')}>Verifikasi Transaksi</button>
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => setActiveTab('history')}>Riwayat Transaksi</button>
        </div>

        {activeTab==='sales' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Transaksi Penjualan Daging</h1>
              <div className="flex items-center gap-2">
                <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="all">Semua</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Terverifikasi</option>
                </select>
                <button onClick={()=>setShowForm(true)} className="px-3 py-2 bg-primary text-white rounded text-sm"><i className="fas fa-plus mr-2"></i>Transaksi Baru</button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">CID</th>
                    <th className="px-4 py-2">Pembeli</th>
                    <th className="px-4 py-2">Daging</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-primary">{t.id}</td>
                      <td className="px-4 py-2">{formatDate(t.date)}</td>
                      <td className="px-4 py-2">
                        {t.cid ? (
                          <a href={`https://ipfs.io/ipfs/${t.cid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title={t.cid}>{truncateCid(t.cid,8,8)}</a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{t.buyerName || '-'}</td>
                      <td className="px-4 py-2">{t.dagingId}</td>
                      <td className="px-4 py-2">{t.qty}</td>
                      <td className="px-4 py-2">{getStatusBadge(t.status)}</td>
                    </tr>
                  ))}
                  {list.length===0 && <tr><td colSpan={7} className="px-4 py-6 text-gray-500">Belum ada transaksi.</td></tr>}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowForm(false)}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={e=>e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Transaksi Baru</h3>
                    <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Daging</label>
                        <select value={form.dagingId} onChange={e=>setForm(prev=>({...prev, dagingId:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm">
                          <option value="">Pilih daging</option>
                          {dagingList.map(d => <option key={d.dagingId} value={d.dagingId}>{d.dagingId} - {d.sapiId} ({d.berat} kg)</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Jumlah</label>
                        <input type="number" min="1" value={form.qty} onChange={e=>setForm(prev=>({...prev, qty:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Pembeli</label>
                        <select value={form.buyerId? `${form.buyerType}:${form.buyerId}` : (form.buyerType==='LAINNYA'?'LAINNYA':'')} onChange={e=>{
                          const val = e.target.value;
                          if(val==='LAINNYA'){
                            setForm(prev=>({...prev, buyerType:'LAINNYA', buyerId:'', buyerName:''}));
                          } else if(val){
                            const [type,id] = val.split(':');
                            const ent = entityOptions.find(o=>`${o.type}:${o.id}`===val);
                            setForm(prev=>({...prev, buyerType:type, buyerId:id, buyerName:ent?.name || ''}));
                          } else {
                            setForm(prev=>({...prev, buyerType:'', buyerId:'', buyerName:''}));
                          }
                        }} className="w-full border rounded px-3 py-2 text-sm">
                          <option value="">Pilih pembeli</option>
                          {entityOptions.map(ent => (
                            <option key={`${ent.type}-${ent.id}`} value={`${ent.type}:${ent.id}`}>{ent.type} - {ent.name}</option>
                          ))}
                          <option value="LAINNYA">Lainnya</option>
                        </select>
                      </div>
                      {form.buyerType==='LAINNYA' && (
                        <div>
                          <label className="text-xs text-gray-600">Nama Pembeli (Lainnya)</label>
                          <input value={form.buyerName} onChange={e=>setForm(prev=>({...prev, buyerName:e.target.value}))} className="w-full border rounded px-3 py-2 text-sm" placeholder="Masukkan nama pembeli" />
                        </div>
                      )}
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
        )}

        {activeTab==='verification' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Verifikasi Transaksi Daging</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{dagingTx.filter(t => t.verificationStatus === 'waiting_buyer').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Terverifikasi</p>
                <p className="text-2xl font-semibold text-green-600">{dagingTx.filter(t => t.verificationStatus === 'verified').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-red-600">{dagingTx.filter(t => t.verificationStatus === 'rejected').length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dagingTx.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{t.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(t.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.buyerName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.dagingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getStatusBadge(t.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {(t.verificationStatus === 'waiting_buyer' || !t.verificationStatus) && (
                            <>
                              <button className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10" onClick={() => handleRequestVerification(t.id)}>Verifikasi Bersama</button>
                              <button className="text-red-500 hover:text-red-700 text-xs" onClick={() => { setVerifyingTx(t); setShowVerifyModal(true); }}>Tolak</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showVerifyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowVerifyModal(false)}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Verifikasi Transaksi</h3>
                    <button onClick={()=>setShowVerifyModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
                  </div>
                  {verifyingTx && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 border rounded">
                        <div className="text-xs text-gray-500">Kode Verifikasi</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-mono tracking-widest">{verifyingTx.verify?.code || '-'}</div>
                          <button type="button" onClick={handleCopyCode} className="text-xs px-2 py-1 border rounded hover:bg-gray-100"><i className="fas fa-copy mr-1"></i>Salin</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Masukkan Kode dari Pembeli</label>
                        <input value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="6 digit" />
                      </div>
                      {verifyError && <div className="text-xs text-red-600">{verifyError}</div>}
                      {verifySuccess && <div className="text-xs text-green-600">{verifySuccess}</div>}
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={handleReject} className="px-3 py-2 border rounded text-sm text-red-600 border-red-300 hover:bg-red-50">Tolak</button>
                        <button onClick={handleConfirm} className="px-3 py-2 bg-primary text-white rounded text-sm">Konfirmasi</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==='history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dagingTx
                    .filter(t => t.status === 'completed' || t.status === 'cancelled')
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{t.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(t.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.buyerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.dagingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getStatusBadge(t.status)}</td>
                      </tr>
                    ))}
                  {dagingTx.filter(t => t.status === 'completed' || t.status === 'cancelled').length===0 && (
                    <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>Belum ada riwayat transaksi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DistributorTransaksi;
