import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RphSidebar from '../components/RphSidebar';

// Halaman Verifikasi Sehat (gabungan):
// 1. Checklist item sehat (PengecekanSehat)
// 2. Pemeriksaan klinis (kondisi, suhu, penyakit, dokter) yang sebelumnya ada di halaman kesehatan terpisah
//    -> Disimpan lokal di localStorage key: clinicalHealthChecks: [{sapiId,kondisi,suhu,pmk,antraks,brucellosis,parasit,catatan,dokter,timestamp}]
// Mock data checklist: itemSehatList, pengecekanSehatList

const ensureSeed = () => {
  if(!localStorage.getItem('itemSehatList')){
    const seed = [
      {id:'IS-001', nama:'Kondisi Mata', kategori:'Fisik'},
      {id:'IS-002', nama:'Kondisi Kulit', kategori:'Fisik'},
      {id:'IS-003', nama:'Nafsu Makan', kategori:'Perilaku'},
      {id:'IS-004', nama:'Pernafasan Normal', kategori:'Fisiologis'}
    ];
    localStorage.setItem('itemSehatList', JSON.stringify(seed));
  }
};

const loadJSON = (k, fb=[]) => { try { return JSON.parse(localStorage.getItem(k)||JSON.stringify(fb)); } catch { return fb; } };
const saveJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));

const RphVerifikasiSehat = () => {
  const [cattle, setCattle] = useState([]); // subset sapi yang belum lengkap verifikasi
  const [items, setItems] = useState([]);
  const [checks, setChecks] = useState([]);
  const [selected, setSelected] = useState(null); // sapi
  const [formState, setFormState] = useState({}); // itemId -> boolean
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false); // modal checklist item sehat
  const [historyFilterSapi, setHistoryFilterSapi] = useState('');
  // Clinical exam integration
  const [pendingClinical, setPendingClinical] = useState([]); // sapi yang butuh pemeriksaan klinis
  const [clinicalRecords, setClinicalRecords] = useState([]); // histori klinis
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [selectedClinical, setSelectedClinical] = useState(null);
  const [clinicalForm, setClinicalForm] = useState({ kondisi:'', suhu:'', pmk:false, antraks:false, brucellosis:false, parasit:false, catatan:'', dokter:'' });

  const TEMP_MIN = 37.5;
  const TEMP_MAX = 39.5;
  const isTempNormal = (val) => {
    const t = parseFloat(val); if(Number.isNaN(t)) return null; return t >= TEMP_MIN && t <= TEMP_MAX;
  };
  const computeClinicalLabel = (data) => {
    const anyDisease = data.pmk || data.antraks || data.brucellosis || data.parasit;
    const tempOk = isTempNormal(data.suhu);
    const kondisiBaik = ['Sangat Baik','Baik','Sehat'].includes(data.kondisi);
    if(!data.kondisi || !data.suhu) return 'Lengkapi Data';
    if(!tempOk || anyDisease || !kondisiBaik) return 'Butuh Pemeriksaan Lanjut';
    return 'Layak Sehat';
  };

  useEffect(()=>{
    ensureSeed();
    const allCattle = loadJSON('cattleList');
    setCattle(allCattle.slice(0,50).map(c=>({id:c.id, jenis:c.jenis==='other'?c.customJenis:c.jenis })));
    setItems(loadJSON('itemSehatList'));
    setChecks(loadJSON('pengecekanSehatList'));
    // Clinical records
    const clinical = loadJSON('clinicalHealthChecks');
    setClinicalRecords(clinical);
    // Determine pending clinical: sapi tanpa record klinis atau flagged healthStatus
    const flagged = (allCattle||[]).filter(c => ['perlu_periksa','sakit','Perlu Dicek'].includes(c.healthStatus));
    const missing = (allCattle||[]).filter(c => !clinical.find(r=>r.sapiId===c.id));
    // unify by id
    const map = {};
    [...flagged, ...missing].forEach(c=>{ map[c.id]=c; });
    setPendingClinical(Object.values(map).slice(0,30).map(c=>({
      id:c.id,
      jenis:c.jenis==='other'?c.customJenis:c.jenis,
      berat:c.berat||0,
      arrival:c.tanggalLahir? new Date(c.tanggalLahir).toLocaleDateString('id-ID'):'-'
    })));
  }, []);

  const openModal = (s) => {
    setSelected(s);
    // prefill existing
    const existing = checks.filter(ch=>ch.sapiId===s.id).reduce((acc,ch)=>{acc[ch.itemSehatId]=ch.boolean; return acc;},{});
    setFormState(existing);
    setShowModal(true);
  };

  const toggleItem = (id) => setFormState(prev=>({...prev,[id]: !prev[id]}));

  const saveVerification = async () => {
    if(!selected) return;
    const sapiId = selected.id;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const results = [];
    for (const itemId of Object.keys(formState)) {
      try {
        const payload = { sapiId, itemSehatId: itemId, boolean: !!formState[itemId] };
        const r = await fetch('http://localhost:3000/pengecekanSehat', { method: 'POST', headers, body: JSON.stringify(payload) });
        if (r.ok) {
          const created = await r.json();
          results.push({ id: 'PS-'+sapiId+'-'+itemId, sapiId, itemSehatId: itemId, boolean: !!formState[itemId], cid: created.cid, timestamp: new Date().toISOString() });
        } else {
          results.push({ id: 'PS-'+sapiId+'-'+itemId, sapiId, itemSehatId: itemId, boolean: !!formState[itemId], cid: '-', timestamp: new Date().toISOString() });
        }
      } catch {
        results.push({ id: 'PS-'+sapiId+'-'+itemId, sapiId, itemSehatId: itemId, boolean: !!formState[itemId], cid: '-', timestamp: new Date().toISOString() });
      }
    }
    const filtered = checks.filter(c=>c.sapiId!==sapiId);
    const updated = [...results, ...filtered];
    setChecks(updated);
    saveJSON('pengecekanSehatList', updated);
    setShowModal(false); setSelected(null); setFormState({});
  };

  // Clinical modal handlers
  const openClinicalModal = (s) => {
    setSelectedClinical(s);
    const existing = clinicalRecords.find(r=>r.sapiId===s.id) || null;
    setClinicalForm(existing ? {...existing} : { kondisi:'', suhu:'', pmk:false, antraks:false, brucellosis:false, parasit:false, catatan:'', dokter:'' });
    setShowClinicalModal(true);
  };
  const saveClinical = (e) => {
    e.preventDefault(); if(!selectedClinical) return;
    const record = { ...clinicalForm, sapiId: selectedClinical.id, timestamp: new Date().toISOString() };
    const filtered = clinicalRecords.filter(r=>r.sapiId!==selectedClinical.id);
    const updated = [record, ...filtered];
    setClinicalRecords(updated); saveJSON('clinicalHealthChecks', updated);
    setShowClinicalModal(false); setSelectedClinical(null);
    // Refresh pending
    setPendingClinical(prev=> prev.filter(p=>p.id!==record.sapiId));
  };

  const completionPercent = (sapiId) => {
    const total = items.length;
    if(!total) return 0;
    const done = checks.filter(c=>c.sapiId===sapiId && c.boolean).length; // count true only
    return Math.round((done/total)*100);
  };

  const filteredCattle = cattle.filter(c=>!filter || c.id.toLowerCase().includes(filter.toLowerCase()));

  const historyGrouped = checks.reduce((acc,ch)=>{
    acc[ch.sapiId] = acc[ch.sapiId]||[]; acc[ch.sapiId].push(ch); return acc;
  },{});

  const historySapiIds = Object.keys(historyGrouped).filter(id => !historyFilterSapi || id.toLowerCase().includes(historyFilterSapi.toLowerCase()));

  return (
    <DashboardLayout title="Verifikasi Sehat" role="RPH" customSidebar={<RphSidebar /> }>
      <div className="space-y-12 mt-2">
        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {[{t:'Item Sehat',v:items.length,icon:'fa-list',color:'text-blue-600 bg-blue-100'},
            {t:'Checklist Record',v:checks.length,icon:'fa-database',color:'text-indigo-600 bg-indigo-100'},
            {t:'Sapi Checklist Selesai',v:historySapiIds.length,icon:'fa-check-circle',color:'text-green-600 bg-green-100'},
            {t:'Pending Klinis',v:pendingClinical.length,icon:'fa-notes-medical',color:'text-amber-600 bg-amber-100'},
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

        {/* Pending Pemeriksaan Klinis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-stethoscope text-purple-600"></i> Pending Pemeriksaan Klinis</h2>
            <p className="text-xs text-gray-500">Sapi yang membutuhkan pemeriksaan fisik / suhu / penyakit.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Jenis</th>
                  <th className="px-4 py-2">Berat</th>
                  <th className="px-4 py-2">Tanggal Lahir</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingClinical.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 font-medium text-primary">{s.id}</td>
                    <td className="px-4 py-2">{s.jenis}</td>
                    <td className="px-4 py-2">{s.berat}</td>
                    <td className="px-4 py-2">{s.arrival}</td>
                    <td className="px-4 py-2">
                      <button onClick={()=>openClinicalModal(s)} className="p-2 rounded-md border border-primary/30 text-primary hover:bg-primary/10" title="Periksa Klinis"><i className="fas fa-stethoscope"></i></button>
                    </td>
                  </tr>
                ))}
                {pendingClinical.length===0 && <tr><td colSpan={5} className="px-4 py-4 text-left text-gray-500">Tidak ada yang pending.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-heartbeat text-rose-600"></i> Daftar Sapi</h2>
              <p className="text-xs text-gray-500">Verifikasi status sehat per item checklist.</p>
            </div>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Cari sapi..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Jenis</th>
                  <th className="px-4 py-2">Progress</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCattle.map(c=>(
                  <tr key={c.id} className="hover:bg-gray-50 text-left">
                    <td className="px-4 py-2 font-medium text-primary">{c.id}</td>
                    <td className="px-4 py-2">{c.jenis}</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{width: completionPercent(c.id)+'%'}}></div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{completionPercent(c.id)}%</p>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={()=>openModal(c)} className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primaryDark"><i className="fas fa-edit mr-1"></i>Isi</button>
                    </td>
                  </tr>
                ))}
                {filteredCattle.length===0 && <tr><td colSpan={4} className="px-4 py-4 text-left text-gray-500">Tidak ada data sapi.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-history text-blue-600"></i> Riwayat Verifikasi</h2>
      <p className="text-xs text-gray-500">Entri pengecekan sehat checklist per item.</p>
            </div>
            <input value={historyFilterSapi} onChange={e=>setHistoryFilterSapi(e.target.value)} placeholder="Filter ID sapi..." className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
                  const item = items.find(i=>i.id===ch.itemSehatId) || {}; return (
                    <tr key={ch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-primary">{id}</td>
                      <td className="px-4 py-2">{item.nama || ch.itemSehatId}</td>
                      <td className="px-4 py-2">{item.kategori || '-'}</td>
                      <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${ch.boolean?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{ch.boolean?'OK':'TIDAK'}</span></td>
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
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-heartbeat text-rose-600"></i> Verifikasi Sehat - {selected.id}</h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map(item => (
                    <button key={item.id} type="button" onClick={()=>toggleItem(item.id)} className={`flex items-center justify-between px-4 py-3 rounded-md border text-sm ${formState[item.id] ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}> 
                      <span className="font-medium text-left">{item.nama}</span>
                      <span className={`px-2 py-1 text-[10px] rounded-full font-semibold ${formState[item.id] ? 'bg-green-600 text-white':'bg-gray-200 text-gray-700'}`}>{formState[item.id] ? 'OK':'X'}</span>
                    </button>
                  ))}
                </div>
              </div>
              <aside className="md:col-span-1">
                <div className="border rounded-lg p-4 bg-gray-50 space-y-3 text-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ringkasan</h4>
                  <p className="flex justify-between"><span className="text-gray-500">Total Item</span><span className="font-medium text-gray-800">{items.length}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">OK</span><span className="font-medium text-green-700">{Object.values(formState).filter(Boolean).length}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Progress</span><span className="font-medium">{items.length?Math.round(Object.values(formState).filter(Boolean).length/items.length*100):0}%</span></p>
                </div>
              </aside>
              <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                <button onClick={saveVerification} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showClinicalModal && selectedClinical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={()=>setShowClinicalModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-stethoscope text-purple-600"></i>Pemeriksaan Klinis - {selectedClinical.id}</h3>
                <p className="text-xs text-gray-500">Isi data klinis. Kolom bertanda * wajib.</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${computeClinicalLabel(clinicalForm) === 'Layak Sehat' ? 'bg-green-100 text-green-700' : computeClinicalLabel(clinicalForm) === 'Lengkapi Data' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{computeClinicalLabel(clinicalForm)}</span>
            </div>
            <form onSubmit={saveClinical} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Fisik *</label>
                    <select value={clinicalForm.kondisi} onChange={e=>setClinicalForm({...clinicalForm,kondisi:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                      <option value="">Pilih Kondisi</option>
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Sehat">Sehat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kurang">Kurang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh (°C) *</label>
                    <input type="number" step="0.1" value={clinicalForm.suhu} onChange={e=>setClinicalForm({...clinicalForm,suhu:e.target.value})} placeholder="38.5" className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${isTempNormal(clinicalForm.suhu) === false ? 'border-yellow-400 focus:ring-yellow-400':'border-gray-300 focus:ring-primary'}`} required />
                    <p className={`mt-1 text-xs ${isTempNormal(clinicalForm.suhu)===null?'text-gray-400':isTempNormal(clinicalForm.suhu)?'text-green-600':'text-yellow-700'}`}>Normal: {TEMP_MIN}–{TEMP_MAX} °C {isTempNormal(clinicalForm.suhu)===null?'':isTempNormal(clinicalForm.suhu)?'• Normal':'• Di luar rentang'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pemeriksaan Penyakit</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {[{key:'pmk',label:'PMK',icon:'fa-virus'},{key:'antraks',label:'Antraks',icon:'fa-biohazard'},{key:'brucellosis',label:'Brucellosis',icon:'fa-shield-virus'},{key:'parasit',label:'Parasit',icon:'fa-bug'}].map(d => (
                      <button type="button" key={d.key} onClick={()=>setClinicalForm(p=>({...p,[d.key]:!p[d.key]}))} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${clinicalForm[d.key] ? 'bg-red-50 border-red-300 text-red-700':'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}> <i className={`fas ${d.icon}`}></i>{d.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea rows="3" value={clinicalForm.catatan} onChange={e=>setClinicalForm({...clinicalForm,catatan:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Detail temuan klinis..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dokter Pemeriksa *</label>
                  <input type="text" value={clinicalForm.dokter} onChange={e=>setClinicalForm({...clinicalForm,dokter:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nama dokter" required />
                </div>
              </div>
              <aside className="md:col-span-1">
                <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ringkasan</h4>
                  <p className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-medium text-gray-800">{selectedClinical.id}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Kondisi</span><span className="font-medium">{clinicalForm.kondisi||'-'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Suhu</span><span className={`font-medium ${isTempNormal(clinicalForm.suhu)===false?'text-yellow-700':''}`}>{clinicalForm.suhu||'-'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Penyakit</span><span className="font-medium">{(['pmk','antraks','brucellosis','parasit'].filter(k=>clinicalForm[k]).length>0?'Ada indikasi':'Tidak ada')}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Dokter</span><span className="font-medium">{clinicalForm.dokter||'-'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Label</span><span className="font-medium">{computeClinicalLabel(clinicalForm)}</span></p>
                </div>
              </aside>
              <div className="md:col-span-3 flex justify-between items-center pt-2">
                <button type="button" onClick={()=>setClinicalForm({ kondisi:'', suhu:'', pmk:false, antraks:false, brucellosis:false, parasit:false, catatan:'', dokter:'' })} className="text-sm text-gray-600 hover:underline">Reset</button>
                <div className="flex gap-3">
                  <button type="button" onClick={()=>setShowClinicalModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                  <button type="submit" disabled={!clinicalForm.kondisi || !clinicalForm.suhu || !clinicalForm.dokter} className={`px-4 py-2 rounded-md text-white ${(!clinicalForm.kondisi || !clinicalForm.suhu || !clinicalForm.dokter)?'bg-primary/60 cursor-not-allowed':'bg-primary hover:bg-primaryDark'}`}>Simpan Pemeriksaan</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RphVerifikasiSehat;
