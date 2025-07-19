import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faDrumstickBite, faCut, faCow, faCheckCircle, faUser, 
  faCog, faSignOutAlt, faBars, faBell, faWeight, faTruck, 
  faClipboardCheck, faQrcode, faEdit, faEye, faFilter, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const JagalPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [jagalData, setJagalData] = useState(null);
  const [dagingInventory, setDagingInventory] = useState([]);
  const [slaughterRecords, setSlaughterRecords] = useState([]);
  const [selectedDaging, setSelectedDaging] = useState('');
  
  useEffect(() => {
    // Fetch jagal data from API
    const fetchJagalData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/jagal/current');
        const data = await response.json();
        setJagalData(data);
      } catch (error) {
        console.error('Error fetching jagal data:', error);
      }
    };

    // Fetch daging inventory from API
    const fetchDagingInventory = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/daging');
        const data = await response.json();
        setDagingInventory(data);
      } catch (error) {
        console.error('Error fetching daging inventory:', error);
      }
    };

    // Fetch slaughter records from API
    const fetchSlaughterRecords = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penyembelihan');
        const data = await response.json();
        setSlaughterRecords(data);
      } catch (error) {
        console.error('Error fetching slaughter records:', error);
      }
    };

    fetchJagalData();
    fetchDagingInventory();
    fetchSlaughterRecords();
  }, []);

  const handleGenerateQR = () => {
    if (!selectedDaging) return;
    // Implement QR code generation logic here
    console.log(`Generating QR code for daging ID: ${selectedDaging}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  return (
    <div className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg lg:w-64 lg:flex-shrink-0 border-r lg:block ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:block'}`}>
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
            to="#dashboard" 
            onClick={() => handlePageChange('dashboard')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'dashboard' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faHome} className="w-6" />
            <span>Dasbor</span>
          </Link>
          <Link 
            to="#inventory" 
            onClick={() => handlePageChange('inventory')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'inventory' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faDrumstickBite} className="w-6" />
            <span>Inventaris Daging</span>
          </Link>
          <Link 
            to="#slaughter" 
            onClick={() => handlePageChange('slaughter')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'slaughter' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCut} className="w-6" />
            <span>Penyembelihan</span>
          </Link>
          <Link 
            to="#cattle" 
            onClick={() => handlePageChange('cattle')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'cattle' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCow} className="w-6" />
            <span>Ternak Tersedia</span>
          </Link>
          <Link 
            to="#halal" 
            onClick={() => handlePageChange('halal')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'halal' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="w-6" />
            <span>Verifikasi Halal</span>
          </Link>
          <div className="px-4 py-2 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Akun</p>
          </div>
          <Link 
            to="#profile" 
            onClick={() => handlePageChange('profile')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'profile' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faUser} className="w-6" />
            <span>Profil</span>
          </Link>
          <Link 
            to="#settings" 
            onClick={() => handlePageChange('settings')}
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
                  <span className="text-gray-700 font-medium">
                    {jagalData ? jagalData.nama : 'Jagal Berkah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Jagal</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faCow} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ternak Tersedia</p>
                <p className="text-2xl font-semibold text-gray-800">{jagalData ? jagalData.jumlahSapi : '12'}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faDrumstickBite} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Daging (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">{jagalData ? jagalData.jumlahDaging : '850'}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCut} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Sembelih Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {slaughterRecords.filter(record => 
                    new Date(record.timestamp).toDateString() === new Date().toDateString()
                  ).length || '3'}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tersertifikasi Halal</p>
                <p className="text-2xl font-semibold text-gray-800">100%</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & QR Code Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                <a href="#" className="text-primary text-sm">Lihat Semua</a>
              </div>
              <div className="space-y-4">
                {slaughterRecords.length > 0 ? (
                  slaughterRecords.slice(0, 4).map((record, index) => {
                    // Define different activity types for visualization
                    const activities = [
                      {
                        icon: faCut,
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-600',
                        text: `Penyembelihan ternak selesai (ID: ${record.sapiId})`,
                        time: new Date(record.timestamp).toLocaleString()
                      },
                      {
                        icon: faWeight,
                        bgColor: 'bg-blue-100',
                        textColor: 'text-blue-600',
                        text: `Daging berhasil ditimbang dan dikemas dari ternak (ID: ${record.sapiId})`,
                        time: new Date(record.timestamp).toLocaleString()
                      }
                    ];
                    
                    const activity = activities[index % 2];
                    
                    return (
                      <div className="flex items-start" key={record.id}>
                        <div className={`rounded-full ${activity.bgColor} p-2 mr-4`}>
                          <FontAwesomeIcon icon={activity.icon} className={activity.textColor} />
                        </div>
                        <div>
                          <p className="text-gray-800">{activity.text}</p>
                          <p className="text-gray-500 text-sm">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="rounded-full bg-green-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faCut} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Penyembelihan ternak selesai (ID: HT-2023-0092)</p>
                        <p className="text-gray-500 text-sm">Hari ini, 09:15</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faWeight} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Daging berhasil ditimbang dan dikemas: 120kg</p>
                        <p className="text-gray-500 text-sm">Hari ini, 10:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faTruck} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Pengiriman daging ke Distributor Al-Baraka</p>
                        <p className="text-gray-500 text-sm">Kemarin, 15:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Verifikasi halal selesai untuk 5 daging</p>
                        <p className="text-gray-500 text-sm">14 Jul 2023, 13:20</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* QR Code Generator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Generator Kode QR</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih ID Daging</label>
                <select 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedDaging}
                  onChange={(e) => setSelectedDaging(e.target.value)}
                >
                  <option value="">-- Pilih ID Daging --</option>
                  {dagingInventory.length > 0 ? (
                    dagingInventory.map(daging => (
                      <option key={daging.id} value={daging.id}>{daging.id}</option>
                    ))
                  ) : (
                    <>
                      <option>DG-2023-0045</option>
                      <option>DG-2023-0044</option>
                      <option>DG-2023-0043</option>
                      <option>DG-2023-0042</option>
                    </>
                  )}
                </select>
              </div>
              <div className="text-center mb-4">
                <div className="bg-gray-100 w-40 h-40 mx-auto flex flex-col items-center justify-center rounded-lg">
                  <FontAwesomeIcon icon={faQrcode} className="text-6xl text-primary mb-2" />
                  <p className="text-xs text-gray-500">Pratinjau QR</p>
                </div>
              </div>
              <button 
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2"
                onClick={handleGenerateQR}
              >
                Buat Kode QR
              </button>
              <button className="w-full border border-primary text-primary py-2 rounded-md hover:bg-primaryLight transition">
                Unduh
              </button>
            </div>
          </div>

          {/* Meat Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Inventaris Daging</h2>
              <div className="flex items-center">
                <input type="text" placeholder="Cari..." className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2" />
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <FontAwesomeIcon icon={faFilter} className="mr-1" /> Filter
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Daging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal Ternak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Produksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Halal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dagingInventory.length > 0 ? (
                    dagingInventory.map((daging) => (
                      <tr key={daging.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{daging.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi</td>
                        <td className="px-6 py-4 whitespace-nowrap">{daging.sapiId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{daging.berat}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(daging.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terverifikasi</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faTruck} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DG-2023-0045</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Has Dalam</td>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0092</td>
                        <td className="px-6 py-4 whitespace-nowrap">120</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terverifikasi</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faTruck} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DG-2023-0044</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Has Luar</td>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0091</td>
                        <td className="px-6 py-4 whitespace-nowrap">180</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terverifikasi</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faTruck} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slaughtering Records */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Catatan Penyembelihan Terbaru</h2>
              <a href="#" className="text-primary text-sm">Lihat Semua Catatan</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slaughterRecords.length > 0 ? (
                    slaughterRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{record.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(record.timestamp).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.sapiId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.rphId ? 'RPH' : 'Pasar Hewan'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.distributorId || 'Belum ditentukan'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TS-9876</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0092</td>
                        <td className="px-6 py-4 whitespace-nowrap">Pasar Hewan Al-Falah</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TS-9875</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0091</td>
                        <td className="px-6 py-4 whitespace-nowrap">Pasar Hewan Al-Falah</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
          &copy; 2023 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default JagalPage;
