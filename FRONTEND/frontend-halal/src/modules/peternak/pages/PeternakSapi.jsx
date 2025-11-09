import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';

const PeternakSapi = () => {
  const [loading, setLoading] = useState(true);
  const [cattleData, setCattleData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    type: '',
    healthStatus: '',
    availability: '',
    search: ''
  });
  const [showCattleModal, setShowCattleModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCattle, setEditCattle] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [stats, setStats] = useState({
    totalSapi: 0,
    availableForSale: 0,
    inTransaction: 0,
    needHealthCheck: 0
  });
  
  // QR Code states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  // CID copy feedback
  const [cidCopyMessage, setCidCopyMessage] = useState('');
  
  // Fetch cattle data from backend based on peternakId
  useEffect(() => {
    const fetchCattleData = async () => {
      setLoading(true);
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) {
          console.error('User data not found in localStorage');
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        const peternakId = userData.entityId || userData.id;

        if (!peternakId) {
          console.error('Peternak ID not found');
          setLoading(false);
          return;
        }

        // Fetch cattle data from backend API
        const response = await fetch(`http://localhost:3000/sapi/entity/PETERNAK/${peternakId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch cattle data: ${response.status}`);
        }

        const data = await response.json();
        
        // Map backend data to frontend structure
        let mappedData = data.map(cattle => ({
          id: cattle.id,
          type: cattle.jenis,
          gender: cattle.kelamin,
          birthDate: cattle.tanggalLahir || new Date().toISOString().split('T')[0],
          weight: parseFloat(cattle.beratSapi) || 0,
          healthStatus: cattle.healthStatus || 'perlu_periksa',
          // CID pemeriksaan sehat (diisi setelah memuat pengecekanSehat)
          healthCid: null,
          availability: cattle.availability || 'available',
          motherId: cattle.motherId || '',
          fatherId: cattle.fatherId || '',
          origin: cattle.asalType,
          age: parseFloat(cattle.usia) || 0,
          asalId: cattle.asalId,
          peternakId: cattle.peternakId,
          pasarHewanId: cattle.pasarHewanId
        }));

        // Tandai 'sehat' hanya jika sapi memiliki verifikasi kesehatan (boolean=true) dan CID
        try {
          const hcRes = await fetch('http://localhost:3000/pengecekanSehat', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (hcRes.ok) {
            const checks = await hcRes.json();
            const validChecks = (checks || []).filter(ch => ch && ch.boolean === true && ch.cid);
            const verifiedIds = new Set(validChecks.map(ch => ch.sapiId));
            // Mapkan sapiId -> CID (jika ada beberapa catatan, ambil yang terakhir)
            const cidBySapi = new Map();
            for (const ch of validChecks) {
              cidBySapi.set(ch.sapiId, ch.cid);
            }
            mappedData = mappedData.map(c => ({
              ...c,
              healthStatus: verifiedIds.has(c.id) ? 'sehat' : 'perlu_periksa',
              healthCid: cidBySapi.get(c.id) || null
            }));
          }
        } catch (e) {
          console.warn('Gagal memuat pengecekanSehat, status kesehatan default ke perlu_periksa');
        }

        setCattleData(mappedData);
        
        // Calculate stats
        const updatedStats = {
          totalSapi: mappedData.length,
          availableForSale: mappedData.filter(item => item.availability === 'available').length,
          inTransaction: mappedData.filter(item => item.availability === 'in_transaction').length,
          needHealthCheck: mappedData.filter(item => item.healthStatus !== 'sehat').length
        };
        
        setStats(updatedStats);

      } catch (error) {
        console.error('Error fetching cattle data:', error);
        setCattleData([]);
        setStats({
          totalSapi: 0,
          availableForSale: 0,
          inTransaction: 0,
          needHealthCheck: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCattleData();
  }, []);
  
  // Copy CID to clipboard with feedback
  const handleCopyCid = async (cid) => {
    try {
      await navigator.clipboard.writeText(cid);
      setCidCopyMessage('CID berhasil disalin');
      setTimeout(() => setCidCopyMessage(''), 1500);
    } catch (e) {
      setCidCopyMessage('Gagal menyalin CID');
      setTimeout(() => setCidCopyMessage(''), 1500);
    }
  };
  
  // Handle filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: value
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      type: '',
      healthStatus: '',
      availability: '',
      search: ''
    });
  };
  
  // Apply filters
  const filteredCattle = cattleData.filter(cattle => {
    return (
      (filterOptions.type === '' || cattle.type.toLowerCase().includes(filterOptions.type.toLowerCase())) &&
      (filterOptions.healthStatus === '' || cattle.healthStatus === filterOptions.healthStatus) &&
      (filterOptions.availability === '' || cattle.availability === filterOptions.availability) &&
      (filterOptions.search === '' || 
        cattle.id.toLowerCase().includes(filterOptions.search.toLowerCase()) ||
        cattle.type.toLowerCase().includes(filterOptions.search.toLowerCase()))
    );
  });
  
  // Handle cattle detail modal
  const viewCattleDetail = (cattleId) => {
    const cattle = cattleData.find(c => c.id === cattleId);
    if (cattle) {
      setSelectedCattle(cattle);
      setShowCattleModal(true);
  setShowEditForm(false);
  setEditCattle(null);
    }
  };
  
  // Close modal
  const closeCattleModal = () => {
    setShowCattleModal(false);
    setSelectedCattle(null);
    setShowEditForm(false);
    setEditCattle(null);
    setSaveSuccess('');
  };

  // Open edit form prefilled
  const openEditForm = (cattle) => {
    const c = cattle || selectedCattle;
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

  const handleEditChange = (field, value) => {
    setEditCattle(prev => ({ ...prev, [field]: value }));
  };

  const recomputeStats = (list) => ({
    totalSapi: list.length,
    availableForSale: list.filter(item => item.availability === 'available').length,
    inTransaction: list.filter(item => item.availability === 'in_transaction').length,
    needHealthCheck: list.filter(item => item.healthStatus === 'perlu_periksa' || item.healthStatus === 'sakit').length
  });

  const handleSaveEdit = () => {
    if (!editCattle) return;
    // Basic validation
    if (!editCattle.type || !editCattle.gender) {
      alert('Jenis dan Jenis Kelamin wajib diisi');
      return;
    }

    try {
      const knownTypes = ['Sapi Limosin','Sapi Simental','Sapi Brahman','Sapi PO','Sapi Bali','Sapi Madura','Sapi Angus','Sapi BX'];
      const isKnown = knownTypes.includes(editCattle.type);

      // Update localStorage raw structure
      const storedJSON = localStorage.getItem('cattleList');
      let raw = [];
      if (storedJSON) raw = JSON.parse(storedJSON);
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
            usia: Number(editCattle.age) || 0
          };
        }
        return item;
      });
      localStorage.setItem('cattleList', JSON.stringify(updatedRaw));

      // Update UI list
      const updatedUI = cattleData.map(c => c.id === editCattle.id ? {
        ...c,
        type: editCattle.type,
        gender: editCattle.gender,
        age: Number(editCattle.age) || 0,
        weight: Number(editCattle.weight) || 0,
        birthDate: editCattle.birthDate,
        healthStatus: editCattle.healthStatus,
        availability: editCattle.availability,
        origin: editCattle.origin,
        motherId: editCattle.origin === 'lahir_sendiri' ? editCattle.motherId : '',
        fatherId: editCattle.origin === 'lahir_sendiri' ? editCattle.fatherId : ''
      } : c);
      setCattleData(updatedUI);
      setStats(recomputeStats(updatedUI));

      // Update selected and feedback
      const updatedSelected = updatedUI.find(c => c.id === editCattle.id);
      setSelectedCattle(updatedSelected);
      setSaveSuccess('Perubahan berhasil disimpan.');
      setShowEditForm(false);
      setTimeout(() => setSaveSuccess(''), 2000);
    } catch (e) {
      console.error('Error saving edit:', e);
      alert('Gagal menyimpan perubahan.');
    }
  };
  
  // Delete cattle function
  const handleDeleteCattle = (cattleId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ternak ini?')) {
      // Get current data from localStorage
      try {
        const storedCattleJSON = localStorage.getItem('cattleList');
        if (storedCattleJSON) {
          const storedCattle = JSON.parse(storedCattleJSON);
          // Filter out the deleted cattle
          const updatedCattle = storedCattle.filter(cattle => cattle.id !== cattleId);
          // Save back to localStorage
          localStorage.setItem('cattleList', JSON.stringify(updatedCattle));
          // Update the UI
          const updatedCattleData = cattleData.filter(cattle => cattle.id !== cattleId);
          setCattleData(updatedCattleData);
          setStats(recomputeStats(updatedCattleData));
          // Close modal if this was the selected cattle
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
  
  // QR Code generation function
  const handleGenerateQR = async (cattle) => {
    setQrLoading(true);
    setQrError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      // Call backend API to generate QR code
      const response = await fetch('http://localhost:3000/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sapiId: cattle.id
          // dagingId hanya untuk daging, tidak untuk sapi
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghasilkan QR code');
      }

      const data = await response.json();
      
      console.log('QR Code Response:', data);
      console.log('QR Code Data URL:', data.qrCode ? data.qrCode.substring(0, 100) : 'MISSING');
      
      // Store QR data and show modal
      setQrCodeData({
        qrCode: data.qrCode || data.qrImage, // base64 image, fallback to qrImage
        cattleId: cattle.id,
        cattleType: cattle.type,
        cattleWeight: cattle.weight
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

  // Helper function for health status badge
  const getHealthStatusBadge = (status) => {
    const badges = {
      'sehat': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Sehat</span>,
      'perlu_periksa': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Perlu Periksa</span>,
      'sakit': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Sakit</span>,
      'karantina': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Karantina</span>
    };
    return badges[status] || <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  };

  // Helper function for availability badge
  const getAvailabilityBadge = (availability) => {
    const badges = {
      'available': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Tersedia</span>,
      'sold': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Terjual</span>,
      'reserved': <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dipesan</span>
    };
    return badges[availability] || <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{availability}</span>;
  };

  // Helper function for date formatting
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
    <DashboardLayout title="Data Sapi" role="PETERNAK">
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Total Sapi</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalSapi}</p>
                </div>
                <i className="fas fa-cow text-primary text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Tersedia Jual</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.availableForSale}</p>
                </div>
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Dalam Transaksi</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.inTransaction}</p>
                </div>
                <i className="fas fa-handshake text-blue-500 text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Perlu Periksa</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.needHealthCheck}</p>
                </div>
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Filter dan Pencarian */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Ternak</label>
                <select 
                  name="type" 
                  value={filterOptions.type}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Jenis</option>
                  <option value="Sapi Limosin">Sapi Limosin</option>
                  <option value="Sapi Simental">Sapi Simental</option>
                  <option value="Sapi Brahman">Sapi Brahman</option>
                  <option value="Sapi PO">Sapi PO (Peranakan Ongole)</option>
                  <option value="Sapi Bali">Sapi Bali</option>
                  <option value="Sapi Madura">Sapi Madura</option>
                  <option value="Sapi Angus">Sapi Angus</option>
                  <option value="Sapi BX">Sapi BX (Brahman Cross)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                <select 
                  name="healthStatus" 
                  value={filterOptions.healthStatus}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Status</option>
                  <option value="sehat">Sehat</option>
                  <option value="perlu_periksa">Perlu Diperiksa</option>
                  <option value="sakit">Sakit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                <select 
                  name="availability" 
                  value={filterOptions.availability}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua</option>
                  <option value="available">Tersedia</option>
                  <option value="sold">Terjual</option>
                  <option value="in_transaction">Dalam Transaksi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input 
                  type="text" 
                  name="search"
                  value={filterOptions.search}
                  onChange={handleFilterChange}
                  placeholder="Cari ID, jenis..."  
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm mr-2"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Tabel Detail Inventaris */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Detail Inventaris</h2>
              <Link 
                to="/peternak/daftar-ternak"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm inline-block"
              >
                <i className="fas fa-plus mr-1"></i> Tambah Sapi Baru
              </Link>
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
                  {filteredCattle.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data sapi yang ditemukan. Silahkan tambahkan sapi baru melalui menu "Tambah Sapi Baru".
                      </td>
                    </tr>
                  ) : (
                    filteredCattle.map(cattle => (
                      <tr key={cattle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-left text-sm font-medium text-primary">{cattle.id}</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-700">{cattle.type}</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-700">{cattle.gender}</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-700">{cattle.age} tahun</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-700">{cattle.weight} kg</td>
                        <td className="px-6 py-4 text-left">
                          {getHealthStatusBadge(cattle.healthStatus)}
                        </td>
                        <td className="px-6 py-4 text-left">
                          {getAvailabilityBadge(cattle.availability)}
                        </td>
                        <td className="px-6 py-4 text-left text-sm font-medium">
                          <button 
                            className="text-primary hover:text-primaryDark mr-2" 
                            onClick={() => viewCattleDetail(cattle.id)}
                            title="Lihat Detail"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="text-yellow-600 hover:text-yellow-800 mr-2"
                            onClick={() => openEditForm(cattle)}
                            title="Edit Data"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                            onClick={() => handleDeleteCattle(cattle.id)}
                          >
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
          
          {/* Detail Modal */}
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
                      <p className="font-semibold">{getHealthStatusBadge(selectedCattle.healthStatus)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CID Pemeriksaan Sehat</p>
                      {selectedCattle.healthCid ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold break-all">{selectedCattle.healthCid}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopyCid(selectedCattle.healthCid)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                          >
                            Salin CID
                          </button>
                          <a 
                            href={`https://ipfs.io/ipfs/${selectedCattle.healthCid}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Buka IPFS
                          </a>
                        </div>
                      ) : (
                        <p className="font-semibold">Belum ada / Perlu periksa</p>
                      )}
                      {cidCopyMessage && (
                        <p className="mt-1 text-xs text-green-600">{cidCopyMessage}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ketersediaan</p>
                      <p className="font-semibold">{getAvailabilityBadge(selectedCattle.availability)}</p>
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
                  
                  {/* Action buttons */}
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
                          to="/peternak/transaksi" 
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => {
                            // Store the selected cattle info in localStorage for access in PeternakTransaksi
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
                    {/* Cattle Info */}
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
                    
                    {/* QR Code Image */}
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                      <img 
                        src={qrCodeData.qrCode} 
                        alt="QR Code" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={handlePrintQR}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        <i className="fas fa-print mr-2"></i> Cetak
                      </button>
                      <button 
                        onClick={() => {
                          // Download QR code as image
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

export default PeternakSapi;
