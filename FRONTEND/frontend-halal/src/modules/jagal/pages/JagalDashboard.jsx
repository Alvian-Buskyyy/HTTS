import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import ModalCard from '../../../components/ModalCard';
import JagalSidebar from '../components/JagalSidebar';

const API_BASE = 'http://localhost:3000';

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
  const [stats, setStats] = useState({ totalDaging: 0, penyembelihanBaru: 0, dagingTerjual: 0, menungguVerifikasi: 0 });
  const [dagingInventory, setDagingInventory] = useState([]);
  const [cattleInventory, setCattleInventory] = useState([]);
  const [slaughters, setSlaughters] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedDagingForQR, setSelectedDagingForQR] = useState('');
  const [qrPreview, setQrPreview] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  // Ambil data riil Jagal: daging, penyembelihan, penjualan
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const userRaw = localStorage.getItem('user');
        let jagalId = '';
        try {
          const u = userRaw ? JSON.parse(userRaw) : null;
          jagalId = u?.entityId || u?.id || '';
        } catch {}
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [dagingRes, slaughterRes, salesRes, sapiRes] = await Promise.all([
          fetch(`${API_BASE}/daging`, { headers }),
          fetch(`${API_BASE}/transaksiPenyembelihan`, { headers }),
          fetch(`${API_BASE}/transaksiPenjualan`, { headers }),
          fetch(`${API_BASE}/sapi`, { headers }),
        ]);

        const dagingAll = await dagingRes.json();
        const slaughterAll = await slaughterRes.json();
        const salesAll = await salesRes.json();
        const sapiAll = await sapiRes.json();

        const slForJagal = Array.isArray(slaughterAll)
          ? slaughterAll.filter(s => String(s.penyembelihType) === 'JAGAL' && String(s.penyembelihId) === String(jagalId))
          : [];
        const sapiIds = new Set(slForJagal.map(s => s.sapiId));
        const dagingForJagal = Array.isArray(dagingAll)
          ? dagingAll.filter(d => sapiIds.has(d.sapiId))
          : [];
        const salesForJagal = Array.isArray(salesAll)
          ? salesAll.filter(t => String(t.penjualType) === 'JAGAL' && String(t.penjualId) === String(jagalId))
          : [];

        setSlaughters(slForJagal);
        setDagingInventory(dagingForJagal);
        setSales(salesForJagal);

        // Inventaris sapi untuk Jagal: dari transaksi pembelian + data lokal pendaftaran
        const pembelianJagal = Array.isArray(salesAll) ? salesAll.filter(t => String(t.pembeliType) === 'JAGAL' && t.sapiId) : [];
        const sapiMap = new Map(Array.isArray(sapiAll) ? sapiAll.map(s => [s.id, s]) : []);
        const purchasedCattle = pembelianJagal.map(t => {
          const s = sapiMap.get(t.sapiId) || {};
          const verif = String(t.verificationStatus || '').toUpperCase();
          return {
            id: t.sapiId,
            type: s.jenis || 'Sapi',
            gender: s.kelamin || '-',
            weight: Number(s.beratSapi) || 0,
            age: Number(s.usia) || 0,
            availability: verif === 'VERIFIED' ? 'available' : 'in_transaction',
            healthStatus: 'sehat',
            birthDate: s.tanggalLahir || '',
            origin: 'beli',
          };
        });

        let localItems = [];
        try { const ls = localStorage.getItem('cattleList'); if (ls) localItems = JSON.parse(ls); } catch {}
        const mappedLocal = Array.isArray(localItems) ? localItems.map(item => ({
          id: item.id,
          type: item.jenis || item.customJenis || 'Sapi',
          gender: item.kelamin || '-',
          weight: Number(item.berat) || 0,
          age: Number(item.usia) || 0,
          availability: item.availability || 'available',
          healthStatus: item.healthStatus || 'sehat',
          birthDate: item.tanggalLahir || '',
          origin: item.origin || 'lahir_sendiri',
        })) : [];
        const idSet = new Set(purchasedCattle.map(d => d.id));
        const mergedCattle = purchasedCattle.concat(mappedLocal.filter(m => m.id && !idSet.has(m.id)));
        setCattleInventory(mergedCattle);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const penyembelihanBaru = slForJagal.filter(s => {
          const ts = s.timestamp ? new Date(s.timestamp) : null;
          return ts ? ts >= thirtyDaysAgo : false;
        }).length;
        const dagingTerjual = salesForJagal.filter(t => t.dagingId).length;
        const menungguVerifikasi = salesForJagal.filter(t => {
          const st = String(t.verificationStatus || '').toUpperCase();
          return st === 'PENDING' || st === 'WAITING_BUYER';
        }).length;

        setStats({
          totalDaging: dagingForJagal.length,
          penyembelihanBaru,
          dagingTerjual,
          menungguVerifikasi
        });
      } catch (e) {
        console.error('Gagal memuat data Jagal:', e);
        setSlaughters([]);
        setDagingInventory([]);
        setSales([]);
        setCattleInventory([]);
        setStats({ totalDaging: 0, penyembelihanBaru: 0, dagingTerjual: 0, menungguVerifikasi: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
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
    const c = dagingInventory.find(x => (x.id || x.dagingId) === cattleId);
    if (c) { setSelectedCattle(c); setShowCattleModal(true); }
  };
  const closeCattleModal = () => { setShowCattleModal(false); setSelectedCattle(null); };

  // Generate QR untuk daging terpilih
  const handleGenerateQR = async () => {
    if (!selectedDagingForQR) return;
    setQrLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/qr/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ dagingId: selectedDagingForQR })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal membuat QR');
      const img = data?.qrCode || data?.qrImage;
      setQrPreview(img || '');
    } catch (e) {
      console.error('Gagal generate QR:', e);
      alert(e.message || 'Gagal membuat QR untuk daging');
    } finally {
      setQrLoading(false);
    }
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
                  <p className="text-sm text-gray-500 m-0 leading-snug">Pantau inventaris daging dan aktivitas riil.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/jagal/daftar-ternak" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primaryDark flex items-center gap-2"><i className="fas fa-plus"></i> Tambah Ternak</Link>
                  <Link to="/jagal/transaksi" onClick={() => localStorage.setItem('transactionAuth','true')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-exchange-alt"></i> Transaksi</Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard title="Total Daging" value={stats.totalDaging} icon="fas fa-drumstick-bite" color="primary" desc="Unit daging aktif" />
                <StatCard title="Penyembelihan Baru" value={stats.penyembelihanBaru} icon="fas fa-cut" color="green" desc="30 hari terakhir" />
                <StatCard title="Daging Terjual" value={stats.dagingTerjual} icon="fas fa-exchange-alt" color="blue" desc="Bulan ini" />
                <StatCard title="Menunggu Verifikasi" value={stats.menungguVerifikasi} icon="fas fa-shield-halved" color="red" desc="Transaksi belum final" />
              </div>

              {/* SupplyChainTracker dihapus untuk Jagal; fokus ke daging */}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-clipboard-list text-primary"></i> Inventaris Daging</h2>
                  <Link to="/jagal/transaksi" className="text-primary text-sm hover:underline flex items-center gap-1"><i className="fas fa-eye"></i> Lihat Transaksi</Link>
                </div>
                {dagingInventory.length === 0 ? (
                  <EmptyState icon="fas fa-drumstick-bite" title="Belum Ada Daging" desc="Lakukan penyembelihan dan konversi sapi ke daging untuk melihat inventaris." action={<Link to="/jagal/transaksi" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"><i className="fas fa-plus mr-1"></i> Buat Transaksi</Link>} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                          <th className="px-4 py-2 text-left">ID Daging</th>
                          <th className="px-4 py-2 text-left">Asal Sapi</th>
                          <th className="px-4 py-2 text-left">Berat (kg)</th>
                          <th className="px-4 py-2 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dagingInventory.slice(0,5).map(d => (
                          <tr key={d.id || d.dagingId} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-primary text-left">{d.id || d.dagingId}</td>
                            <td className="px-4 py-2 text-left">{d.sapiId}</td>
                            <td className="px-4 py-2 text-left">{d.berat} kg</td>
                            <td className="px-4 py-2 text-center w-20">
                              <div className="inline-flex items-center justify-center gap-2">
                                <button onClick={()=>viewCattleDetail(d.id || d.dagingId)} className="px-2 py-1 rounded border text-primary border-primary/30 hover:bg-primary/10" title="Detail">
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

              {/* Inventaris Ternak untuk Jagal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-cow text-primary"></i> Inventaris Ternak</h2>
                  <Link to="/jagal/sapi" className="text-primary text-sm hover:underline flex items-center gap-1"><i className="fas fa-eye"></i> Lihat Semua</Link>
                </div>
                {cattleInventory.length === 0 ? (
                  <EmptyState icon="fas fa-cow" title="Belum Ada Sapi" desc="Daftarkan ternak atau selesaikan transaksi pembelian untuk melihat inventaris sapi." action={<Link to="/jagal/daftar-ternak" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"><i className="fas fa-plus mr-1"></i> Daftarkan Ternak</Link>} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                          <th className="px-4 py-2 text-left">ID Ternak</th>
                          <th className="px-4 py-2 text-left">Jenis</th>
                          <th className="px-4 py-2 text-left">Kelamin</th>
                          <th className="px-4 py-2 text-left">Umur</th>
                          <th className="px-4 py-2 text-left">Berat (kg)</th>
                          <th className="px-4 py-2 text-left">Status Kesehatan</th>
                          <th className="px-4 py-2 text-left">Ketersediaan</th>
                          <th className="px-4 py-2 text-left">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cattleInventory.slice(0,5).map(c => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-left font-medium text-primary">{c.id}</td>
                            <td className="px-4 py-2 text-left">{c.type}</td>
                            <td className="px-4 py-2 text-left">{c.gender}</td>
                            <td className="px-4 py-2 text-left">{c.age} tahun</td>
                            <td className="px-4 py-2 text-left">{c.weight} kg</td>
                            <td className="px-4 py-2 text-left">{getHealthStatusBadge(c.healthStatus)}</td>
                            <td className="px-4 py-2 text-left">{getAvailabilityBadge(c.availability)}</td>
                            <td className="px-4 py-2 text-left w-20">
                              <div className="inline-flex items-center gap-2">
                                <button onClick={()=>navigate('/jagal/sapi')} className="px-2 py-1 rounded border text-primary border-primary/30 hover:bg-primary/10" title="Lihat Detail">
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
                      {slaughters.slice(0,1).map(act => (
                        <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><i className="fas fa-cut text-green-600"></i></div>
                          <div className="flex-1 text-left">
                            <p className="text-sm text-gray-700"><span className="font-medium">Penyembelihan</span> - Sapi {act.sapiId} untuk {String(act.penerimaType)}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{act.timestamp ? new Date(act.timestamp).toLocaleString('id-ID') : '-'}</p>
                          </div>
                        </div>
                      ))}
                      {sales.slice(0,1).map(tx => (
                        <div key={tx.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><i className="fas fa-exchange-alt text-blue-600"></i></div>
                          <div className="flex-1 text-left">
                            <p className="text-sm text-gray-700"><span className="font-medium">Penjualan Daging</span> - Daging {tx.dagingId} → {String(tx.pembeliType)}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{tx.timestamp ? new Date(tx.timestamp).toLocaleString('id-ID') : '-'}</p>
                          </div>
                        </div>
                      ))}
                      {slaughters.length === 0 && sales.length === 0 && (
                        <div className="text-sm text-gray-500">Belum ada aktivitas.</div>
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
                        <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={selectedDagingForQR} onChange={(e)=>setSelectedDagingForQR(e.target.value)}>
                          <option value="">-- Pilih --</option>
                          {dagingInventory.map(d => (
                            <option key={d.id || d.dagingId} value={d.id || d.dagingId}>{(d.id || d.dagingId)} - {d.berat}kg</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-gray-100 w-40 h-40 flex items-center justify-center rounded-lg">
                          {qrPreview ? (
                            <img src={qrPreview} alt="QR Preview" className="w-36 h-36 object-contain" />
                          ) : (
                            <i className="fas fa-qrcode text-5xl text-primary"></i>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">Pratinjau</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="w-full bg-primary text-white py-2 rounded-md text-sm hover:bg-primaryDark disabled:opacity-50" onClick={handleGenerateQR} disabled={qrLoading || !selectedDagingForQR}>
                          <i className="fas fa-magic mr-1"></i> {qrLoading ? 'Menghasilkan...' : 'Buat QR'}
                        </button>
                        <a className="w-full border border-primary text-primary py-2 rounded-md text-sm hover:bg-primary/10 text-center disabled:opacity-50" href={qrPreview || '#'} download={`QR-${selectedDagingForQR || 'daging'}.png`} onClick={(e)=>{ if(!qrPreview) e.preventDefault(); }}>
                          <i className="fas fa-download mr-1"></i> Unduh
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showCattleModal && selectedCattle && (
                <ModalCard
                  isOpen={showCattleModal}
                  onClose={closeCattleModal}
                  title={`Detail Daging ${(selectedCattle.id || selectedCattle.dagingId)}`}
                  size="lg"
                  footer={<button onClick={closeCattleModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">ID Daging</p><p className="font-semibold text-gray-800">{selectedCattle.id || selectedCattle.dagingId}</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Asal Sapi</p><p className="font-semibold text-gray-800">{selectedCattle.sapiId}</p></div>
                    <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Berat</p><p className="font-semibold text-gray-800">{selectedCattle.berat} kg</p></div>
                    {selectedCattle.createdAt && (
                      <div className="bg-gray-50 rounded-md p-3"><p className="text-[11px] text-gray-500">Dibuat</p><p className="font-semibold text-gray-800">{new Date(selectedCattle.createdAt).toLocaleString('id-ID')}</p></div>
                    )}
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
