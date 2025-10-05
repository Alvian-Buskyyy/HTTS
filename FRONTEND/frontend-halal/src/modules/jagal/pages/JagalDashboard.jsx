import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import ModalCard from '../../../components/ModalCard';
import SupplyChainTracker from '../../peternak/components/SupplyChainTracker';
import JagalSidebar from '../components/JagalSidebar';

const loadingCSS = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .loader { border-top-color: #60A5FA; animation: spin 1s linear infinite; }
`;

const JagalDashboard = ({ initialSection = 'dashboard' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [showCattleModal, setShowCattleModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [stats, setStats] = useState({ totalSapi: 0, sapiBaru: 0, sapiTerjual: 0, periksaKesehatan: 0 });
  const [cattleData, setCattleData] = useState([]);

  // Fetch cattle from localStorage and compute stats like PeternakDashboard
  useEffect(() => {
    setTimeout(() => {
      try {
        const storedCattleJSON = localStorage.getItem('cattleList');
        let list = [];
        if (storedCattleJSON) {
          const stored = JSON.parse(storedCattleJSON);
          list = stored.map(c => ({
            id: c.id || `SP${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`,
            type: c.jenis === 'other' ? c.customJenis : c.jenis,
            gender: c.kelamin,
            birthDate: c.tanggalLahir || new Date().toISOString().split('T')[0],
            weight: parseFloat(c.berat) || 0,
            healthStatus: c.healthStatus || 'sehat',
            availability: c.availability || 'available',
            origin: c.origin || 'beli',
            age: parseFloat(c.usia) || 0
          })).sort((a,b)=>a.id.localeCompare(b.id));
        }
        setCattleData(list);
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        setStats({
          totalSapi: list.length,
          sapiBaru: list.filter(c => new Date(c.birthDate) > oneMonthAgo).length,
          sapiTerjual: list.filter(c => c.availability === 'sold').length,
          periksaKesehatan: list.filter(c => c.healthStatus === 'perlu_periksa' || c.healthStatus === 'sakit').length,
        });
      } catch (e) {
        console.error('Error loading cattle data:', e);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const showSection = (sectionName) => {
    if (sectionName === 'transactions') {
      localStorage.setItem('transactionAuth','true');
      localStorage.setItem('showTransactionFromDashboard','true');
      navigate('/jagal/transaksi');
    } else if (sectionName === 'dashboard') {
      navigate('/jagal/dashboard');
    } else if (sectionName === 'sapi') {
      navigate('/jagal/sapi');
    } else if (sectionName === 'daftar-ternak') {
      navigate('/jagal/daftar-ternak');
    } else if (sectionName === 'profil') {
      navigate('/jagal/profil');
    } else {
      setActiveSection(sectionName);
    }
  };

  const getHealthStatusBadge = (status) => {
    const badges = { sehat: 'bg-green-100 text-green-800', perlu_periksa: 'bg-yellow-100 text-yellow-800', sakit: 'bg-red-100 text-red-800' };
    const labels = { sehat: 'Sehat', perlu_periksa: 'Perlu Periksa', sakit: 'Sakit' };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges['sehat']}`}>{labels[status] || labels['sehat']}</span>;
  };
  const getAvailabilityBadge = (availability) => {
    const badges = { available: 'bg-green-100 text-green-800', sold: 'bg-gray-100 text-gray-800', in_transaction: 'bg-blue-100 text-blue-800' };
    const labels = { available: 'Tersedia', sold: 'Terjual', in_transaction: 'Dalam Transaksi' };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[availability] || badges['available']}`}>{labels[availability] || labels['available']}</span>;
  };

  const viewCattleDetail = (cattleId) => {
    const c = cattleData.find(x => x.id === cattleId);
    if (c) { setSelectedCattle(c); setShowCattleModal(true); }
  };
  const closeCattleModal = () => { setShowCattleModal(false); setSelectedCattle(null); };

  const StatCard = ({ title, value, icon, color = 'primary', desc }) => {
    const colorMap = { primary: 'bg-primary/10 text-primary', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', red: 'bg-red-100 text-red-600' };
    return (
      <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}><i className={`${icon} text-xl`}></i></div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{value}</p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
    );
  };

  const EmptyState = ({ icon, title, desc, action }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><i className={`${icon} text-2xl text-gray-400`}></i></div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">{desc}</p>
      {action}
    </div>
  );

  return (
    <DashboardLayout title="Dasbor Jagal" role="JAGAL" customSidebar={<JagalSidebar />}>
      <style>{loadingCSS}</style>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-4 md:p-6 space-y-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-800 tracking-tight m-0">Ringkasan Operasional</h1>
                  <p className="text-sm text-gray-500 m-0 leading-snug">Pantau kondisi ternak dan aktivitas terbaru.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/jagal/daftar-ternak" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primaryDark flex items-center gap-2"><i className="fas fa-plus"></i> Tambah Ternak</Link>
                  <Link to="/jagal/transaksi" onClick={() => localStorage.setItem('transactionAuth','true')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-exchange-alt"></i> Transaksi</Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard title="Total Ternak" value={stats.totalSapi} icon="fas fa-cow" color="primary" desc="Semua jenis" />
                <StatCard title="Baru Lahir" value={stats.sapiBaru} icon="fas fa-baby-carriage" color="green" desc="30 hari terakhir" />
                <StatCard title="Terjual" value={stats.sapiTerjual} icon="fas fa-exchange-alt" color="blue" desc="Bulan ini" />
                <StatCard title="Perlu Periksa" value={stats.periksaKesehatan} icon="fas fa-heartbeat" color="red" desc="Butuh perhatian" />
              </div>

              <SupplyChainTracker cattleOptions={cattleData} />

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-clipboard-list text-primary"></i> Inventaris Ternak</h2>
                  <Link to="/jagal/sapi" className="text-primary text-sm hover:underline flex items-center gap-1"><i className="fas fa-eye"></i> Lihat Semua</Link>
                </div>
                {cattleData.length === 0 ? (
                  <EmptyState icon="fas fa-cow" title="Belum Ada Data Ternak" desc="Tambahkan ternak pertama untuk mulai memantau kesehatan dan transaksi." action={<Link to="/jagal/daftar-ternak" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"><i className="fas fa-plus mr-1"></i> Tambah Ternak</Link>} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                          <th className="px-4 py-2 text-left">ID Sapi</th>
                          <th className="px-4 py-2 text-left">Jenis</th>
                          <th className="px-4 py-2 text-left">Jenis Kelamin</th>
                          <th className="px-4 py-2 text-left">Umur</th>
                          <th className="px-4 py-2 text-left">Berat (kg)</th>
                          <th className="px-4 py-2 text-left">Status Kesehatan</th>
                          <th className="px-4 py-2 text-left">Ketersediaan</th>
                          <th className="px-4 py-2 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cattleData.slice(0,5).map(c => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-primary text-left">{c.id}</td>
                            <td className="px-4 py-2 text-left">{c.type}</td>
                            <td className="px-4 py-2 text-left">{c.gender}</td>
                            <td className="px-4 py-2 text-left">{c.age} tahun</td>
                            <td className="px-4 py-2 text-left">{c.weight} kg</td>
                            <td className="px-4 py-2 text-left">{getHealthStatusBadge(c.healthStatus)}</td>
                            <td className="px-4 py-2 text-left">{getAvailabilityBadge(c.availability)}</td>
                            <td className="px-4 py-2 text-center w-20">
                              <div className="inline-flex items-center justify-center gap-2">
                                <button onClick={()=>viewCattleDetail(c.id)} className="px-2 py-1 rounded border text-primary border-primary/30 hover:bg-primary/10" title="Detail">
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-history text-primary"></i> Aktivitas Terbaru</h2>
                      <Link to="/jagal/aktivitas" className="text-primary text-xs hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="space-y-3">
                      {cattleData.length > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-exchange-alt text-blue-600"></i></div>
                          <div className="flex-1 text-left">
                            <p className="text-sm text-gray-700"><span className="font-medium">Transaksi Penjualan</span> - contoh aktivitas</p>
                            <p className="text-[11px] text-gray-400 mt-1">15 Jul 2025</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><i className="fas fa-heartbeat text-green-600"></i></div>
                        <div className="flex-1 text-left">
                          <p className="text-sm text-gray-700"><span className="font-medium">Pemeriksaan Kesehatan</span> - 5 ternak sudah diperiksa</p>
                          <p className="text-[11px] text-gray-400 mt-1">14 Jul 2025</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><i className="fas fa-plus text-yellow-600"></i></div>
                        <div className="flex-1 text-left">
                          <p className="text-sm text-gray-700"><span className="font-medium">Ternak Baru</span> - 3 anak sapi didaftarkan</p>
                          <p className="text-[11px] text-gray-400 mt-1">12 Jul 2025</p>
                        </div>
                      </div>
                      {cattleData.length === 0 && (
                        <EmptyState icon="fas fa-inbox" title="Belum Ada Aktivitas" desc="Aktivitas akan muncul setelah Anda menambahkan dan mengelola ternak." />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><i className="fas fa-qrcode text-primary"></i> QR Ternak</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pilih ID Ternak</label>
                        <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                          <option value="">-- Pilih --</option>
                          {cattleData.map(c => <option key={c.id}>{c.id}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-gray-100 w-40 h-40 flex items-center justify-center rounded-lg"><i className="fas fa-qrcode text-5xl text-primary"></i></div>
                        <p className="text-[11px] text-gray-400">Pratinjau</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="w-full bg-primary text-white py-2 rounded-md text-sm hover:bg-primaryDark"><i className="fas fa-magic mr-1"></i> Buat QR</button>
                        <button className="w-full border border-primary text-primary py-2 rounded-md text-sm hover:bg-primary/10"><i className="fas fa-download mr-1"></i> Unduh</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showCattleModal && selectedCattle && (
                <ModalCard
                  isOpen={showCattleModal}
                  onClose={closeCattleModal}
                  title={`Detail Ternak ${selectedCattle.id}`}
                  size="lg"
                  footer={<button onClick={closeCattleModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Jenis</p><p className="font-semibold text-gray-800">{selectedCattle.type}</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Kelamin</p><p className="font-semibold text-gray-800">{selectedCattle.gender}</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Umur</p><p className="font-semibold text-gray-800">{selectedCattle.age} tahun</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Berat</p><p className="font-semibold text-gray-800">{selectedCattle.weight} kg</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Kesehatan</p>{getHealthStatusBadge(selectedCattle.healthStatus)}</div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Ketersediaan</p>{getAvailabilityBadge(selectedCattle.availability)}</div>
                  </div>
                </ModalCard>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default JagalDashboard;
