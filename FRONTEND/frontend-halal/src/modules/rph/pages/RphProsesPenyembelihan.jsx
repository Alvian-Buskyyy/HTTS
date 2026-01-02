import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import RphSidebar from "../components/RphSidebar";
import ChecklistPraForm from "../components/ChecklistPraForm";
import ChecklistPascaForm from "../components/ChecklistPascaForm";
import InputHasilForm from "../components/InputHasilForm";

const RphProsesPenyembelihan = () => {
  const API_BASE = "http://localhost:3000";

  const [sapiPending, setSapiPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // list, checklist-pra, slaughter, checklist-pasca, input-hasil
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, ready, processing
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchSapiPending();
  }, []);

  const fetchSapiPending = async (filterStatus = null) => {
    try {
      setLoading(true);
      let url = `${API_BASE}/transaksiPenyembelihan/rph/sapi-pending`;
      
      // Add status query parameter if filter is applied
      if (filterStatus && filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSapiPending(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sapi pending:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (transaksi) => {
    // Tentukan action berdasarkan status transaksi
    switch(transaksi.status) {
      case 'PENDING_RPH':
        // Call API to update status to CHECKLIST_PRA first
        handleMulaiChecklistPra(transaksi);
        break;
      case 'CHECKLIST_PRA':
        // Continue filling checklist pra (no API call needed, just show form)
        setSelectedTransaksi(transaksi);
        setCurrentView('checklist-pra');
        break;
      case 'READY_TO_SLAUGHTER':
        setSelectedTransaksi(transaksi);
        setCurrentView('slaughter');
        break;
      case 'SLAUGHTERING':
        setSelectedTransaksi(transaksi);
        setCurrentView('checklist-pasca');
        break;
      case 'CHECKLIST_PASCA':
        // Continue filling checklist pasca (no API call needed, just show form)
        setSelectedTransaksi(transaksi);
        setCurrentView('checklist-pasca');
        break;
      case 'PENDING_INPUT_HASIL':
        setSelectedTransaksi(transaksi);
        setCurrentView('input-hasil');
        break;
      default:
        setCurrentView('list');
    }
  };

  const handleMulaiChecklistPra = async (transaksi) => {
    setSelectedTransaksi(transaksi);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/rph/mulai-checklist-pra`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transaksiId: transaksi.id })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Checklist pra-penyembelihan dimulai!' });
        setCurrentView('checklist-pra');
        // Update transaksi with new status
        setSelectedTransaksi(data.data);
        fetchSapiPending();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memulai checklist pra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const handleMulaiPenyembelihan = async () => {
    setLoading(true);
    try {
      // Step 1: Mulai penyembelihan (READY_TO_SLAUGHTER -> SLAUGHTERING)
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/rph/mulai-penyembelihan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transaksiId: selectedTransaksi.id })
      });

      const data = await res.json();
      if (res.ok) {
        // Step 2: Mulai checklist pasca (SLAUGHTERING -> CHECKLIST_PASCA)
        const res2 = await fetch(`${API_BASE}/transaksiPenyembelihan/rph/mulai-checklist-pasca`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ transaksiId: selectedTransaksi.id })
        });

        const data2 = await res2.json();
        if (res2.ok) {
          setMessage({ type: 'success', text: 'Proses penyembelihan dimulai! Lanjut ke checklist pasca.' });
          setCurrentView('checklist-pasca');
          setSelectedTransaksi(data2.data);
          fetchSapiPending();
        } else {
          setMessage({ type: 'error', text: data2.error || 'Gagal memulai checklist pasca' });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memulai penyembelihan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedTransaksi(null);
    setMessage({ type: '', text: '' });
  };

  const handleSuccess = () => {
    setCurrentView('list');
    setSelectedTransaksi(null);
    fetchSapiPending(statusFilter === 'all' ? null : statusFilter);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    let statusValue = null;
    
    switch(filter) {
      case 'pending':
        // Include both PENDING_RPH and CHECKLIST_PRA (in-progress checklist)
        statusValue = 'PENDING_RPH,CHECKLIST_PRA';
        break;
      case 'ready':
        statusValue = 'READY_TO_SLAUGHTER';
        break;
      case 'processing':
        statusValue = 'SLAUGHTERING,CHECKLIST_PASCA,PENDING_INPUT_HASIL';
        break;
      default:
        statusValue = null;
    }
    
    fetchSapiPending(statusValue);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING_RPH': { color: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock', text: 'Pending Checklist Pra' },
      'CHECKLIST_PRA': { color: 'bg-blue-100 text-blue-800', icon: 'fa-clipboard-list', text: 'Mengisi Checklist Pra' },
      'READY_TO_SLAUGHTER': { color: 'bg-green-100 text-green-800', icon: 'fa-check-circle', text: 'Siap Disembelih' },
      'SLAUGHTERING': { color: 'bg-orange-100 text-orange-800', icon: 'fa-cut', text: 'Dalam Proses' },
      'CHECKLIST_PASCA': { color: 'bg-purple-100 text-purple-800', icon: 'fa-clipboard-check', text: 'Mengisi Checklist Pasca' },
      'PENDING_INPUT_HASIL': { color: 'bg-pink-100 text-pink-800', icon: 'fa-weight', text: 'Input Hasil' },
      'PENDING_JAGAL_VERIFICATION': { color: 'bg-gray-100 text-gray-800', icon: 'fa-hourglass-half', text: 'Menunggu Verifikasi Jagal' },
      'PENDING_REGULATOR_VERIFICATION': { color: 'bg-gray-100 text-gray-800', icon: 'fa-hourglass-half', text: 'Menunggu Verifikasi Regulator' },
      'VERIFIED': { color: 'bg-green-100 text-green-800', icon: 'fa-check-double', text: 'Terverifikasi' }
    };

    const badge = badges[status] || badges['PENDING_RPH'];
    return (
      <span className={`${badge.color} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5`}>
        <i className={`fas ${badge.icon}`}></i>
        {badge.text}
      </span>
    );
  };

  const getActionButton = (transaksi) => {
    const buttons = {
      'PENDING_RPH': { text: 'Mulai Checklist Pra', icon: 'fa-clipboard-list', color: 'bg-blue-500 hover:bg-blue-600' },
      'CHECKLIST_PRA': { text: 'Lanjutkan Checklist Pra', icon: 'fa-clipboard-list', color: 'bg-blue-500 hover:bg-blue-600' },
      'READY_TO_SLAUGHTER': { text: 'Mulai Penyembelihan', icon: 'fa-cut', color: 'bg-green-500 hover:bg-green-600' },
      'SLAUGHTERING': { text: 'Checklist Pasca', icon: 'fa-clipboard-check', color: 'bg-purple-500 hover:bg-purple-600' },
      'CHECKLIST_PASCA': { text: 'Lanjutkan Checklist Pasca', icon: 'fa-clipboard-check', color: 'bg-purple-500 hover:bg-purple-600' },
      'PENDING_INPUT_HASIL': { text: 'Input Hasil', icon: 'fa-weight', color: 'bg-pink-500 hover:bg-pink-600' }
    };

    const btn = buttons[transaksi.status];
    if (!btn) return null;

    return (
      <button
        onClick={() => handleActionClick(transaksi)}
        className={`${btn.color} text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg`}
      >
        <i className={`fas ${btn.icon}`}></i>
        {btn.text}
      </button>
    );
  };

  return (
    <DashboardLayout title="Proses Penyembelihan" role="RPH" customSidebar={<RphSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-cut text-white"></i>
            </div>
            Proses Penyembelihan Halal
          </h1>
          <p className="text-gray-600 mt-2 ml-13">
            Kelola proses penyembelihan sapi yang didaftarkan oleh Jagal dengan checklist halal
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg flex items-center gap-2`}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            {message.text}
          </div>
        )}

        {/* Content based on current view */}
        {currentView === 'checklist-pra' && selectedTransaksi && (
          <ChecklistPraForm
            transaksi={selectedTransaksi}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        )}

        {currentView === 'slaughter' && selectedTransaksi && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cut text-green-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sapi Siap Disembelih</h2>
              <p className="text-gray-600 mb-6">Checklist pra-penyembelihan telah lengkap. Klik tombol di bawah untuk memulai proses penyembelihan.</p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-900 mb-2">Informasi Sapi</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Jenis:</span>
                    <p className="text-blue-900">{selectedTransaksi.sapi.jenis}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Kelamin:</span>
                    <p className="text-blue-900">{selectedTransaksi.sapi.kelamin}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Usia:</span>
                    <p className="text-blue-900">{selectedTransaksi.sapi.usia} bulan</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Berat:</span>
                    <p className="text-blue-900">{selectedTransaksi.sapi.beratSapi} kg</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  <i className="fas fa-times mr-2"></i>
                  Batal
                </button>
                <button
                  onClick={handleMulaiPenyembelihan}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:bg-gray-400 transition shadow-md"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cut mr-2"></i>
                      Mulai Penyembelihan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'checklist-pasca' && selectedTransaksi && (
          <ChecklistPascaForm
            transaksi={selectedTransaksi}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        )}

        {currentView === 'input-hasil' && selectedTransaksi && (
          <InputHasilForm
            transaksi={selectedTransaksi}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        )}

        {/* List Transaksi */}
        {currentView === 'list' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Status Filter Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                    statusFilter === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-list mr-2"></i>
                  Semua
                </button>
                <button
                  onClick={() => handleFilterChange('pending')}
                  className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                    statusFilter === 'pending'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-clock mr-2"></i>
                  Perlu Checklist Pra
                </button>
                <button
                  onClick={() => handleFilterChange('ready')}
                  className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                    statusFilter === 'ready'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-check-circle mr-2"></i>
                  Siap Dipotong
                </button>
                <button
                  onClick={() => handleFilterChange('processing')}
                  className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
                    statusFilter === 'processing'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-cut mr-2"></i>
                  Dalam Proses
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {statusFilter === 'all' && 'Semua Transaksi Penyembelihan'}
                {statusFilter === 'pending' && 'Sapi Perlu Checklist Pra-Penyembelihan'}
                {statusFilter === 'ready' && 'Sapi Siap Dipotong'}
                {statusFilter === 'processing' && 'Sapi Dalam Proses Penyembelihan'}
              </h2>
              <button
                onClick={() => fetchSapiPending(statusFilter === 'all' ? null : statusFilter)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data...</p>
              </div>
            ) : sapiPending.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 text-lg">Tidak ada transaksi penyembelihan</p>
                <p className="text-gray-500 text-sm">Transaksi akan muncul ketika Jagal mendaftarkan sapi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sapiPending.map((transaksi) => (
                  <div key={transaksi.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{transaksi.sapi.jenis}</h3>
                          {getStatusBadge(transaksi.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <i className="fas fa-user w-5"></i>
                            Pemilik: <span className="font-medium">{transaksi.jagal?.nama || 'N/A'}</span>
                          </p>
                          <p>
                            <i className="fas fa-calendar w-5"></i>
                            Didaftarkan: {new Date(transaksi.tanggalPendaftaran).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Kelamin</p>
                        <p className="font-semibold text-sm text-gray-900">{transaksi.sapi.kelamin}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Usia</p>
                        <p className="font-semibold text-sm text-gray-900">{transaksi.sapi.usia} bulan</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Berat</p>
                        <p className="font-semibold text-sm text-gray-900">{transaksi.sapi.beratSapi} kg</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Asal</p>
                        <p className="font-semibold text-sm text-gray-900">{transaksi.sapi.asalType}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <p className="font-semibold text-sm text-gray-900">{transaksi.status.replace(/_/g, ' ')}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {getActionButton(transaksi)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RphProsesPenyembelihan;
