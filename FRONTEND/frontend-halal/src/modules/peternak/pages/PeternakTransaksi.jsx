import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import PeternakSidebar from '../components/PeternakSidebar';

const PeternakTransaksi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('sales');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyInputCode, setVerifyInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState({
    status: 'all',
    verificationStatus: 'all',
    search: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    buyerId: '',
    buyerName: '',
    buyerType: '',
    cattleId: '',
    quantity: 1,
    date: '', // added
    notes: ''
  });
  
  // Transaksi penjualan (real data dari backend)
  const [transactions, setTransactions] = useState([]);
  
  // Daftar sapi milik peternak (real data dari backend)
  const [availableCattle, setAvailableCattle] = useState([]);
  
  // Dynamic entity options (buyers and transfer recipients) loaded from backend
  const [buyers, setBuyers] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]); // for Transfer Tujuan
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState('');

  // Load all entities from backend to populate buyers and transfer tujuan
  useEffect(() => {
    const API_BASE = 'http://localhost:3000';
    const fetchAllEntities = async () => {
      try {
        setEntitiesLoading(true);
        setEntitiesError('');
        const endpoints = [
          { url: `${API_BASE}/peternak`, type: 'PETERNAK', nameKey: 'nama' },
          { url: `${API_BASE}/pasarHewan`, type: 'PASAR_HEWAN', nameKey: 'nama' },
          { url: `${API_BASE}/jagal`, type: 'JAGAL', nameKey: 'nama' },
          { url: `${API_BASE}/rph`, type: 'RPH', nameKey: 'nama' },
          { url: `${API_BASE}/distributor`, type: 'DISTRIBUTOR', nameKey: 'namaUsaha' },
          { url: `${API_BASE}/horeka`, type: 'HOREKA', nameKey: 'nama' },
        ];

        const results = await Promise.allSettled(
          endpoints.map(async (ep) => {
            const res = await fetch(ep.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data.map((item) => ({
              // Gunakan ID entitas (item.id) untuk konsistensi dengan validator backend
              // Backend transaksiPenjualan memvalidasi berdasarkan kolom id entitas, bukan userId
              id: item.id || item.kode || item.uuid || '',
              name: item[ep.nameKey] || item.nama || item.namaUsaha || '—',
              type: ep.type,
            }));
          })
        );

        const combined = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value)
          .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

        if (combined.length) {
          setBuyers(combined);
          setEntityOptions(combined);
        }

        const anyRejected = results.some(r => r.status === 'rejected');
        if (anyRejected && !combined.length) {
          setEntitiesError('Gagal memuat daftar entitas. Opsi default akan digunakan.');
        }
      } catch (err) {
        setEntitiesError('Gagal memuat daftar entitas.');
      } finally {
        setEntitiesLoading(false);
      }
    };

    fetchAllEntities();
  }, []);

  // Helper nama entitas untuk tampil di tabel transaksi
  const resolveEntityName = (type, id) => {
    const found = buyers.find(b => b.type === type && String(b.id) === String(id));
    return found?.name || '-';
  };

  // Fetch sapi milik peternak dan transaksi penjualan riil dari backend
  useEffect(() => {
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const peternakId = user?.entityId || user?.id;
    if (!peternakId) return;

    const fetchData = async () => {
      try {
        // 1) Ambil sapi milik peternak
        const resSapi = await fetch(`${API_BASE}/sapi/entity/PETERNAK/${peternakId}`, { headers });
        let sapiList = [];
        if (resSapi.ok) {
          const json = await resSapi.json();
          sapiList = Array.isArray(json) ? json : (json.data || []);
          const mapped = sapiList.map(s => ({
            id: s.id,
            type: s.jenis || 'Sapi',
            gender: s.kelamin || '-',
            age: typeof s.usia === 'number' ? s.usia : undefined,
            weight: typeof s.beratSapi === 'number' ? s.beratSapi : undefined,
            birthDate: s.tglLahir || undefined,
            healthStatus: 'sehat',
            availability: 'available',
          }));
          setAvailableCattle(mapped);
        } else {
          setAvailableCattle([]);
        }

        const sapiIds = sapiList.map(s => s.id);

        // 2) Ambil transaksi penjualan dan filter untuk peternak ini
        const resTx = await fetch(`${API_BASE}/transaksiPenjualan`, { headers });
        if (resTx.ok) {
          const raw = await resTx.json();
          const list = Array.isArray(raw) ? raw : (raw.data || []);
          const relevant = list.filter(t => {
            const penjualMatch = t.penjualType === 'PETERNAK' && String(t.penjualId) === String(peternakId);
            const sapiMatch = t.sapiId && sapiIds.includes(t.sapiId);
            return penjualMatch || sapiMatch;
          });
          const mappedTx = relevant.map(t => ({
            id: t.id,
            date: t.timestamp || new Date().toISOString(),
            buyerId: t.pembeliId,
            buyerName: resolveEntityName(t.pembeliType, t.pembeliId),
            buyerType: t.pembeliType,
            cattleId: t.sapiId || '-',
            quantity: t.jumlahQty || 1,
            status: t.verifikasiPembeli ? 'verified' : 'pending',
            verificationStatus: t.verifikasiPembeli ? 'verified' : 'waiting_buyer',
            blockchainHash: t.cid || '',
            cid: t.cid,
            notes: ''
          }));
          setTransactions(mappedTx);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.warn('Gagal memuat sapi/transaksi:', err);
        setAvailableCattle([]);
        setTransactions([]);
      }
    };

    // Jalankan setelah buyers siap agar nama pembeli dapat dipetakan
    fetchData();
  }, [buyers]);

  // Transfer Sapi state (simplified)
  const [newTransfer, setNewTransfer] = useState({ cattleId: '', recipient: '', date: '', notes: '' });
  const [transferSuccess, setTransferSuccess] = useState(false);
  // Transfer records with two-way verification
  const [transfers, setTransfers] = useState([]);
  const [showVerifyTransferModal, setShowVerifyTransferModal] = useState(false);
  const [verifyingTransfer, setVerifyingTransfer] = useState(null);
  const [transferVerifyInputCode, setTransferVerifyInputCode] = useState('');
  const [transferVerifyError, setTransferVerifyError] = useState('');
  const [transferVerifySuccess, setTransferVerifySuccess] = useState('');

  // Load saved transfers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('peternakTransfers');
      if (saved) setTransfers(JSON.parse(saved));
    } catch {}
  }, []);

  const persistTransfers = (list) => {
    setTransfers(list);
    try { localStorage.setItem('peternakTransfers', JSON.stringify(list)); } catch {}
  };

  // Handle authentication submission
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    // In a real implementation, this would validate against an API
    // For demonstration purposes, we'll use a simple code
    const correctCode = '123456'; // In real app, this should be from backend
    
    if (authCode === correctCode) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError('');
      setAuthCode('');
      
      // Store authentication state in localStorage
      localStorage.setItem('transactionAuth', 'true');
      
      // Process page setup after authentication
      processPageSetup();
    } else {
      setAuthError('Kode autentikasi tidak valid. Silakan coba lagi.');
    }
  };
  
  // Update when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      processPageSetup();
    }
  }, [isAuthenticated]);

  // Check for authentication status on initial load
  useEffect(() => {
    // Check authentication first - this is to prevent showing auth modal when user is already authenticated
    const transactionAuth = localStorage.getItem('transactionAuth');
    if (transactionAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      // Only show auth modal if coming directly to the page (not from sidebar or dashboard)
      // This is because sidebar and dashboard should handle auth before navigating here
      const fromSidebar = localStorage.getItem('fromSidebar') === 'true';
      const fromDashboard = localStorage.getItem('showTransactionFromDashboard') === 'true';
      
      if (!fromSidebar && !fromDashboard) {
        setShowAuthModal(true);
        return;
      }
    }
    
    processPageSetup();
  }, []);
  
  // Process page setup after authentication
  const processPageSetup = () => {
    // Handle cattle data passed for sale
    const storedCattle = localStorage.getItem('selectedCattleForSale');
    if (storedCattle) {
      try {
        const cattleData = JSON.parse(storedCattle);
        // Set the new transaction form with the cattle ID
        setNewTransaction(prev => ({ ...prev, cattleId: cattleData.id }));
        // Show the transaction form
        setShowTransactionForm(true);
        // Set active tab to sales
        setActiveTab('sales');
        // Remove the stored data to prevent it from being used again on refresh
        localStorage.removeItem('selectedCattleForSale');
      } catch (error) {
        console.error("Error parsing stored cattle data:", error);
      }
    }
    
    // Handle navigation from dashboard transaksi link
    const showFromDashboard = localStorage.getItem('showTransactionFromDashboard');
    if (showFromDashboard === 'true') {
      // Set active tab to sales
      setActiveTab('sales');
      // Show transaction form
      setShowTransactionForm(true);
      // Remove the flag
      localStorage.removeItem('showTransactionFromDashboard');
    }
    
    // Clear the fromSidebar flag after it's been used
    localStorage.removeItem('fromSidebar');
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle form submission for new transaction (wire to backend & capture CID)
  const handleNewTransaction = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Current user assumed to represent the entity for seller mapping
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Map buyer selection to proper buyer field in payload
      const buyer = buyers.find(b => b.id === newTransaction.buyerId);
      const pembeliType = buyer?.type || newTransaction.buyerType;
      // Payload sesuai controller backend: gunakan penjualId dan pembeliId
      const payload = {
        penjualType: 'PETERNAK',
        penjualId: user?.entityId || user?.id,
        pembeliType,
        pembeliId: buyer?.id,
        sapiId: newTransaction.cattleId,
        jumlahQty: Number(newTransaction.quantity) || 1,
        type: 'SAPI',
        timestamp: newTransaction.date ? new Date(newTransaction.date).toISOString() : new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/transaksiPenjualan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      let created = null;
      if (res.ok) {
        created = await res.json();
      } else {
        const err = await res.json().catch(()=>({}));
        console.warn('Gagal kirim ke backend:', err?.error || res.statusText);
      }

      // Update UI using backend response when available; else fall back to local append
      const txId = created?.data?.id || created?.id || `TXN00${transactions.length + 1}`;
      const buyerName = buyer?.name || '';
      setTransactions([...transactions, {
        id: txId,
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        buyerId: newTransaction.buyerId,
        buyerName,
        buyerType: pembeliType,
        cattleId: newTransaction.cattleId,
        quantity: newTransaction.quantity,
        status: 'pending',
        verificationStatus: (created?.data?.verificationStatus || 'PENDING'),
        verificationCode: created?.data?.verificationCode,
        cid: created?.data?.cid || undefined,
        notes: newTransaction.notes
      }]);

      setTransactionSuccess(true);
      setTimeout(() => {
        setShowTransactionForm(false);
        setTransactionSuccess(false);
        setNewTransaction({ buyerId:'', buyerName:'', buyerType:'', cattleId:'', quantity:1, date:'', notes:'' });
      }, 2000);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Gagal membuat transaksi. Coba lagi nanti.');
    }
  };

  // Handle buyer selection
  const handleBuyerChange = (e) => {
    const buyerId = e.target.value;
    const selectedBuyer = buyers.find(b => b.id === buyerId);
    
    setNewTransaction({
      ...newTransaction,
      buyerId: buyerId,
      buyerName: selectedBuyer?.name || '',
      buyerType: selectedBuyer?.type || ''
    });
  };

  // View transaction details
  const handleViewTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  // Cancel transaction
  const handleCancelTransaction = (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) {
      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      ));
      alert('Transaksi berhasil dibatalkan');
    }
  };

  // Request/regenerate verification code via backend
  const handleRequestVerification = async (transactionId) => {
    const API_BASE = 'http://localhost:3000';
    try {
      const res = await fetch(`${API_BASE}/transaksiPenjualan/${transactionId}/requestVerification`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gagal membuat kode verifikasi');
      const updated = transactions.map(t => t.id === transactionId ? {
        ...t,
        verificationStatus: json?.data?.verificationStatus || 'PENDING',
        verificationCode: json?.data?.verificationCode
      } : t);
      setTransactions(updated);
      setVerifyingTx(updated.find(t => t.id === transactionId));
      setVerifyInputCode('');
      setVerifyError('');
      setVerifySuccess('');
      setShowVerifyModal(true);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal meminta verifikasi');
    }
  };

  // Simple CID generator (placeholder, replace with backend/IPFS integration)
  const generateCid = () => 'cid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10);

  const handleCopyCode = async () => {
    if (!verifyingTx?.verificationCode) return;
    try {
      await navigator.clipboard.writeText(verifyingTx.verificationCode);
      setVerifySuccess('Kode disalin ke clipboard');
      setTimeout(()=> setVerifySuccess(''), 1500);
    } catch {
      setVerifyError('Gagal menyalin kode');
      setTimeout(()=> setVerifyError(''), 2000);
    }
  };

  const handleConfirmBuyer = async () => {
    if (!verifyingTx) return;
    try {
      const API_BASE = 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/transaksiPenjualan/${verifyingTx.id}/confirmBuyer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyInputCode })
      });
      const json = await res.json();
      if (!res.ok) {
        setVerifyError(json?.error || 'Verifikasi gagal');
        return;
      }
      const updated = transactions.map(t => t.id === verifyingTx.id ? {
        ...t,
        verificationStatus: 'VERIFIED',
        cid: json?.ipfsCid || json?.data?.cid || t.cid,
      } : t);
      setTransactions(updated);
      setVerifySuccess('Verifikasi berhasil. Transaksi ditandai sebagai terverifikasi.');
      setVerifyError('');
      setTimeout(()=>{
        setShowVerifyModal(false);
        setVerifyingTx(null);
        setVerifyInputCode('');
        setVerifySuccess('');
      }, 1200);
    } catch (err) {
      console.error(err);
      setVerifyError('Terjadi kesalahan saat verifikasi');
    }
  };

  const handleRejectVerification = async () => {
    if (!verifyingTx) return;
    if (!window.confirm('Tolak verifikasi transaksi ini?')) return;
    try {
      const API_BASE = 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/transaksiPenjualan/${verifyingTx.id}/rejectVerification`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gagal menolak verifikasi');
      const updated = transactions.map(t => t.id === verifyingTx.id ? { ...t, verificationStatus: 'REJECTED' } : t);
      setTransactions(updated);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menolak verifikasi');
    }
    setShowVerifyModal(false);
    setVerifyingTx(null);
    setVerifyInputCode('');
    setVerifySuccess('');
    setVerifyError('');
  };

  // Utility function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  // Utility function to get status badge
  const getTransactionStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu</span>;
      case 'verified':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Selesai</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Dibatalkan</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  // Utility function to get verification badge
  const getVerificationBadge = (status) => {
    switch(String(status)) {
      case 'waiting_buyer':
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu Pembeli</span>;
      case 'verified':
      case 'VERIFIED':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'rejected':
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const isPendingStatus = (s) => String(s) === 'waiting_buyer' || String(s) === 'PENDING';
  const isVerifiedStatus = (s) => String(s) === 'verified' || String(s) === 'VERIFIED';
  const isRejectedStatus = (s) => String(s) === 'rejected' || String(s) === 'REJECTED';

  // Submit transfer: create pending transfer with verification code, persist, redirect to verification
  const handleNewTransferSubmit = (e) => {
    e.preventDefault();
    if (!newTransfer.cattleId || !newTransfer.recipient) return;

    const [recipientType, recipientIdRaw] = String(newTransfer.recipient).split(':');
    const recipientId = recipientIdRaw || '';
    const recipientName = resolveEntityName(recipientType, recipientId);
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const trId = `TRF${String(transfers.length + 1).padStart(4, '0')}`;

    const transfer = {
      id: trId,
      date: newTransfer.date ? new Date(newTransfer.date).toISOString() : new Date().toISOString(),
      cattleId: newTransfer.cattleId,
      recipientType,
      recipientId,
      recipientName: recipientName || recipientType,
      status: 'pending',
      verificationStatus: 'waiting_buyer',
      verify: { sellerSigned: true, buyerSigned: false, code },
      notes: newTransfer.notes || ''
    };

    const updated = [...transfers, transfer];
    persistTransfers(updated);

    setTransferSuccess(true);
    setNewTransfer({ cattleId: '', recipient: '', date: '', notes: '' });
    setTimeout(() => {
      setTransferSuccess(false);
      handleTabChange('verification');
    }, 800);
  };

  // Open transfer verification modal (generate code if missing)
  const openTransferVerification = (transferId) => {
    const tr = transfers.find(t => t.id === transferId);
    if (!tr) return;
    let updated = transfers;
    if (!tr.verify || !tr.verify.code) {
      const code = (Math.floor(100000 + Math.random() * 900000)).toString();
      updated = transfers.map(t => t.id === transferId ? {
        ...t,
        verify: { sellerSigned: true, buyerSigned: false, code },
        verificationStatus: 'waiting_buyer'
      } : t);
      persistTransfers(updated);
      setVerifyingTransfer(updated.find(t => t.id === transferId));
    } else {
      setVerifyingTransfer(tr);
    }
    setTransferVerifyInputCode('');
    setTransferVerifyError('');
    setTransferVerifySuccess('');
    setShowVerifyTransferModal(true);
  };

  const handleCopyTransferCode = async () => {
    if (!verifyingTransfer?.verify?.code) return;
    try {
      await navigator.clipboard.writeText(verifyingTransfer.verify.code);
      setTransferVerifySuccess('Kode disalin ke clipboard');
      setTimeout(()=> setTransferVerifySuccess(''), 1500);
    } catch {
      setTransferVerifyError('Gagal menyalin kode');
      setTimeout(()=> setTransferVerifyError(''), 2000);
    }
  };

  const handleConfirmTransferBuyer = () => {
    if (!verifyingTransfer) return;
    const expected = verifyingTransfer.verify?.code || '';
    if (transferVerifyInputCode.trim() !== expected) {
      setTransferVerifyError('Kode tidak cocok. Minta penerima untuk memasukkan kode yang benar.');
      return;
    }
    const updated = transfers.map(t => t.id === verifyingTransfer.id ? {
      ...t,
      verificationStatus: 'verified',
      verify: { ...(t.verify||{}), buyerSigned: true },
      cid: t.cid || generateCid()
    } : t);
    persistTransfers(updated);
    setTransferVerifySuccess('Verifikasi transfer berhasil.');
    setTransferVerifyError('');
    setTimeout(()=>{
      setShowVerifyTransferModal(false);
      setVerifyingTransfer(null);
      setTransferVerifyInputCode('');
      setTransferVerifySuccess('');
    }, 1200);
  };

  const handleRejectTransferVerification = () => {
    if (!verifyingTransfer) return;
    if (!window.confirm('Tolak verifikasi transfer ini?')) return;
    const updated = transfers.map(t => t.id === verifyingTransfer.id ? {
      ...t,
      verificationStatus: 'rejected'
    } : t);
    persistTransfers(updated);
    setShowVerifyTransferModal(false);
    setVerifyingTransfer(null);
    setTransferVerifyInputCode('');
    setTransferVerifySuccess('');
    setTransferVerifyError('');
  };

  return (
    <DashboardLayout
      title="Transaksi Penjualan"
      role="PETERNAK"
    >
      <div className="mt-4">{/* add top margin to separate from title */}
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8 gap-2">
        <button 
          className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'sales' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
          onClick={() => handleTabChange('sales')}
        >
          Transaksi Penjualan
        </button>
        <button 
          className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'verification' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
          onClick={() => handleTabChange('verification')}
        >
          Verifikasi Transaksi
        </button>
        <button 
          className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
          onClick={() => handleTabChange('history')}
        >
          Riwayat Transaksi
        </button>
      </div>

      {/* Transaksi Penjualan Tab Content */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {/* ===== TRANSFER SAPI (moved to top) ===== */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-truck text-primary"></i> Transfer Sapi</h2>
            <p className="text-sm text-gray-500 mb-4">Ajukan pemindahan sapi ke entitas tujuan (RPH, dsb).</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {transferSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  <i className="fas fa-check-circle mr-1"></i> Transfer berhasil diajukan.
                </div>
              )}
              <form onSubmit={handleNewTransferSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Sapi</label>
                    <select value={newTransfer.cattleId} onChange={e=>setNewTransfer({...newTransfer, cattleId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                      <option value="">Pilih ID Sapi</option>
                      {availableCattle.filter(c=>c.availability==='available').map(c=>(
                        <option key={c.id} value={c.id}>{c.id} - {c.type} ({c.weight}kg)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan</label>
                    <select 
                      value={newTransfer.recipient}
                      onChange={e=>setNewTransfer({...newTransfer, recipient:e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                      required
                    >
                      <option value="">{entitiesLoading ? 'Memuat...' : 'Pilih Tujuan'}</option>
                      {entityOptions.map(ent => (
                        <option key={`${ent.type}:${ent.id}`} value={`${ent.type}:${ent.id}`}>
                          {ent.type.replace('_',' ')} - {ent.name}
                        </option>
                      ))}
                    </select>
                    {entitiesError && (
                      <p className="text-xs text-red-600 mt-1">{entitiesError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
                    <input type="date" value={newTransfer.date} onChange={e=>setNewTransfer({...newTransfer, date:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea rows="2" value={newTransfer.notes} onChange={e=>setNewTransfer({...newTransfer, notes:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Opsional"></textarea>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-md shadow-sm transition"
                  >
                    Ajukan Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* ===== END TRANSFER SAPI ===== */}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Transaksi Penjualan</h2>
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
              onClick={() => setShowTransactionForm(!showTransactionForm)}
            >
              <i className="fas fa-plus mr-1"></i> {showTransactionForm ? 'Tutup Form' : 'Buat Transaksi Baru'}
            </button>
          </div>

          {/* Form Transaksi Baru */}
          {showTransactionForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Form Transaksi</h3>
              <form onSubmit={handleNewTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={newTransaction.buyerId}
                      onChange={handleBuyerChange}
                      required
                    >
                      <option value="" disabled>-- Pilih Pembeli --</option>
                      {buyers.map(buyer => (
                        <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Entitas Pembeli</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" 
                      value={newTransaction.buyerType.replace('_', ' ')} 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sapi</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newTransaction.cattleId}
                      onChange={(e) => setNewTransaction({...newTransaction, cattleId: e.target.value})}
                      required
                    >
                      <option value="" disabled>-- Pilih Sapi --</option>
                      {availableCattle.map(cattle => (
                        <option key={cattle.id} value={cattle.id}>{cattle.id} - {cattle.type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value, 10)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <textarea 
                      rows="2" 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                    onClick={() => setShowTransactionForm(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm"
                  >
                    <i className="fas fa-save mr-1"></i> Simpan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success Message */}
          {transactionSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <i className="fas fa-check-circle mr-2"></i>
              <span>Transaksi berhasil disimpan!</span>
            </div>
          )}

          {/* Filter dan Pencarian */}
          <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <select 
                className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={transactionFilter.status}
                onChange={(e) => setTransactionFilter({...transactionFilter, status: e.target.value})}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi Pembeli</option>
                <option value="verified">Terverifikasi</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2"
                value={transactionFilter.search}
                onChange={(e) => setTransactionFilter({...transactionFilter, search: e.target.value})}
              />
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                <i className="fas fa-search mr-1"></i> Cari
              </button>
            </div>
          </div>
          
          {/* Tabel Transaksi */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter(t => transactionFilter.status === 'all' || t.status === transactionFilter.status)
                  .filter(t => transactionFilter.search === '' || 
                    t.id.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                    t.buyerName.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                    t.cattleId.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                    (t.cid ? t.cid.toLowerCase().includes(transactionFilter.search.toLowerCase()) : false)
                  )
                  .map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getTransactionStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(transaction.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                        {transaction.cid ? (
                          <a 
                            href={`https://ipfs.io/ipfs/${transaction.cid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                            title={transaction.cid}
                          >
                            {transaction.cid.length > 18 
                              ? `${transaction.cid.slice(0, 8)}...${transaction.cid.slice(-8)}` 
                              : transaction.cid}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          <button 
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleViewTransaction(transaction.id)}
                          >
                            Detail
                          </button>
                          {transaction.status === 'pending' && (
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleCancelTransaction(transaction.id)}
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= TRANSFER HEWAN (Embedded) ================= */}
          {/* <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-truck text-primary"></i> Transfer Hewan</h2>
            </div>
            {/* Form Transfer Baru 
            <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Form Transfer</h3>
              {transferSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  <i className="fas fa-check-circle mr-1"></i> Transfer berhasil diajukan.
                </div>
              )}
              <form onSubmit={handleNewTransferSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Ternak</label>
                    <select value={newTransfer.cattleId} onChange={e=>setNewTransfer({...newTransfer, cattleId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                      <option value="">Pilih ID Ternak</option>
                      {availableCattle.filter(c=>c.availability==='available').map(c=>(
                        <option key={c.id} value={c.id}>{c.id} - {c.type} ({c.weight}kg)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Transfer</label>
                    <select value={newTransfer.recipient} onChange={e=>setNewTransfer({...newTransfer, recipient:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                      <option value="">Pilih Tujuan</option>
                      <option value="RPH Barokah">RPH Barokah</option>
                      <option value="RPH Makmur">RPH Makmur</option>
                      <option value="RPH Sentosa">RPH Sentosa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
                    <input type="date" value={newTransfer.date} onChange={e=>setNewTransfer({...newTransfer, date:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                    <textarea rows="2" value={newTransfer.notes} onChange={e=>setNewTransfer({...newTransfer, notes:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Masukkan catatan..."></textarea>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">Kirim Permintaan Transfer</button>
                </div>
              </form>
            </div>

            {/* Pending Transfers 
            <div className="mb-10">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Transfer Menunggu</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left">ID Transfer</th>
                      <th className="px-6 py-3 text-left">Tanggal</th>
                      <th className="px-6 py-3 text-left">ID Ternak</th>
                      <th className="px-6 py-3 text-left">Penerima</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingTransfers.map(tr => (
                      <tr key={tr.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-primary">{tr.id}</td>
                        <td className="px-6 py-3">{tr.date}</td>
                        <td className="px-6 py-3">{tr.cattleId}</td>
                        <td className="px-6 py-3">{tr.recipient}</td>
                        <td className="px-6 py-3"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{tr.status}</span></td>
                        <td className="px-6 py-3 flex gap-3">
                          <button onClick={()=>completeTransfer(tr.id)} className="text-green-600 hover:text-green-800" title="Tandai Selesai"><i className="fas fa-check-circle"></i></button>
                          <button onClick={()=>cancelTransfer(tr.id)} className="text-red-600 hover:text-red-800" title="Batalkan"><i className="fas fa-times-circle"></i></button>
                        </td>
                      </tr>
                    ))}
                    {pendingTransfers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Tidak ada transfer menunggu.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transfer History 
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-4">Riwayat Transfer</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left">ID Transfer</th>
                      <th className="px-6 py-3 text-left">Tanggal</th>
                      <th className="px-6 py-3 text-left">ID Ternak</th>
                      <th className="px-6 py-3 text-left">Penerima</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transferHistory.map(tr => (
                      <tr key={tr.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-primary">{tr.id}</td>
                        <td className="px-6 py-3">{tr.date}</td>
                        <td className="px-6 py-3">{tr.cattleId}</td>
                        <td className="px-6 py-3">{tr.recipient}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${tr.status==='Selesai' ? 'bg-green-100 text-green-800' : tr.status==='Dibatalkan' ? 'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>{tr.status}</span>
                        </td>
                      </tr>
                    ))}
                    {transferHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Belum ada riwayat transfer.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div> */}
          {/* ================= END TRANSFER HEWAN ================= */}
        </div>
      )}

      {/* Inter-Entity Verification Modal */}
      {showVerifyModal && verifyingTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Verifikasi Antar Entitas</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>{setShowVerifyModal(false); setVerifyingTx(null);}}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Transaksi:</span> {verifyingTx.id}</p>
                <p><span className="font-medium">Pembeli:</span> {verifyingTx.buyerName} ({verifyingTx.buyerType})</p>
                <p><span className="font-medium">Sapi:</span> {verifyingTx.cattleId}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 mb-2"><i className="fas fa-shield-alt mr-2"></i>Kode Verifikasi Bersama</p>
                <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-3 text-center">
                  <div className="text-2xl font-mono tracking-widest text-blue-700 text-center">
                    {verifyingTx.verificationCode || '— — — — — —'}
                  </div>
                  <button className="px-2 py-1 text-xs border border-blue-400 text-blue-600 rounded hover:bg-blue-100" onClick={handleCopyCode}>Salin</button>
                  {!verifyingTx.verificationCode && (
                    <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" onClick={()=>handleRequestVerification(verifyingTx.id)}>Buat Kode</button>
                  )}
                </div>
                <p className="text-xs text-blue-700 mt-2">Bagikan kode ini kepada pembeli untuk konfirmasi. Pembeli harus mengirimkan kembali kode yang sama.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Kode dari Pembeli</label>
                <input value={verifyInputCode} onChange={e=>setVerifyInputCode(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="6 digit" />
                {verifyError && <p className="text-sm text-red-600 mt-1">{verifyError}</p>}
                {verifySuccess && <p className="text-sm text-green-600 mt-1">{verifySuccess}</p>}
                {!verifyError && !verifySuccess && verifyInputCode && verifyInputCode.length < 6 && (
                  <p className="text-xs text-gray-500 mt-1">Masukkan 6 digit kode</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <button className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50" onClick={handleRejectVerification}>Tolak</button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50" onClick={()=>{setShowVerifyModal(false); setVerifyingTx(null);}}>Batal</button>
                <button
                  className={`px-4 py-2 rounded-md text-white ${/^\d{6}$/.test(verifyInputCode) ? 'bg-primary hover:bg-primaryDark' : 'bg-primary/60 cursor-not-allowed'}`}
                  onClick={handleConfirmBuyer}
                  disabled={!/^\d{6}$/.test(verifyInputCode)}
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Verification Modal */}
      {showVerifyTransferModal && verifyingTransfer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Verifikasi Transfer Antar Entitas</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>{setShowVerifyTransferModal(false); setVerifyingTransfer(null);}}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Transfer:</span> {verifyingTransfer.id}</p>
                <p><span className="font-medium">Penerima:</span> {verifyingTransfer.recipientName} ({verifyingTransfer.recipientType})</p>
                <p><span className="font-medium">Sapi:</span> {verifyingTransfer.cattleId}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 mb-2"><i className="fas fa-shield-alt mr-2"></i>Kode Verifikasi Bersama</p>
                <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-3 text-center">
                  <div className="text-2xl font-mono tracking-widest text-blue-700 text-center">
                    {verifyingTransfer.verify?.code || '— — — — — —'}
                  </div>
                  <button className="px-2 py-1 text-xs border border-blue-400 text-blue-600 rounded hover:bg-blue-100" onClick={handleCopyTransferCode}>Salin</button>
                </div>
                <p className="text-xs text-blue-700 mt-2">Bagikan kode ini kepada penerima untuk konfirmasi. Penerima harus mengirimkan kembali kode yang sama.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Kode dari Penerima</label>
                <input value={transferVerifyInputCode} onChange={e=>setTransferVerifyInputCode(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="6 digit" />
                {transferVerifyError && <p className="text-sm text-red-600 mt-1">{transferVerifyError}</p>}
                {transferVerifySuccess && <p className="text-sm text-green-600 mt-1">{transferVerifySuccess}</p>}
                {!transferVerifyError && !transferVerifySuccess && transferVerifyInputCode && transferVerifyInputCode.length < 6 && (
                  <p className="text-xs text-gray-500 mt-1">Masukkan 6 digit kode</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <button className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50" onClick={handleRejectTransferVerification}>Tolak</button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50" onClick={()=>{setShowVerifyTransferModal(false); setVerifyingTransfer(null);}}>Batal</button>
                <button
                  className={`px-4 py-2 rounded-md text-white ${/^\d{6}$/.test(transferVerifyInputCode) ? 'bg-primary hover:bg-primaryDark' : 'bg-primary/60 cursor-not-allowed'}`}
                  onClick={handleConfirmTransferBuyer}
                  disabled={!/^\d{6}$/.test(transferVerifyInputCode)}
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verifikasi Transaksi Tab Content */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Verifikasi Transaksi & Transfer</h2>
          
          {/* Statistik Verifikasi (Gabungan) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {transactions.filter(t => isPendingStatus(t.verificationStatus)).length + transfers.filter(t => isPendingStatus(t.verificationStatus)).length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Terverifikasi</p>
              <p className="text-2xl font-semibold text-green-600">
                {transactions.filter(t => isVerifiedStatus(t.verificationStatus)).length + transfers.filter(t => isVerifiedStatus(t.verificationStatus)).length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-2xl font-semibold text-red-600">
                {transactions.filter(t => isRejectedStatus(t.verificationStatus)).length + transfers.filter(t => isRejectedStatus(t.verificationStatus)).length}
              </p>
            </div>
          </div>

          {/* Daftar Verifikasi (Transaksi + Transfer) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-800">Daftar Verifikasi</h3>
            </div>
            <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Jenis</th>
                <th className="px-6 py-3 text-left">Pihak</th>
                <th className="px-6 py-3 text-left">ID Sapi</th>
                <th className="px-6 py-3 text-left">Status Verifikasi</th>
                <th className="px-6 py-3 text-left">CID</th>
                <th className="px-6 py-3 text-left">Tindakan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                ...transactions.map(t => ({
                  id: t.id,
                  date: t.date,
                  jenis: 'Transaksi',
                  pihakLabel: 'Pembeli',
                  pihakNama: t.buyerName,
                  sapi: t.cattleId,
                  status: t.verificationStatus,
                  cid: t.cid || null,
                  raw: t,
                })),
                ...transfers.map(tr => ({
                  id: tr.id,
                  date: tr.date,
                  jenis: 'Transfer',
                  pihakLabel: 'Penerima',
                  pihakNama: `${tr.recipientName} (${tr.recipientType})`,
                  sapi: tr.cattleId,
                  status: tr.verificationStatus,
                  cid: tr.cid || null,
                  raw: tr,
                })),
              ].map(item => (
                <tr key={`${item.jenis}-${item.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-left font-medium text-primary">{item.id}</td>
                  <td className="px-6 py-3 text-left">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-3 text-left">{item.jenis}</td>
                  <td className="px-6 py-3 text-left">{item.pihakLabel}: {item.pihakNama}</td>
                  <td className="px-6 py-3 text-left">{item.sapi}</td>
                  <td className="px-6 py-3 text-left">{getVerificationBadge(item.status)}</td>
                  <td className="px-6 py-3 text-left">
                    {item.cid ? (
                      <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{String(item.cid).slice(0,12)}...</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Belum</span>
                    )}
                  </td>
                      <td className="px-6 py-3 text-left">
                        {item.jenis === 'Transaksi' ? (
                          <div className="flex items-center gap-3">
                            {isPendingStatus(item.status) && (
                              <>
                                <button
                                  className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10"
                                  onClick={() => handleRequestVerification(item.raw.id)}
                                >
                                  Verifikasi Bersama
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  onClick={() => { setVerifyingTx(item.raw); setShowVerifyModal(true); }}
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            <button 
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => handleViewTransaction(item.raw.id)}
                            >
                              Detail
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-xs"
                              onClick={() => openTransferVerification(item.raw.id)}
                              title="Detail/Verifikasi"
                            >
                              Detail/Verifikasi
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {[...transactions, ...transfers].length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-left text-gray-500">Belum ada data verifikasi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Verifikasi digabung ke atas */}
        </div>
      )}

      {/* Riwayat Transaksi Tab Content */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
          
          {/* Filter Riwayat */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">Semua Status</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div>
              <input type="month" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <input type="text" placeholder="Cari pembeli..." className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition text-sm">
                <i className="fas fa-download mr-1"></i> Export
              </button>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter(t => t.status === 'completed' || t.status === 'cancelled')
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">Rp 15.000.000</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{getTransactionStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleViewTransaction(transaction.id)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-600">Menampilkan 1-{transactions.length} dari {transactions.length} transaksi</p>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-primary text-white">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Detail Transaksi Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Detail Transaksi <span className="text-primary">{selectedTransaction.id}</span>
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                  <p className="text-gray-800 font-semibold">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pembeli</p>
                  <p className="text-gray-800 font-semibold">{selectedTransaction.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sapi</p>
                  <p className="text-gray-800 font-semibold">{selectedTransaction.cattleId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah</p>
                  <p className="text-gray-800 font-semibold">{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status Transaksi</p>
                  <p className="text-gray-800 font-semibold">
                    {selectedTransaction.status === 'pending' ? 'Menunggu' : 
                     selectedTransaction.status === 'verified' ? 'Terverifikasi' :
                     selectedTransaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status Verifikasi</p>
                  <p className="text-gray-800 font-semibold">
                    {selectedTransaction.verificationStatus === 'waiting_buyer' ? 'Menunggu Pembeli' :
                     selectedTransaction.verificationStatus === 'verified' ? 'Terverifikasi' : 'Ditolak'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CID (IPFS)</p>
                  <p className="text-gray-800 font-semibold">
                    {selectedTransaction.cid ? (
                      <a 
                        href={`https://ipfs.io/ipfs/${selectedTransaction.cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                        title={selectedTransaction.cid}
                      >
                        {selectedTransaction.cid.length > 24
                          ? `${selectedTransaction.cid.slice(0, 10)}...${selectedTransaction.cid.slice(-10)}`
                          : selectedTransaction.cid}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Catatan</p>
                  <p className="text-gray-800 font-semibold">{selectedTransaction.notes}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Autentikasi Diperlukan</h2>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Untuk mengakses transaksi, masukkan kode autentikasi Anda:
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Autentikasi</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  required
                />
                {authError && (
                  <p className="text-red-500 text-sm mt-1">{authError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => navigate('/peternak/dashboard')}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Autentikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default PeternakTransaksi;
