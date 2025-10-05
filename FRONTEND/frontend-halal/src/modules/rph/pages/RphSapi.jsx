import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RphSidebar from '../components/RphSidebar';

// Mengadopsi JagalSapi dengan penyesuaian konteks RPH (tanpa fitur edit penuh untuk batch pemotongan)
const RphSapi = () => {
  const [loading, setLoading] = useState(true);
  const [cattle, setCattle] = useState([]);
  const [filters, setFilters] = useState({ type: '', availability: '', healthStatus: '', search: '' });
  const [showCattleModal, setShowCattleModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('cattleList') || '[]');
        const data = stored.map(c => ({
          id: c.id,
          type: c.jenis === 'other' ? c.customJenis : c.jenis,
          gender: c.kelamin,
          weight: Number(c.berat) || 0,
          healthStatus: c.healthStatus || 'sehat',
          availability: c.availability || 'available',
          age: Number(c.usia) || 0,
          birthDate: c.tanggalLahir || new Date().toISOString().split('T')[0],
          origin: c.origin || 'beli'
        }));
        setCattle(data);
      } catch(e){ console.error(e); }
      setLoading(false);
    }, 500);
  }, []);

  const stats = useMemo(() => ({
    total: cattle.length,
    available: cattle.filter(c => c.availability === 'available').length,
    inTrans: cattle.filter(c => c.availability === 'in_transaction').length,
    needCheck: cattle.filter(c => c.healthStatus !== 'sehat').length,
  }), [cattle]);

  const onFilter = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const reset = () => setFilters({ type: '', availability: '', healthStatus: '', search: '' });

  const filtered = cattle.filter(c => (
    (filters.type === '' || c.type.toLowerCase().includes(filters.type.toLowerCase())) &&
    (filters.availability === '' || c.availability === filters.availability) &&
    (filters.healthStatus === '' || c.healthStatus === filters.healthStatus) &&
    (filters.search === '' || c.id.toLowerCase().includes(filters.search.toLowerCase()) || c.type.toLowerCase().includes(filters.search.toLowerCase()))
  ));

  const badge = (cls, label) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}>{label}</span>;
  const healthBadge = (s) => { const map = { sehat: ['bg-green-100 text-green-800', 'Sehat'], perlu_periksa: ['bg-yellow-100 text-yellow-800', 'Perlu Periksa'], sakit: ['bg-red-100 text-red-800', 'Sakit'] }; const [cls, label] = map[s] || map.sehat; return badge(cls, label); };
  const availBadge = (a) => { const map = { available: ['bg-green-100 text-green-800', 'Tersedia'], sold: ['bg-gray-100 text-gray-800', 'Terjual'], in_transaction: ['bg-blue-100 text-blue-800', 'Dalam Transaksi'] }; const [cls, label] = map[a] || map.available; return badge(cls, label); };

  const viewCattleDetail = (id) => { const c = cattle.find(x => x.id === id); if(!c) return; setSelectedCattle(c); setShowCattleModal(true); };
  const closeCattleModal = () => { setShowCattleModal(false); setSelectedCattle(null); };
  const formatDate = (s) => new Date(s).toLocaleDateString('id-ID');

  return (
    <DashboardLayout title="Data Sapi" role="RPH" customSidebar={<RphSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6"><div className="flex items-center"><div className="flex-grow text-left"><p className="text-sm text-gray-500">Total Sapi</p><p className="text-2xl font-semibold text-gray-800">{stats.total}</p></div><i className="fas fa-cow text-primary text-2xl"></i></div></div>
            <div className="bg-white rounded-lg shadow-sm p-6"><div className="flex items-center"><div className="flex-grow text-left"><p className="text-sm text-gray-500">Tersedia</p><p className="text-2xl font-semibold text-green-600">{stats.available}</p></div><i className="fas fa-check-circle text-green-500 text-2xl"></i></div></div>
            <div className="bg-white rounded-lg shadow-sm p-6"><div className="flex items-center"><div className="flex-grow text-left"><p className="text-sm text-gray-500">Dalam Transaksi</p><p className="text-2xl font-semibold text-blue-600">{stats.inTrans}</p></div><i className="fas fa-handshake text-blue-500 text-2xl"></i></div></div>
            <div className="bg-white rounded-lg shadow-sm p-6"><div className="flex items-center"><div className="flex-grow text-left"><p className="text-sm text-gray-500">Perlu Periksa</p><p className="text-2xl font-semibold text-red-600">{stats.needCheck}</p></div><i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i></div></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Ternak</label>
                <input name="type" value={filters.type} onChange={onFilter} placeholder="Contoh: Sapi Limosin" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                <select name="availability" value={filters.availability} onChange={onFilter} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua</option>
                  <option value="available">Tersedia</option>
                  <option value="sold">Terjual</option>
                  <option value="in_transaction">Dalam Transaksi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                <select name="healthStatus" value={filters.healthStatus} onChange={onFilter} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua</option>
                  <option value="sehat">Sehat</option>
                  <option value="perlu_periksa">Perlu Periksa</option>
                  <option value="sakit">Sakit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input name="search" value={filters.search} onChange={onFilter} placeholder="Cari ID/Jenis..." className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={reset} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm">Reset</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Detail Inventaris</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kesehatan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ketersediaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" className="px-6 py-4 text-left text-sm text-gray-500">Tidak ada data.</td></tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">{c.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.age}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{healthBadge(c.healthStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{availBadge(c.availability)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary hover:text-primaryDark mr-2" onClick={() => viewCattleDetail(c.id)} title="Lihat Detail">
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showCattleModal && selectedCattle && (
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
                  <h3 className="text-xl font-medium text-blue-600">Detail Sapi</h3>
                  <button onClick={closeCattleModal} className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 p-2 rounded-full hover:bg-blue-50" title="Tutup">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                <div className="p-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ID Sapi</p>
                      <p className="font-semibold">{selectedCattle.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jenis</p>
                      <p className="font-semibold">{selectedCattle.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jenis Kelamin</p>
                      <p className="font-semibold">{selectedCattle.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Umur</p>
                      <p className="font-semibold">{selectedCattle.age} tahun</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Berat</p>
                      <p className="font-semibold">{selectedCattle.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status Kesehatan</p>
                      {healthBadge(selectedCattle.healthStatus)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ketersediaan</p>
                      {availBadge(selectedCattle.availability)}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={closeCattleModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RphSapi;
