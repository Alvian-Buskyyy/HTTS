import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RphSidebar from '../components/RphSidebar';

// Halaman Operasi Pemotongan RPH - skeleton fungsional mengacu schema Prisma
// Penyimpanan sementara menggunakan localStorage: rphBatches, rphOperations

const STORAGE_KEYS = {
  batches: 'rphBatches',
  operations: 'rphOperations',
  daging: 'rphDagingLocal' // penyimpanan sementara hasil konversi
};

const loadLS = (key, fallback=[]) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};
const saveLS = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); };

const statusBadge = (status) => {
  const map = {
    TERJADWAL: 'bg-gray-100 text-gray-700',
    BERLANGSUNG: 'bg-blue-100 text-blue-700',
    SELESAI: 'bg-green-100 text-green-700',
    DIBATALKAN: 'bg-red-100 text-red-700'
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[status]||'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const RphOperasi = () => {
  const [cattle, setCattle] = useState([]); // sapi siap potong (mock filter healthStatus === sehat & available)
  const [batches, setBatches] = useState([]);
  const [operations, setOperations] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedForBatch, setSelectedForBatch] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null); // for assign sapi ke batch
  const [filterText, setFilterText] = useState('');
  const [newBatch, setNewBatch] = useState({ tanggal: '', waktu: '', juleha: '', penyembelih: '' });
  const [toast, setToast] = useState(null);
  // Konversi sapi -> daging
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [operationToFinish, setOperationToFinish] = useState(null);
  const [carcassWeight, setCarcassWeight] = useState('');
  const [customDagingId, setCustomDagingId] = useState('');
  const [dagingList, setDagingList] = useState([]);

  // Load data
  useEffect(()=>{
    const storedCattleJSON = localStorage.getItem('cattleList');
    let list = [];
    if (storedCattleJSON) {
      try {
        const raw = JSON.parse(storedCattleJSON);
        list = raw.map(c => ({
          id: c.id,
          jenis: c.jenis === 'other' ? c.customJenis : c.jenis,
          usia: c.usia,
          kelamin: c.kelamin,
          healthStatus: c.healthStatus || 'sehat',
          availability: c.availability || 'available'
        }));
      } catch {}
    }
    // Filter siap potong (contoh sederhana)
    setCattle(list.filter(c => c.healthStatus === 'sehat' && c.availability === 'available'));
  setBatches(loadLS(STORAGE_KEYS.batches));
  setOperations(loadLS(STORAGE_KEYS.operations));
  setDagingList(loadLS(STORAGE_KEYS.daging));
  }, []);

  // Derived data
  const kpi = useMemo(()=>{
    const today = new Date().toISOString().split('T')[0];
    const batchToday = batches.filter(b => b.tanggal === today);
    const selesaiHariIni = operations.filter(o => o.status === 'SELESAI' && o.tanggal === today).length;
    const berlangsung = operations.filter(o => o.status === 'BERLANGSUNG').length;
    const siapPotong = cattle.length;
    return { siapPotong, batchToday: batchToday.length, berlangsung, selesaiHariIni };
  }, [batches, operations, cattle]);

  const toggleSelect = (id) => {
    setSelectedForBatch(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const createBatch = (e) => {
    e.preventDefault();
    if(!newBatch.tanggal || !newBatch.waktu) return;
    const id = 'BATCH-' + Date.now().toString().slice(-6);
    const batch = { id, ...newBatch, status: 'TERJADWAL', sapi: selectedForBatch }; // store sapi list maybe empty; can assign later
    const updated = [batch, ...batches];
    setBatches(updated); saveLS(STORAGE_KEYS.batches, updated);
    setShowBatchModal(false); setSelectedForBatch([]);
    setNewBatch({ tanggal:'', waktu:'', juleha:'', penyembelih:'' });
    popToast('Batch dibuat');
  };

  const startBatch = (batchId) => {
    setBatches(prev => {
      const updated = prev.map(b => b.id===batchId ? {...b, status:'BERLANGSUNG', mulai:new Date().toISOString()} : b);
      saveLS(STORAGE_KEYS.batches, updated);
      return updated;
    });
    // Create operations for each sapi in batch (simplified)
    const batch = batches.find(b=>b.id===batchId);
    if(batch && batch.sapi.length){
      const opsNew = batch.sapi.map(sid => ({ id: 'OP-'+sid+'-'+Date.now().toString().slice(-4), sapiId: sid, batchId, status:'BERLANGSUNG', tanggal: batch.tanggal, cid: '-', penyembelih: batch.penyembelih || 'N/A', juleha: batch.juleha || 'N/A' }));
      const merged = [...opsNew, ...operations];
      setOperations(merged); saveLS(STORAGE_KEYS.operations, merged);
    }
    popToast('Batch dimulai');
  };

  const finishOperationDirect = (opId, dagingId, berat) => {
    // simpan daging
    const createdAt = new Date().toISOString();
    const newDaging = { id: dagingId, sapiId: operations.find(o=>o.id===opId)?.sapiId, berat: Number(berat), createdAt };
    const updatedDaging = [newDaging, ...dagingList];
    setDagingList(updatedDaging); saveLS(STORAGE_KEYS.daging, updatedDaging);
    // update operasi
    setOperations(prev => {
      const up = prev.map(o => o.id===opId ? {...o, status:'SELESAI', selesai:createdAt, dagingId} : o);
      saveLS(STORAGE_KEYS.operations, up);
      return up;
    });
    popToast('Operasi selesai & daging dibuat');
  };

  const openConvertModal = (operation) => {
    setOperationToFinish(operation);
    setCarcassWeight('');
    const generated = 'DGG-' + operation.sapiId;
    setCustomDagingId(generated);
    setShowConvertModal(true);
  };

  const submitConversion = (e) => {
    e.preventDefault();
    if(!operationToFinish) return;
    if(!carcassWeight || Number(carcassWeight) <= 0) return;
    // Pastikan belum ada daging untuk sapi ini
    const sapiId = operationToFinish.sapiId;
    if(dagingList.some(d=>d.sapiId===sapiId)){
      popToast('Sapi sudah dikonversi');
      setShowConvertModal(false); return;
    }
    const finalId = customDagingId && customDagingId.trim()!=='' ? customDagingId.trim() : 'DGG-'+Date.now().toString().slice(-6);
    finishOperationDirect(operationToFinish.id, finalId, carcassWeight);
    setShowConvertModal(false);
    setOperationToFinish(null);
  };

  const finishBatchIfCompleted = (batchId) => {
    // Batch dianggap selesai bila semua operations status SELESAI
    const related = operations.filter(o=>o.batchId===batchId);
    if(related.length && related.every(o=>o.status==='SELESAI')){
      setBatches(prev => {
        const up = prev.map(b=>b.id===batchId ? {...b, status:'SELESAI', selesai:new Date().toISOString()} : b);
        saveLS(STORAGE_KEYS.batches, up); return up;
      });
    }
  };

  useEffect(()=>{
    // each time operations change check batches
    batches.forEach(b=>finishBatchIfCompleted(b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations]);

  const openAssignModal = (batch) => { setCurrentBatch(batch); setShowAssignModal(true); };
  const assignSapiToBatch = (batchId, sapiIds) => {
    setBatches(prev => {
      const up = prev.map(b => b.id===batchId ? {...b, sapi: Array.from(new Set([...(b.sapi||[]), ...sapiIds]))} : b);
      saveLS(STORAGE_KEYS.batches, up); return up;
    });
    setShowAssignModal(false); setCurrentBatch(null); setSelectedForBatch([]); popToast('Sapi ditambahkan ke batch');
  };

  const popToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const filteredCattle = useMemo(()=>
    cattle.filter(c => !filterText || c.id.toLowerCase().includes(filterText.toLowerCase()) || (c.jenis||'').toLowerCase().includes(filterText.toLowerCase())),
    [cattle, filterText]
  );

  return (
    <DashboardLayout title="Operasi Pemotongan" role="RPH" customSidebar={<RphSidebar /> }>
      <div className="mt-2 space-y-8">
        {toast && <div className="rounded-md bg-green-100 border border-green-300 px-4 py-2 text-sm text-green-800">{toast}</div>}

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[{t:'Sapi Siap Potong',v:kpi.siapPotong,icon:'fa-cow',color:'text-primary bg-primary/10'},{t:'Batch Hari Ini',v:kpi.batchToday,icon:'fa-layer-group',color:'text-blue-600 bg-blue-100'},{t:'Sedang Berlangsung',v:kpi.berlangsung,icon:'fa-play',color:'text-yellow-600 bg-yellow-100'},{t:'Selesai Hari Ini',v:kpi.selesaiHariIni,icon:'fa-check-circle',color:'text-green-600 bg-green-100'}].map(card => (
            <div key={card.t} className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4 border border-gray-100">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}> <i className={`fas ${card.icon} text-xl`}></i></div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{card.t}</p>
                <p className="text-2xl font-semibold text-gray-800 leading-tight">{card.v}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Antrian & Buat Batch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-cow text-primary"></i> Antrian Sapi Siap Potong</h2>
              <p className="text-xs text-gray-500">Pilih sapi dan buat batch pemotongan.</p>
            </div>
            <div className="flex items-center gap-2">
              <input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder="Cari sapi..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={()=>setShowBatchModal(true)} disabled={selectedForBatch.length===0} className={`px-4 py-2 rounded-md text-white text-sm ${selectedForBatch.length===0?'bg-primary/50 cursor-not-allowed':'bg-primary hover:bg-primaryDark'}`}><i className="fas fa-layer-group mr-2"></i>Buat Batch</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left w-8"><input type="checkbox" onChange={e=> e.target.checked ? setSelectedForBatch(filteredCattle.map(c=>c.id)) : setSelectedForBatch([])} checked={filteredCattle.length>0 && selectedForBatch.length===filteredCattle.length} /></th>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Jenis</th>
                  <th className="px-4 py-2 text-left">Usia</th>
                  <th className="px-4 py-2 text-left">Kelamin</th>
                  <th className="px-4 py-2 text-left">Kesehatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCattle.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 text-left"><input type="checkbox" checked={selectedForBatch.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
                    <td className="px-4 py-2 text-left text-primary font-medium">{c.id}</td>
                    <td className="px-4 py-2 text-left">{c.jenis}</td>
                    <td className="px-4 py-2 text-left">{c.usia} th</td>
                    <td className="px-4 py-2 text-left">{c.kelamin}</td>
                    <td className="px-4 py-2 text-left"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{c.healthStatus}</span></td>
                  </tr>
                ))}
                {filteredCattle.length===0 && <tr><td colSpan={6} className="px-4 py-4 text-left text-gray-500">Tidak ada sapi siap potong.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-layer-group text-primary"></i> Batch Pemotongan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Waktu</th>
                  <th className="px-4 py-2 text-left">JULEHA</th>
                  <th className="px-4 py-2 text-left">Penyembelih</th>
                  <th className="px-4 py-2 text-left">Jumlah Sapi</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 text-left font-medium text-primary">{b.id}</td>
                    <td className="px-4 py-2 text-left">{b.tanggal}</td>
                    <td className="px-4 py-2 text-left">{b.waktu}</td>
                    <td className="px-4 py-2 text-left">{b.juleha || '-'}</td>
                    <td className="px-4 py-2 text-left">{b.penyembelih || '-'}</td>
                    <td className="px-4 py-2 text-left">{b.sapi?.length || 0}</td>
                    <td className="px-4 py-2 text-left">{statusBadge(b.status)}</td>
                    <td className="px-4 py-2 text-left space-x-2">
                      {b.status === 'TERJADWAL' && (
                        <>
                          <button onClick={()=>openAssignModal(b)} className="px-2 py-1 border rounded text-xs hover:bg-gray-50 flex items-center gap-1"><i className="fas fa-plus text-green-600"></i><span>Sapi</span></button>
                          <button onClick={()=>startBatch(b.id)} disabled={!b.sapi || b.sapi.length===0} className={`px-2 py-1 rounded text-xs text-white flex items-center gap-1 ${(!b.sapi || b.sapi.length===0)?'bg-primary/50 cursor-not-allowed':'bg-primary hover:bg-primaryDark'}`}><i className="fas fa-play text-yellow-300"></i><span>Mulai</span></button>
                        </>
                      )}
                      {b.status === 'BERLANGSUNG' && <span className="inline-flex items-center gap-1 text-xs text-blue-600"><i className="fas fa-spinner animate-spin"></i>Berjalan...</span>}
                      {b.status === 'SELESAI' && <span className="inline-flex items-center gap-1 text-xs text-green-600"><i className="fas fa-check"></i>Selesai</span>}
                    </td>
                  </tr>
                ))}
                {batches.length===0 && <tr><td colSpan={8} className="px-4 py-4 text-left text-gray-500">Belum ada batch.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operasi Berlangsung */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-cut text-primary"></i> Operasi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Operasi</th>
                  <th className="px-4 py-2 text-left">Sapi</th>
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-left">Penyembelih</th>
                  <th className="px-4 py-2 text-left">JULEHA</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Daging</th>
                  <th className="px-4 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {operations.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 text-left text-primary font-medium">{o.id}</td>
                    <td className="px-4 py-2 text-left">{o.sapiId}</td>
                    <td className="px-4 py-2 text-left">{o.batchId}</td>
                    <td className="px-4 py-2 text-left">{o.penyembelih}</td>
                    <td className="px-4 py-2 text-left">{o.juleha}</td>
                    <td className="px-4 py-2 text-left">{statusBadge(o.status)}</td>
                    <td className="px-4 py-2 text-left">{o.dagingId ? <span className="text-green-700 font-medium">{o.dagingId}</span> : <span className="text-gray-400 text-xs">-</span>}</td>
                    <td className="px-4 py-2 text-left">
                      {o.status === 'BERLANGSUNG' && <button onClick={()=>openConvertModal(o)} className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-1"><i className="fas fa-check"></i><span>Konversi</span></button>}
                      {o.status === 'SELESAI' && <span className="inline-flex items-center gap-1 text-xs text-green-600"><i className="fas fa-check-circle"></i>Done</span>}
                    </td>
                  </tr>
                ))}
                {operations.length===0 && <tr><td colSpan={8} className="px-4 py-4 text-left text-gray-500">Belum ada operasi.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Buat Batch */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowBatchModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-layer-group text-primary"></i>Buat Batch</h3>
              <button onClick={()=>setShowBatchModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={createBatch} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" value={newBatch.tanggal} onChange={e=>setNewBatch({...newBatch,tanggal:e.target.value})} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu <span className="text-red-500">*</span></label>
                  <input type="time" value={newBatch.waktu} onChange={e=>setNewBatch({...newBatch,waktu:e.target.value})} required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penyembelih</label>
                  <input type="text" placeholder="Nama penyembelih" value={newBatch.penyembelih} onChange={e=>setNewBatch({...newBatch,penyembelih:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">JULEHA</label>
                  <input type="text" placeholder="Nama JULEHA" value={newBatch.juleha} onChange={e=>setNewBatch({...newBatch,juleha:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="border rounded-md p-3 bg-gray-50 text-sm">
                <p className="text-gray-600">{selectedForBatch.length} sapi dipilih untuk batch ini.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowBatchModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign Sapi */}
      {showAssignModal && currentBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowAssignModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-plus text-primary"></i>Tambah Sapi ke {currentBatch.id}</h3>
              <button onClick={()=>setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
            </div>
            <div className="h-64 overflow-y-auto border rounded-md mb-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <th className="px-3 py-2 text-left w-8"></th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Jenis</th>
                    <th className="px-3 py-2 text-left">Usia</th>
                    <th className="px-3 py-2 text-left">Kelamin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cattle.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 text-left">
                      <td className="px-3 py-2 text-left"><input type="checkbox" checked={selectedForBatch.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
                      <td className="px-3 py-2 text-left text-primary font-medium">{c.id}</td>
                      <td className="px-3 py-2 text-left">{c.jenis}</td>
                      <td className="px-3 py-2 text-left">{c.usia} th</td>
                      <td className="px-3 py-2 text-left">{c.kelamin}</td>
                    </tr>
                  ))}
                  {cattle.length===0 && <tr><td colSpan={5} className="px-3 py-4 text-left text-gray-500">Tidak ada sapi.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={()=>setShowAssignModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
              <button onClick={()=>assignSapiToBatch(currentBatch.id, selectedForBatch)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tambahkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konversi Sapi -> Daging */}
      {showConvertModal && operationToFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowConvertModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-drumstick-bite text-primary"></i>Konversi Daging</h3>
              <button onClick={()=>setShowConvertModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={submitConversion} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sapi</label>
                  <p className="text-sm font-medium text-primary">{operationToFinish.sapiId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operasi</label>
                  <p className="text-sm text-gray-700">{operationToFinish.id}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Daging (boleh ubah)</label>
                  <input value={customDagingId} onChange={e=>setCustomDagingId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat Karkas (kg) *</label>
                  <input type="number" step="0.01" min="0" value={carcassWeight} onChange={e=>setCarcassWeight(e.target.value)} placeholder="120.5" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">Data disimpan lokal (mock). Integrasi API selanjutnya.</span>
                <div className="flex gap-3">
                  <button type="button" onClick={()=>setShowConvertModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                  <button type="submit" disabled={!carcassWeight || Number(carcassWeight)<=0} className={`px-4 py-2 rounded-md text-white text-sm ${(!carcassWeight || Number(carcassWeight)<=0)?'bg-primary/50 cursor-not-allowed':'bg-primary hover:bg-primaryDark'}`}>Simpan & Selesai</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RphOperasi;
