import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';
import { Link } from 'react-router-dom';

// Mengadopsi struktur RphDashboard: statistik, inventaris, aktivitas, dan kartu QR
const DistributorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [daging, setDaging] = useState([]);
  const [dagingTx, setDagingTx] = useState([]);
  const [selectedDaging, setSelectedDaging] = useState(null);
  const [showDagingModal, setShowDagingModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem('rphDagingLocal') || '[]');
        setDaging(list);
        const tx = JSON.parse(localStorage.getItem('distributorTransaksiDaging') || '[]');
        setDagingTx(tx);
      } catch (e) {
        setDaging([]); setDagingTx([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const stats = {
    totalDaging: daging.length,
    batchBaru: 0, // jika ada field tanggal pada daging, bisa dihitung 30 hari terakhir
    terjual: dagingTx.filter(x => x.status === 'verified' || x.status === 'completed').length,
    menungguVerifikasi: dagingTx.filter(x => x.verificationStatus === 'waiting_buyer').length
  };

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

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID');

  const viewDagingDetail = (id) => {
    const it = daging.find(x => x.dagingId === id);
    if (it) { setSelectedDaging(it); setShowDagingModal(true); }
  };
  const closeDagingModal = () => { setShowDagingModal(false); setSelectedDaging(null); };

  return (
    <DashboardLayout title="Dasbor Distributor" role="DISTRIBUTOR" customSidebar={<DistributorSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-4 md:p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight m-0">Ringkasan Operasional</h1>
              <p className="text-sm text-gray-500 m-0 leading-snug">Pantau stok daging dan aktivitas terbaru.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/distributor/transaksi" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-exchange-alt"></i> Transaksi</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard title="Total Daging" value={stats.totalDaging} icon="fas fa-drumstick-bite" color="primary" desc="Dari RPH" />
            <StatCard title="Batch Baru" value={stats.batchBaru} icon="fas fa-plus" color="green" desc="30 hari terakhir" />
            <StatCard title="Terjual" value={stats.terjual} icon="fas fa-exchange-alt" color="blue" desc="Bulan ini" />
            <StatCard title="Menunggu Verifikasi" value={stats.menungguVerifikasi} icon="fas fa-hourglass-half" color="red" desc="Perlu aksi" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-box-open text-primary"></i> Inventaris Daging</h2>
              <Link to="/distributor/transaksi" className="text-primary text-sm hover:underline flex items-center gap-1"><i className="fas fa-eye"></i> Lihat Transaksi</Link>
            </div>
            {daging.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><i className="fas fa-drumstick-bite text-2xl text-gray-400"></i></div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Belum Ada Stok Daging</h3>
                <p className="text-sm text-gray-500 mb-2">Stok akan muncul setelah ada konversi dari RPH.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                      <th className="px-4 py-2 text-left">ID Daging</th>
                      <th className="px-4 py-2 text-left">Asal Sapi</th>
                      <th className="px-4 py-2 text-left">Berat (kg)</th>
                      <th className="px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {daging.slice(0,5).map(d => (
                      <tr key={d.dagingId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-primary text-left">{d.dagingId}</td>
                        <td className="px-4 py-2 text-left">{d.sapiId}</td>
                        <td className="px-4 py-2 text-left">{d.berat} kg</td>
                        <td className="px-4 py-2 text-left w-20">
                          <div className="flex items-center gap-2">
                            <button onClick={()=>viewDagingDetail(d.dagingId)} className="px-2 py-1 rounded border text-primary border-primary/30 hover:bg-primary/10 inline-flex items-center justify-center" title="Detail">
                              <i className="fas fa-eye text-blue-600"></i>
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
                  <Link to="/distributor/transaksi" className="text-primary text-xs hover:underline">Lihat Semua</Link>
                </div>
                <div className="space-y-3">
                  {dagingTx.length > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-exchange-alt text-blue-600"></i></div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-gray-700"><span className="font-medium">Transaksi Daging</span> - contoh aktivitas</p>
                        <p className="text-[11px] text-gray-400 mt-1">{formatDate(dagingTx[0].date || new Date())}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><i className="fas fa-truck-loading text-green-600"></i></div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-700"><span className="font-medium">Penerimaan Daging</span> - batch terbaru dari RPH</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatDate(new Date())}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><i className="fas fa-hourglass-half text-yellow-600"></i></div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-700"><span className="font-medium">Menunggu Verifikasi</span> - {stats.menungguVerifikasi} transaksi</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatDate(new Date())}</p>
                    </div>
                  </div>
                  {dagingTx.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-500">Aktivitas akan muncul setelah ada transaksi.</div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><i className="fas fa-qrcode text-primary"></i> QR Daging</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pilih ID Daging</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                      <option value="">-- Pilih --</option>
                      {daging.map(d => <option key={d.dagingId}>{d.dagingId}</option>)}
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

          {showDagingModal && selectedDaging && (
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
                  <h3 className="text-xl font-medium text-blue-600">Detail Daging</h3>
                  <button onClick={closeDagingModal} className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 p-2 rounded-full hover:bg-blue-50" title="Tutup">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                <div className="p-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">ID Daging</p>
                      <p className="font-semibold">{selectedDaging.dagingId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asal Sapi</p>
                      <p className="font-semibold">{selectedDaging.sapiId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Berat</p>
                      <p className="font-semibold">{selectedDaging.berat} kg</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={closeDagingModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default DistributorDashboard;
