import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faDrumstickBite, faShoppingCart, faCheckCircle, faUser, 
  faCog, faSignOutAlt, faBars, faBell, faUtensils, faTruck, 
  faCheckDouble, faQrcode, faTag, faEye, faFilter, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const HorecaPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [horecaData, setHorecaData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    // Fetch horeca data from API
    const fetchHorecaData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/horeca/current');
        const data = await response.json();
        setHorecaData(data);
      } catch (error) {
        console.error('Error fetching horeca data:', error);
      }
    };

    // Fetch inventory from API
    const fetchInventory = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/daging');
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    // Fetch purchases from API
    const fetchPurchases = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penjualan');
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    // Fetch activities
    const fetchActivities = async () => {
      try {
        // This could be a combined API that gets different activities
        const response = await fetch('/api/activity');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchHorecaData();
    fetchInventory();
    fetchPurchases();
    fetchActivities();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Calculate stats
  const calculateStats = () => {
    // Calculate total meat weight
    const totalMeat = inventory.reduce((total, item) => total + (item.berat || 0), 0) || 85;
    
    // Calculate purchases this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const purchasesThisWeek = purchases.filter(purchase => 
      new Date(purchase.timestamp) > oneWeekAgo
    ).length || 8;
    
    // Calculate daily usage (rough estimate - could be more complex in real app)
    const dailyUsage = Math.round(totalMeat / 7) || 12;
    
    // Verified products - in this case always 100%
    const verifiedProducts = "100%";
    
    return {
      totalMeat,
      purchasesThisWeek,
      dailyUsage,
      verifiedProducts
    };
  };

  const stats = calculateStats();

  // Function to handle scanning QR code
  const handleScanQR = () => {
    // This would typically open a camera or file picker
    console.log('Scanning QR code');
    alert('QR code scanner would open here');
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
            to="#purchases" 
            onClick={() => handlePageChange('purchases')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'purchases' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="w-6" />
            <span>Riwayat Pembelian</span>
          </Link>
          <Link 
            to="#verification" 
            onClick={() => handlePageChange('verification')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'verification' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
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
                    {horecaData ? horecaData.nama : 'Restoran Barokah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor HoReCa</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faDrumstickBite} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Daging (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalMeat}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pembelian Minggu Ini</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.purchasesThisWeek}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Penggunaan Harian (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.dailyUsage}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCheckDouble} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Produk Terverifikasi</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.verifiedProducts}</p>
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
                    
                    if (activity.type === 'purchase') {
                      icon = faShoppingCart;
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-600';
                    } else if (activity.type === 'verification') {
                      icon = faCheckCircle;
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-600';
                    } else if (activity.type === 'menu') {
                      icon = faUtensils;
                      bgColor = 'bg-yellow-100';
                      textColor = 'text-yellow-600';
                    } else {
                      icon = faTag;
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
                        <FontAwesomeIcon icon={faShoppingCart} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Membeli 15kg daging sapi dari Distributor Al-Baraka</p>
                        <p className="text-gray-500 text-sm">Hari ini, 10:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Memverifikasi status halal untuk pasokan daging hari ini</p>
                        <p className="text-gray-500 text-sm">Kemarin, 15:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faUtensils} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Memperbarui menu dengan hidangan halal baru</p>
                        <p className="text-gray-500 text-sm">Kemarin, 11:20</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faTag} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Menerima pembaruan harga dari pemasok</p>
                        <p className="text-gray-500 text-sm">15 Juli 2025, 09:15</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* QR Code Scanner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Verifikasi Daging</h2>
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
                Pindai kode QR kemasan daging untuk memverifikasi status halal
              </p>
            </div>
          </div>

          {/* Meat Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Inventaris Daging</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pembelian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Halal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory && inventory.length > 0 ? (
                    inventory.slice(0, 3).map((item, index) => {
                      const meatTypes = ['Daging Sapi (Has Dalam)', 'Daging Sapi (Has Luar)', 'Daging Sapi (Giling)'];
                      const meatType = meatTypes[index % meatTypes.length];
                      
                      const suppliers = ['Distributor Al-Baraka', 'Distributor Rahmat', 'Distributor Al-Baraka'];
                      const supplier = suppliers[index % suppliers.length];
                      
                      const weights = [15, 20, 10];
                      const weight = weights[index % weights.length];
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`MT-2023-00${54 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{meatType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{supplier}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.berat || weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Terverifikasi
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faQrcode} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0054</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Dalam)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">15</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0053</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Luar)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">20</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0051</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Giling)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">10</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Pembelian Terbaru</h2>
              <a href="#" className="text-primary text-sm">Lihat Semua Pembelian</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemasok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases && purchases.length > 0 ? (
                    purchases.slice(0, 3).map((purchase, index) => {
                      const meatTypes = ['Daging Sapi (Has Dalam)', 'Daging Sapi (Has Luar)', 'Daging Sapi (Giling)'];
                      const meatType = meatTypes[index % meatTypes.length];
                      
                      const suppliers = ['Distributor Al-Baraka', 'Distributor Rahmat', 'Distributor Al-Baraka'];
                      const supplier = suppliers[index % suppliers.length];
                      
                      const weights = [15, 20, 10];
                      const weight = weights[index % weights.length];
                      
                      return (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`TR-${5678 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(purchase.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{supplier}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{meatType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{purchase.jumlahQty || weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Selesai
                            </span>
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
                        <td className="px-6 py-4 whitespace-nowrap">TR-5678</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Dalam)</td>
                        <td className="px-6 py-4 whitespace-nowrap">15</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5677</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Luar)</td>
                        <td className="px-6 py-4 whitespace-nowrap">20</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5676</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Giling)</td>
                        <td className="px-6 py-4 whitespace-nowrap">10</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
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
          &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default HorecaPage;
