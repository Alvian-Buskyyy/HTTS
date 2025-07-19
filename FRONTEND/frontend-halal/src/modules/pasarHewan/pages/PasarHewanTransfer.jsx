import React, { useState } from 'react';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanTransfer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data for pending and history transfers
  const [pendingTransfers, setPendingTransfers] = useState([
    { id: 'TRF-2025-0012', date: '19 Jul 2025', cattleId: 'HT-2023-0054', recipient: 'RPH Barokah', status: 'Menunggu Konfirmasi' },
    { id: 'TRF-2025-0011', date: '18 Jul 2025', cattleId: 'HT-2023-0053', recipient: 'RPH Barokah', status: 'Menunggu Konfirmasi' }
  ]);
  
  const [transferHistory, setTransferHistory] = useState([
    { id: 'TRF-2025-0010', date: '16 Jul 2025', cattleId: 'HT-2023-0048', recipient: 'RPH Barokah', status: 'Selesai' },
    { id: 'TRF-2025-0009', date: '15 Jul 2025', cattleId: 'HT-2023-0047', recipient: 'RPH Makmur', status: 'Selesai' },
    { id: 'TRF-2025-0008', date: '14 Jul 2025', cattleId: 'HT-2023-0046', recipient: 'RPH Barokah', status: 'Selesai' },
    { id: 'TRF-2025-0007', date: '12 Jul 2025', cattleId: 'HT-2023-0045', recipient: 'RPH Makmur', status: 'Selesai' }
  ]);

  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="transfer" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Transfer</h1>

            {/* New Transfer Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Transfer Baru</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Ternak</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Pilih ID Ternak</option>
                      <option value="HT-2023-0054">HT-2023-0054 - Sapi Betina (325kg)</option>
                      <option value="HT-2023-0053">HT-2023-0053 - Sapi Jantan (410kg)</option>
                      <option value="HT-2023-0051">HT-2023-0051 - Sapi Betina (315kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Transfer</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Pilih Tujuan</option>
                      <option value="RPH Barokah">RPH Barokah</option>
                      <option value="RPH Makmur">RPH Makmur</option>
                      <option value="RPH Sentosa">RPH Sentosa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                  <textarea 
                    rows="3" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan catatan tambahan jika ada..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
                  >
                    Kirim Permintaan Transfer
                  </button>
                </div>
              </form>
            </div>

            {/* Pending Transfers */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Transfer Menunggu</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transfer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerima</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingTransfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.recipient}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-red-600 hover:text-red-800">
                            <i className="fas fa-times-circle mr-1"></i> Batal
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingTransfers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada transfer yang menunggu saat ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transfer History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transfer</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transfer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerima</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transferHistory.map((transfer) => (
                      <tr key={transfer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transfer.recipient}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-primary hover:text-primaryDark">
                            <i className="fas fa-file-alt mr-1"></i> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Menampilkan halaman 1 dari 5
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

export default PasarHewanTransfer;
