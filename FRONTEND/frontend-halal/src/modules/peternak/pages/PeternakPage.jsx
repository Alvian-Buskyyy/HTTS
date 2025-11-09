import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faCow, faExchangeAlt, faFileAlt, faChartLine,
  faUser, faCog, faSignOutAlt, faBars, faBell, faCheckCircle,
  faCalendarAlt, faSearch, faFilter, faClipboardCheck, faQrcode,
  faDownload, faEye, faEdit, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const PeternakPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [cattleData, setCattleData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Mock data for cattle
    const mockCattle = [
      { id: 'HT-2023-0054', breed: 'Sapi Limosin', age: '3 tahun', gender: 'Jantan', weight: 520, status: 'Sehat', createdAt: '2023-07-15' },
      { id: 'HT-2023-0053', breed: 'Sapi Brahman', age: '2.5 tahun', gender: 'Betina', weight: 450, status: 'Sehat', createdAt: '2023-07-15' },
      { id: 'HT-2023-0052', breed: 'Sapi Bali', age: '4 tahun', gender: 'Jantan', weight: 510, status: 'Sehat', createdAt: '2023-07-14' },
      { id: 'HT-2023-0051', breed: 'Sapi Simental', age: '3.5 tahun', gender: 'Betina', weight: 480, status: 'Sehat', createdAt: '2023-07-14' },
    ];
    
    // Mock data for transactions
    const mockTransactions = [
      { id: 'TR-2023-012', date: '2023-07-16', type: 'Jual', cattleIds: ['HT-2023-0050'], destination: 'Pasar Hewan Al-Falah', status: 'Selesai' },
      { id: 'TR-2023-011', date: '2023-07-15', type: 'Jual', cattleIds: ['HT-2023-0049', 'HT-2023-0048'], destination: 'Pasar Hewan Berkah', status: 'Selesai' },
      { id: 'TR-2023-010', date: '2023-07-12', type: 'Beli', cattleIds: ['HT-2023-0054', 'HT-2023-0053'], source: 'Peternakan Wijaya', status: 'Selesai' },
    ];
    
    setCattleData(mockCattle);
    setTransactions(mockTransactions);
  }, []);
  
  // Filter cattle data based on search term
  const filteredCattle = cattleData.filter(cattle => {
    return (
      cattle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cattle.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cattle.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handlePageChange = (page) => {
    setActivePage(page);
    setSidebarOpen(false); // Close sidebar when changing page on mobile
  };

  return (
    <div className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg lg:w-64 lg:flex-shrink-0 border-r lg:block ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'}`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-center lg:justify-start">
          <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-2xl mr-2" />
          <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
        </div>
        {/* Menu Items */}
        <div className="py-4">
          <div className="px-4 py-2">
            <p className="text-xs uppercase text-gray-500 font-semibold">Utama</p>
          </div>
          <Link 
            to="/peternak/dashboard" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'dashboard' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faHome} className="w-6" />
            <span>Dasbor</span>
          </Link>
          <Link 
            to="/peternak/ternak" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'cattle' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCow} className="w-6" />
            <span>Ternak</span>
          </Link>
          <Link 
            to="/peternak/transaksi" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'transactions' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faExchangeAlt} className="w-6" />
            <span>Transaksi</span>
          </Link>
          <Link 
            to="/peternak/kesehatan" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'health' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faFileAlt} className="w-6" />
            <span>Catatan Kesehatan</span>
          </Link>
          <Link 
            to="/peternak/laporan" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'reports' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faChartLine} className="w-6" />
            <span>Laporan</span>
          </Link>
          <div className="px-4 py-2 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Akun</p>
          </div>
          <Link 
            to="/peternak/profil" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'profile' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faUser} className="w-6" />
            <span>Profil</span>
          </Link>
          <Link 
            to="/peternak/pengaturan" 
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'settings' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCog} className="w-6" />
            <span>Pengaturan</span>
          </Link>
          <Link to="/" className="flex items-center px-4 py-3 text-red-500 hover:bg-gray-100">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
            <span>Keluar</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10 sticky top-0">
          <div className="flex items-center justify-between p-4">
            <button 
              className="lg:hidden text-gray-600 focus:outline-none"
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 focus:outline-none">
                <FontAwesomeIcon icon={faBell} className="text-xl" />
              </button>
              <div className="relative">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <span className="text-gray-700 font-medium">Peternakan Berkah</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {activePage === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Peternak</h1>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-primaryLight p-3 mr-4">
                    <FontAwesomeIcon icon={faCow} className="text-primary text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Ternak</p>
                    <p className="text-2xl font-semibold text-gray-800">{cattleData.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Ternak Sehat</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {cattleData.filter(cattle => cattle.status === 'Sehat').length}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Transaksi Bulan Ini</p>
                    <p className="text-2xl font-semibold text-gray-800">3</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3 mr-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Pemeriksaan Ternak</p>
                    <p className="text-2xl font-semibold text-gray-800">2</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity & QR Code Generator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                    <Link to="#activities" className="text-primary text-sm">Lihat Semua</Link>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="rounded-full bg-green-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faExchangeAlt} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Transaksi Penjualan 2 ekor ternak ke Pasar Hewan Berkah</p>
                        <p className="text-gray-500 text-sm">15 Jul 2023, 10:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Pemeriksaan kesehatan rutin untuk 4 ternak</p>
                        <p className="text-gray-500 text-sm">14 Jul 2023, 15:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faDownload} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Penerimaan 2 ekor ternak baru dari Peternakan Wijaya</p>
                        <p className="text-gray-500 text-sm">12 Jul 2023, 09:15</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faQrcode} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Pembuatan kode QR untuk 2 ternak baru</p>
                        <p className="text-gray-500 text-sm">12 Jul 2023, 11:20</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Generator */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Kode QR Ternak</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih ID Ternak</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>-- Pilih ID Ternak --</option>
                      {cattleData.map(cattle => (
                        <option key={cattle.id} value={cattle.id}>{cattle.id}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center mb-4">
                    <div className="bg-gray-100 w-40 h-40 mx-auto flex flex-col items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faQrcode} className="text-6xl text-primary mb-2" />
                      <p className="text-xs text-gray-500">Pratinjau QR</p>
                    </div>
                  </div>
                  <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2">
                    Buat Kode QR
                  </button>
                  <button className="w-full border border-primary text-primary py-2 rounded-md hover:bg-primaryLight transition">
                    Unduh
                  </button>
                </div>
              </div>

              {/* Cattle Inventory */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Inventaris Ternak</h2>
                  <Link 
                    to="/peternak/ternak"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
                  >
                    Lihat Semua
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCattle.slice(0, 3).map((cattle) => (
                        <tr key={cattle.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.breed}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{cattle.weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {cattle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faQrcode} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h2>
                  <Link 
                    to="/peternak/transaksi"
                    className="text-primary text-sm"
                  >
                    Lihat Semua Transaksi
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan/Sumber</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'Jual' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.cattleIds.join(', ')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.destination || transaction.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activePage === 'cattle' && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Ternak</h1>
              
              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center">
                    <div className="relative flex-grow max-w-md">
                      <input 
                        type="text" 
                        placeholder="Cari ternak..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="mr-2" />
                      Filter
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">
                    + Tambah Ternak Baru
                  </button>
                </div>
              </div>
              
              {/* Cattle List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Daftar Ternak</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Masuk</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCattle.map((cattle) => (
                        <tr key={cattle.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.breed}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{cattle.weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {cattle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.createdAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faQrcode} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Menampilkan {filteredCattle.length} dari {cattleData.length} ternak
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">
                      Sebelumnya
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-primary text-white text-sm">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activePage === 'transactions' && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Transaksi</h1>
              
              {/* Transaction Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Catat Transaksi Penjualan</h2>
                    <p className="text-sm text-gray-500">Catat penjualan ternak ke pasar hewan atau mitra lainnya</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">
                    + Buat Baru
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Catat Transaksi Pembelian</h2>
                    <p className="text-sm text-gray-500">Catat pembelian ternak baru dari peternak atau mitra</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">
                    + Buat Baru
                  </button>
                </div>
              </div>
              
              {/* Transaction List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Riwayat Transaksi</h2>
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <input 
                        type="text" 
                        placeholder="Cari transaksi..." 
                        className="w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                      <FontAwesomeIcon icon={faFilter} className="mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan/Sumber</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'Jual' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.cattleIds.join(', ')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.destination || transaction.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faQrcode} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Menampilkan {transactions.length} dari {transactions.length} transaksi
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">
                      Sebelumnya
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-primary text-white text-sm">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
          &copy; 2023 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default PeternakPage;
