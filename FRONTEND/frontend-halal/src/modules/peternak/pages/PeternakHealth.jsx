import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';

const PeternakHealth = () => {
  const API_BASE = 'http://localhost:3000';
  // Ambil sebagian data sapi dari localStorage (sebagai contoh ternak yang perlu verifikasi)
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [formData, setFormData] = useState({
    kondisi: '',
    suhu: '',
    pmk: false,
    antraks: false,
    brucellosis: false,
    parasit: false,
    catatan: '',
    dokter: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [itemSehatId, setItemSehatId] = useState('');

  // Helpers: normal temperature range and computed status
  const TEMP_MIN = 37.5;
  const TEMP_MAX = 39.5;
  const isTempNormal = (val) => {
    const t = parseFloat(val);
    if (Number.isNaN(t)) return null;
    return t >= TEMP_MIN && t <= TEMP_MAX;
  };
  const computeStatusLabel = (data) => {
    const anyDisease = data.pmk || data.antraks || data.brucellosis || data.parasit;
    const tempOk = isTempNormal(data.suhu);
    const kondisiBaik = ['Sangat Baik', 'Baik'].includes(data.kondisi);
    if (!data.kondisi || !data.suhu) return 'Lengkapi Data';
    if (!tempOk || anyDisease || !kondisiBaik) return 'Butuh Pemeriksaan Lanjut';
    return 'Layak Sehat';
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cattleList') || '[]');
      // Filter contoh: healthStatus perlu_periksa atau sakit dianggap pending
      const pending = stored
        .filter(c => c.healthStatus === 'perlu_periksa' || c.healthStatus === 'sakit')
        .slice(0, 10) // batasi
        .map(c => ({
          id: c.id,
          type: c.jenis === 'other' ? c.customJenis : c.jenis,
          weight: c.berat || 0,
          source: 'Kandang Sendiri',
          arrivalDate: c.tanggalLahir ? new Date(c.tanggalLahir).toLocaleDateString('id-ID') : '-'
        }));
      setPendingVerifications(pending);
    } catch (e) {
      console.error(e);
    }
    // Fetch default ItemSehat for clinical verification
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/itemSehat`, { headers });
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          const klinis = list.find(i => String(i.nama || '').toLowerCase().includes('klinis')) || list[0];
          setItemSehatId(klinis.id);
        }
      } catch {}
    })();
  }, []);

  const openVerificationModal = (cattle) => {
    setSelectedCattle(cattle);
    setFormData({ kondisi: '', suhu: '', pmk:false, antraks:false, brucellosis:false, parasit:false, catatan:'', dokter:'' });
    setShowVerificationModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedCattle) return;
    let created = null;
    try {
      let ensureItemId = itemSehatId;
      if (!ensureItemId) {
        // Try create a default ItemSehat when none available
        const token = localStorage.getItem('token');
        const headersC = { 'Content-Type': 'application/json' };
        if (token) headersC['Authorization'] = `Bearer ${token}`;
        const createRes = await fetch(`${API_BASE}/itemSehat`, { method: 'POST', headers: headersC, body: JSON.stringify({ nama: 'Pemeriksaan Klinis', kategori: 'Klinis' }) });
        if (createRes.ok) {
          const it = await createRes.json();
          ensureItemId = it.id;
          setItemSehatId(it.id);
        }
      }
      const okBoolean = computeStatusLabel(formData) === 'Layak Sehat';
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const payload = { sapiId: selectedCattle.id, itemSehatId: ensureItemId, boolean: okBoolean };
      const res = await fetch(`${API_BASE}/pengecekanSehat`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (res.ok) {
        created = await res.json();
      }
    } catch (err) {}

    const record = {
      id: selectedCattle.id,
      type: selectedCattle.type,
      source: selectedCattle.source,
      verifiedDate: new Date().toLocaleDateString('id-ID'),
      weight: selectedCattle.weight,
      status: 'Terverifikasi',
      detail: { ...formData },
      cid: created?.cid || ''
    };
    setPendingVerifications(prev => prev.filter(p => p.id !== selectedCattle.id));
    setVerificationHistory(prev => [record, ...prev]);
    setShowVerificationModal(false);
    setSelectedCattle(null);
    setSuccessMessage(`Verifikasi kesehatan untuk ${record.id} berhasil disimpan.`);
    setTimeout(()=> setSuccessMessage(''), 3000);
  };

  return (
  <DashboardLayout title="Pemeriksaan & Verifikasi Kesehatan" role="PETERNAK"> 
  <div className="mt-2">
        <div className="mb-6">
          {/* Title now provided by DashboardLayout */}
          <p className="text-sm text-gray-600 leading-relaxed text-center whitespace-nowrap">Kelola proses pemeriksaan kesehatan sapi Anda. Lakukan verifikasi kesehatan pada ternak yang berstatus perlu periksa atau sakit untuk memperbarui status kesehatannya.</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-md border border-green-400 bg-green-100 text-green-700 text-sm">
            <i className="fas fa-check-circle mr-2"></i>{successMessage}
          </div>
        )}

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Menunggu Pemeriksaan</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingVerifications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Terverifikasi</p>
            <p className="text-3xl font-bold text-green-600">{verificationHistory.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
            <p className="text-sm text-gray-500">Total Pemeriksaan (Sesi Ini)</p>
            <p className="text-3xl font-bold text-primary">{verificationHistory.length + pendingVerifications.length}</p>
          </div>
        </div>

        {/* Pending */}
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Perlu Pemeriksaan</h2>
          <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sapi</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingVerifications.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-primary text-left align-middle">{c.id}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{c.type}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{c.source}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{c.arrivalDate}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{c.weight}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-left align-middle">
                      <button
                        onClick={() => openVerificationModal(c)}
                        title="Periksa Kesehatan"
                        className="p-2 rounded-md border border-primary/30 text-primary hover:bg-primary/10"
                        aria-label="Periksa Kesehatan"
                      >
                        <i className="fas fa-stethoscope"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingVerifications.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-4 text-left text-sm text-gray-500">Tidak ada sapi yang perlu diperiksa.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
    <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Pemeriksaan</h2>
          <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sapi</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Verifikasi</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokter</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verificationHistory.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-primary text-left align-middle">{r.id}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{r.type}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{r.verifiedDate}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{r.weight}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{r.detail.kondisi || '-'}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">{r.detail.dokter || '-'}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700 text-left align-middle">
                      {r.cid ? (
                        <a 
                          href={`https://ipfs.io/ipfs/${r.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                          title={r.cid}
                        >
                          {r.cid.length > 18 ? `${r.cid.slice(0,8)}...${r.cid.slice(-8)}` : r.cid}
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))}
                {verificationHistory.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-4 text-left text-sm text-gray-500">Belum ada pemeriksaan dilakukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showVerificationModal && selectedCattle && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent"
            onClick={() => setShowVerificationModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-stethoscope text-primary"></i>
                    Pemeriksaan Sapi #{selectedCattle.id}
                  </h3>
                  <p className="text-xs text-gray-500">Isi data pemeriksaan di bawah ini. Kolom bertanda bintang wajib diisi.</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${computeStatusLabel(formData) === 'Layak Sehat' ? 'bg-green-100 text-green-700' : computeStatusLabel(formData) === 'Lengkapi Data' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {computeStatusLabel(formData)}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form kiri (2 kolom) */}
                <div className="md:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Fisik <span className="text-red-500">*</span></label>
                      <select
                        value={formData.kondisi}
                        onChange={e=>setFormData({...formData, kondisi:e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Pilih Kondisi</option>
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh (°C) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.suhu}
                        onChange={e=>setFormData({...formData, suhu:e.target.value})}
                        placeholder="Misal: 38.5"
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${isTempNormal(formData.suhu) === false ? 'border-yellow-400 focus:ring-yellow-400' : 'border-gray-300 focus:ring-primary'}`}
                        required
                      />
                      <p className={`mt-1 text-xs ${isTempNormal(formData.suhu) === null ? 'text-gray-400' : isTempNormal(formData.suhu) ? 'text-green-600' : 'text-yellow-700'}`}>
                        Normal: {TEMP_MIN}–{TEMP_MAX} °C {isTempNormal(formData.suhu) === null ? '' : isTempNormal(formData.suhu) ? '• Suhu normal' : '• Di luar rentang normal'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Pemeriksaan Penyakit</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {[
                        {key:'pmk', label:'PMK', icon:'fa-virus'},
                        {key:'antraks', label:'Antraks', icon:'fa-biohazard'},
                        {key:'brucellosis', label:'Brucellosis', icon:'fa-shield-virus'},
                        {key:'parasit', label:'Parasit', icon:'fa-bug'}
                      ].map(item => (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => setFormData(prev => ({...prev, [item.key]: !prev[item.key]}))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${formData[item.key] ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          aria-pressed={formData[item.key]}
                        >
                          <i className={`fas ${item.icon}`}></i>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Pemeriksaan</label>
                    <textarea
                      rows="3"
                      value={formData.catatan}
                      onChange={e=>setFormData({...formData, catatan:e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Masukkan hasil pemeriksaan secara detail..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dokter Hewan Pemeriksa <span className="text-red-500">*</span></label>
                    <input
                      list="daftar-dokter"
                      type="text"
                      value={formData.dokter}
                      onChange={e=>setFormData({...formData, dokter:e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nama dokter hewan"
                      required
                    />
                    <datalist id="daftar-dokter">
                      <option value="drh. Andi" />
                      <option value="drh. Sari" />
                      <option value="drh. Bima" />
                    </datalist>
                  </div>
                </div>

                {/* Ringkasan kanan */}
                <aside className="md:col-span-1">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex justify-between gap-3"><span className="text-gray-500">ID</span><span className="font-medium text-gray-800">{selectedCattle.id}</span></li>
                      <li className="flex justify-between gap-3"><span className="text-gray-500">Kondisi</span><span className="font-medium">{formData.kondisi || '-'}</span></li>
                      <li className="flex justify-between gap-3"><span className="text-gray-500">Suhu</span><span className={`font-medium ${isTempNormal(formData.suhu) === false ? 'text-yellow-700' : ''}`}>{formData.suhu || '-'}</span></li>
                      <li className="flex justify-between gap-3"><span className="text-gray-500">Penyakit</span><span className="font-medium">{(['pmk','antraks','brucellosis','parasit'].filter(k=>formData[k]).length>0 ? 'Ada indikasi' : 'Tidak ada')}</span></li>
                      <li className="flex justify-between gap-3"><span className="text-gray-500">Dokter</span><span className="font-medium">{formData.dokter || '-'}</span></li>
                    </ul>
                  </div>
                </aside>

                {/* Footer actions spanning all cols */}
                <div className="md:col-span-3 flex justify-between items-center pt-2">
                  <button type="button" onClick={()=>setFormData({ kondisi: '', suhu: '', pmk:false, antraks:false, brucellosis:false, parasit:false, catatan:'', dokter:'' })} className="text-sm text-gray-600 hover:underline">Reset formulir</button>
                  <div className="flex gap-3">
                    <button type="button" onClick={()=>setShowVerificationModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                    <button
                      type="submit"
                      disabled={!formData.kondisi || !formData.suhu || !formData.dokter}
                      className={`px-4 py-2 rounded-md text-white ${(!formData.kondisi || !formData.suhu || !formData.dokter) ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primaryDark'}`}
                    >
                      Simpan Verifikasi
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PeternakHealth;
