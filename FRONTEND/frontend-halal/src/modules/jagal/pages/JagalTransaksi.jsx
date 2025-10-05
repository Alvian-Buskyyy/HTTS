import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

const JagalTransaksi = () => {
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
    date: '',
    notes: ''
  });

  const [transactions, setTransactions] = useState([
    {
      id: 'TXN001',
      date: '2024-12-05',
      buyerId: 'PASAR_HEWAN-123',
      buyerName: 'Pasar Hewan Al-Falah',
      buyerType: 'PASAR_HEWAN',
      cattleId: 'SP001',
      quantity: 1,
      status: 'pending',
      verificationStatus: 'waiting_buyer',
      blockchainHash: '',
      verify: { sellerSigned: true, buyerSigned: false, code: '' },
      notes: 'Untuk acara qurban'
    },
    {
      id: 'TXN002',
      date: '2024-12-03',
      buyerId: 'JAGAL-125',
      buyerName: 'Jagal Berkah',
      buyerType: 'JAGAL',
      cattleId: 'SP002',
      quantity: 1,
      status: 'verified',
      verificationStatus: 'verified',
      blockchainHash: '0x1234...abcd',
      verify: { sellerSigned: true, buyerSigned: true, code: '654321' },
      notes: 'Transaksi normal'
    }
  ]);

  const [availableCattle, setAvailableCattle] = useState([]);

  useEffect(() => {
    // Prefer localStorage cattle list; fallback to sample data
    try {
      const raw = JSON.parse(localStorage.getItem('cattleList') || '[]');
      const mapped = raw.map(c => ({
        id: c.id,
        type: c.jenis === 'other' ? c.customJenis : c.jenis,
        gender: c.kelamin,
        birthDate: c.tanggalLahir || new Date().toISOString().split('T')[0],
        weight: Number(c.berat) || 0,
        healthStatus: c.healthStatus || 'sehat',
        availability: c.availability || 'available'
      }));
      setAvailableCattle(mapped.length ? mapped : [
        { id: 'SP001', type: 'Sapi Jantan', gender: 'Jantan', birthDate: '2021-03-15', weight: 450, healthStatus: 'sehat', availability: 'available' },
        { id: 'SP002', type: 'Sapi Betina', gender: 'Betina', birthDate: '2020-08-22', weight: 380, healthStatus: 'sehat', availability: 'available' },
        { id: 'KB001', type: 'Kambing Jantan', gender: 'Jantan', birthDate: '2022-01-10', weight: 65, healthStatus: 'perlu_periksa', availability: 'available' }
      ]);
    } catch {
      setAvailableCattle([
        { id: 'SP001', type: 'Sapi Jantan', gender: 'Jantan', birthDate: '2021-03-15', weight: 450, healthStatus: 'sehat', availability: 'available' },
        { id: 'SP002', type: 'Sapi Betina', gender: 'Betina', birthDate: '2020-08-22', weight: 380, healthStatus: 'sehat', availability: 'available' },
        { id: 'KB001', type: 'Kambing Jantan', gender: 'Jantan', birthDate: '2022-01-10', weight: 65, healthStatus: 'perlu_periksa', availability: 'available' }
      ]);
    }
  }, []);

  // Dynamic entity options (buyers and transfer recipients) loaded from backend
  const [buyers, setBuyers] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]);
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
              id: item.id,
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
          setEntitiesError('Gagal memuat daftar entitas.');
        }
      } catch (err) {
        setEntitiesError('Gagal memuat daftar entitas.');
      } finally {
        setEntitiesLoading(false);
      }
    };

    fetchAllEntities();
  }, []);

  const [newTransfer, setNewTransfer] = useState({ cattleId: '', recipient: '', date: '', notes: '' });
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Penyembelihan (slaughter) states
  const [slaughterForm, setSlaughterForm] = useState({ rphId: '', sapiId: '', distributorId: '', timestamp: '', berat: '', idPengecekanHalalSehat: '' });
  const [slaughterSuccess, setSlaughterSuccess] = useState(false);
  const [slaughters, setSlaughters] = useState([]);
  const [rphOptions] = useState([
    { id: 'RPH-001', name: 'RPH Barokah' },
    { id: 'RPH-002', name: 'RPH Makmur' },
    { id: 'RPH-003', name: 'RPH Sentosa' }
  ]);
  const [distributorOptions] = useState([
    { id: 'DIST-001', name: 'Distributor A' },
    { id: 'DIST-002', name: 'Distributor B' }
  ]);
  // Slaughter verification modal states
  const [showVerifySlaughterModal, setShowVerifySlaughterModal] = useState(false);
  const [verifyingSlaughter, setVerifyingSlaughter] = useState(null);
  const [verifySlaughterInputCode, setVerifySlaughterInputCode] = useState('');
  const [verifySlaughterError, setVerifySlaughterError] = useState('');
  const [verifySlaughterSuccess, setVerifySlaughterSuccess] = useState('');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const correctCode = '123456';
    if (authCode === correctCode) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError('');
      setAuthCode('');
      localStorage.setItem('transactionAuth', 'true');
      processPageSetup();
    } else {
      setAuthError('Kode autentikasi tidak valid. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) processPageSetup();
  }, [isAuthenticated]);

  useEffect(() => {
    const transactionAuth = localStorage.getItem('transactionAuth');
    if (transactionAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      const fromSidebar = localStorage.getItem('fromSidebar') === 'true';
      const fromDashboard = localStorage.getItem('showTransactionFromDashboard') === 'true';
      if (!fromSidebar && !fromDashboard) {
        setShowAuthModal(true);
        return;
      }
    }
    processPageSetup();
  }, []);

  const processPageSetup = () => {
    const storedCattle = localStorage.getItem('selectedCattleForSale');
    if (storedCattle) {
      try {
        const cattleData = JSON.parse(storedCattle);
        setNewTransaction(prev => ({ ...prev, cattleId: cattleData.id }));
        setShowTransactionForm(true);
        setActiveTab('sales');
        localStorage.removeItem('selectedCattleForSale');
      } catch (error) {
        console.error('Error parsing stored cattle data:', error);
      }
    }

    const showFromDashboard = localStorage.getItem('showTransactionFromDashboard');
    if (showFromDashboard === 'true') {
      setActiveTab('sales');
      setShowTransactionForm(true);
      localStorage.removeItem('showTransactionFromDashboard');
    }
    localStorage.removeItem('fromSidebar');
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleNewTransaction = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const buyer = buyers.find(b => b.id === newTransaction.buyerId);
      const pembeliType = buyer?.type || newTransaction.buyerType;
      const pembeliFields = {
        PETERNAK: { peternakPembeliId: buyer?.id },
        PASAR_HEWAN: { pasarHewanPembeliId: buyer?.id },
        JAGAL: { jagalPembeliId: buyer?.id },
        RPH: { rphPembeliId: buyer?.id },
        DISTRIBUTOR: { distributorPembeliId: buyer?.id },
        HOREKA: { horekaPembeliId: buyer?.id },
      }[pembeliType] || {};

      const payload = {
        penjualType: 'JAGAL',
        jagalPenjualId: user?.id,
        pembeliType,
        ...pembeliFields,
        sapiId: newTransaction.cattleId,
        jumlahQty: Number(newTransaction.quantity) || 1,
        type: 'SAPI',
        timestamp: newTransaction.date ? new Date(newTransaction.date).toISOString() : new Date().toISOString(),
        pengecekanSehatId: null,
      };

      const res = await fetch(`${API_BASE}/transaksiPenjualan`, { method: 'POST', headers, body: JSON.stringify(payload) });
      let created = null;
      if (res.ok) {
        created = await res.json();
      } else {
        const err = await res.json().catch(()=>({}));
        console.warn('Gagal kirim ke backend:', err?.error || res.statusText);
      }

      const txId = created?.id || `TXN00${transactions.length + 1}`;
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
        verificationStatus: 'waiting_buyer',
        blockchainHash: '',
        cid: created?.cid || undefined,
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

  const handleBuyerChange = (e) => {
    const buyerId = e.target.value;
    const selectedBuyer = buyers.find(b => b.id === buyerId);
    setNewTransaction({
      ...newTransaction,
      buyerId,
      buyerName: selectedBuyer?.name || '',
      buyerType: selectedBuyer?.type || ''
    });
  };

  const handleViewTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleCancelTransaction = (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) {
      setTransactions(transactions.map(t => t.id === transactionId ? { ...t, status: 'cancelled' } : t));
      alert('Transaksi berhasil dibatalkan');
    }
  };

  const handleRequestVerification = (transactionId) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;
    setVerifyingTx(tx);
    setVerifyInputCode('');
    setVerifyError('');
    setVerifySuccess('');
    if (!tx.verify || !tx.verify.code) {
      const code = (Math.floor(100000 + Math.random() * 900000)).toString();
      const updated = transactions.map(t => t.id === transactionId ? {
        ...t,
        verify: { sellerSigned: true, buyerSigned: false, code },
        verificationStatus: 'waiting_buyer'
      } : t);
      setTransactions(updated);
      setVerifyingTx({ ...tx, verify: { sellerSigned: true, buyerSigned: false, code } });
    }
    setShowVerifyModal(true);
  };

  const handleCopyCode = async () => {
    if (!verifyingTx?.verify?.code) return;
    try {
      await navigator.clipboard.writeText(verifyingTx.verify.code);
      setVerifySuccess('Kode disalin ke clipboard');
      setTimeout(()=> setVerifySuccess(''), 1500);
    } catch {
      setVerifyError('Gagal menyalin kode');
      setTimeout(()=> setVerifyError(''), 2000);
    }
  };

  const handleConfirmBuyer = () => {
    if (!verifyingTx) return;
    const expected = verifyingTx.verify?.code || '';
    if (verifyInputCode.trim() !== expected) {
      setVerifyError('Kode tidak cocok. Minta pembeli untuk memasukkan kode yang benar.');
      return;
    }
    const updated = transactions.map(t => t.id === verifyingTx.id ? {
      ...t,
      verificationStatus: 'verified',
      verify: { ...(t.verify||{}), buyerSigned: true },
      blockchainHash: t.blockchainHash || '0x' + Math.random().toString(16).slice(2,10) + '...' + Math.random().toString(16).slice(2,10)
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
  };

  const handleRejectVerification = () => {
    if (!verifyingTx) return;
    if (!window.confirm('Tolak verifikasi transaksi ini?')) return;
    const updated = transactions.map(t => t.id === verifyingTx.id ? { ...t, verificationStatus: 'rejected' } : t);
    setTransactions(updated);
    setShowVerifyModal(false);
    setVerifyingTx(null);
    setVerifyInputCode('');
    setVerifySuccess('');
    setVerifyError('');
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID');

  const getTransactionStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu</span>;
      case 'verified': return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Selesai</span>;
      case 'cancelled': return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Dibatalkan</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getVerificationBadge = (status) => {
    switch(status) {
      case 'waiting_buyer': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu Pembeli</span>;
      case 'verified': return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'rejected': return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const handleNewTransferSubmit = (e) => {
    e.preventDefault();
    if(!newTransfer.cattleId || !newTransfer.recipient) return;
    setTransferSuccess(true);
    setTimeout(()=> setTransferSuccess(false), 2200);
    setNewTransfer({ cattleId:'', recipient:'', date:'', notes:'' });
  };

  const handleSlaughterSubmit = (e) => {
    e.preventDefault();
    // Validate required fields: rphId, sapiId, berat
    if (!slaughterForm.rphId || !slaughterForm.sapiId || !slaughterForm.berat) {
      alert('Mohon lengkapi RPH, Sapi, dan Berat.');
      return;
    }
    const payload = {
      id: 'PMS-' + Date.now(),
      rphId: slaughterForm.rphId,
      jagalId: 'JAGAL-DEMO',
      distributorId: slaughterForm.distributorId || null,
      sapiId: slaughterForm.sapiId,
      timestamp: slaughterForm.timestamp || new Date().toISOString(),
      berat: Number(slaughterForm.berat),
      idPengecekanHalalSehat: slaughterForm.idPengecekanHalalSehat || 'ITEM-HALALSEHAT-DEMO',
      cid: 'bafy' + Math.random().toString(36).slice(2, 10),
      status: 'pending',
      verificationStatus: 'waiting_rph',
      blockchainHash: '',
      verify: { jagalSigned: true, rphSigned: false, code: '' }
    };
    setSlaughters(prev => [payload, ...prev]);
    setSlaughterSuccess(true);
    setTimeout(()=> setSlaughterSuccess(false), 1800);
    // Optionally mark sapi as processed in localStorage
    try {
      const cows = JSON.parse(localStorage.getItem('cattleList') || '[]');
      localStorage.setItem('cattleList', JSON.stringify(cows.map(c => c.id === slaughterForm.sapiId ? { ...c, availability: 'processed' } : c)));
    } catch {}
    setSlaughterForm({ rphId: '', sapiId: '', distributorId: '', timestamp: '', berat: '', idPengecekanHalalSehat: '' });
  };

  const getSlaughterVerificationBadge = (status) => {
    switch(status) {
      case 'waiting_rph': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu RPH</span>;
      case 'verified': return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'rejected': return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const handleRequestSlaughterVerification = (id) => {
    const tx = slaughters.find(s => s.id === id);
    if (!tx) return;
    setVerifyingSlaughter(tx);
    setVerifySlaughterInputCode('');
    setVerifySlaughterError('');
    setVerifySlaughterSuccess('');
    if (!tx.verify || !tx.verify.code) {
      const code = (Math.floor(100000 + Math.random() * 900000)).toString();
      const updated = slaughters.map(s => s.id === id ? {
        ...s,
        verify: { jagalSigned: true, rphSigned: false, code },
        verificationStatus: 'waiting_rph'
      } : s);
      setSlaughters(updated);
      setVerifyingSlaughter({ ...tx, verify: { jagalSigned: true, rphSigned: false, code } });
    }
    setShowVerifySlaughterModal(true);
  };

  const handleCopySlaughterCode = async () => {
    if (!verifyingSlaughter?.verify?.code) return;
    try {
      await navigator.clipboard.writeText(verifyingSlaughter.verify.code);
      setVerifySlaughterSuccess('Kode disalin ke clipboard');
      setTimeout(()=> setVerifySlaughterSuccess(''), 1500);
    } catch {
      setVerifySlaughterError('Gagal menyalin kode');
      setTimeout(()=> setVerifySlaughterError(''), 2000);
    }
  };

  const handleConfirmSlaughter = () => {
    if (!verifyingSlaughter) return;
    const expected = verifyingSlaughter.verify?.code || '';
    if (verifySlaughterInputCode.trim() !== expected) {
      setVerifySlaughterError('Kode tidak cocok. Minta RPH untuk memasukkan kode yang benar.');
      return;
    }
    const updated = slaughters.map(s => s.id === verifyingSlaughter.id ? {
      ...s,
      verificationStatus: 'verified',
      verify: { ...(s.verify||{}), rphSigned: true },
      blockchainHash: s.blockchainHash || '0x' + Math.random().toString(16).slice(2,10) + '...' + Math.random().toString(16).slice(2,10)
    } : s);
    setSlaughters(updated);
    setVerifySlaughterSuccess('Verifikasi berhasil. Transaksi penyembelihan ditandai sebagai terverifikasi.');
    setVerifySlaughterError('');
    setTimeout(()=>{
      setShowVerifySlaughterModal(false);
      setVerifyingSlaughter(null);
      setVerifySlaughterInputCode('');
      setVerifySlaughterSuccess('');
    }, 1200);
  };

  const handleRejectSlaughter = () => {
    if (!verifyingSlaughter) return;
    if (!window.confirm('Tolak verifikasi transaksi penyembelihan ini?')) return;
    const updated = slaughters.map(s => s.id === verifyingSlaughter.id ? { ...s, verificationStatus: 'rejected' } : s);
    setSlaughters(updated);
    setShowVerifySlaughterModal(false);
    setVerifyingSlaughter(null);
    setVerifySlaughterInputCode('');
    setVerifySlaughterSuccess('');
    setVerifySlaughterError('');
  };

  return (
    <DashboardLayout title="Transaksi Penjualan" role="JAGAL" customSidebar={<JagalSidebar /> }>
      <div className="mt-4 min-h-[70vh] overflow-y-auto pr-1">
        <div className="flex border-b border-gray-200 mb-8 gap-2">
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'sales' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => handleTabChange('sales')}>Transaksi Penjualan</button>
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'slaughter' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => handleTabChange('slaughter')}>Transaksi Penyembelihan</button>
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'verification' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => handleTabChange('verification')}>Verifikasi Transaksi</button>
          <button className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`} onClick={() => handleTabChange('history')}>Riwayat Transaksi</button>
        </div>

        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                        {availableCattle.filter(c=>c.availability==='available').map(c=> (
                          <option key={c.id} value={c.id}>{c.id} - {c.type} ({c.weight}kg)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan</label>
                      <select value={newTransfer.recipient} onChange={e=>setNewTransfer({...newTransfer, recipient:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                        <option value="">{entitiesLoading ? 'Memuat...' : 'Pilih Tujuan'}</option>
                        {entityOptions.map(ent => (
                          <option key={`${ent.type}:${ent.id}`} value={`${ent.type}:${ent.id}`}>
                            {ent.type} • {ent.name} (ID:{ent.id})
                          </option>
                        ))}
                      </select>
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
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">Ajukan Transfer</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Transaksi Penjualan</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm" onClick={() => setShowTransactionForm(!showTransactionForm)}>
                <i className="fas fa-plus mr-1"></i> {showTransactionForm ? 'Tutup Form' : 'Buat Transaksi Baru'}
              </button>
            </div>

            {showTransactionForm && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Form Transaksi</h3>
                <form onSubmit={handleNewTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
                      <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.buyerId} onChange={handleBuyerChange} required>
                        <option value="" disabled>{entitiesLoading ? 'Memuat...' : '-- Pilih Pembeli --'}</option>
                        {buyers.map(buyer => (<option key={`${buyer.type}:${buyer.id}`} value={buyer.id}>{buyer.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Entitas Pembeli</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" value={(newTransaction.buyerType || '').replace('_', ' ')} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sapi</label>
                      <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.cattleId} onChange={(e) => setNewTransaction({...newTransaction, cattleId: e.target.value})} required>
                        <option value="" disabled>-- Pilih Sapi --</option>
                        {availableCattle.map(cattle => (<option key={cattle.id} value={cattle.id}>{cattle.id} - {cattle.type}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                      <input type="number" min="1" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.quantity} onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value, 10)})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi</label>
                      <input type="date" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.date} onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                      <textarea rows="2" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.notes} onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm" onClick={() => setShowTransactionForm(false)}>Batal</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm"><i className="fas fa-save mr-1"></i> Simpan</button>
                  </div>
                </form>
              </div>
            )}

            {transactionSuccess && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <i className="fas fa-check-circle mr-2"></i>
                <span>Transaksi berhasil disimpan!</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <select className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={transactionFilter.status} onChange={(e) => setTransactionFilter({...transactionFilter, status: e.target.value})}>
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Verifikasi Pembeli</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="text" placeholder="Cari transaksi..." className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2" value={transactionFilter.search} onChange={(e) => setTransactionFilter({...transactionFilter, search: e.target.value})} />
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <i className="fas fa-search mr-1"></i> Cari
                </button>
              </div>
            </div>

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
                    .filter(t => transactionFilter.search === '' || t.id.toLowerCase().includes(transactionFilter.search.toLowerCase()) || t.buyerName.toLowerCase().includes(transactionFilter.search.toLowerCase()) || t.cattleId.toLowerCase().includes(transactionFilter.search.toLowerCase()) || (t.cid ? t.cid.toLowerCase().includes(transactionFilter.search.toLowerCase()) : false))
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
                              rel="noopener noreferrer"
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
                            <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>Detail</button>
                            {transaction.status === 'pending' && (
                              <button className="text-red-500 hover:text-red-700" onClick={() => handleCancelTransaction(transaction.id)}>Batal</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Verifikasi Transaksi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{transactions.filter(t => t.verificationStatus === 'waiting_buyer').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Terverifikasi</p>
                <p className="text-2xl font-semibold text-green-600">{transactions.filter(t => t.verificationStatus === 'verified').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-red-600">{transactions.filter(t => t.verificationStatus === 'rejected').length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(transaction.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {transaction.blockchainHash ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tercatat</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Belum</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {transaction.verificationStatus === 'waiting_buyer' && (
                            <>
                              <button className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10" onClick={() => handleRequestVerification(transaction.id)}>Verifikasi Bersama</button>
                              <button className="text-red-500 hover:text-red-700 text-xs" onClick={() => { setVerifyingTx(transaction); setShowVerifyModal(true); }}>Tolak</button>
                            </>
                          )}
                          <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>Detail</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-10 mb-6">Verifikasi Transaksi Penyembelihan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{slaughters.filter(s => s.verificationStatus === 'waiting_rph').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Terverifikasi</p>
                <p className="text-2xl font-semibold text-green-600">{slaughters.filter(s => s.verificationStatus === 'verified').length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-red-600">{slaughters.filter(s => s.verificationStatus === 'rejected').length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RPH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slaughters.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{s.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{new Date(s.timestamp).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{s.rphId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{s.sapiId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getSlaughterVerificationBadge(s.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {s.blockchainHash ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tercatat</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Belum</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {s.verificationStatus === 'waiting_rph' && (
                            <>
                              <button className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10" onClick={() => handleRequestSlaughterVerification(s.id)}>Verifikasi Bersama</button>
                              <button className="text-red-500 hover:text-red-700 text-xs" onClick={() => { setVerifyingSlaughter(s); setShowVerifySlaughterModal(true); }}>Tolak</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
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
                <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition text-sm"><i className="fas fa-download mr-1"></i> Export</button>
              </div>
            </div>

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
                          <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>Detail</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'slaughter' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-cut text-primary"></i> Transaksi Penyembelihan</h2>
              <p className="text-sm text-gray-500">Catat proses penyembelihan sapi ke RPH sesuai skema.</p>
            </div>
            {slaughterSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                <i className="fas fa-check-circle mr-1"></i> Transaksi penyembelihan disimpan.
              </div>
            )}
            <form onSubmit={handleSlaughterSubmit} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RPH</label>
                  <select value={slaughterForm.rphId} onChange={e=>setSlaughterForm({...slaughterForm, rphId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                    <option value="">Pilih RPH</option>
                    {rphOptions.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Sapi</label>
                  <select value={slaughterForm.sapiId} onChange={e=>setSlaughterForm({...slaughterForm, sapiId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                    <option value="">Pilih Sapi</option>
                    {availableCattle.filter(c=>c.availability==='available').map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat Daging (kg)</label>
                  <input type="number" min="1" value={slaughterForm.berat} onChange={e=>setSlaughterForm({...slaughterForm, berat:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distributor (Opsional)</label>
                  <select value={slaughterForm.distributorId} onChange={e=>setSlaughterForm({...slaughterForm, distributorId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Tidak ada</option>
                    {distributorOptions.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal/Waktu</label>
                  <input type="datetime-local" value={slaughterForm.timestamp} onChange={e=>setSlaughterForm({...slaughterForm, timestamp:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Pengecekan Halal-Sehat (Opsional)</label>
                  <input type="text" value={slaughterForm.idPengecekanHalalSehat} onChange={e=>setSlaughterForm({...slaughterForm, idPengecekanHalalSehat:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: IHS-001" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">Simpan</button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RPH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slaughters.length === 0 ? (
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-500" colSpan="6">Belum ada transaksi penyembelihan.</td>
                    </tr>
                  ) : (
                    slaughters.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.rphId}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.sapiId}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.berat} kg</td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {item.cid ? (
                            <a
                              href={`https://ipfs.io/ipfs/${item.cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              title={item.cid}
                            >
                              {item.cid.length > 18 ? `${item.cid.slice(0,8)}...${item.cid.slice(-8)}` : item.cid}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{new Date(item.timestamp).toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Detail Transaksi <span className="text-primary">{selectedTransaction.id}</span></h2>
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
                    <p className="text-gray-800 font-semibold">{selectedTransaction.status === 'pending' ? 'Menunggu' : selectedTransaction.status === 'verified' ? 'Terverifikasi' : selectedTransaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status Verifikasi</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.verificationStatus === 'waiting_buyer' ? 'Menunggu Pembeli' : selectedTransaction.verificationStatus === 'verified' ? 'Terverifikasi' : 'Ditolak'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.notes}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">CID (IPFS)</p>
                    {selectedTransaction.cid ? (
                      <a
                        href={`https://ipfs.io/ipfs/${selectedTransaction.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                        title={selectedTransaction.cid}
                      >
                        {selectedTransaction.cid.length > 24
                          ? `${selectedTransaction.cid.slice(0, 10)}...${selectedTransaction.cid.slice(-10)}`
                          : selectedTransaction.cid}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200" onClick={() => setShowDetailModal(false)}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        {showAuthModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Autentikasi Diperlukan</h2>
              </div>
              <form onSubmit={handleAuthSubmit} className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">Untuk mengakses transaksi, masukkan kode autentikasi Anda:</p>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Autentikasi</label>
                  <input type="password" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={authCode} onChange={(e) => setAuthCode(e.target.value)} required />
                  {authError && (<p className="text-red-500 text-sm mt-1">{authError}</p>)}
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => navigate('/jagal/dashboard')}>Kembali</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Autentikasi</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    <div className="text-2xl font-mono tracking-widest text-blue-700 text-center">{verifyingTx.verify?.code || '— — — — — —'}</div>
                    <button className="px-2 py-1 text-xs border border-blue-400 text-blue-600 rounded hover:bg-blue-100" onClick={handleCopyCode}>Salin</button>
                    {!verifyingTx.verify?.code && (
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
                  <button className={`px-4 py-2 rounded-md text-white ${/^[\d]{6}$/.test(verifyInputCode) ? 'bg-primary hover:bg-primaryDark' : 'bg-primary/60 cursor-not-allowed'}`} onClick={handleConfirmBuyer} disabled={!/^\d{6}$/.test(verifyInputCode)}>Verifikasi</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVerifySlaughterModal && verifyingSlaughter && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Verifikasi Penyembelihan</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={()=>{setShowVerifySlaughterModal(false); setVerifyingSlaughter(null);}}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Transaksi:</span> {verifyingSlaughter.id}</p>
                  <p><span className="font-medium">RPH:</span> {verifyingSlaughter.rphId}</p>
                  <p><span className="font-medium">Sapi:</span> {verifyingSlaughter.sapiId}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800 mb-2"><i className="fas fa-shield-alt mr-2"></i>Kode Verifikasi Bersama</p>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-3 text-center">
                    <div className="text-2xl font-mono tracking-widest text-blue-700 text-center">{verifyingSlaughter.verify?.code || '— — — — — —'}</div>
                    <button className="px-2 py-1 text-xs border border-blue-400 text-blue-600 rounded hover:bg-blue-100" onClick={handleCopySlaughterCode}>Salin</button>
                    {!verifyingSlaughter.verify?.code && (
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" onClick={()=>handleRequestSlaughterVerification(verifyingSlaughter.id)}>Buat Kode</button>
                    )}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">Bagikan kode ini kepada RPH untuk konfirmasi. Pihak RPH harus mengirimkan kembali kode yang sama.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Kode dari RPH</label>
                  <input value={verifySlaughterInputCode} onChange={e=>setVerifySlaughterInputCode(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="6 digit" />
                  {verifySlaughterError && <p className="text-sm text-red-600 mt-1">{verifySlaughterError}</p>}
                  {verifySlaughterSuccess && <p className="text-sm text-green-600 mt-1">{verifySlaughterSuccess}</p>}
                  {!verifySlaughterError && !verifySlaughterSuccess && verifySlaughterInputCode && verifySlaughterInputCode.length < 6 && (
                    <p className="text-xs text-gray-500 mt-1">Masukkan 6 digit kode</p>
                  )}
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <button className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50" onClick={handleRejectSlaughter}>Tolak</button>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50" onClick={()=>{setShowVerifySlaughterModal(false); setVerifyingSlaughter(null);}}>Batal</button>
                  <button className={`px-4 py-2 rounded-md text-white ${/^[\d]{6}$/.test(verifySlaughterInputCode) ? 'bg-primary hover:bg-primaryDark' : 'bg-primary/60 cursor-not-allowed'}`} onClick={handleConfirmSlaughter} disabled={!/^\d{6}$/.test(verifySlaughterInputCode)}>Verifikasi</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JagalTransaksi;
