import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Link } from 'react-router-dom';
import JagalSidebar from '../components/JagalSidebar';

const JagalSapi = () => {
  const [loading, setLoading] = useState(true);
  const [cattle, setCattle] = useState([]);
  const [filters, setFilters] = useState({ type: '', availability: '', healthStatus: '', search: '' });
  const [showCattleModal, setShowCattleModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCattle, setEditCattle] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // QR Code states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const userRaw = localStorage.getItem('user');
        let jagalId = '';
        try {
          const u = userRaw ? JSON.parse(userRaw) : null;
          jagalId = u?.entityId || u?.id || '';
        } catch {}

        if (!jagalId) {
          console.error('Jagal ID tidak ditemukan');
          setCattle([]);
          setLoading(false);
          return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Gunakan endpoint getSapiByEntity dari sapiRoutes
        const sapiRes = await fetch(`http://localhost:3000/sapi/entity/JAGAL/${jagalId}`, { headers });

        if (!sapiRes.ok) {
          throw new Error('Gagal memuat data sapi dari server');
        }

        const sapiData = await sapiRes.json();

        const data = Array.isArray(sapiData) ? sapiData.map(s => ({
          id: s.id,
          type: s.jenis || 'Sapi',
          gender: s.kelamin || '-',
          weight: Number(s.beratSapi) || 0,
          healthStatus: 'sehat',
          availability: s.isProcessed ? 'sold' : 'available',
          age: Number(s.usia) || 0,
          birthDate: s.tanggalLahir || '',
          origin: s.asalType === 'JAGAL' ? 'lahir_sendiri' : 'beli',
          motherId: '',
          fatherId: ''
        })) : [];

        // Merge dengan data lokal hasil pendaftaran (localStorage)
        let localItems = [];
        try {
          const ls = localStorage.getItem('cattleList');
          if (ls) localItems = JSON.parse(ls);
        } catch {}

        const mappedLocal = Array.isArray(localItems) ? localItems.map(item => ({
          id: item.id,
          type: item.jenis || item.customJenis || 'Sapi',
          gender: item.kelamin || '-',
          weight: Number(item.berat) || 0,
          healthStatus: item.healthStatus || 'sehat',
          availability: item.availability || 'available',
          age: Number(item.usia) || 0,
          birthDate: item.tanggalLahir || '',
          origin: item.origin || 'lahir_sendiri',
          motherId: item.motherId || '',
          fatherId: item.fatherId || ''
        })) : [];

        const idSet = new Set(data.map(d => d.id));
        const merged = data.concat(mappedLocal.filter(m => m.id && !idSet.has(m.id)));

        setCattle(merged);
      } catch (e) {
        console.error('Gagal memuat data sapi Jagal:', e);
        setCattle([]);
      } finally {
        setLoading(false);
      }
    };
    load();
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

  const badge = (cls, label) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}>{label}</span>
  );

  const healthBadge = (s) => {
    const map = { sehat: ['bg-green-100 text-green-800', 'Sehat'], perlu_periksa: ['bg-yellow-100 text-yellow-800', 'Perlu Periksa'], sakit: ['bg-red-100 text-red-800', 'Sakit'] };
    const [cls, label] = map[s] || map.sehat; return badge(cls, label);
  };
  const availBadge = (a) => {
    const map = { available: ['bg-green-100 text-green-800', 'Tersedia'], sold: ['bg-gray-100 text-gray-800', 'Terjual'], in_transaction: ['bg-blue-100 text-blue-800', 'Dalam Transaksi'] };
    const [cls, label] = map[a] || map.available; return badge(cls, label);
  };

  // Detail modal helpers
  const viewCattleDetail = (id) => {
    const c = cattle.find(x => x.id === id);
    if (!c) return;
    setSelectedCattle(c);
    setShowCattleModal(true);
    setShowEditForm(false);
    setEditCattle(null);
  };

  const closeCattleModal = () => {
    setShowCattleModal(false);
    setSelectedCattle(null);
    setShowEditForm(false);
    setEditCattle(null);
    setSaveSuccess('');
  };

  const openEditForm = (row) => {
    const c = row || selectedCattle;
    if (!c) return;
    setSelectedCattle(c);
    setShowCattleModal(true);
    setShowEditForm(true);
    setEditCattle({
      id: c.id,
      type: c.type || '',
      gender: c.gender || '',
      age: c.age ?? 0,
      weight: c.weight ?? 0,
      birthDate: c.birthDate || new Date().toISOString().split('T')[0],
      healthStatus: c.healthStatus || 'sehat',
      availability: c.availability || 'available',
      origin: c.origin || 'beli',
      motherId: c.motherId || '',
      fatherId: c.fatherId || ''
    });
  };

  const handleEditChange = (field, value) => setEditCattle(prev => ({ ...prev, [field]: value }));

  const handleSaveEdit = () => {
    if (!editCattle) return;
    if (!editCattle.type || !editCattle.gender) {
      alert('Jenis dan Jenis Kelamin wajib diisi');
      return;
    }
    try {
      const known = ['Sapi Limosin','Sapi Simental','Sapi Brahman','Sapi PO','Sapi Bali','Sapi Madura','Sapi Angus','Sapi BX'];
      const isKnown = known.includes(editCattle.type);

      const rawJSON = localStorage.getItem('cattleList');
      let raw = [];
      if (rawJSON) raw = JSON.parse(rawJSON);
      const updatedRaw = raw.map(item => {
        if (item.id === editCattle.id) {
          return {
            ...item,
            id: editCattle.id,
            jenis: isKnown ? editCattle.type : 'other',
            customJenis: isKnown ? '' : editCattle.type,
            kelamin: editCattle.gender,
            tanggalLahir: editCattle.birthDate,
            berat: Number(editCattle.weight) || 0,
            healthStatus: editCattle.healthStatus,
            availability: editCattle.availability,
            origin: editCattle.origin,
            motherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.motherId || '') : '',
            fatherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.fatherId || '') : '',
            usia: Number(editCattle.age) || 0,
          };
        }
        return item;
      });
      localStorage.setItem('cattleList', JSON.stringify(updatedRaw));

      const updatedUI = cattle.map(c => c.id === editCattle.id ? {
        ...c,
        type: editCattle.type,
        gender: editCattle.gender,
        age: Number(editCattle.age) || 0,
        weight: Number(editCattle.weight) || 0,
        birthDate: editCattle.birthDate,
        healthStatus: editCattle.healthStatus,
        availability: editCattle.availability,
        origin: editCattle.origin,
        motherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.motherId || '') : '',
        fatherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.fatherId || '') : '',
      } : c);
      setCattle(updatedUI);
      setSaveSuccess('Perubahan berhasil disimpan.');
      setShowEditForm(false);
      setTimeout(() => setSaveSuccess(''), 2000);
    } catch (e) {
      console.error('Error saving edit:', e);
      alert('Gagal menyimpan perubahan.');
    }
  };

  // QR Code generation function
  const handleGenerateQR = async (cattleItem) => {
    setQrLoading(true);
    setQrError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sapiId: cattleItem.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghasilkan QR code');
      }

      const data = await response.json();
      
      console.log('QR Code Response:', data);
      console.log('QR Code Data URL:', data.qrCode ? data.qrCode.substring(0, 100) : 'MISSING');
      
      setQrCodeData({
        qrCode: data.qrCode || data.qrImage,
        cattleId: cattleItem.id,
        cattleType: cattleItem.type,
        cattleWeight: cattleItem.weight
      });
      setShowQRModal(true);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrError(error.message || 'Gagal menghasilkan QR code. Silakan coba lagi.');
      alert(error.message || 'Gagal menghasilkan QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Print QR Code function
  const handlePrintQR = () => {
    if (!qrCodeData) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${qrCodeData.cattleId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 20px;
              border-radius: 8px;
            }
            h2 {
              margin-top: 0;
              color: #333;
            }
            .info {
              margin: 10px 0;
              font-size: 14px;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>QR Code Sapi</h2>
            <div class="info"><strong>ID:</strong> ${qrCodeData.cattleId}</div>
            <div class="info"><strong>Jenis:</strong> ${qrCodeData.cattleType}</div>
            <div class="info"><strong>Berat:</strong> ${qrCodeData.cattleWeight} kg</div>
            <img src="${qrCodeData.qrCode}" alt="QR Code" />
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDeleteCattle = (cattleId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ternak ini?')) {
      try {
        const storedCattleJSON = localStorage.getItem('cattleList');
        if (storedCattleJSON) {
          const storedCattle = JSON.parse(storedCattleJSON);
          const updatedCattle = storedCattle.filter(c => c.id !== cattleId);
          localStorage.setItem('cattleList', JSON.stringify(updatedCattle));
          const updatedCattleData = cattle.filter(c => c.id !== cattleId);
          setCattle(updatedCattleData);
          if (selectedCattle && selectedCattle.id === cattleId) {
            setShowCattleModal(false);
            setSelectedCattle(null);
          }
          alert('Data ternak berhasil dihapus.');
        }
      } catch (e) {
        console.error('Error deleting cattle:', e);
        alert('Gagal menghapus data ternak.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardLayout title="Data Sapi" role="JAGAL" customSidebar={<JagalSidebar /> }>
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
              <a href="/jagal/daftar-ternak" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm inline-block"><i className="fas fa-plus mr-1"></i> Tambah Sapi Baru</a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kesehatan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ketersediaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data.</td></tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-left font-medium text-primary">{c.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-gray-700">{c.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-gray-700">{c.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-gray-700">{c.age} tahun</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-gray-700">{c.weight} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{healthBadge(c.healthStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{availBadge(c.availability)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <button className="text-primary hover:text-primaryDark mr-2" onClick={() => viewCattleDetail(c.id)} title="Lihat Detail">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-800 mr-2" onClick={() => openEditForm(c)} title="Edit Data">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteCattle(c.id)} title="Hapus">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal Detail/Edit */}
          {showCattleModal && selectedCattle && (
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
                  <h3 className="text-xl font-medium text-blue-600">Detail Sapi</h3>
                  <button
                    onClick={closeCattleModal}
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 p-2 rounded-full hover:bg-blue-50"
                    aria-label="Tutup detail sapi"
                    title="Tutup"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                <div className="p-6">
                  {saveSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
                      <i className="fas fa-check-circle mr-2"></i>{saveSuccess}
                    </div>
                  )}
                  {!showEditForm && (
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
                        <p className="text-sm text-gray-500">Tanggal Lahir</p>
                        <p className="font-semibold">{formatDate(selectedCattle.birthDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status Kesehatan</p>
                        <p className="font-semibold">{healthBadge(selectedCattle.healthStatus)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ketersediaan</p>
                        <p className="font-semibold">{availBadge(selectedCattle.availability)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Asal</p>
                        <p className="font-semibold">{selectedCattle.origin === 'lahir_sendiri' ? 'Lahir di Peternakan' : 'Dibeli'}</p>
                      </div>
                    </div>
                  )}

                  {selectedCattle.origin === 'lahir_sendiri' && !showEditForm && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Informasi Silsilah</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">ID Induk</p>
                          <p className="font-semibold">{selectedCattle.motherId || 'Tidak ada informasi'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ID Pejantan</p>
                          <p className="font-semibold">{selectedCattle.fatherId || 'Tidak ada informasi'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showEditForm && editCattle && (
                    <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); handleSaveEdit();}}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ID Sapi</label>
                          <input value={editCattle.id} disabled className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                          <input value={editCattle.type} onChange={e=>handleEditChange('type', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                          <select value={editCattle.gender} onChange={e=>handleEditChange('gender', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                            <option value="">Pilih</option>
                            <option value="Jantan">Jantan</option>
                            <option value="Betina">Betina</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Umur (tahun)</label>
                          <input type="number" min="0" value={editCattle.age} onChange={e=>handleEditChange('age', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
                          <input type="number" min="0" value={editCattle.weight} onChange={e=>handleEditChange('weight', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                          <input type="date" value={(editCattle.birthDate || '').slice(0,10)} onChange={e=>handleEditChange('birthDate', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                          <select value={editCattle.healthStatus} onChange={e=>handleEditChange('healthStatus', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                            <option value="sehat">Sehat</option>
                            <option value="perlu_periksa">Perlu Periksa</option>
                            <option value="sakit">Sakit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                          <select value={editCattle.availability} onChange={e=>handleEditChange('availability', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                            <option value="available">Tersedia</option>
                            <option value="in_transaction">Dalam Transaksi</option>
                            <option value="sold">Terjual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Asal</label>
                          <select value={editCattle.origin} onChange={e=>handleEditChange('origin', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                            <option value="beli">Dibeli</option>
                            <option value="lahir_sendiri">Lahir di Peternakan</option>
                          </select>
                        </div>
                        {editCattle.origin === 'lahir_sendiri' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">ID Induk</label>
                              <input value={editCattle.motherId} onChange={e=>handleEditChange('motherId', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">ID Pejantan</label>
                              <input value={editCattle.fatherId} onChange={e=>handleEditChange('fatherId', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={()=>{setShowEditForm(false); setEditCattle(null);}}>Batal</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Simpan</button>
                      </div>
                    </form>
                  )}

                  {!showEditForm && (
                    <div className="flex justify-end space-x-3 mt-6">
                      <button 
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50" 
                        onClick={() => handleGenerateQR(selectedCattle)}
                        disabled={qrLoading}
                      >
                        {qrLoading ? 'Menghasilkan QR Code...' : 'Cetak QR'}
                      </button>
                      <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600" onClick={()=>openEditForm(selectedCattle)}>
                        Edit Data
                      </button>
                      {selectedCattle.availability === 'available' && (
                        <Link
                          to="/jagal/transaksi"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => {
                            localStorage.setItem('selectedCattleForSale', JSON.stringify(selectedCattle));
                          }}
                        >
                          Jual Sapi
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* QR Code Modal */}
          {showQRModal && qrCodeData && (
            <div className="fixed inset-0 flex items-center justify-center z-[90] backdrop-blur-sm bg-black/40">
              <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-yellow-500 px-6 py-4 flex justify-between items-center rounded-t-lg">
                  <h3 className="text-xl font-semibold text-white">QR Code Sapi</h3>
                  <button 
                    onClick={() => {
                      setShowQRModal(false);
                      setQrCodeData(null);
                      setQrError('');
                    }} 
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  {qrError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      <i className="fas fa-exclamation-circle mr-2"></i>{qrError}
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <p className="text-sm text-gray-600">ID Sapi</p>
                      <p className="font-bold text-lg text-gray-800">{qrCodeData.cattleId}</p>
                      <div className="mt-2 flex justify-center gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Jenis:</span> {qrCodeData.cattleType}
                        </div>
                        <div>
                          <span className="font-medium">Berat:</span> {qrCodeData.cattleWeight} kg
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                      <img 
                        src={qrCodeData.qrCode} 
                        alt="QR Code" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={handlePrintQR}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        <i className="fas fa-print mr-2"></i> Cetak
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = qrCodeData.qrCode;
                          link.download = `QR_Sapi_${qrCodeData.cattleId}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                      >
                        <i className="fas fa-download mr-2"></i> Unduh
                      </button>
                    </div>
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

export default JagalSapi;
