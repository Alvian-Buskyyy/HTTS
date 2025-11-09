import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import ModalCard from '../../../components/ModalCard';

const PasarHewanTernak = () => {
  const [loading, setLoading] = useState(true);
  // Real data from backend API per entity (Pasar Hewan)
  const [cattleData, setCattleData] = useState([]);

  const [filters, setFilters] = useState({ type: '', healthStatus: '', search: '', source: '' });
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState({ id: '', type: '', source: '', arrivalDate: '', weight: '', healthStatus: 'Menunggu' });
  const [saveMsg, setSaveMsg] = useState('');

  // Derived stats mirroring Peternak layout
  const stats = useMemo(() => {
    const total = cattleData.length;
    const verified = cattleData.filter(c => c.healthStatus === 'Terverifikasi').length;
    const pending = cattleData.filter(c => c.healthStatus !== 'Terverifikasi').length;
    const avgWeight = total ? Math.round(cattleData.reduce((s, c) => s + (Number(c.weight) || 0), 0) / total) : 0;
    return { total, verified, pending, avgWeight };
  }, [cattleData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        let entityId = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            entityId = user.entityId || user.id || null;
          } catch (_) {
            entityId = null;
          }
        }

        if (!entityId || !token) {
          setCattleData([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3000/sapi/entity/PASAR_HEWAN/${entityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch cattle data: ${res.status}`);
        }

        const data = await res.json();

        const mapped = (Array.isArray(data) ? data : []).map((s) => {
          const transactions = Array.isArray(s.transaksiPenjualan) ? s.transaksiPenjualan : [];
          const purchaseTx = transactions.find(t => t && t.pembeliType === 'PASAR_HEWAN' && t.pembeliId === entityId);
          const arrivalDate = purchaseTx?.timestamp 
            ? new Date(purchaseTx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '-';
          const source = purchaseTx?.penjualType 
            || s.asalType 
            || (s.peternak?.nama ? `Peternak ${s.peternak.nama}` : 'Tidak diketahui');
          const healthStatus = (Array.isArray(s.pengecekanSehat) && s.pengecekanSehat.length > 0) ? 'Terverifikasi' : 'Menunggu';

          return {
            id: s.id,
            type: s.jenis || 'Sapi',
            source,
            arrivalDate,
            weight: Number(s.beratSapi) || 0,
            healthStatus
          };
        });

        setCattleData(mapped);
      } catch (error) {
        console.error('Gagal memuat data sapi:', error);
        setCattleData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatBadge = (status) => {
    const ok = status === 'Terverifikasi';
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ok ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {status}
      </span>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ type: '', healthStatus: '', search: '', source: '' });

  const filtered = cattleData.filter(c => (
    (filters.type === '' || c.type.toLowerCase().includes(filters.type.toLowerCase())) &&
    (filters.source === '' || c.source.toLowerCase().includes(filters.source.toLowerCase())) &&
    (filters.healthStatus === '' || c.healthStatus === filters.healthStatus) &&
    (filters.search === '' || c.id.toLowerCase().includes(filters.search.toLowerCase()) || c.type.toLowerCase().includes(filters.search.toLowerCase()) || c.source.toLowerCase().includes(filters.search.toLowerCase()))
  ));

  const openDetail = (c) => { setSelected(c); setShowDetail(true); };
  const closeDetail = () => { setShowDetail(false); setSelected(null); };

  const openEdit = (c) => {
    setSelected(c);
    setEdit({ id: c.id, type: c.type, source: c.source, arrivalDate: c.arrivalDate, weight: c.weight, healthStatus: c.healthStatus });
    setShowEdit(true);
  };
  const closeEdit = () => { setShowEdit(false); setSaveMsg(''); };

  const saveEdit = (e) => {
    e?.preventDefault?.();
    if (!edit.type || !edit.source || !edit.arrivalDate) return alert('Jenis, Sumber, dan Tanggal Tiba wajib diisi');
    const updated = cattleData.map(c => c.id === edit.id ? { ...c, ...edit, weight: Number(edit.weight) || 0 } : c);
    setCattleData(updated);
    const updatedSel = updated.find(c => c.id === edit.id);
    setSelected(updatedSel);
    setSaveMsg('Perubahan berhasil disimpan.');
    setTimeout(() => setSaveMsg(''), 1500);
  };

  const remove = (id) => {
    if (!confirm('Hapus data ternak ini?')) return;
    setCattleData(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <DashboardLayout title="Inventaris Ternak" role="PASAR_HEWAN">
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-6">
          {/* Stats Cards (mirroring style) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Total Ternak</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
                </div>
                <i className="fas fa-cow text-primary text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Terverifikasi</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.verified}</p>
                </div>
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Menunggu</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
                </div>
                <i className="fas fa-hourglass-half text-yellow-500 text-2xl"></i>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-grow text-left">
                  <p className="text-sm text-gray-500">Rata-rata Berat</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.avgWeight} kg</p>
                </div>
                <i className="fas fa-weight-hanging text-blue-500 text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Ternak</label>
                <input
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  placeholder="Contoh: Sapi Jantan"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sumber</label>
                <input
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                  placeholder="Nama peternakan"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                <select 
                  name="healthStatus" 
                  value={filters.healthStatus}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Status</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Menunggu">Menunggu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Cari ID/Jenis/Sumber..." 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Reset</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Daftar Ternak</h2>
              <p className="text-sm text-gray-500">Menampilkan {filtered.length} dari total {stats.total} ternak</p>
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
                  {filtered.map((cattle) => (
                    <tr key={cattle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cattle.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cattle.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cattle.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cattle.arrivalDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{cattle.weight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatBadge(cattle.healthStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openDetail(cattle)} className="text-primary hover:text-primaryDark" title="Detail">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button onClick={() => openEdit(cattle)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => remove(cattle.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAIL MODAL */}
          {showDetail && selected && (
            <ModalCard
              isOpen={showDetail}
              onClose={closeDetail}
              title={`Detail Ternak ${selected.id}`}
              size="lg"
              footer={<button onClick={closeDetail} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Jenis</p>
                  <p className="font-semibold text-gray-800">{selected.type}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Sumber</p>
                  <p className="font-semibold text-gray-800">{selected.source}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Tanggal Tiba</p>
                  <p className="font-semibold text-gray-800">{selected.arrivalDate}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Berat</p>
                  <p className="font-semibold text-gray-800">{selected.weight} kg</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Kesehatan</p>
                  {formatBadge(selected.healthStatus)}
                </div>
              </div>
            </ModalCard>
          )}

          {/* EDIT MODAL (keep same input fields as current page) */}
          {showEdit && selected && (
            <ModalCard
              isOpen={showEdit}
              onClose={closeEdit}
              title={`Edit Data ${edit.id}`}
              size="lg"
              footer={
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={closeEdit}>Batal</button>
                  <button type="button" onClick={saveEdit} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"><i className="fas fa-save mr-1"></i> Simpan</button>
                </div>
              }
            >
              {saveMsg && (
                <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{saveMsg}</div>
              )}
              <form onSubmit={saveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input value={edit.id} disabled className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                    <input value={edit.type} onChange={e=>setEdit(v=>({...v,type:e.target.value}))} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sumber</label>
                    <input value={edit.source} onChange={e=>setEdit(v=>({...v,source:e.target.value}))} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tiba</label>
                    <input type="text" value={edit.arrivalDate} onChange={e=>setEdit(v=>({...v,arrivalDate:e.target.value}))} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
                    <input type="number" min="0" value={edit.weight} onChange={e=>setEdit(v=>({...v,weight:e.target.value}))} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                    <select value={edit.healthStatus} onChange={e=>setEdit(v=>({...v,healthStatus:e.target.value}))} className="w-full border border-gray-300 rounded-md py-2 px-3">
                      <option value="Terverifikasi">Terverifikasi</option>
                      <option value="Menunggu">Menunggu</option>
                    </select>
                  </div>
                </div>
              </form>
            </ModalCard>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PasarHewanTernak;
