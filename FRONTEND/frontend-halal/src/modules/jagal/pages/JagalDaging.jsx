import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

const JagalDaging = () => {
  const [dagingList, setDagingList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    totalBerat: 0,
    terjual: 0,
    tersedia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, verified, pending, tersedia, terjual
  const [selectedDaging, setSelectedDaging] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchDaging();
  }, []);

  const fetchDaging = async () => {
    setLoading(true);
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/daging`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDagingList(data.data || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching daging:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (daging) => {
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/daging/${daging.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSelectedDaging(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching daging detail:', error);
    }
  };

  const filteredDaging = dagingList.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'verified') return d.statusHalal === 'VERIFIED';
    if (filter === 'pending') return d.statusHalal === 'PENDING';
    if (filter === 'tersedia') return !d.transaksiPenjualan || d.transaksiPenjualan.length === 0;
    if (filter === 'terjual') return d.transaksiPenjualan && d.transaksiPenjualan.length > 0;
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      VERIFIED: <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">✓ Halal Verified</span>,
      PENDING: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">⏳ Pending</span>,
      REJECTED: <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">✗ Rejected</span>,
    };
    return badges[status] || <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">{status}</span>;
  };

  return (
    <DashboardLayout title="Data Daging" role="JAGAL" customSidebar={<JagalSidebar />}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <i className="fas fa-drumstick-bite text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Daging</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="fas fa-certificate text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Halal Verified</p>
                <p className="text-2xl font-bold text-gray-800">{stats.verified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <i className="fas fa-weight text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Berat</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalBerat.toFixed(1)} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tersedia</p>
                <p className="text-2xl font-bold text-gray-800">{stats.tersedia}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-box-open text-indigo-600"></i>
                  Inventori Daging
                </h2>
                <p className="text-sm text-gray-500 mt-1">Kelola dan monitor stok daging halal Anda</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('verified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'verified'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Verified ({stats.verified})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setFilter('tersedia')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'tersedia'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tersedia ({stats.tersedia})
                </button>
                <button
                  onClick={() => setFilter('terjual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'terjual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Terjual ({stats.terjual})
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Memuat data daging...</p>
              </div>
            ) : filteredDaging.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <i className="fas fa-box-open text-gray-300 text-5xl mb-4"></i>
                <p className="text-gray-600">Tidak ada daging</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Daging</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asal Sapi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RPH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Halal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Jual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDaging.map(daging => (
                      <tr key={daging.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                          #{daging.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {daging.sapi?.jenis || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {daging.rph?.nama || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Daging:</span>
                              <span className="font-semibold text-green-700">{daging.beratDaging} kg</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Jeroan:</span>
                              <span className="font-semibold text-blue-700">{daging.beratJeroan} kg</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Tulang:</span>
                              <span className="font-semibold text-gray-700">{daging.beratTulang} kg</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold border-t pt-1">
                              <span>Total:</span>
                              <span>{daging.totalBerat} kg</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(daging.statusHalal)}
                          <div className="mt-2 flex gap-1">
                            <span className={`px-2 py-1 rounded text-xs ${daging.verifikasiJagal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              J: {daging.verifikasiJagal ? '✓' : '✗'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${daging.verifikasiRegulator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              R: {daging.verifikasiRegulator ? '✓' : '✗'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {daging.transaksiPenjualan && daging.transaksiPenjualan.length > 0 ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Terjual ({daging.transaksiPenjualan.length}x)
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">
                              Tersedia
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(daging.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleViewDetail(daging)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <i className="fas fa-info-circle text-indigo-600"></i>
                Detail Daging #{selectedDaging.id.slice(0, 8)}
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-box text-indigo-600"></i>
                    Informasi Dasar
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Daging:</span>
                      <span className="font-medium">#{selectedDaging.id.slice(0, 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asal Sapi:</span>
                      <span className="font-medium">{selectedDaging.sapi?.jenis || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RPH:</span>
                      <span className="font-medium">{selectedDaging.rph?.nama || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Produksi:</span>
                      <span className="font-medium">{new Date(selectedDaging.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-weight-hanging text-purple-600"></i>
                    Berat & Komposisi
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berat Daging:</span>
                      <span className="font-bold text-green-700">{selectedDaging.beratDaging} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berat Jeroan:</span>
                      <span className="font-bold text-blue-700">{selectedDaging.beratJeroan} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berat Tulang:</span>
                      <span className="font-bold text-gray-700">{selectedDaging.beratTulang} kg</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-800 font-semibold">Total Berat:</span>
                      <span className="font-bold text-indigo-700">{selectedDaging.totalBerat} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Halal */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-certificate text-green-600"></i>
                  Status Sertifikasi Halal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1">Status:</span>
                    {getStatusBadge(selectedDaging.statusHalal)}
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Verifikasi Jagal:</span>
                    <span className={`px-2 py-1 rounded text-xs ${selectedDaging.verifikasiJagal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedDaging.verifikasiJagal ? '✓ Terverifikasi' : '✗ Belum'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Verifikasi Regulator:</span>
                    <span className={`px-2 py-1 rounded text-xs ${selectedDaging.verifikasiRegulator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedDaging.verifikasiRegulator ? '✓ Terverifikasi' : '✗ Belum'}
                    </span>
                  </div>
                </div>
                {selectedDaging.verifiedAt && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">Terverifikasi pada:</span>
                    <span className="ml-2 font-medium">{new Date(selectedDaging.verifiedAt).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              {selectedDaging.transaksiPenjualan && selectedDaging.transaksiPenjualan.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-receipt text-blue-600"></i>
                    Riwayat Penjualan
                  </h4>
                  <div className="space-y-2">
                    {selectedDaging.transaksiPenjualan.map((transaksi, idx) => (
                      <div key={idx} className="bg-white rounded p-3 text-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Pembeli: {transaksi.distributor?.nama || transaksi.horeka?.nama || 'Unknown'}</p>
                            <p className="text-gray-600 text-xs">{new Date(transaksi.tanggalTransaksi || transaksi.createdAt).toLocaleString('id-ID')}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {transaksi.status || 'COMPLETED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {selectedDaging.qr && selectedDaging.qr.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-qrcode text-gray-600"></i>
                    QR Code Traceability
                  </h4>
                  <p className="text-sm text-gray-600">QR Code tersedia untuk tracking</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JagalDaging;
