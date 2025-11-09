import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Dashboard Pasar Hewan Component
const PasarHewanPage = ({ initialSection = 'dashboard' }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data for demonstration - Cattle inventory
  const [cattleData, setCattleData] = useState([
    { id: 'HT-2023-0054', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '16 Jul 2025', weight: 325, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0053', type: 'Sapi Jantan', source: 'Peternakan Salam', arrivalDate: '16 Jul 2025', weight: 410, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0051', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '15 Jul 2025', weight: 315, healthStatus: 'Menunggu', action: '' }
  ]);
  
  // Sample data for transfer records
  const [transfers, setTransfers] = useState([
    { id: 'TR-5678', date: '16 Jul 2025', cattleIds: ['HT-2023-0052'], destination: 'Rumah Potong Al-Baraka', status: 'Selesai' },
    { id: 'TR-5677', date: '16 Jul 2025', cattleIds: ['HT-2023-0049', 'HT-2023-0050'], destination: 'Rumah Potong Rahmat', status: 'Selesai' },
    { id: 'TR-5676', date: '15 Jul 2025', cattleIds: ['HT-2023-0048'], destination: 'Jagal Hasan', status: 'Dalam Pengiriman' }
  ]);
  
  const [activities, setActivities] = useState([
    { id: 1, icon: 'fa-download', iconClass: 'bg-green-100 text-green-600', title: 'Terima Ternak', description: 'Menerima 5 ternak dari Peternakan Ahmad', time: 'Hari ini, 10:30' },
    { id: 2, icon: 'fa-exchange-alt', iconClass: 'bg-blue-100 text-blue-600', title: 'Transfer Ternak', description: 'Mentransfer 3 ternak ke Rumah Potong Al-Baraka', time: 'Kemarin, 15:45' },
    { id: 3, icon: 'fa-clipboard-check', iconClass: 'bg-yellow-100 text-yellow-600', title: 'Verifikasi Kesehatan', description: 'Verifikasi kesehatan untuk 4 ternak selesai', time: 'Kemarin, 11:20' },
    { id: 4, icon: 'fa-tag', iconClass: 'bg-purple-100 text-purple-600', title: 'Update Harga', description: 'Harga diperbarui untuk 8 ternak', time: '10 Jul 2025, 09:15' }
  ]);
  
  // Statistics
  const stats = {
    totalCattle: 46,
    receivedThisWeek: 12,
    transferredThisWeek: 9,
    pendingVerification: 3
  };
  
  // Change active section
  const showSection = (section) => {
    setActiveSection(section);
    navigate(`/pasarhewan/${section}`);
    setSidebarOpen(false); // Close sidebar on mobile when section changes
  };
  
  // Update active section based on URL
  useEffect(() => {
    // Get the last part of the URL path
    const pathSegments = window.location.pathname.split('/');
    const currentSection = pathSegments[pathSegments.length - 1];
    
    if (currentSection && currentSection !== 'pasarhewan') {
      setActiveSection(currentSection);
    } else if (pathSegments.length === 2 && pathSegments[1] === 'pasarhewan') {
      // If we're at the root /pasarhewan path, set to dashboard as default
      setActiveSection('dashboard');
    }
  }, [window.location.pathname]);
  
  // Generate random ID for new cattle
  const generateCattleId = () => {
    const prefix = 'HT-2023';
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNumber}`;
  };
  
  // Handle new cattle reception
  const handleCattleReception = (e) => {
    e.preventDefault();
    alert('Ternak baru berhasil diterima dan dicatat!');
    // In a real app, you would add the new cattle to the state
  };
  
  // Handle cattle transfer
  const handleCattleTransfer = (e) => {
    e.preventDefault();
    alert('Transfer ternak berhasil dicatat!');
    // In a real app, you would update the cattle and transfers states
  };
  
  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg lg:w-64 lg:flex-shrink-0 border-r lg:block ${sidebarOpen ? 'block fixed inset-0 z-20' : 'hidden'}`}>
          {/* Close button for mobile */}
          {sidebarOpen && (
            <div className="p-4 flex justify-end lg:hidden">
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          )}
          
          {/* Logo */}
          <div className="p-4 border-b flex items-center justify-center lg:justify-start">
            <i className="fas fa-shield-halved text-primary text-2xl mr-2"></i>
            <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
          </div>
          
          {/* Menu Items */}
          <div className="py-4">
            <div className="px-4 py-2">
              <p className="text-xs uppercase text-gray-500 font-semibold">Utama</p>
            </div>
            <Link 
              to="/pasarhewan/dashboard"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'dashboard' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-home w-6"></i>
              <span>Dasbor</span>
            </Link>
            <Link 
              to="/pasarhewan/ternak"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'inventory' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-cow w-6"></i>
            <span>Data Sapi</span>
            </Link>
            <Link 
              to="/pasarhewan/receive"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'receive' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-truck-loading w-6"></i>
              <span>Terima Ternak</span>
            </Link>
            <Link 
              to="/pasarhewan/transfer"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'transfers' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-exchange-alt w-6"></i>
              <span>Transfer/Jual</span>
            </Link>
            <Link 
              to="/pasarhewan/health"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'health' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-heartbeat w-6"></i>
              <span>Verifikasi Kesehatan</span>
            </Link>
            
            <div className="px-4 py-2 mt-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Akun</p>
            </div>
            <Link 
              to="/pasarhewan/profile"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'profile' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-user w-6"></i>
              <span>Profil</span>
            </Link>
            <Link 
              to="/pasarhewan/settings"
              className={`flex w-full items-center px-4 py-3 text-gray-700 ${activeSection === 'settings' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
            >
              <i className="fas fa-cog w-6"></i>
              <span>Pengaturan</span>
            </Link>
            <Link to="/" className="flex items-center px-4 py-3 text-red-500 hover:bg-gray-100">
              <i className="fas fa-sign-out-alt w-6"></i>
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 focus:outline-none"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 focus:outline-none">
                  <i className="fas fa-bell text-xl"></i>
                </button>
                <div className="relative">
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <i className="fas fa-user"></i>
                    </div>
                    <span className="text-gray-700 font-medium">Pasar Hewan Al-Falah</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Pasar Hewan</h1>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                    <div className="rounded-full bg-primaryLight p-3 mr-4">
                      <i className="fas fa-cow text-primary text-xl"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Ternak</p>
                      <p className="text-2xl font-semibold text-gray-800">{stats.totalCattle}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                    <div className="rounded-full bg-green-100 p-3 mr-4">
                      <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Diterima Minggu Ini</p>
                      <p className="text-2xl font-semibold text-gray-800">{stats.receivedThisWeek}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                    <div className="rounded-full bg-blue-100 p-3 mr-4">
                      <i className="fas fa-exchange-alt text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Ditransfer Minggu Ini</p>
                      <p className="text-2xl font-semibold text-gray-800">{stats.transferredThisWeek}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
                    <div className="rounded-full bg-yellow-100 p-3 mr-4">
                      <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Menunggu Verifikasi</p>
                      <p className="text-2xl font-semibold text-gray-800">{stats.pendingVerification}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity & QR Code Scanner */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                      <Link to="/pasarhewan/activities" className="text-primary text-sm">Lihat Semua</Link>
                    </div>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start">
                          <div className={`rounded-full ${activity.iconClass} p-2 mr-4`}>
                            <i className={`fas ${activity.icon}`}></i>
                          </div>
                          <div>
                            <p className="text-gray-800">{activity.description}</p>
                            <p className="text-gray-500 text-sm">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Scanner */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Pemindai Kode QR</h2>
                    <div className="text-center mb-4">
                      <div className="bg-gray-100 w-40 h-40 mx-auto flex flex-col items-center justify-center rounded-lg">
                        <i className="fas fa-qrcode text-6xl text-primary mb-2"></i>
                        <p className="text-xs text-gray-500">Bidikan Kamera</p>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2">
                      Pindai Kode QR
                    </button>
                    <p className="text-xs text-gray-500 text-center">Pindai kode QR ternak untuk melihat atau memperbarui informasi</p>
                  </div>
                </div>

                {/* Animal Inventory Preview */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Inventaris Ternak</h2>
                    <Link to="/pasarhewan/ternak" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm inline-block">
                      Lihat Semua
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Tiba</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kesehatan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cattleData.map((cattle, index) => (
                          <tr key={cattle.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.source}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.arrivalDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.weight}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                cattle.healthStatus === 'Terverifikasi' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {cattle.healthStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-edit"></i></button>
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-qrcode"></i></button>
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-exchange-alt"></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transfer Records */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Transfer Terbaru</h2>
                    <Link to="/pasarhewan/transfer" className="text-primary text-sm">Lihat Semua Transfer</Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transfer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transfers.map((transfer) => (
                          <tr key={transfer.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{transfer.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{transfer.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{transfer.cattleIds.join(', ')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{transfer.destination}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transfer.status === 'Selesai' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {transfer.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-eye"></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Section */}
            {activeSection === 'inventory' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Inventaris Ternak</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Daftar Ternak</h2>
                      <p className="text-sm text-gray-500">Menampilkan {cattleData.length} dari total {stats.totalCattle} ternak</p>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Cari ID, jenis, sumber..." 
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2"
                      />
                      <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                        <i className="fas fa-filter mr-1"></i> Filter
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Tiba</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kesehatan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cattleData.map((cattle) => (
                          <tr key={cattle.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.source}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.arrivalDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.weight}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                cattle.healthStatus === 'Terverifikasi' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {cattle.healthStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-edit"></i></button>
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-qrcode"></i></button>
                              <button className="text-primary hover:text-primaryDark"><i className="fas fa-exchange-alt"></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Menampilkan halaman 1 dari 10
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">Sebelumnya</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-primary text-white text-sm">1</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">2</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">3</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 text-sm">Selanjutnya</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receive Cattle Section */}
            {activeSection === 'receive' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Terima Ternak</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Formulir Penerimaan</h2>
                    <form onSubmit={handleCattleReception}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="source">Sumber Ternak</label>
                          <select id="source" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Pilih sumber ternak</option>
                            <option value="Peternakan Ahmad">Peternakan Ahmad</option>
                            <option value="Peternakan Salam">Peternakan Salam</option>
                            <option value="Peternakan Wijaya">Peternakan Wijaya</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="arrival-date">Tanggal Penerimaan</label>
                          <input type="date" id="arrival-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cattle-type">Jenis Ternak</label>
                          <select id="cattle-type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Pilih jenis ternak</option>
                            <option value="Sapi Jantan">Sapi Jantan</option>
                            <option value="Sapi Betina">Sapi Betina</option>
                            <option value="Anak Sapi">Anak Sapi</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cattle-count">Jumlah Ternak</label>
                          <input type="number" id="cattle-count" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cattle-weight">Berat Rata-Rata (kg)</label>
                          <input type="number" id="cattle-weight" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Kesehatan</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-500 mb-2">Unggah dokumen kesehatan ternak (PDF, JPG)</p>
                            <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                              Pilih File
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">Catatan Tambahan</label>
                          <textarea id="notes" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" rows="3"></textarea>
                        </div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                        >
                          Terima & Daftarkan Ternak
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* QR Code Scanner */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Pindai Kode QR</h2>
                    <p className="text-sm text-gray-500 mb-4">Pindai kode QR ternak untuk mempercepat proses penerimaan.</p>
                    
                    <div className="text-center mb-6">
                      <div className="bg-gray-100 w-64 h-64 mx-auto flex flex-col items-center justify-center rounded-lg">
                        <i className="fas fa-qrcode text-6xl text-primary mb-2"></i>
                        <p className="text-xs text-gray-500">Bidikan Kamera</p>
                      </div>
                    </div>
                    
                    <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2">
                      Mulai Pemindaian
                    </button>
                    
                    <div className="mt-6 border-t pt-6">
                      <h3 className="text-md font-medium text-gray-700 mb-2">Informasi Terdeteksi</h3>
                      <div className="bg-gray-50 p-4 rounded-md text-sm">
                        <p className="text-gray-500">Belum ada data terdeteksi. Pindai kode QR untuk menampilkan informasi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer/Sell Section */}
            {activeSection === 'transfers' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Transfer/Jual Ternak</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Formulir Transfer</h2>
                    <form onSubmit={handleCattleTransfer}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="destination">Tujuan Transfer</label>
                          <select id="destination" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Pilih tujuan</option>
                            <option value="Rumah Potong Al-Baraka">Rumah Potong Al-Baraka</option>
                            <option value="Rumah Potong Rahmat">Rumah Potong Rahmat</option>
                            <option value="Jagal Hasan">Jagal Hasan</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="transfer-date">Tanggal Transfer</label>
                          <input type="date" id="transfer-date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cattle-ids">ID Ternak (Pisahkan dengan koma)</label>
                          <input 
                            type="text" 
                            id="cattle-ids" 
                            placeholder="contoh: HT-2023-0054, HT-2023-0055" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Atau Pilih dari Inventaris</label>
                          <div className="border border-gray-300 rounded-md p-2 h-48 overflow-y-auto">
                            {cattleData.map(cattle => (
                              <div key={cattle.id} className="flex items-center p-2 hover:bg-gray-50">
                                <input type="checkbox" id={`select-${cattle.id}`} className="mr-2" />
                                <label htmlFor={`select-${cattle.id}`} className="text-sm">
                                  <span className="font-medium">{cattle.id}</span> - {cattle.type} ({cattle.weight} kg)
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="transfer-price">Harga Transfer (Rp)</label>
                          <input type="number" id="transfer-price" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">Catatan Tambahan</label>
                          <textarea id="notes" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" rows="3"></textarea>
                        </div>
                        <button 
                          type="submit" 
                          className="w-full py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                        >
                          Proses Transfer
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Transfer Records */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transfer</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transfer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transfers.map((transfer) => (
                            <tr key={transfer.id} className="hover:bg-gray-50 cursor-pointer">
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{transfer.id}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{transfer.date}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">{transfer.destination}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transfer.status === 'Selesai' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {transfer.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Health Verification Section */}
            {activeSection === 'health' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Verifikasi Kesehatan Ternak</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Ternak Menunggu Verifikasi</h2>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Cari ID ternak..." 
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Tiba</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cattleData.filter(c => c.healthStatus === 'Menunggu').map((cattle) => (
                          <tr key={cattle.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.source}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cattle.arrivalDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primaryDark transition text-sm mr-2">
                                Verifikasi
                              </button>
                              <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 text-sm">
                                Detail
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

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Profil Pasar Hewan</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl mr-6">
                      <i className="fas fa-building"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Pasar Hewan Al-Falah</h2>
                      <p className="text-gray-500">Terdaftar sejak 15 Januari 2022</p>
                      <div className="mt-2 flex items-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mr-2">Terverifikasi</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Sertifikat NKV</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Pasar Hewan</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Nama Pasar</label>
                          <p className="text-gray-800">Pasar Hewan Al-Falah</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Alamat</label>
                          <p className="text-gray-800">Jl. Raya Pasar Hewan No. 123, Kota Bogor</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Telepon</label>
                          <p className="text-gray-800">+62 812-3456-7890</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-800">info@pasarhewanalfalah.co.id</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">No. Sertifikat NKV</label>
                          <p className="text-gray-800">NKV-123456789-2022</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Statistik</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-500">Total Ternak Terdaftar</span>
                          <span className="font-medium text-gray-800">{stats.totalCattle}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-500">Total Transaksi Bulan Ini</span>
                          <span className="font-medium text-gray-800">24</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-500">Pemeriksaan Kesehatan</span>
                          <span className="font-medium text-gray-800">18</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Rating Pengguna</span>
                          <span className="font-medium text-gray-800">
                            4.8/5 
                            <i className="fas fa-star text-yellow-400 ml-1"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                      Edit Profil
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pengaturan</h1>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Preferensi Akun</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-800">Notifikasi Email</h3>
                        <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" id="email-notifications" className="sr-only" />
                        <label htmlFor="email-notifications" className="block w-10 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-800">Notifikasi Sistem</h3>
                        <p className="text-sm text-gray-500">Terima notifikasi di dasbor</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" id="system-notifications" className="sr-only" defaultChecked />
                        <label htmlFor="system-notifications" className="block w-10 h-6 rounded-full bg-primary cursor-pointer transition-colors duration-200"></label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-medium text-gray-800">Mode Gelap</h3>
                        <p className="text-sm text-gray-500">Ubah tampilan ke mode gelap</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" id="dark-mode" className="sr-only" />
                        <label htmlFor="dark-mode" className="block w-10 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200"></label>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-medium text-gray-800 mt-8 mb-4">Keamanan</h2>
                  <div className="space-y-4">
                    <button className="w-full flex justify-between items-center py-3 px-4 border rounded-md hover:bg-gray-50">
                      <span className="font-medium text-gray-800">Ubah Kata Sandi</span>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </button>
                    <button className="w-full flex justify-between items-center py-3 px-4 border rounded-md hover:bg-gray-50">
                      <span className="font-medium text-gray-800">Autentikasi Dua Faktor</span>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </button>
                    <button className="w-full flex justify-between items-center py-3 px-4 border rounded-md hover:bg-gray-50">
                      <span className="font-medium text-gray-800">Log Aktivitas</span>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
            &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanPage;
