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

    // Fetch recent activity from API
    const fetchRecentActivity = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/recent-activity');
        const data = await response.json();
        setRecentActivity(data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    // Mock data
    setDistributorData({
      name: 'Distributor Daging Segar',
      address: 'Jl. Distributor No. 123, Jakarta',
      phone: '08123456789',
      email: 'distributor@example.com',
      license: 'DIST-12345'
    });

    setInventory([
      {
        id: 'DG-2023-0001',
        type: 'Daging Has Dalam',
        quantity: 50,
        weight: 250,
        dateReceived: '2023-07-10',
        source: 'RPH Berkah',
        halalStatus: 'Tersertifikasi Halal',
        healthStatus: 'Sehat',
        temperature: -2
      },
      {
        id: 'DG-2023-0002',
        type: 'Daging Has Luar',
        quantity: 40,
        weight: 200,
        dateReceived: '2023-07-11',
        source: 'RPH Berkah',
        halalStatus: 'Tersertifikasi Halal',
        healthStatus: 'Sehat',
        temperature: -3
      },
      {
        id: 'DG-2023-0003',
        type: 'Daging Iga',
        quantity: 30,
        weight: 150,
        dateReceived: '2023-07-12',
        source: 'RPH Santoso',
        halalStatus: 'Tersertifikasi Halal',
        healthStatus: 'Sehat',
        temperature: -2
      }
    ]);

    setShipments([
      {
        id: 'SHP-2023-0001',
        destination: 'Restaurant Lezat',
        items: [{ id: 'DG-2023-0001', quantity: 10, weight: 50 }],
        status: 'Delivered',
        date: '2023-07-13'
      },
      {
        id: 'SHP-2023-0002',
        destination: 'Hotel Mewah',
        items: [
          { id: 'DG-2023-0002', quantity: 5, weight: 25 },
          { id: 'DG-2023-0003', quantity: 5, weight: 25 }
        ],
        status: 'In Transit',
        date: '2023-07-14'
      },
      {
        id: 'SHP-2023-0003',
        destination: 'Catering Nikmat',
        items: [{ id: 'DG-2023-0001', quantity: 8, weight: 40 }],
        status: 'Scheduled',
        date: '2023-07-15'
      }
    ]);

    setRecentActivity([
      {
        id: 'ACT-2023-0001',
        type: 'Received',
        description: 'Received 50 kg Daging Has Dalam from RPH Berkah',
        date: '2023-07-10 10:15'
      },
      {
        id: 'ACT-2023-0002',
        type: 'Shipped',
        description: 'Shipped 50 kg Daging Has Dalam to Restaurant Lezat',
        date: '2023-07-13 14:30'
      },
      {
        id: 'ACT-2023-0003',
        type: 'Quality Check',
        description: 'Performed quality check on all inventory items',
        date: '2023-07-14 09:45'
      }
    ]);

    // fetchDistributorData();
    // fetchInventory();
    // fetchShipments();
    // fetchRecentActivity();
  }, []);

  // Function to render different pages based on active tab
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'inventory':
        return renderInventory();
      case 'incoming':
        return renderIncoming();
      case 'outgoing':
        return renderOutgoing();
      case 'cold-chain':
        return renderColdChain();
      default:
        return renderDashboard();
    }
  };

  // Dashboard content
  const renderDashboard = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard Distributor</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Inventory</p>
                <p className="text-2xl font-bold">{inventory.reduce((acc, item) => acc + item.quantity, 0)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm">+5% </span>
              <span className="text-gray-400 text-sm">from last week</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Incoming Orders</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faTruckLoading} className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm">+2% </span>
              <span className="text-gray-400 text-sm">from last week</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Outgoing Shipments</p>
                <p className="text-2xl font-bold">{shipments.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faTruck} className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-yellow-500 text-sm">±0% </span>
              <span className="text-gray-400 text-sm">from last week</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Cold Chain Status</p>
                <p className="text-2xl font-bold">Normal</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <FontAwesomeIcon icon={faTemperatureLow} className="text-teal-500 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4">
                <div className={`p-2 rounded-full mr-4 ${
                  activity.type === 'Received' ? 'bg-green-100' : 
                  activity.type === 'Shipped' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  <FontAwesomeIcon icon={
                    activity.type === 'Received' ? faTruckLoading : 
                    activity.type === 'Shipped' ? faTruck : faClipboardList
                  } className={`${
                    activity.type === 'Received' ? 'text-green-500' : 
                    activity.type === 'Shipped' ? 'text-blue-500' : 'text-yellow-500'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-gray-500 text-sm">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shipment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Shipment Status</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map(shipment => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shipment.items.map(item => `${item.quantity} x ${item.id}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-500 hover:text-blue-700">
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
    );
  };

  // Inventory page content
  const renderInventory = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Manajemen Inventori</h2>
        {/* Rest of inventory content would go here */}
      </div>
    );
  };

  // Incoming orders page content
  const renderIncoming = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Pesanan Masuk</h2>
        {/* Rest of incoming orders content would go here */}
      </div>
    );
  };

  // Outgoing shipments page content
  const renderOutgoing = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Pengiriman Keluar</h2>
        {/* Rest of outgoing shipments content would go here */}
      </div>
    );
  };

  // Cold chain monitoring page content
  const renderColdChain = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Monitoring Cold Chain</h2>
        {/* Rest of cold chain monitoring content would go here */}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-white w-64 fixed inset-y-0 z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex items-center">
          <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-2xl mr-3" />
          <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
        </div>
        <nav className="mt-4">
          <div className="px-4 py-2">
            <p className="text-xs uppercase text-gray-500 font-semibold">Menu</p>
          </div>
          <button 
            onClick={() => setActivePage('dashboard')}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activePage === 'dashboard' ? 'bg-blue-50 border-r-4 border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="w-5 mr-3" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActivePage('inventory')}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activePage === 'inventory' ? 'bg-blue-50 border-r-4 border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faBoxOpen} className="w-5 mr-3" />
            <span>Inventori</span>
          </button>
          <button 
            onClick={() => setActivePage('incoming')}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activePage === 'incoming' ? 'bg-blue-50 border-r-4 border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faTruckLoading} className="w-5 mr-3" />
            <span>Pesanan Masuk</span>
          </button>
          <button 
            onClick={() => setActivePage('outgoing')}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activePage === 'outgoing' ? 'bg-blue-50 border-r-4 border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faTruck} className="w-5 mr-3" />
            <span>Pengiriman</span>
          </button>
          <button 
            onClick={() => setActivePage('cold-chain')}
            className={`flex items-center px-4 py-3 w-full text-left ${
              activePage === 'cold-chain' ? 'bg-blue-50 border-r-4 border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faTemperatureLow} className="w-5 mr-3" />
            <span>Cold Chain</span>
          </button>

          <div className="px-4 py-2 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Akun</p>
          </div>
          <Link to="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100">
            <FontAwesomeIcon icon={faUser} className="w-5 mr-3" />
            <span>Profil</span>
          </Link>
          <Link to="/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100">
            <FontAwesomeIcon icon={faCog} className="w-5 mr-3" />
            <span>Pengaturan</span>
          </Link>
          <Link to="/" className="flex items-center px-4 py-3 text-red-500 hover:bg-gray-100">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 mr-3" />
            <span>Keluar</span>
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button 
              className="lg:hidden text-gray-600 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <FontAwesomeIcon icon={faBell} className="text-xl" />
              </button>
              <div className="relative">
                <div className="flex items-center cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    D
                  </div>
                  <span className="ml-2 text-gray-700">{distributorData?.name.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default DistributorPage;
