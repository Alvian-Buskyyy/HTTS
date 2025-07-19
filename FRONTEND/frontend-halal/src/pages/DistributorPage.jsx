import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faBoxOpen, faTruckLoading, faTruck, faTemperatureLow,
  faUser, faCog, faSignOutAlt, faBars, faBell, faClipboardList, 
  faEdit, faQrcode, faEye, faFilter, faShieldHalved,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const DistributorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [distributorData, setDistributorData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  useEffect(() => {
    // Fetch distributor data from API
    const fetchDistributorData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/distributor/current');
        const data = await response.json();
        setDistributorData(data);
      } catch (error) {
        console.error('Error fetching distributor data:', error);
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

    // Fetch shipments from API
    const fetchShipments = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penjualan');
        const data = await response.json();
        setShipments(data);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      }
    };

    // Fetch recent activity
    const fetchRecentActivity = async () => {
      try {
        // This could be a combined API that gets different activities
        const response = await fetch('/api/activity');
        const data = await response.json();
        setRecentActivity(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchDistributorData();
    fetchInventory();
    fetchShipments();
    fetchRecentActivity();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date().toDateString();
    
    // Calculate total inventory weight
    const totalInventory = inventory.reduce((total, item) => total + (item.berat || 0), 0) || 1850;
    
    // Calculate received today
    const receivedToday = shipments
      .filter(ship => 
        new Date(ship.timestamp).toDateString() === today && 
        ship.pembeliType === 'DISTRIBUTOR'
      )
      .reduce((total, ship) => total + (ship.jumlahQty || 0), 0) || 850;
    
    // Calculate shipped today
    const shippedToday = shipments
      .filter(ship => 
        new Date(ship.timestamp).toDateString() === today && 
        ship.penjualType === 'DISTRIBUTOR'
      )
      .reduce((total, ship) => total + (ship.jumlahQty || 0), 0) || 680;
    
    // Calculate pending orders
    const pendingOrders = shipments
      .filter(ship => !ship.verifikasiPembeli || !ship.verifikasiPenjual)
      .length || 5;
    
    return {
      totalInventory,
      receivedToday,
      shippedToday,
      pendingOrders
    };
  };

  const stats = calculateStats();

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
            <FontAwesomeIcon icon={faBoxOpen} className="w-6" />
            <span>Inventaris</span>
          </Link>
          <Link 
            to="#receive" 
            onClick={() => handlePageChange('receive')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'receive' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faTruckLoading} className="w-6" />
            <span>Terima Pengiriman</span>
          </Link>
          <Link 
            to="#deliver" 
            onClick={() => handlePageChange('deliver')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'deliver' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faTruck} className="w-6" />
            <span>Kirim Produk</span>
          </Link>
          <Link 
            to="#storage" 
            onClick={() => handlePageChange('storage')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'storage' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faTemperatureLow} className="w-6" />
            <span>Kelola Penyimpanan</span>
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
                    {distributorData ? distributorData.namaUsaha : 'Distributor Berkah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor Distributor</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faBoxOpen} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Inventaris</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalInventory} kg</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faTruckLoading} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Diterima Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.receivedToday} kg</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faTruck} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Dikirim Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.shippedToday} kg</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faClipboardList} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pesanan Tertunda</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                <a href="#" className="text-primary text-sm">Lihat Semua</a>
              </div>
              <div className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((activity, index) => {
                    // Define different activity types for visualization
                    let icon, bgColor, textColor, text;
                    
                    if (activity.type === 'receive') {
                      icon = faTruckLoading;
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-600';
                      text = `Menerima ${activity.quantity}kg daging dari ${activity.source}`;
                    } else if (activity.type === 'deliver') {
                      icon = faTruck;
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-600';
                      text = `Mengirim ${activity.quantity}kg daging ke ${activity.destination}`;
                    } else {
                      icon = faExclamationCircle;
                      bgColor = 'bg-yellow-100';
                      textColor = 'text-yellow-600';
                      text = `${activity.message || 'Inspeksi kualitas selesai untuk batch pengiriman'}`;
                    }
                    
                    return (
                      <div className="flex items-start" key={index}>
                        <div className={`rounded-full ${bgColor} p-2 mr-4`}>
                          <FontAwesomeIcon icon={icon} className={textColor} />
                        </div>
                        <div>
                          <p className="text-gray-800">{text}</p>
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
                        <FontAwesomeIcon icon={faTruckLoading} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Menerima 850kg daging dari RPH Al-Baraka</p>
                        <p className="text-gray-500 text-sm">Hari ini, 10:15</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Mengirim 340kg daging ke Restoran Nasi Padang</p>
                        <p className="text-gray-500 text-sm">Hari ini, 13:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faTruck} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Mengirim 340kg daging ke Restoran Sakinah</p>
                        <p className="text-gray-500 text-sm">Hari ini, 15:20</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Inspeksi kualitas selesai untuk batch pengiriman BT-2023-1045</p>
                        <p className="text-gray-500 text-sm">Kemarin, 14:30</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Ikhtisar Inventaris</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Diterima</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyimpanan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory && inventory.length > 0 ? (
                    inventory.slice(0, 3).map((item, index) => {
                      const storageLocations = ['Penyimpanan Dingin #1', 'Penyimpanan Dingin #2', 'Penyimpanan Dingin #3'];
                      const storageLocation = storageLocations[index % storageLocations.length];
                      const meatTypes = ['Daging Has Luar', 'Daging Has Dalam', 'Daging Iga'];
                      const meatType = meatTypes[index % meatTypes.length];
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`BT-2023-${1045 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{meatType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">RPH Al-Baraka</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.berat}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{storageLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Tersedia</span>
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
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">BT-2023-1045</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Has Luar</td>
                        <td className="px-6 py-4 whitespace-nowrap">RPH Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">350</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penyimpanan Dingin #1</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Tersedia</span>
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
                        <td className="px-6 py-4 whitespace-nowrap">BT-2023-1044</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Has Dalam</td>
                        <td className="px-6 py-4 whitespace-nowrap">RPH Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">120</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penyimpanan Dingin #1</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Tersedia</span>
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
                        <td className="px-6 py-4 whitespace-nowrap">BT-2023-1043</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Iga</td>
                        <td className="px-6 py-4 whitespace-nowrap">RPH Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">380</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Penyimpanan Dingin #2</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Tersedia</span>
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

          {/* Shipment Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Pengiriman Terbaru</h2>
              <a href="#" className="text-primary text-sm">Lihat Semua Pengiriman</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pengiriman</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments && shipments.length > 0 ? (
                    shipments.slice(0, 3).map((ship, index) => {
                      const customers = ['Restoran Nasi Padang', 'Restoran Sakinah', 'Hotel Barokah'];
                      const customer = customers[index % customers.length];
                      const products = ['Campuran Daging', 'Daging Has Luar', 'Campuran Daging'];
                      const product = products[index % products.length];
                      const quantities = [340, 340, 500];
                      const quantity = quantities[index % quantities.length];
                      
                      return (
                        <tr key={ship.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`DEL-${8765 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(ship.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{ship.jumlahQty || quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {ship.verifikasiPembeli && ship.verifikasiPenjual ? 'Terkirim' : 'Dalam Perjalanan'}
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
                        <td className="px-6 py-4 whitespace-nowrap">DEL-8765</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Restoran Nasi Padang</td>
                        <td className="px-6 py-4 whitespace-nowrap">Campuran Daging</td>
                        <td className="px-6 py-4 whitespace-nowrap">340</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terkirim</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DEL-8764</td>
                        <td className="px-6 py-4 whitespace-nowrap">17 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Restoran Sakinah</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Has Luar</td>
                        <td className="px-6 py-4 whitespace-nowrap">340</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terkirim</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">DEL-8763</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Hotel Barokah</td>
                        <td className="px-6 py-4 whitespace-nowrap">Campuran Daging</td>
                        <td className="px-6 py-4 whitespace-nowrap">500</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Terkirim</span>
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

export default DistributorPage;
