import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faDrumstickBite, faCut, faCow, faCheckCircle, faUser, 
  faCog, faSignOutAlt, faBars, faBell, faWeight, faTruck, 
  faClipboardCheck, faQrcode, faEdit, faEye, faFilter, faShieldHalved,
  faCertificate, faUserCheck, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const RPHPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [rphData, setRPHData] = useState(null);
  const [cattleInventory, setCattleInventory] = useState([]);
  const [operationSchedules, setOperationSchedules] = useState([]);
  const [distributions, setDistributions] = useState([]);
  
  useEffect(() => {
    // Fetch RPH data from API
    const fetchRPHData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/rph/current');
        const data = await response.json();
        setRPHData(data);
      } catch (error) {
        console.error('Error fetching RPH data:', error);
      }
    };

    // Fetch cattle inventory from API
    const fetchCattleInventory = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/sapi');
        const data = await response.json();
        setCattleInventory(data);
      } catch (error) {
        console.error('Error fetching cattle inventory:', error);
      }
    };

    // Fetch operation schedules from API
    const fetchOperationSchedules = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penyembelihan');
        const data = await response.json();
        setOperationSchedules(data);
      } catch (error) {
        console.error('Error fetching operation schedules:', error);
      }
    };

    // Fetch distributions from API
    const fetchDistributions = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penjualan');
        const data = await response.json();
        setDistributions(data);
      } catch (error) {
        console.error('Error fetching distributions:', error);
      }
    };

    fetchRPHData();
    fetchCattleInventory();
    fetchOperationSchedules();
    fetchDistributions();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const getTodayOperations = () => {
    const today = new Date().toDateString();
    if (!operationSchedules || !operationSchedules.length) return [];
    
    return operationSchedules
      .filter(op => new Date(op.timestamp).toDateString() === today)
      .slice(0, 5);
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
            to="#operations" 
            onClick={() => handlePageChange('operations')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'operations' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCut} className="w-6" />
            <span>Operasi Penyembelihan</span>
          </Link>
          <Link 
            to="#cattle" 
            onClick={() => handlePageChange('cattle')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'cattle' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCow} className="w-6" />
            <span>Inventaris Ternak</span>
          </Link>
          <Link 
            to="#meat" 
            onClick={() => handlePageChange('meat')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'meat' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faDrumstickBite} className="w-6" />
            <span>Produksi Daging</span>
          </Link>
          <Link 
            to="#certification" 
            onClick={() => handlePageChange('certification')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'certification' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCertificate} className="w-6" />
            <span>Sertifikasi Halal</span>
          </Link>
          <Link 
            to="#distribution" 
            onClick={() => handlePageChange('distribution')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'distribution' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faTruck} className="w-6" />
            <span>Distribusi</span>
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
                    {rphData ? rphData.nama : 'RPH Al-Baraka'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Rumah Potong Hewan</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faCow} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ternak Tersedia</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {cattleInventory?.length || 32}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCut} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Diproses Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {getTodayOperations().length || 8}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faDrumstickBite} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Daging Dihasilkan (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {distributions?.reduce((total, dist) => total + (dist.jumlahQty || 0), 0) || 2450}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faUserCheck} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">JULEHA Bertugas</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {rphData?.jumlahPenyelia || 3}
                </p>
              </div>
            </div>
          </div>

          {/* Halal Certification & Scheduled Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Halal Certification Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sertifikasi Halal</h2>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={faCertificate} className="text-green-600 text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status Sertifikasi</p>
                  <p className="text-lg font-semibold text-green-600">Aktif & Valid</p>
                  <p className="text-xs text-gray-500">Sampai: 15 Des 2025</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Sertifikat JULEHA</p>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Valid</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Nomor Sertifikat: {rphData?.noSertifJuleha || "JULEHA-2023-5678"}
                </p>
                <button className="w-full bg-primaryLight text-primary py-2 rounded-md hover:bg-primary hover:text-white transition">
                  Lihat Sertifikat
                </button>
              </div>
            </div>

            {/* Today's Operations */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Operasi Hari Ini</h2>
                <a href="#" className="text-primary text-sm">Lihat Jadwal</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Ternak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JULEHA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTodayOperations().length > 0 ? (
                      getTodayOperations().map((operation, index) => {
                        const times = ['08:00', '10:30', '14:00', '16:30'];
                        const statuses = [
                          { label: 'Selesai', bgColor: 'bg-green-100', textColor: 'text-green-800' },
                          { label: 'Sedang Berlangsung', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
                          { label: 'Terjadwal', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
                        ];
                        
                        // Create some display data based on operation
                        const time = times[index % times.length];
                        const status = index < 2 ? statuses[0] : (index === 2 ? statuses[1] : statuses[2]);
                        const batchNumber = `Batch #${520 + index}`;
                        const julehaNames = ['Ustadz Ahmad', 'Ustadz Mahmud', 'Ustadz Ibrahim'];
                        const juleha = julehaNames[index % julehaNames.length];
                        
                        return (
                          <tr key={operation.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{time}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{batchNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {index + 3}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{juleha}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${status.bgColor} ${status.textColor}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">08:00</td>
                          <td className="px-6 py-4 whitespace-nowrap">Batch #521</td>
                          <td className="px-6 py-4 whitespace-nowrap">3</td>
                          <td className="px-6 py-4 whitespace-nowrap">Ustadz Ahmad</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">10:30</td>
                          <td className="px-6 py-4 whitespace-nowrap">Batch #522</td>
                          <td className="px-6 py-4 whitespace-nowrap">5</td>
                          <td className="px-6 py-4 whitespace-nowrap">Ustadz Mahmud</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Selesai</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">14:00</td>
                          <td className="px-6 py-4 whitespace-nowrap">Batch #523</td>
                          <td className="px-6 py-4 whitespace-nowrap">4</td>
                          <td className="px-6 py-4 whitespace-nowrap">Ustadz Ibrahim</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              Sedang Berlangsung
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">16:30</td>
                          <td className="px-6 py-4 whitespace-nowrap">Batch #524</td>
                          <td className="px-6 py-4 whitespace-nowrap">6</td>
                          <td className="px-6 py-4 whitespace-nowrap">Ustadz Ahmad</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Terjadwal</span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cattle Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Inventaris Ternak</h2>
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Cari..." 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2" 
                />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kedatangan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dijadwalkan Untuk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cattleInventory && cattleInventory.length > 0 ? (
                    cattleInventory.slice(0, 5).map((cattle, index) => {
                      // Generate some mock data based on the cattle object
                      const scheduledDates = ['18 Jul 2025', '19 Jul 2025', '20 Jul 2025'];
                      const scheduledDate = scheduledDates[index % scheduledDates.length];
                      const batchNumber = `Batch #${525 + index}`;
                      
                      return (
                        <tr key={cattle.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cattle.jenis}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cattle.asalType === 'PASAR_HEWAN' 
                              ? 'Pasar Hewan Al-Falah' 
                              : 'Peternakan Salam'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{`${scheduledDate} - ${batchNumber}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faCut} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0076</td>
                        <td className="px-6 py-4 whitespace-nowrap">Sapi</td>
                        <td className="px-6 py-4 whitespace-nowrap">Pasar Hewan Al-Falah</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">18 Jul 2025 - Batch #525</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faCut} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0077</td>
                        <td className="px-6 py-4 whitespace-nowrap">Sapi Jantan</td>
                        <td className="px-6 py-4 whitespace-nowrap">Peternakan Salam</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">18 Jul 2025 - Batch #525</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faCut} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">HT-2023-0078</td>
                        <td className="px-6 py-4 whitespace-nowrap">Sapi</td>
                        <td className="px-6 py-4 whitespace-nowrap">Pasar Hewan Al-Falah</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">18 Jul 2025 - Batch #526</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faCut} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Distributions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Distribusi Daging Terbaru</h2>
              <a href="#" className="text-primary text-sm">Lihat Semua Distribusi</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Distribusi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributions && distributions.length > 0 ? (
                    distributions.slice(0, 3).map((dist, index) => {
                      const batches = ['Batch #521', 'Batch #522', 'Batch #520'];
                      const batch = batches[index % batches.length];
                      const destinations = ['Distributor Berkah', 'Distributor Daging Halal', 'Suplai Daging Segar'];
                      const destination = destinations[index % destinations.length];
                      const statuses = [
                        { label: 'Terkirim', bgColor: 'bg-green-100', textColor: 'text-green-800' },
                        { label: 'Dalam Perjalanan', bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
                      ];
                      const status = index === 1 ? statuses[1] : statuses[0];
                      
                      return (
                        <tr key={dist.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`DS-${8920 + index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(dist.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{batch}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{dist.jumlahQty}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {dist.pembeliType === 'DISTRIBUTOR' ? destination : 'Lainnya'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${status.bgColor} ${status.textColor}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DS-8924</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Batch #521</td>
                        <td className="px-6 py-4 whitespace-nowrap">850</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Berkah</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terkirim</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DS-8923</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Batch #522</td>
                        <td className="px-6 py-4 whitespace-nowrap">1250</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Daging Halal</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Dalam Perjalanan</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DS-8922</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Batch #520</td>
                        <td className="px-6 py-4 whitespace-nowrap">920</td>
                        <td className="px-6 py-4 whitespace-nowrap">Suplai Daging Segar</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terkirim</span>
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
          &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default RPHPage;
