import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanDashboard = () => {
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

  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="dashboard" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
          </main>

          <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
            &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanDashboard;
