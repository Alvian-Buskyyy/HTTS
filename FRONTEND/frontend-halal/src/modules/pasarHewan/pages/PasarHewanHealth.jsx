import React, { useState } from 'react';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanHealth = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data for health verifications
  const [pendingVerifications, setPendingVerifications] = useState([
    { id: 'HT-2023-0051', type: 'Sapi Betina', source: 'Peternakan Ahmad', arrivalDate: '15 Jul 2025', weight: 315, status: 'Menunggu' }
  ]);
  
  const [verificationHistory, setVerificationHistory] = useState([
    { id: 'HT-2023-0054', type: 'Sapi Betina', source: 'Peternakan Ahmad', verifiedDate: '16 Jul 2025', weight: 325, status: 'Terverifikasi' },
    { id: 'HT-2023-0053', type: 'Sapi Jantan', source: 'Peternakan Salam', verifiedDate: '16 Jul 2025', weight: 410, status: 'Terverifikasi' },
    { id: 'HT-2023-0050', type: 'Sapi Jantan', source: 'Peternakan Wijaya', verifiedDate: '14 Jul 2025', weight: 390, status: 'Terverifikasi' },
    { id: 'HT-2023-0049', type: 'Sapi Betina', source: 'Peternakan Ahmad', verifiedDate: '14 Jul 2025', weight: 330, status: 'Terverifikasi' }
  ]);

  // Toggle health verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);

  const openVerificationModal = (cattle) => {
    setSelectedCattle(cattle);
    setShowVerificationModal(true);
  };

  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="health" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Verifikasi Kesehatan Ternak</h1>

            {/* Health Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ternak Terverifikasi</p>
                    <h3 className="text-2xl font-bold text-gray-800">{verificationHistory.length}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <i className="fas fa-check-circle text-green-500 text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
                    <h3 className="text-2xl font-bold text-gray-800">{pendingVerifications.length}</h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <i className="fas fa-clock text-yellow-500 text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Verifikasi Bulan Ini</p>
                    <h3 className="text-2xl font-bold text-gray-800">32</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <i className="fas fa-calendar-check text-primary text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Verifications */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Menunggu Verifikasi</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Tiba</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingVerifications.map((cattle) => (
                      <tr key={cattle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.arrivalDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {cattle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primaryDark transition"
                            onClick={() => openVerificationModal(cattle)}
                          >
                            Verifikasi
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingVerifications.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada ternak yang menunggu verifikasi saat ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Verifikasi</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Verifikasi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {verificationHistory.map((cattle) => (
                      <tr key={cattle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.verifiedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cattle.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {cattle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-primary hover:text-primaryDark">
                            <i className="fas fa-file-alt mr-1"></i> Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Menampilkan halaman 1 dari 4
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

            {/* Health Verification Modal */}
            {showVerificationModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Verifikasi Kesehatan Ternak #{selectedCattle?.id}
                    </h3>
                    <button 
                      onClick={() => setShowVerificationModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ID Ternak</p>
                        <p className="font-semibold">{selectedCattle?.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Jenis</p>
                        <p className="font-semibold">{selectedCattle?.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sumber</p>
                        <p className="font-semibold">{selectedCattle?.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Tiba</p>
                        <p className="font-semibold">{selectedCattle?.arrivalDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Berat (kg)</p>
                        <p className="font-semibold">{selectedCattle?.weight}</p>
                      </div>
                    </div>

                    <hr className="my-4" />
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Fisik</label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="">Pilih Kondisi</option>
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                          <option value="Kurang">Kurang</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suhu Tubuh (°C)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Misal: 38.5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pemeriksaan Penyakit</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="disease1" className="mr-2" />
                            <label htmlFor="disease1">Bebas Penyakit Mulut dan Kuku (PMK)</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="disease2" className="mr-2" />
                            <label htmlFor="disease2">Bebas Antraks</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="disease3" className="mr-2" />
                            <label htmlFor="disease3">Bebas Brucellosis</label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="disease4" className="mr-2" />
                            <label htmlFor="disease4">Bebas Parasit</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Pemeriksaan</label>
                        <textarea 
                          rows="3" 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Masukkan hasil pemeriksaan secara detail..."
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dokter Hewan Pemeriksa</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nama dokter hewan"
                        />
                      </div>
                      
                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <button 
                          type="button"
                          onClick={() => setShowVerificationModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                        >
                          Simpan Verifikasi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
            &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanHealth;
