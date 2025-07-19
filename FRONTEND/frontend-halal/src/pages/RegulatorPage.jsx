import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faCheckCircle, faExchangeAlt, faClipboardList, faUsers, faUser,
  faCog, faSignOutAlt, faBars, faBell, faExclamationCircle, faCheckDouble,
  faClipboardCheck, faUserCheck, faFileAlt, faQrcode, faCheck, faTimes, faEye, 
  faFilter, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const RegulatorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [regulatorData, setRegulatorData] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [entityStats, setEntityStats] = useState({
    totalEntities: 238,
    pendingVerifications: 24,
    todayTransactions: 18,
    complianceRate: '98.7%'
  });
  
  useEffect(() => {
    // Fetch regulator data from API
    const fetchRegulatorData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/regulator/current');
        const data = await response.json();
        setRegulatorData(data);
      } catch (error) {
        console.error('Error fetching regulator data:', error);
      }
    };

    // Fetch pending verifications from API
    const fetchPendingVerifications = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/pengecekan-halal-sehat/pending');
        const data = await response.json();
        setPendingVerifications(data);
      } catch (error) {
        console.error('Error fetching pending verifications:', error);
      }
    };

    // Fetch activities from API
    const fetchActivities = async () => {
      try {
        // This could be a combined API that gets different activities
        const response = await fetch('/api/regulator/activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    // Fetch compliance data from API
    const fetchComplianceData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/regulator/compliance');
        const data = await response.json();
        setComplianceData(data);
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      }
    };

    // Fetch entity statistics
    const fetchEntityStats = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/regulator/stats');
        const data = await response.json();
        setEntityStats(data);
      } catch (error) {
        console.error('Error fetching entity stats:', error);
        // Fallback to default values if API fails
      }
    };

    fetchRegulatorData();
    fetchPendingVerifications();
    fetchActivities();
    fetchComplianceData();
    fetchEntityStats();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Function to handle scanning QR code
  const handleScanQR = () => {
    // This would typically open a camera or file picker
    console.log('Scanning QR code');
    alert('QR code scanner would open here');
  };

  // Function to handle verification approval or rejection
  const handleVerification = (id, action) => {
    console.log(`Verification ${id} ${action}`);
    // In a real app, this would call an API to update the verification status
    // Then we would refresh the pending verifications list
    alert(`Verification ${id} ${action === 'approve' ? 'approved' : 'rejected'}`);
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
            to="#verifications" 
            onClick={() => handlePageChange('verifications')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'verifications' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="w-6" />
            <span>Verifikasi Tertunda</span>
          </Link>
          <Link 
            to="#transactions" 
            onClick={() => handlePageChange('transactions')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'transactions' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faExchangeAlt} className="w-6" />
            <span>Riwayat Transaksi</span>
          </Link>
          <Link 
            to="#compliance" 
            onClick={() => handlePageChange('compliance')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'compliance' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faClipboardList} className="w-6" />
            <span>Laporan Kepatuhan</span>
          </Link>
          <Link 
            to="#entities" 
            onClick={() => handlePageChange('entities')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'entities' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faUsers} className="w-6" />
            <span>Manajemen Entitas</span>
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
                    {regulatorData ? regulatorData.name : 'Regulator BPJPH'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Regulator</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faUsers} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Entitas</p>
                <p className="text-2xl font-semibold text-gray-800">{entityStats.totalEntities}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Verifikasi Tertunda</p>
                <p className="text-2xl font-semibold text-gray-800">{entityStats.pendingVerifications}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Transaksi Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-800">{entityStats.todayTransactions}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCheckDouble} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tingkat Kepatuhan</p>
                <p className="text-2xl font-semibold text-gray-800">{entityStats.complianceRate}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & QR Code Scanner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                <a href="#" className="text-primary text-sm">Lihat Semua</a>
              </div>
              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.slice(0, 4).map((activity, index) => {
                    // Define activity types for visualization
                    let icon, bgColor, textColor;
                    
                    if (activity.type === 'verification') {
                      icon = faCheckCircle;
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-600';
                    } else if (activity.type === 'inspection') {
                      icon = faClipboardCheck;
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-600';
                    } else if (activity.type === 'approval') {
                      icon = faUserCheck;
                      bgColor = 'bg-yellow-100';
                      textColor = 'text-yellow-600';
                    } else {
                      icon = faFileAlt;
                      bgColor = 'bg-purple-100';
                      textColor = 'text-purple-600';
                    }
                    
                    return (
                      <div className="flex items-start" key={index}>
                        <div className={`rounded-full ${bgColor} p-2 mr-4`}>
                          <FontAwesomeIcon icon={icon} className={textColor} />
                        </div>
                        <div>
                          <p className="text-gray-800">{activity.message}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="rounded-full bg-green-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Transaksi #TR-5678 terverifikasi (RPH ke Distributor)</p>
                        <p className="text-gray-500 text-sm">Hari ini, 10:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Inspeksi selesai di RPH Al-Baraka</p>
                        <p className="text-gray-500 text-sm">Kemarin, 15:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faUserCheck} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Menyetujui pendaftaran RPH baru: Rumah Potong Rahmat</p>
                        <p className="text-gray-500 text-sm">Kemarin, 11:20</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faFileAlt} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Membuat laporan kepatuhan untuk Q2 2025</p>
                        <p className="text-gray-500 text-sm">15 Juli 2025, 09:15</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* QR Code Scanner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Verifikasi Rantai Pasok</h2>
              <div className="text-center mb-4">
                <div className="bg-gray-100 w-40 h-40 mx-auto flex flex-col items-center justify-center rounded-lg">
                  <FontAwesomeIcon icon={faQrcode} className="text-6xl text-primary mb-2" />
                  <p className="text-xs text-gray-500">Bidikan Kamera</p>
                </div>
              </div>
              <button 
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2"
                onClick={handleScanQR}
              >
                Pindai Kode QR
              </button>
              <p className="text-xs text-gray-500 text-center">
                Pindai kode QR untuk memverifikasi keaslian produk secara instan
              </p>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Verifikasi Tertunda</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dari</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ke</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingVerifications && pendingVerifications.length > 0 ? (
                    pendingVerifications.slice(0, 3).map((verification, index) => {
                      return (
                        <tr key={verification.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`TR-${5685 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(verification.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {verification.type === 'PENJUALAN' ? 'Penjualan' : 'Penyembelihan'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {verification.fromEntity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {verification.toEntity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Tertunda
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                            <button 
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleVerification(verification.id, 'approve')}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleVerification(verification.id, 'reject')}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5685</td>
                        <td className="px-6 py-4 whitespace-nowrap">20 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penjualan</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">Restoran Barokah</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Tertunda</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button 
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleVerification('TR-5685', 'approve')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleVerification('TR-5685', 'reject')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5682</td>
                        <td className="px-6 py-4 whitespace-nowrap">20 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penyembelihan</td>
                        <td className="px-6 py-4 whitespace-nowrap">RPH Al-Amin</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Tertunda</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button 
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleVerification('TR-5682', 'approve')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleVerification('TR-5682', 'reject')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5680</td>
                        <td className="px-6 py-4 whitespace-nowrap">19 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penjualan</td>
                        <td className="px-6 py-4 whitespace-nowrap">Peternakan Ahmad</td>
                        <td className="px-6 py-4 whitespace-nowrap">Pasar Al-Falah</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Tertunda</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button 
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleVerification('TR-5680', 'approve')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleVerification('TR-5680', 'reject')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
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

          {/* Compliance Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Ikhtisar Kepatuhan</h2>
              <a href="#" className="text-primary text-sm">Buat Laporan</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Entitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tersertifikasi (%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor Kepatuhan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspeksi Terakhir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complianceData && complianceData.length > 0 ? (
                    complianceData.map((entity, index) => {
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{entity.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{entity.count}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{entity.certificationRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{entity.complianceScore}%</span>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${entity.complianceScore > 90 ? 'bg-green-500' : 'bg-yellow-500'} h-2 rounded-full`} 
                                  style={{ width: `${entity.complianceScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(entity.lastInspection).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">RPH</td>
                        <td className="px-6 py-4 whitespace-nowrap">24</td>
                        <td className="px-6 py-4 whitespace-nowrap">100%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">98%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">18 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor</td>
                        <td className="px-6 py-4 whitespace-nowrap">36</td>
                        <td className="px-6 py-4 whitespace-nowrap">94%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">92%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">15 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">HoReCa</td>
                        <td className="px-6 py-4 whitespace-nowrap">85</td>
                        <td className="px-6 py-4 whitespace-nowrap">89%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">86%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">10 Jul 2025</td>
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
          &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default RegulatorPage;
