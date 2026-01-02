import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';

const DistributorTransaksi = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [filter, setFilter] = useState('all');
  
  // State for available daging for sale
  const [availableDaging, setAvailableDaging] = useState([]);
  
  // State for daging transactions from API endpoint
  const [dagingTransactions, setDagingTransactions] = useState([]);
  const [dagingStats, setDagingStats] = useState({ total: 0, outgoing: 0, incoming: 0 });
  const [dagingLoading, setDagingLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dagingId:'', date:'', notes:'', buyerType:'', buyerId:'' });
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Dynamic entity options
  const [entityOptions, setEntityOptions] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState('');

  // Fetch entity options
  useEffect(()=>{
    const API_BASE = 'http://localhost:3000';
    const fetchAllEntities = async () => {
      try {
        setEntitiesLoading(true); setEntitiesError('');
        const endpoints = [
          { url: `${API_BASE}/horeka`, type: 'HOREKA', nameKey: 'nama' },
          { url: `${API_BASE}/endCustomer`, type: 'END_CUSTOMER', nameKey: 'nama' },
        ];
        const results = await Promise.allSettled(endpoints.map(async ep => {
          const res = await fetch(ep.url);
          if(!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return data.map(item => ({ id:item.id, name:item[ep.nameKey] || item.nama || '—', type: ep.type }));
        }));
        const combined = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value).sort((a,b)=> a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        setEntityOptions(combined);
      } catch(e) {
        setEntitiesError('Gagal memuat entitas');
      } finally {
        setEntitiesLoading(false);
      }
    };
    fetchAllEntities();
  },[]);

  // Fetch available daging for sale
  useEffect(() => {
    const fetchAvailableDaging = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get Distributor ID from localStorage
        const userRaw = localStorage.getItem('user');
        let distributorId = '';
        
        try {
          const user = userRaw ? JSON.parse(userRaw) : null;
          distributorId = user?.entityId || user?.id || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }

        if (!distributorId) {
          console.error('Distributor ID tidak ditemukan');
          setAvailableDaging([]);
          return;
        }

        console.log('🔍 Fetching daging for Distributor ID:', distributorId);

        // Use the endpoint: /daging/distributor/:distributorId (you may need to create this)
        // For now, we'll fetch all daging and filter client-side
        const response = await fetch(`http://localhost:3000/daging`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch daging');
        }
        
        const result = await response.json();
        console.log('✅ Daging data fetched:', result);
        
        // Filter daging owned by this distributor and VERIFIED
        const filtered = result.filter(d => 
          d.distributorId === distributorId && 
          d.statusHalal === 'VERIFIED' &&
          !d.sudahDijual
        );
        
        setAvailableDaging(filtered);
        
      } catch (error) {
        console.error('❌ Error fetching daging:', error);
        setAvailableDaging([]);
      }
    };

    if (activeTab === 'sales') {
      fetchAvailableDaging();
    }
  }, [activeTab]);
  
  // Fetch daging transactions from API endpoint
  useEffect(() => {
    const fetchDagingTransactions = async () => {
      try {
        setDagingLoading(true);
        const token = localStorage.getItem('token');
        
        // Get Distributor ID from localStorage
        const userRaw = localStorage.getItem('user');
        let distributorId = '';
        
        try {
          const user = userRaw ? JSON.parse(userRaw) : null;
          distributorId = user?.entityId || user?.id || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }

        if (!distributorId) {
          console.error('Distributor ID tidak ditemukan');
          setDagingTransactions([]);
          setDagingLoading(false);
          return;
        }

        console.log('🔍 Fetching daging transactions for Distributor ID:', distributorId);

        // Use the endpoint: /transaksiPenjualan/distributor/:distributorId/transactions
        const response = await fetch(`http://localhost:3000/transaksiPenjualan/distributor/${distributorId}/transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch transactions');
        }
        
        const result = await response.json();
        console.log('✅ Daging transactions fetched:', result);
        
        // Enrich buyer names from entityOptions
        const enrichedData = result.data.map(tx => {
          let enrichedBuyerName = tx.buyerName;
          
          // If buyerName is still a UUID, try to get the real name
          if (tx.buyerName && tx.buyerName.includes('-')) {
            const buyerEntity = entityOptions.find(e => 
              e.type === tx.pembeliType && e.id === tx.pembeliId
            );
            if (buyerEntity) {
              enrichedBuyerName = buyerEntity.name;
            }
          }
          
          return {
            ...tx,
            buyerName: enrichedBuyerName
          };
        });
        
        // Set data and statistics
        setDagingTransactions(enrichedData);
        setDagingStats({
          total: result.total || 0,
          outgoing: result.outgoing || 0,
          incoming: result.incoming || 0
        });
        
      } catch (error) {
        console.error('❌ Error fetching daging transactions:', error);
        setDagingTransactions([]);
        setDagingStats({ total: 0, outgoing: 0, incoming: 0 });
      } finally {
        setDagingLoading(false);
      }
    };

    if (activeTab === 'sales' && entityOptions.length > 0) {
      fetchDagingTransactions();
    }
  }, [activeTab, transferSuccess, entityOptions]);

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [verifyInputCode, setVerifyInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  // Handle form submit - Create transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dagingId || !form.buyerId) return;
    
    try {
      // Get Distributor ID from localStorage user object
      const userRaw = localStorage.getItem('user');
      let distributorId = '';
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        distributorId = user?.entityId || user?.id || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      if (!distributorId) {
        alert('Distributor ID tidak ditemukan. Silakan login ulang.');
        return;
      }

      const formData = {
        penjualType: 'DISTRIBUTOR',
        penjualId: distributorId,
        pembeliType: form.buyerType,
        pembeliId: form.buyerId,
        dagingId: form.dagingId,
        jumlahQty: 1,
        type: 'daging',
        notes: form.notes
      };

      // Create transaction
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/transaksiPenjualan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const result = await response.json();
      
      setTransferSuccess(true);
      setShowForm(false);
      setForm({ dagingId:'', date:'', notes:'', buyerType:'', buyerId:'' });

      // Request verification code for the new transaction
      try {
        const verifyResponse = await fetch(`http://localhost:3000/transaksiPenjualan/${result.data.id}/requestVerification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          
          // Open verification modal
          setVerifyingTx({
            id: result.data.id,
            verificationCode: verifyResult.data?.verificationCode || verifyResult.verificationCode,
            verificationStatus: 'waiting_buyer'
          });
          setVerifyInputCode('');
          setVerifyError('');
          setVerifySuccess('');
          setShowVerifyModal(true);
        }
      } catch (verifyError) {
        console.error('Error requesting verification:', verifyError);
        alert('Transaksi berhasil dibuat, tetapi gagal meminta kode verifikasi.');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal mengajukan transfer');
    } finally {
      setTimeout(() => setTransferSuccess(false), 2200);
    }
  };

  const handleCopyCode = async () => {
    if (!verifyingTx?.verificationCode) return;
    try {
      await navigator.clipboard.writeText(verifyingTx.verificationCode);
      setVerifySuccess('Kode disalin ke clipboard');
      setTimeout(() => setVerifySuccess(''), 1500);
    } catch {
      setVerifyError('Gagal menyalin kode');
      setTimeout(() => setVerifyError(''), 2000);
    }
  };

  const handleConfirmBuyer = async () => {
    if (!verifyingTx) return;
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 [VERIFY] Verification Details:', {
        transactionId: verifyingTx.id,
        inputCode: verifyInputCode,
        inputCodeTrimmed: verifyInputCode.trim(),
        expectedCode: verifyingTx.verificationCode,
        codeMatch: verifyInputCode.trim() === String(verifyingTx.verificationCode)
      });
      
      const response = await fetch(`http://localhost:3000/transaksiPenjualan/${verifyingTx.id}/confirmBuyer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verifyInputCode.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verifikasi gagal');
      }

      const result = await response.json();
      console.log('✅ [VERIFY] Verification success:', result);
      
      setVerifySuccess('Verifikasi berhasil! Transaksi telah dikonfirmasi.');
      setVerifyError('');
      
      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifyingTx(null);
        setVerifyInputCode('');
        setVerifySuccess('');
        setTransferSuccess(prev => !prev); // Toggle to trigger refresh
      }, 2000);
    } catch (error) {
      console.error(error);
      setVerifyError(error.message || 'Terjadi kesalahan saat verifikasi');
    }
  };

  const handleRejectVerification = async () => {
    if (!verifyingTx) return;
    if (!window.confirm('Tolak verifikasi transaksi ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/transaksiPenjualan/${verifyingTx.id}/rejectVerification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menolak verifikasi');
      }
      
      setShowVerifyModal(false);
      setVerifyingTx(null);
      setVerifyInputCode('');
      setVerifySuccess('');
      setVerifyError('');
      setTransferSuccess(prev => !prev); // Trigger refresh
      alert('Verifikasi transaksi telah ditolak');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal menolak verifikasi');
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID');
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'waiting_buyer': 'bg-yellow-100 text-yellow-800',
      'WAITING_BUYER': 'bg-yellow-100 text-yellow-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'VERIFIED': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    
    const statusText = {
      'waiting_buyer': 'Menunggu Verifikasi',
      'WAITING_BUYER': 'Menunggu Verifikasi',
      'PENDING': 'Menunggu',
      'verified': 'Terverifikasi',
      'VERIFIED': 'Terverifikasi',
      'rejected': 'Ditolak',
      'REJECTED': 'Ditolak',
    };
    
    const text = statusText[status] || status;
    const className = statusMap[status] || 'bg-gray-100 text-gray-800';
    
    return <span className={`px-2 py-1 rounded-full text-xs ${className}`}>{text}</span>;
  };

  const truncateCid = (cid, left=8, right=8) => {
    if(!cid) return '';
    return cid.length > left + right ? `${cid.slice(0,left)}...${cid.slice(-right)}` : cid;
  };

  // Filter transactions based on selected filter
  const filteredTransactions = dagingTransactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.verificationStatus === 'PENDING' || t.verificationStatus === 'WAITING_BUYER';
    if (filter === 'verified') return t.verificationStatus === 'VERIFIED';
    return false;
  });

  return (
    <DashboardLayout title="Transaksi Penjualan Daging" role="DISTRIBUTOR" customSidebar={<DistributorSidebar />}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transaksi Penjualan Daging</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Transaksi Baru
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-900">{dagingStats.total}</p>
              </div>
              <i className="fas fa-receipt text-3xl text-blue-300"></i>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Transaksi Keluar</p>
                <p className="text-2xl font-bold text-green-900">{dagingStats.outgoing}</p>
              </div>
              <i className="fas fa-arrow-up text-3xl text-green-300"></i>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Transaksi Masuk</p>
                <p className="text-2xl font-bold text-purple-900">{dagingStats.incoming}</p>
              </div>
              <i className="fas fa-arrow-down text-3xl text-purple-300"></i>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {transferSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            Transaksi penjualan daging berhasil dibuat!
          </div>
        )}

        {/* Filter */}
        <div className="mb-4">
          <select
            className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Semua Status Verifikasi</option>
            <option value="WAITING_BUYER">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        {/* Transaction Table */}
        {dagingLoading ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Memuat transaksi...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penjual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pembeli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Daging
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Verifikasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dagingTransactions
                    .filter((t) => filter === 'all' || t.verificationStatus === filter)
                    .length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        Belum ada transaksi penjualan daging
                      </td>
                    </tr>
                  ) : (
                    dagingTransactions
                      .filter((t) => filter === 'all' || t.verificationStatus === filter)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tx.id.substring(0, 12)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(tx.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.direction === 'outgoing' ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <i className="fas fa-arrow-up mr-1"></i>Keluar
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                <i className="fas fa-arrow-down mr-1"></i>Masuk
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{tx.sellerName || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{tx.penjualType}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{tx.buyerName || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{tx.pembeliType}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.dagingId ? tx.dagingId.substring(0, 12) + '...' : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(tx.verificationStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tx.cid ? (
                              <a 
                                href={`https://ipfs.io/ipfs/${tx.cid}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-primary hover:underline"
                                title={tx.cid}
                              >
                                <i className="fas fa-link"></i>
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              {tx.direction === 'outgoing' && (tx.verificationStatus === 'WAITING_BUYER' || tx.verificationStatus === 'PENDING') && (
                                <button
                                  className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10"
                                  onClick={() => {
                                    setVerifyingTx(tx);
                                    setVerifyInputCode('');
                                    setVerifyError('');
                                    setVerifySuccess('');
                                    setShowVerifyModal(true);
                                  }}
                                >
                                  <i className="fas fa-key mr-1"></i>
                                  Verifikasi Bersama
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Transaksi Baru</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Daging <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.dagingId}
                    onChange={(e) => setForm({ ...form, dagingId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">-- Pilih Daging --</option>
                    {availableDaging.length === 0 ? (
                      <option disabled>Tidak ada daging tersedia</option>
                    ) : (
                      availableDaging.map((d) => (
                        <option key={d.id} value={d.id}>
                          {`${d.id.substring(0, 8)}... | ${d.sapi?.jenis || 'N/A'} - ${d.sapi?.beratSapi || 0}kg | Total: ${d.totalBerat}kg`}
                        </option>
                      ))
                    )}
                  </select>
                  {availableDaging.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Belum ada daging yang siap dijual. Daging harus terverifikasi halal terlebih dahulu.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pembeli Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.buyerId ? `${form.buyerType}:${form.buyerId}` : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [type, id] = val.split(':');
                        setForm({ ...form, buyerType: type, buyerId: id });
                      } else {
                        setForm({ ...form, buyerType: '', buyerId: '' });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Pilih Pembeli</option>
                    {entityOptions.map((e) => (
                      <option key={`${e.type}:${e.id}`} value={`${e.type}:${e.id}`}>
                        {e.type} - {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Catatan tambahan (opsional)"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
                  >
                    Buat Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {showVerifyModal && verifyingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Verifikasi Transaksi</h2>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    Kode verifikasi telah dikirim ke email pembeli
                  </p>
                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div className="font-mono text-2xl tracking-widest font-bold text-primary">
                      {verifyingTx.verificationCode || '------'}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
                    >
                      <i className="fas fa-copy mr-1"></i>
                      Salin
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masukkan Kode Verifikasi dari Pembeli
                  </label>
                  <input
                    type="text"
                    value={verifyInputCode}
                    onChange={(e) => setVerifyInputCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="000000"
                    maxLength="6"
                  />
                </div>

                {verifyError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {verifyError}
                  </div>
                )}

                {verifySuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                    <i className="fas fa-check-circle mr-2"></i>
                    {verifySuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleRejectVerification}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={handleConfirmBuyer}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DistributorTransaksi;
