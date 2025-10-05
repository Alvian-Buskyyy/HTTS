import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RphSidebar from '../components/RphSidebar';

// Verifikasi Halal: fokus dua fase utama ANTE MORTEM & POST MORTEM.
// Kriteria: masing-masing fase punya set pertanyaan yes/no; jika YES >= 90% di kedua fase -> status HALAL.
// Penyimpanan:
//   - Pertanyaan sekarang di-backend (model ItemHalalSehat) via endpoint /itemHalalSehat
//   - Jawaban masih lokal (localStorage) untuk tahap awal; bisa diintegrasi ke /pengecekanHalalSehat nanti.

const PASS_THRESHOLD = 0.9; // 90%

const DEFAULT_ANTEMORTEM = [
  'Identitas & dokumen ternak sesuai',
  'Ternak berdiri tegak normal',
  'Tidak ada luka terbuka signifikan',
  'Tidak ada tanda stres berat',
  'Nafsu makan normal',
  'Pernafasan normal',
  'Mata jernih & tidak bernanah',
  'Bulu / kulit bersih tanpa ektoparasit berat',
  'Tidak ada hipersalivasi',
  'Tidak ada diare aktif',
  'Tidak ada pincang berat',
  'Suhu tubuh dalam rentang normal',
  'Tidak ada tanda penyakit zoonosis',
  'Ternak bebas cacat permanen yang melanggar syarat',
  'Lokasi penampungan higienis'
];
const DEFAULT_POSTMORTEM = [
  'Perdarahan karkas sempurna',
  'Tidak ada memar luas',
  'Organ hati normal',
  'Paru-paru normal',
  'Limpa normal',
  'Ginjal normal',
  'Tidak ada abses tersembunyi',
  'Kelenjar limfe normal',
  'Tidak ada cacing makroskopis',
  'Tidak ada bau abnormal',
  'Tidak ada perubahan warna patologis',
  'Daging elastis & tidak lengket',
  'Permukaan karkas bersih',
  'Kontaminasi silang dicegah',
  'Suhu pendinginan awal tercapai'
];

// BACKEND BASE URL (bisa dipindah ke config/env)
const API_BASE = 'http://localhost:3000';

// Seed ke backend bila kosong: hanya dipanggil sekali saat mount jika server belum punya data.
const seedBackendIfEmpty = async (existing) => {
  try {
    const antCount = existing.filter(i=>i.kategori==='ANTEMORTEM').length;
    const postCount = existing.filter(i=>i.kategori==='POSTMORTEM').length;
    const creates = [];
    if(antCount === 0){
      DEFAULT_ANTEMORTEM.forEach(nama=>creates.push({ nama, kategori:'ANTEMORTEM'}));
    }
    if(postCount === 0){
      DEFAULT_POSTMORTEM.forEach(nama=>creates.push({ nama, kategori:'POSTMORTEM'}));
    }
    if(creates.length){
      // Jalankan POST secara berurutan untuk kesederhanaan
      for(const payload of creates){
        await fetch(`${API_BASE}/itemHalalSehat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      }
      // Return list baru dari server
      const r = await fetch(`${API_BASE}/itemHalalSehat`);
      return await r.json();
    }
    return existing;
  } catch(err){
    console.error('Seed backend gagal:', err);
    return existing; // fallback
  }
};

const loadJSON = (k, fb=[]) => { try { return JSON.parse(localStorage.getItem(k)||JSON.stringify(fb)); } catch { return fb; } };
const saveJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));

const RphVerifikasiHalal = () => {
  const [cattle, setCattle] = useState([]);
  const [items, setItems] = useState([]); // Disinkronkan dengan backend
  const [checks, setChecks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formState, setFormState] = useState({});
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [groupFilter, setGroupFilter] = useState(''); // not used currently
  const [newQuestion, setNewQuestion] = useState({ ANTEMORTEM:'', POSTMORTEM:'' });

  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState('');
  const [syncing, setSyncing] = useState(false);
  const PENDING_KEY = 'pendingItemHalalSehat';
  const loadPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY)||'[]'); } catch { return []; } };
  const savePending = (list) => localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  const [pendingItems, setPendingItems] = useState(loadPending());

  useEffect(()=>{
    const bootstrap = async () => {
      const allCattle = loadJSON('cattleList');
      setCattle(allCattle.slice(0,50).map(c=>({id:c.id, jenis:c.jenis==='other'?c.customJenis:c.jenis })));
      setChecks(loadJSON('pengecekanHalalSehatList'));
      await fetchItems();
    };
    bootstrap();
  }, []);

  const fetchItems = async () => {
    setLoadingItems(true); setErrorItems('');
    try {
      const res = await fetch(`${API_BASE}/itemHalalSehat`);
      let data = await res.json();
      if(Array.isArray(data)){
        if(data.length === 0) {
          data = await seedBackendIfEmpty([]);
        }
        setItems(data);
      } else {
        setErrorItems('Format data tidak dikenal');
      }
    } catch(err){
      console.error(err);
      setErrorItems('Gagal memuat pertanyaan');
    } finally {
      setLoadingItems(false);
    }
  };

  const createItem = async (kategori, nama, deskripsi='') => {
    // Optimistic local pending add; attempt backend sync
    const temp = { id: 'TEMP-'+Date.now(), nama, kategori, deskripsi, _pending:true };
    setPendingItems(prev => { const updated=[...prev, temp]; savePending(updated); return updated; });
    try {
      const payload = { nama, kategori, deskripsi };
      const res = await fetch(`${API_BASE}/itemHalalSehat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!res.ok) throw new Error('RESP');
      const newItem = await res.json();
      // remove temp & add real
      setPendingItems(prev => { const updated = prev.filter(p=>p.id!==temp.id); savePending(updated); return updated; });
      setItems(prev=>[...prev, newItem]);
      return newItem;
    } catch(err){
      // keep pending; user can sync later
      console.warn('Gagal sync ke backend, disimpan lokal sebagai pending');
      return temp;
    }
  };

  const syncPending = async () => {
    if(!pendingItems.length) return;
    setSyncing(true);
    const stillPending = [];
    for(const p of pendingItems){
      try {
        const payload = { nama: p.nama, kategori: p.kategori, deskripsi: p.deskripsi||'' };
        const res = await fetch(`${API_BASE}/itemHalalSehat`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if(!res.ok) throw new Error('fail');
        const saved = await res.json();
        setItems(prev=> prev.find(i=>i.id===saved.id)? prev : [...prev, saved]);
      } catch(err){
        stillPending.push(p); // remain pending
      }
    }
    setPendingItems(stillPending); savePending(stillPending);
    setSyncing(false);
  };

  const openModal = (s) => {
    setSelected(s);
    const existing = checks.filter(ch=>ch.sapiId===s.id).reduce((acc,ch)=>{acc[ch.itemHalalSehatId]=ch.boolean; return acc;},{});
    setFormState(existing);
    setShowModal(true);
  };

  const toggleItem = (id) => setFormState(prev=>({...prev,[id]: !prev[id]}));

  const saveVerification = () => {
    if(!selected) return;
    const timestamp = new Date().toISOString();
    const entries = Object.keys(formState).map(itemId => ({
      id: 'PHS-'+selected.id+'-'+itemId,
      sapiId: selected.id,
      itemHalalSehatId: itemId,
      boolean: !!formState[itemId],
      cid: '-',
      timestamp
    }));
    const filtered = checks.filter(c=>c.sapiId!==selected.id);
    const updated = [...entries, ...filtered];
    setChecks(updated); saveJSON('pengecekanHalalSehatList', updated);
    setShowModal(false); setSelected(null); setFormState({});
  };

  // Helper: percent per kategori
  const percentByCategory = (sapiId, kategori) => {
    const subset = items.filter(i=>i.kategori===kategori); // hanya item tersimpan server
    if(subset.length===0) return 0;
    const done = checks.filter(c=>c.sapiId===sapiId && c.boolean && subset.some(s=>s.id===c.itemHalalSehatId)).length;
    return Math.round((done / subset.length) * 100);
  };
  const antemortemPercent = (sapiId) => percentByCategory(sapiId,'ANTEMORTEM');
  const postmortemPercent = (sapiId) => percentByCategory(sapiId,'POSTMORTEM');
  const isHalal = (sapiId) => (antemortemPercent(sapiId)/100 >= PASS_THRESHOLD) && (postmortemPercent(sapiId)/100 >= PASS_THRESHOLD);

  const filteredCattle = cattle.filter(c=>!filter || c.id.toLowerCase().includes(filter.toLowerCase()));

  // Group by kategori (only two of interest)
  const mergedAllItems = [...items, ...pendingItems];
  const groupedItems = mergedAllItems.reduce((acc,it)=>{acc[it.kategori]=acc[it.kategori]||[]; acc[it.kategori].push(it); return acc;},{});
  const kategoriList = ['ANTEMORTEM','POSTMORTEM'];

  // Live percent inside modal based on current formState selections
  const modalPercentByCategory = (kategori) => {
    const subset = (groupedItems[kategori] || []).filter(i => !i._pending);
    if (subset.length === 0) return 0;
    const yesCount = subset.filter(i => !!formState[i.id]).length;
    return Math.round((yesCount / subset.length) * 100);
  };

  // History grouping
  const historyGrouped = checks.reduce((acc,ch)=>{acc[ch.sapiId]=acc[ch.sapiId]||[]; acc[ch.sapiId].push(ch); return acc;},{});
  const historySapiIds = Object.keys(historyGrouped);

  return (
    <DashboardLayout title="Verifikasi Halal" role="RPH" customSidebar={<RphSidebar /> }>
      <div className="space-y-10 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[{t:'Total Pertanyaan',v:items.length,icon:'fa-list-check',color:'text-emerald-600 bg-emerald-100'},
            {t:'Total Jawaban',v:checks.length,icon:'fa-database',color:'text-indigo-600 bg-indigo-100'},
            {t:'Sapi Halal (≥90%)',v:cattle.filter(c=>isHalal(c.id)).length,icon:'fa-certificate',color:'text-green-600 bg-green-100'},
            {t:'Total Sapi',v:cattle.length,icon:'fa-cow',color:'text-slate-600 bg-slate-100'}].map(card=>(
            <div key={card.t} className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4 border border-gray-100">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}><i className={`fas ${card.icon} text-xl`}></i></div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{card.t}</p>
                <p className="text-2xl font-semibold text-gray-800 leading-tight">{card.v}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-check text-emerald-600"></i> Daftar Sapi</h2>
              <p className="text-xs text-gray-500">Checklist verifikasi halal sesuai prosedur & sertifikasi.</p>
            </div>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Cari sapi..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {pendingItems.length>0 && (
            <div className="mb-3 flex items-center gap-3 text-xs">
              <span className="text-amber-600 flex items-center gap-1"><i className="fas fa-cloud-upload-alt"></i> {pendingItems.length} pertanyaan pending (belum tersimpan di server)</span>
              <button onClick={syncPending} disabled={syncing} className="px-2 py-1 rounded bg-primary text-white hover:bg-primaryDark disabled:opacity-50"><i className="fas fa-sync mr-1"></i>{syncing? 'Sync...' : 'Sync Sekarang'}</button>
            </div>) }
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Jenis</th>
                  <th className="px-4 py-2">Antemortem</th>
                  <th className="px-4 py-2">Postmortem</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCattle.map(c=>(
                  <tr key={c.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 font-medium text-primary">{c.id}</td>
                    <td className="px-4 py-2">{c.jenis}</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1"><div className="h-1.5 rounded-full bg-emerald-500" style={{width: antemortemPercent(c.id)+'%'}}></div></div>
                      <span className="text-[10px] text-gray-500">{antemortemPercent(c.id)}%</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1"><div className="h-1.5 rounded-full bg-indigo-500" style={{width: postmortemPercent(c.id)+'%'}}></div></div>
                      <span className="text-[10px] text-gray-500">{postmortemPercent(c.id)}%</span>
                    </td>
                    <td className="px-4 py-2">
                      {isHalal(c.id) ? <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">HALAL</span> : <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">BELUM</span>}
                    </td>
                    <td className="px-4 py-2"><button onClick={()=>openModal(c)} className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primaryDark"><i className="fas fa-edit mr-1"></i>Isi</button></td>
                  </tr>
                ))}
                {filteredCattle.length===0 && <tr><td colSpan={6} className="px-4 py-4 text-left text-gray-500">Tidak ada data sapi.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-history text-indigo-600"></i> Riwayat Verifikasi</h2>
              <p className="text-xs text-gray-500">Semua entri pengecekan halal (true/false) per item.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Sapi</th>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Kategori</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">CID</th>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historySapiIds.flatMap(id => historyGrouped[id].map(ch => {
                  const item = items.find(i=>i.id===ch.itemHalalSehatId) || {}; return (
                    <tr key={ch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-primary">{id}</td>
                      <td className="px-4 py-2">{item.nama || ch.itemHalalSehatId}</td>
                      <td className="px-4 py-2">{item.kategori || '-'}</td>
                      <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${ch.boolean?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{ch.boolean?'OK':'X'}</span></td>
                      <td className="px-4 py-2">
                        {ch.cid && ch.cid !== '-' ? (
                          <a
                            href={`https://ipfs.io/ipfs/${ch.cid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                            title={ch.cid}
                          >
                            {ch.cid.length > 18 ? `${ch.cid.slice(0,8)}...${ch.cid.slice(-8)}` : ch.cid}
                          </a>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-2">{new Date(ch.timestamp).toLocaleString('id-ID')}</td>
                    </tr>
                  );
                }))}
                {historySapiIds.length===0 && <tr><td colSpan={6} className="px-4 py-4 text-left text-gray-500">Belum ada riwayat.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-check text-emerald-600"></i> Verifikasi Halal - {selected.id}</h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {kategoriList.map(kat => (
                <div key={kat} className="border rounded-md p-4 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <i className="fas fa-folder-open text-amber-600"></i>{kat === 'ANTEMORTEM' ? 'ANTEMORTEM (Pra-Sembelih)' : 'POSTMORTEM (Pasca-Sembelih)'}
                    </h4>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white border text-gray-600">Yes {modalPercentByCategory(kat)}%</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(groupedItems[kat] || []).map(item => (
                      <div key={item.id} className={`relative px-4 py-3 rounded-md border text-sm ${item._pending ? 'opacity-60 cursor-not-allowed bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <p className="font-medium leading-snug text-left mb-2 pr-6">{item.nama}</p>
                        {item._pending && <span className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white">Pending</span>}
                        {!item._pending && (
                          <div className="flex items-center gap-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`ans-${item.id}`}
                                value="yes"
                                checked={formState[item.id] === true}
                                onChange={()=>setFormState(prev=>({...prev, [item.id]: true}))}
                                className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                              />
                              <span className="text-xs font-semibold text-emerald-700">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`ans-${item.id}`}
                                value="no"
                                checked={formState[item.id] === false}
                                onChange={()=>setFormState(prev=>({...prev, [item.id]: false}))}
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                              />
                              <span className="text-xs font-semibold text-red-700">No</span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={async (e)=>{
                    e.preventDefault();
                    const val = newQuestion[kat];
                    if(!val || val.trim()==='') return;
                    try {
                      await createItem(kat, val.trim());
                      setNewQuestion(prev=>({...prev,[kat]:''}));
                    } catch(err){
                      alert('Gagal menambah pertanyaan: '+err.message);
                    }
                  }} className="flex items-center gap-2 pt-1">
                    <input value={newQuestion[kat]} onChange={e=>setNewQuestion(prev=>({...prev,[kat]:e.target.value}))} placeholder={`Tambah pertanyaan ${kat.toLowerCase()}...`} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="submit" className="px-3 py-2 bg-primary text-white rounded-md text-xs hover:bg-primaryDark" disabled={!newQuestion[kat] || loadingItems}><i className="fas fa-plus mr-1"></i>{loadingItems ? '...' : 'Tambah'}</button>
                  </form>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
              <button onClick={saveVerification} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RphVerifikasiHalal;
