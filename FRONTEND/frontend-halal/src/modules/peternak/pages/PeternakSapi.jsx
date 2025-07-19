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
  const [stats, setStats] = useState({
    totalSapi: 0,
    availableForSale: 0,
    inTransaction: 0,
    needHealthCheck: 0
  });
  
  // Get cattle data from localStorage
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Initialize empty data array
      let data = [];
      
      // Load data from localStorage
      try {
        const storedCattleJSON = localStorage.getItem('cattleList');
        if (storedCattleJSON) {
          const storedCattle = JSON.parse(storedCattleJSON);
          
          if (storedCattle.length > 0) {
            // Map stored data to match our UI structure
            data = storedCattle.map(cattle => ({
              id: cattle.id || `SP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              type: cattle.jenis === 'other' ? cattle.customJenis : cattle.jenis,
              gender: cattle.kelamin,
              birthDate: cattle.tanggalLahir || new Date().toISOString().split('T')[0],
              weight: parseFloat(cattle.berat) || 0,
              healthStatus: cattle.healthStatus || 'sehat',
              availability: cattle.availability || 'available',
              motherId: cattle.motherId || '',
              fatherId: cattle.fatherId || '',
              origin: cattle.origin || 'beli',
              age: parseFloat(cattle.usia) || 0
            }));
            
            // Sort by ID for consistency in display
            data.sort((a, b) => a.id.localeCompare(b.id));
          }
        }
      } catch (error) {
        console.error('Error loading cattle from localStorage:', error);
      }
      
      // Set the final data
      setCattleData(data);
      
      // Calculate stats with the combined data
      const updatedStats = {
        totalSapi: data.length,
        availableForSale: data.filter(item => item.availability === 'available').length,
        inTransaction: data.filter(item => item.availability === 'in_transaction').length,
        needHealthCheck: data.filter(item => item.healthStatus === 'perlu_periksa' || item.healthStatus === 'sakit').length
      };
      
      setStats(updatedStats);
      setLoading(false);
    }, 1000);
  }, []);
  
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
    }
  };
  
  // Close modal
  const closeCattleModal = () => {
    setShowCattleModal(false);
    setSelectedCattle(null);
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
          // Recalculate stats
          const updatedStats = {
            totalSapi: updatedCattleData.length,
            availableForSale: updatedCattleData.filter(item => item.availability === 'available').length,
            inTransaction: updatedCattleData.filter(item => item.availability === 'in_transaction').length,
            needHealthCheck: updatedCattleData.filter(item => item.healthStatus === 'perlu_periksa' || item.healthStatus === 'sakit').length
          };
          setStats(updatedStats);
        }
      } catch (error) {
        console.error('Error deleting cattle:', error);
      }
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };
  
  // Utility functions for badge rendering
  const getHealthStatusBadge = (status) => {
    const badges = {
      'sehat': 'bg-green-100 text-green-800',
      'perlu_periksa': 'bg-yellow-100 text-yellow-800',
      'sakit': 'bg-red-100 text-red-800'
    };
    const labels = {
      'sehat': 'Sehat',
      'perlu_periksa': 'Perlu Periksa',
      'sakit': 'Sakit'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges['sehat']}`}>
        {labels[status] || labels['sehat']}
      </span>
    );
  };
  
  const getAvailabilityBadge = (availability) => {
    const badges = {
      'available': 'bg-green-100 text-green-800',
      'sold': 'bg-gray-100 text-gray-800',
      'in_transaction': 'bg-blue-100 text-blue-800'
    };
    const labels = {
      'available': 'Tersedia',
      'sold': 'Terjual',
      'in_transaction': 'Dalam Transaksi'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[availability] || badges['available']}`}>
        {labels[availability] || labels['available']}
      </span>
    );
  };
  
  return (
    <DashboardLayout title="Data Sapi" role="PETERNAK">
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-16 p-6">
          <h1 className="text-2xl font-semibold text-blue-600 mb-6">Inventaris Sapi</h1>
          
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
                <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Detail Sapi</h3>
                  <button onClick={closeCattleModal} className="text-white hover:text-gray-200">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="p-6">
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
                      <p className="text-sm text-gray-500">Ketersediaan</p>
                      <p className="font-semibold">{getAvailabilityBadge(selectedCattle.availability)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asal</p>
                      <p className="font-semibold">{selectedCattle.origin === 'lahir_sendiri' ? 'Lahir di Peternakan' : 'Dibeli'}</p>
                    </div>
                  </div>
                  
                  {selectedCattle.origin === 'lahir_sendiri' && (
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
                  
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                      Cetak QR
                    </button>
                    <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
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
