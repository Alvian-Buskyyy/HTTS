import React, { useState } from 'react';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanTernak = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data for demonstration - Cattle inventory
  const [cattleData, setCattleData] = useState([
    { id: 'HT-2023-0054', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '16 Jul 2025', weight: 325, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0053', type: 'Sapi Jantan', source: 'Peternakan Salam', arrivalDate: '16 Jul 2025', weight: 410, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0051', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '15 Jul 2025', weight: 315, healthStatus: 'Menunggu', action: '' },
    { id: 'HT-2023-0050', type: 'Sapi Jantan', source: 'Peternakan Wijaya', arrivalDate: '14 Jul 2025', weight: 390, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0049', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '14 Jul 2025', weight: 330, healthStatus: 'Terverifikasi', action: '' },
    { id: 'HT-2023-0048', type: 'Sapi Jantan', source: 'Peternakan Salam', arrivalDate: '13 Jul 2025', weight: 405, healthStatus: 'Terverifikasi', action: '' }
  ]);

  // Statistics
  const stats = {
    totalCattle: 46
  };

  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="ternak" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
          </main>

          <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
            &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanTernak;
