import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import ModalCard from '../../../components/ModalCard';
import SupplyChainTracker from '../../peternak/components/SupplyChainTracker';

// CSS untuk animasi loading
const loadingCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .loader {
    border-top-color: #60A5FA;
    animation: spin 1s linear infinite;
  }
`;

const PasarHewanDashboard = ({ initialSection = 'dashboard' }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeTab, setActiveTab] = useState('sales');
  const [showCattleModal, setShowCattleModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // Edit cattle modal state
  const [showEditCattleModal, setShowEditCattleModal] = useState(false);
  const [editCattle, setEditCattle] = useState(null);
  const [editSaveSuccess, setEditSaveSuccess] = useState('');
  const [showNewTransactionForm, setShowNewTransactionForm] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    buyerId: '',
    buyerName: '',
    buyerType: '',
    cattleId: '',
    quantity: 1,
    notes: ''
    
  });
  const [transactionFilter, setTransactionFilter] = useState({
    status: 'all',
    verificationStatus: 'all',
    search: ''
  });
  const [availableCattle, setAvailableCattle] = useState([]);
  const [stats, setStats] = useState({
    totalSapi: 0,
    sapiBaru: 0,
    sapiTerjual: 0,
    periksaKesehatan: 0,
  });
  
  // State untuk data ternak yang diambil dari localStorage
  const [cattleData, setCattleData] = useState([]);

  // Sample transaction data
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN001',
      date: '2025-07-05',
      buyerId: 'PASAR_HEWAN-123',
      buyerName: 'Pasar Hewan Al-Falah',
      buyerType: 'PASAR_HEWAN',
      cattleId: 'SP001',
      quantity: 1,
      status: 'pending',
      verificationStatus: 'waiting_buyer',
      blockchainHash: '',
      notes: 'Untuk acara qurban'
    },
    {
      id: 'TXN002',
      date: '2025-07-03',
      buyerId: 'JAGAL-125',
      buyerName: 'Jagal Berkah',
      buyerType: 'JAGAL',
      cattleId: 'SP002',
      quantity: 1,
      status: 'verified',
      verificationStatus: 'verified',
      blockchainHash: '0x1234...abcd',
      notes: 'Transaksi normal'
    },
    {
      id: 'TXN003',
      date: '2025-07-01',
      buyerId: 'RPH-126',
      buyerName: 'RPH Al-Baraka',
      buyerType: 'RPH',
      cattleId: 'KB001',
      quantity: 1,
      status: 'rejected',
      verificationStatus: 'rejected',
      blockchainHash: '',
      notes: 'Pembayaran tidak sesuai',
      rejectionReason: 'Dokumen tidak lengkap'
    }
  ]);

  // Sample health records
  const [healthRecords, setHealthRecords] = useState([
    {
      cattleId: 'SP001',
      date: '2025-07-01',
      examType: 'rutin',
      healthStatus: 'sehat',
      veterinarian: 'Dr. Ahmad Suharto',
      cost: 150000,
      diagnosis: 'Kondisi sehat, tidak ada masalah yang ditemukan',
      treatment: 'Vitamin dan mineral'
    },
    {
      cattleId: 'KB001',
      date: '2025-06-28',
      examType: 'vaksinasi',
      healthStatus: 'sehat',
      veterinarian: 'Dr. Siti Nurhaliza',
      cost: 75000,
      diagnosis: 'Vaksinasi rutin berhasil',
      treatment: 'Vaksin PMK'
    }
  ]); // fixed missing closing bracket
  
  // State for authentication and transaction modal
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [targetSection, setTargetSection] = useState('');
  
  // Navigation between sections with authentication
  const showSection = (sectionName) => {
    // If navigating to transactions section, check authentication
    if (sectionName === 'transactions') {
      if (isAuthenticated) {
        // Already authenticated, navigate directly to transaction page
        localStorage.setItem('showTransactionFromDashboard', 'true');
  navigate('/pasarhewan/transfer');
      } else {
        // Need authentication first
        setTargetSection(sectionName); // Store the target section
        setShowAuthModal(true); // Show authentication modal
      }
    } else {
      // Direct navigation for all other sections
      if (sectionName === 'dashboard') {
        navigate('/pasarhewan/dashboard');
      } else if (sectionName === 'sapi') {
  navigate('/pasarhewan/ternak');
      } else if (sectionName === 'daftar-ternak') {
  navigate('/pasarhewan/ternak');
      } else if (sectionName === 'profil') {
  navigate('/pasarhewan/profile');
      } else {
        setActiveSection(sectionName); // Fallback to current section switching
      }
    }
  };
  
  // Handle authentication submission
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    const correctCode = '123456'; // In real app, this should be from backend
    
    if (authCode === correctCode) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError('');
      setAuthCode('');
      
      // Store authentication state in localStorage
      localStorage.setItem('transactionAuth', 'true');
      
      // Set flag for dashboard navigation
      localStorage.setItem('showTransactionFromDashboard', 'true');
      
      // Navigate directly to the transaction page
  navigate('/pasarhewan/transfer');
    } else {
      setAuthError('Kode autentikasi tidak valid. Silakan coba lagi.');
    }
  };
  
  // Switch between tabs
  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };
  
  // Handle cattle detail modal
  const viewCattleDetail = (cattleId) => {
    const cattle = cattleData.find(c => c.id === cattleId);
    if (cattle) {
      setSelectedCattle(cattle);
      setShowCattleModal(true);
    }
  };
  // Open edit cattle modal
  const openEditCattle = (cattleId) => {
    const cattle = cattleData.find(c => c.id === cattleId);
    if (cattle) {
      setEditCattle({ ...cattle });
      setShowEditCattleModal(true);
    }
  };
  
  // Handle transaction detail modal
  const viewTransactionDetail = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setShowTransactionModal(true);
    }
  };
  
  // Close modals
  const closeCattleModal = () => {
    setShowCattleModal(false);
    setSelectedCattle(null);
  };
  
  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };
  const closeEditCattleModal = () => {
    setShowEditCattleModal(false);
    setEditCattle(null);
    setEditSaveSuccess('');
  };

  // Edit helpers
  const handleEditChange = (field, value) => {
    setEditCattle(prev => ({ ...prev, [field]: value }));
  };

  const recomputeStats = (list) => {
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    return {
      totalSapi: list.length,
      sapiBaru: list.filter(c => new Date(c.birthDate) > oneMonthAgo).length,
      sapiTerjual: list.filter(c => c.availability === 'sold').length,
      periksaKesehatan: list.filter(c => c.healthStatus === 'perlu_periksa' || c.healthStatus === 'sakit').length,
    };
  };

  const handleSaveEdit = () => {
    if (!editCattle) return;
    if (!editCattle.type || !editCattle.gender) {
      alert('Jenis dan Jenis Kelamin wajib diisi');
      return;
    }

    try {
      const knownTypes = ['Sapi Limosin','Sapi Simental','Sapi Brahman','Sapi PO','Sapi Bali','Sapi Madura','Sapi Angus','Sapi BX'];
      const isKnown = knownTypes.includes(editCattle.type);

      // Update raw structure in localStorage
      const storedJSON = localStorage.getItem('cattleList');
      let raw = [];
      if (storedJSON) raw = JSON.parse(storedJSON);
      const updatedRaw = raw.map(item => {
        if (item.id === editCattle.id) {
          return {
            ...item,
            id: editCattle.id,
            jenis: isKnown ? editCattle.type : 'other',
            customJenis: isKnown ? '' : editCattle.type,
            kelamin: editCattle.gender,
            tanggalLahir: editCattle.birthDate,
            berat: Number(editCattle.weight) || 0,
            healthStatus: editCattle.healthStatus,
            availability: editCattle.availability,
            origin: editCattle.origin,
            motherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.motherId || '') : '',
            fatherId: editCattle.origin === 'lahir_sendiri' ? (editCattle.fatherId || '') : '',
            usia: Number(editCattle.age) || 0
          };
        }
        return item;
      });
      localStorage.setItem('cattleList', JSON.stringify(updatedRaw));

      // Update UI state mapping
      const updatedUI = cattleData.map(c => c.id === editCattle.id ? {
        ...c,
        type: editCattle.type,
        gender: editCattle.gender,
        age: Number(editCattle.age) || 0,
        weight: Number(editCattle.weight) || 0,
        birthDate: editCattle.birthDate,
        healthStatus: editCattle.healthStatus,
        availability: editCattle.availability,
        origin: editCattle.origin,
        motherId: editCattle.origin === 'lahir_sendiri' ? editCattle.motherId : '',
        fatherId: editCattle.origin === 'lahir_sendiri' ? editCattle.fatherId : ''
      } : c);
      setCattleData(updatedUI);
      setStats(recomputeStats(updatedUI));

      setEditSaveSuccess('Perubahan berhasil disimpan.');
      // Close modal after brief delay
      setTimeout(() => {
        setEditSaveSuccess('');
        closeEditCattleModal();
      }, 1200);
    } catch (e) {
      console.error('Error saving edit:', e);
      alert('Gagal menyimpan perubahan.');
    }
  };
  
  // Request verification for a transaction
  const requestVerification = (transactionId) => {
    // In a real implementation, this would make an API call to request verification
    console.log(`Requesting verification for transaction ${transactionId}`);
    
    // Update the local state to show a notification or update the UI
    // Here we'll just show an alert for demonstration
    alert(`Permintaan verifikasi telah dikirim untuk transaksi: ${transactionId}`);
    
    // Optionally update the transaction status if needed
    /*
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, verificationRequested: true };
      }
      return t;
    }));
    */
  };
  
  // Format buyer type for display
  const formatBuyerType = (buyerType) => {
    const typeMap = {
      'PASAR_HEWAN': 'Pasar Hewan',
      'JAGAL': 'Jagal',
      'RPH': 'Rumah Potong Hewan'
    };
    return typeMap[buyerType] || buyerType;
  };
  
  // Handle transaction form submission
  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would submit this data to your API
    console.log('Submitting transaction:', newTransaction);
    
    // Create a new transaction
    const transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      buyerId: newTransaction.buyerId,
      buyerName: newTransaction.buyerName,
      buyerType: newTransaction.buyerType,
      cattleId: newTransaction.cattleId,
      quantity: newTransaction.quantity,
      notes: newTransaction.notes,
      status: 'pending',
      verificationStatus: 'waiting_buyer'
    };
    
    // Add to transactions array (would be API call in real app)
    setTransactions([transaction, ...transactions]);
    
    // Reset form
    setNewTransaction({
      buyerId: '',
      buyerName: '',
      buyerType: '',
      cattleId: '',
      quantity: 1,
      notes: ''
    });
    
    // Close form and show success message
    setShowNewTransactionForm(false);
    setTransactionSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setTransactionSuccess(false);
    }, 3000);
  };
  
  // Handle transaction search
  const handleTransactionSearch = () => {
    // In a real app, this would filter based on API data
    console.log('Searching with filters:', transactionFilter);
    
    // Example implementation - filter transactions based on status and search term
    let filtered = [...transactions];
    
    if (transactionFilter.status !== 'all') {
      filtered = filtered.filter(t => t.status === transactionFilter.status);
    }
    
    if (transactionFilter.search) {
      const searchLower = transactionFilter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchLower) ||
        t.buyerName.toLowerCase().includes(searchLower) ||
        t.cattleId.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    // In a real app, you would update state or fetch from API with filters
  };
  
  useEffect(() => {
    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
    
    // Check if user is already authenticated for transactions
    const isAuth = localStorage.getItem('transactionAuth') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
    
    // Mengambil data ternak dari localStorage
    const fetchCattleData = () => {
      setTimeout(() => {
        try {
          const storedCattleJSON = localStorage.getItem('cattleList');
          let cattleList = [];
          
          if (storedCattleJSON) {
            const storedCattle = JSON.parse(storedCattleJSON);
            
            if (storedCattle.length > 0) {
              // Map stored data to match our UI structure
              cattleList = storedCattle.map(cattle => ({
                id: cattle.id || `SP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                type: cattle.jenis === 'other' ? cattle.customJenis : cattle.jenis,
                gender: cattle.kelamin,
                birthDate: cattle.tanggalLahir || new Date().toISOString().split('T')[0],
                weight: parseFloat(cattle.berat) || 0,
                healthStatus: cattle.healthStatus || 'sehat',
                availability: cattle.availability || 'available',
                motherId: cattle.motherId || '',
                fatherId: cattle.fatherId || '',
                origin: cattle.origin || 'beli',
                age: parseFloat(cattle.usia) || 0
              }));
              
              // Sort by ID for consistency
              cattleList.sort((a, b) => a.id.localeCompare(b.id));
            }
          }
          
          setCattleData(cattleList);
          
          // Set statistics based on cattle data
          const currentDate = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(currentDate.getMonth() - 1);
          
          setStats({
            totalSapi: cattleList.length,
            sapiBaru: cattleList.filter(c => new Date(c.birthDate) > oneMonthAgo).length,
            sapiTerjual: cattleList.filter(c => c.availability === 'sold').length,
            periksaKesehatan: cattleList.filter(c => c.healthStatus === 'perlu_periksa' || c.healthStatus === 'sakit').length,
          });
          
          // Set available cattle for transaction form
          const available = cattleList.filter(c => c.availability === 'available');
          setAvailableCattle(available);
        
          setLoading(false);
        } catch (error) {
          console.error('Error loading cattle data:', error);
          setLoading(false);
          setStats({
            totalSapi: 0,
            sapiBaru: 0,
            sapiTerjual: 0,
            periksaKesehatan: 0,
          });
        }
      }, 1000);
    };
    
    fetchCattleData();
  }, []);

  // Utility components
  const StatCard = ({ title, value, icon, desc, color = 'primary' }) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return (
      <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}> 
          <i className={`${icon} text-xl`}></i>
        </div>
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
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <i className={`${icon} text-2xl text-gray-400`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">{desc}</p>
      {action}
    </div>
  );

  // Utility functions for badge rendering
  const getHealthStatusBadge = (status) => {
    const badges = {
      'sehat': 'bg-green-100 text-green-800',
      'perlu_periksa': 'bg-yellow-100 text-yellow-800',
      'sakit': 'bg-red-100 text-red-800'
    };
    const labels = {
      'sehat': 'Sehat',
      'perlu_periksa': 'Perlu Periksa',
      'sakit': 'Sakit'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges['sehat']}`}>
        {labels[status] || labels['sehat']}
      </span>
    );
  };
  
  const getAvailabilityBadge = (availability) => {
    const badges = {
      'available': 'bg-green-100 text-green-800',
      'sold': 'bg-gray-100 text-gray-800',
      'in_transaction': 'bg-blue-100 text-blue-800'
    };
    const labels = {
      'available': 'Tersedia',
      'sold': 'Terjual',
      'in_transaction': 'Dalam Transaksi'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[availability] || badges['available']}`}>
        {labels[availability] || labels['available']}
      </span>
    );
  };
  
  const getTransactionStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    const labels = {
      'pending': 'Menunggu',
      'verified': 'Terverifikasi',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges['pending']}`}>
        {labels[status] || labels['pending']}
      </span>
    );
  };
  
  const getVerificationBadge = (status) => {
    const badges = {
      'waiting_buyer': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    const labels = {
      'waiting_buyer': 'Menunggu Pembeli',
      'verified': 'Terverifikasi',
      'rejected': 'Ditolak'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges['waiting_buyer']}`}>
        {labels[status] || labels['waiting_buyer']}
      </span>
    );
  };
  
  const getExamTypeBadge = (type) => {
    const badges = {
      'rutin': 'bg-blue-100 text-blue-800',
      'vaksinasi': 'bg-green-100 text-green-800',
      'pengobatan': 'bg-yellow-100 text-yellow-800',
      'darurat': 'bg-red-100 text-red-800'
    };
    const labels = {
      'rutin': 'Rutin',
      'vaksinasi': 'Vaksinasi',
      'pengobatan': 'Pengobatan',
      'darurat': 'Darurat'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[type] || badges['rutin']}`}>
        {labels[type] || labels['rutin']}
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <DashboardLayout title="Dasbor Pasar Hewan" role="PASAR_HEWAN">
      <style>{loadingCSS}</style>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-4 md:p-6 space-y-8">{/* reduced top margin from mt-8 to mt-4 */}
          {/* HEADER + STATS */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-800 tracking-tight m-0">Ringkasan Pasar Hewan</h1>
                  <p className="text-sm text-gray-500 m-0 leading-snug">Pantau kondisi ternak dan aktivitas terbaru Anda.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/pasarhewan/ternak" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primaryDark flex items-center gap-2">
                    <i className="fas fa-plus"></i> Tambah Ternak
                  </Link>
                  <Link to="/pasarhewan/transfer" onClick={() => localStorage.setItem('transactionAuth','true')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-2">
                    <i className="fas fa-exchange-alt"></i> Transaksi
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard title="Total Ternak" value={stats.totalSapi} icon="fas fa-cow" color="primary" desc="Semua jenis" />
                <StatCard title="Baru Lahir" value={stats.sapiBaru} icon="fas fa-baby-carriage" color="green" desc="30 hari terakhir" />
                <StatCard title="Terjual" value={stats.sapiTerjual} icon="fas fa-exchange-alt" color="blue" desc="Bulan ini" />
                <StatCard title="Perlu Periksa" value={stats.periksaKesehatan} icon="fas fa-heartbeat" color="red" desc="Butuh perhatian" />
              </div>

              {/* Rantai Pasok Realtime */}
              <SupplyChainTracker cattleOptions={cattleData} />

              {/* INVENTARIS RINGKAS */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-clipboard-list text-primary"></i> Inventaris Ternak</h2>
                  <Link to="/pasarhewan/ternak" className="text-primary text-sm hover:underline flex items-center gap-1"><i className="fas fa-eye"></i> Lihat Semua</Link>
                </div>
                {cattleData.length === 0 ? (
                  <EmptyState icon="fas fa-cow" title="Belum Ada Data Ternak" desc="Tambahkan ternak pertama Anda untuk mulai memantau kesehatan dan transaksi." action={<Link to="/pasarhewan/ternak" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"><i className="fas fa-plus mr-1"></i> Tambah Ternak</Link>} />
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

              {/* AKTIVITAS & QR */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-history text-primary"></i> Aktivitas Terbaru</h2>
                      <Link to="/pasarhewan/activities" className="text-primary text-xs hover:underline">Lihat Semua</Link>
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
                        <div className="bg-gray-100 w-40 h-40 flex items-center justify-center rounded-lg">
                          <i className="fas fa-qrcode text-5xl text-primary"></i>
                        </div>
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
            </div>
          )}
          
          {/* Inventaris Ternak Section */}
          {activeSection === 'cattle' && (
            <div>
              <h1 className="text-2xl font-semibold text-blue-600 mb-6">Inventaris Ternak</h1>
              {/* Rantai Pasok Realtime */}
              <div className="mb-6">
                <SupplyChainTracker cattleOptions={cattleData} />
              </div>
              {/* Filter dan Statistik */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-grow text-left">
                      <p className="text-sm text-gray-500">Total Ternak</p>
                      <p className="text-2xl font-semibold text-gray-800">{stats.totalSapi}</p>
                    </div>
                    <i className="fas fa-cow text-primary text-2xl"></i>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-grow text-left">
                      <p className="text-sm text-gray-500">Tersedia Jual</p>
                      <p className="text-2xl font-semibold text-green-600">18</p>
                    </div>
                    <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-grow text-left">
                      <p className="text-sm text-gray-500">Dalam Transaksi</p>
                      <p className="text-2xl font-semibold text-blue-600">5</p>
                    </div>
                    <i className="fas fa-handshake text-blue-500 text-2xl"></i>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-grow text-left">
                      <p className="text-sm text-gray-500">Perlu Periksa</p>
                      <p className="text-2xl font-semibold text-red-600">5</p>
                    </div>
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                </div>
              </div>

              {/* Filter dan Pencarian */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Ternak</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Semua Jenis</option>
                      <option value="sapi">Sapi</option>
                      <option value="kambing">Kambing</option>
                      <option value="domba">Domba</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Kesehatan</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Semua Status</option>
                      <option value="sehat">Sehat</option>
                      <option value="perlu_periksa">Perlu Diperiksa</option>
                      <option value="sakit">Sakit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ketersediaan</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Semua</option>
                      <option value="available">Tersedia</option>
                      <option value="sold">Terjual</option>
                      <option value="in_transaction">Dalam Transaksi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
                    <input type="text" placeholder="Cari ID, jenis..." className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>

              {/* Tabel Detail Inventaris */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Detail Inventaris</h2>
                  <Link 
                    to="/pasarhewan/ternak"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm inline-block"
                  >
                    <i className="fas fa-plus mr-1"></i> Tambah Ternak Baru
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kesehatan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ketersediaan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cattleData.map(cattle => (
                        <tr key={cattle.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cattle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cattle.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cattle.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cattle.age} tahun</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cattle.weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getHealthStatusBadge(cattle.healthStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getAvailabilityBadge(cattle.availability)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-primary hover:text-primaryDark mr-2" 
                              onClick={() => viewCattleDetail(cattle.id)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-800 mr-2" onClick={() => openEditCattle(cattle.id)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Daftar Ternak Baru Section */}
          {activeSection === 'register' && (
            <div>
              <h1 className="text-2xl font-semibold text-blue-600 mb-6">Daftar Ternak Baru</h1>
              
              {/* Form Pendaftaran */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Formulir Pendaftaran Ternak</h2>
                
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasi Dasar */}
                    <div className="md:col-span-2">
                      <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">Informasi Dasar</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Ternak <span className="text-red-500">*</span></label>
                      <select required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">-- Pilih Jenis --</option>
                        <option value="sapi_jantan">Sapi Jantan</option>
                        <option value="sapi_betina">Sapi Betina</option>
                        <option value="anak_sapi">Anak Sapi</option>
                        <option value="kambing_jantan">Kambing Jantan</option>
                        <option value="kambing_betina">Kambing Betina</option>
                        <option value="domba_jantan">Domba Jantan</option>
                        <option value="domba_betina">Domba Betina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin <span className="text-red-500">*</span></label>
                      <select required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">-- Pilih Kelamin --</option>
                        <option value="jantan">Jantan</option>
                        <option value="betina">Betina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                      <input type="date" required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Berat (kg) <span className="text-red-500">*</span></label>
                      <input type="number" required min="1" step="0.1" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    {/* Informasi Kesehatan */}
                    <div className="md:col-span-2">
                      <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">Informasi Kesehatan</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status Kesehatan <span className="text-red-500">*</span></label>
                      <select required className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">-- Pilih Status --</option>
                        <option value="sehat">Sehat</option>
                        <option value="perlu_periksa">Perlu Diperiksa</option>
                        <option value="sakit">Sakit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Kesehatan</label>
                      <textarea className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" rows="3"></textarea>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Link to="/pasarhewan/dashboard" className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 mr-4 inline-block">
                      Kembali ke Dashboard
                    </Link>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark">
                      Daftar Ternak
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Transaksi Penjualan Section */}
          {activeSection === 'transactions' && (
            <div>
              <h1 className="text-2xl font-semibold text-blue-600 mb-6">Transaksi Penjualan</h1>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex -mb-px">
                  <button
                    onClick={() => switchTab('sales')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'sales'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Penjualan
                  </button>
                  <button
                    onClick={() => switchTab('verification')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'verification'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Verifikasi
                  </button>
                  <button
                    onClick={() => switchTab('history')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Riwayat
                  </button>
                </div>
              </div>
              
              {/* Tab Contents */}
              <div className={`${activeTab === 'sales' ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-blue-600">Transaksi Penjualan</h3>
                    <button 
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
                      onClick={() => setShowNewTransactionForm(!showNewTransactionForm)}
                    >
                      <i className="fas fa-plus mr-1"></i> Buat Transaksi Baru
                    </button>
                  </div>
                  
                  {/* Form Transaksi Baru */}
                  {showNewTransactionForm && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                      <h3 className="text-md font-semibold text-blue-600 mb-4">Buat Transaksi Penjualan Baru</h3>
                      <form onSubmit={handleTransactionSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
                            <select 
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                              value={newTransaction.buyerId}
                              onChange={(e) => {
                                const selectedOption = e.target.options[e.target.selectedIndex];
                                const buyerName = selectedOption.getAttribute('data-name') || '';
                                const buyerType = selectedOption.getAttribute('data-type') || '';
                                setNewTransaction({
                                  ...newTransaction,
                                  buyerId: e.target.value,
                                  buyerName: buyerName,
                                  buyerType: buyerType
                                });
                              }}
                              required
                            >
                              <option value="" disabled>-- Pilih Pembeli --</option>
                              <option value="PASAR_HEWAN-123" data-name="Pasar Hewan Al-Falah" data-type="PASAR_HEWAN">Pasar Hewan Al-Falah</option>
                              <option value="PASAR_HEWAN-124" data-name="Pasar Hewan Baraka" data-type="PASAR_HEWAN">Pasar Hewan Baraka</option>
                              <option value="JAGAL-125" data-name="Jagal Berkah" data-type="JAGAL">Jagal Berkah</option>
                              <option value="RPH-126" data-name="RPH Al-Baraka" data-type="RPH">RPH Al-Baraka</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Entitas Pembeli</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" 
                              value={newTransaction.buyerType ? formatBuyerType(newTransaction.buyerType) : ''}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Ternak</label>
                            <select 
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                              value={newTransaction.cattleId}
                              onChange={(e) => setNewTransaction({...newTransaction, cattleId: e.target.value})}
                              required
                            >
                              <option value="" disabled>-- Pilih Ternak --</option>
                              {availableCattle.map(cattle => (
                                <option key={cattle.id} value={cattle.id}>
                                  {cattle.id} - {cattle.type} ({cattle.gender})
                                </option>
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
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Transaksi</label>
                            <textarea 
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="2"
                              value={newTransaction.notes}
                              onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button 
                            type="button" 
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                            onClick={() => setShowNewTransactionForm(false)}
                          >
                            Batal
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm"
                          >
                            <i className="fas fa-save mr-1"></i> Simpan Transaksi
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
                      <button 
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
                        onClick={handleTransactionSearch}
                      >
                        <i className="fas fa-search mr-1"></i> Cari
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-600">Transaksi Aktif</h3>
                    <Link to="/pasarhewan/transfer" className="text-primary hover:underline text-sm font-medium">
                      <i className="fas fa-eye mr-1"></i> Lihat Semua
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(transaction => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.buyerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.cattleId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getTransactionStatusBadge(transaction.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getVerificationBadge(transaction.verificationStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                              <button 
                                className="text-primary hover:text-primaryDark mr-2" 
                                onClick={() => viewTransactionDetail(transaction.id)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {transaction.status === 'pending' && (
                                <button className="text-red-600 hover:text-red-800">
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className={`${activeTab === 'verification' ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-6">Verifikasi Transaksi</h3>
                  
                  {/* Statistik Verifikasi */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <i className="fas fa-hourglass-half text-yellow-500 text-3xl mr-3"></i>
                        <div>
                          <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                          <p className="text-2xl font-semibold text-yellow-600">
                            {transactions.filter(t => t.verificationStatus === 'waiting_buyer').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <i className="fas fa-check-circle text-green-500 text-3xl mr-3"></i>
                        <div>
                          <p className="text-sm text-gray-500">Terverifikasi</p>
                          <p className="text-2xl font-semibold text-green-600">
                            {transactions.filter(t => t.verificationStatus === 'verified').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6 text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <i className="fas fa-times-circle text-red-500 text-3xl mr-3"></i>
                        <div>
                          <p className="text-sm text-gray-500">Ditolak</p>
                          <p className="text-2xl font-semibold text-red-600">
                            {transactions.filter(t => t.verificationStatus === 'rejected').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filter dan Pencarian */}
                  <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <select 
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={transactionFilter.verificationStatus}
                        onChange={(e) => setTransactionFilter({...transactionFilter, verificationStatus: e.target.value})}
                      >
                        <option value="all">Semua Status</option>
                        <option value="waiting_buyer">Menunggu Verifikasi</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="rejected">Ditolak</option>
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
                      <button 
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
                        onClick={handleTransactionSearch}
                      >
                        <i className="fas fa-search mr-1"></i> Cari
                      </button>
                    </div>
                  </div>
                  
                  {/* Tabel Verifikasi */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ternak</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions
                          .filter(transaction => {
                            // Filter by verification status
                            if (transactionFilter.verificationStatus && transactionFilter.verificationStatus !== 'all') {
                              if (transaction.verificationStatus !== transactionFilter.verificationStatus) return false;
                            }
                            
                            // Filter by search term
                            if (transactionFilter.search) {
                              const searchTerm = transactionFilter.search.toLowerCase();
                              return (
                                transaction.id.toLowerCase().includes(searchTerm) ||
                                transaction.buyerName.toLowerCase().includes(searchTerm) ||
                                transaction.cattleId.toLowerCase().includes(searchTerm)
                              );
                            }
                            
                            return true;
                          })
                          .map(transaction => (
                          <tr key={transaction.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.buyerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.cattleId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getVerificationBadge(transaction.verificationStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.blockchainHash ? 
                                <a href="#" className="text-primary hover:text-primaryDark truncate max-w-[100px] inline-block">{transaction.blockchainHash}</a> :
                                'Belum ada'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                              {transaction.verificationStatus === 'waiting_buyer' && (
                                <button 
                                  className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primaryDark mr-1"
                                  onClick={() => requestVerification(transaction.id)}
                                >
                                  Minta Verifikasi
                                </button>
                              )}
                              <button 
                                className="text-primary hover:text-primaryDark" 
                                onClick={() => viewTransactionDetail(transaction.id)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {transactions.filter(t => {
                          if (transactionFilter.verificationStatus && transactionFilter.verificationStatus !== 'all') {
                            if (t.verificationStatus !== transactionFilter.verificationStatus) return false;
                          }
                          
                          if (transactionFilter.search) {
                            const searchTerm = transactionFilter.search.toLowerCase();
                            return (
                              t.id.toLowerCase().includes(searchTerm) ||
                              t.buyerName.toLowerCase().includes(searchTerm) ||
                              t.cattleId.toLowerCase().includes(searchTerm)
                            );
                          }
                          
                          return true;
                        }).length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                              Tidak ada transaksi yang memenuhi filter
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className={`${activeTab === 'history' ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-6">Riwayat Transaksi</h3>
                  
                  {/* Filter dan Pencarian */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                      <select 
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={transactionFilter.status}
                        onChange={(e) => setTransactionFilter({...transactionFilter, status: e.target.value})}
                      >
                        <option value="all">Semua Status</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="month" 
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" 
                        value={transactionFilter.month || ''}
                        onChange={(e) => setTransactionFilter({...transactionFilter, month: e.target.value})}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex w-full md:w-96 ml-auto">
                        <input 
                          type="text" 
                          placeholder="Cari transaksi..." 
                          className="flex-grow border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" 
                          value={transactionFilter.search}
                          onChange={(e) => setTransactionFilter({...transactionFilter, search: e.target.value})}
                        />
                        <button 
                          className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primaryDark transition text-sm"
                          onClick={handleTransactionSearch}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(transaction => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.buyerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.cattleId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getTransactionStatusBadge(transaction.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                className="text-primary hover:text-primaryDark" 
                                onClick={() => viewTransactionDetail(transaction.id)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catatan Kesehatan Section */}
          {activeSection === 'health' && (
            <div>
              <h1 className="text-2xl font-semibold text-blue-600 mb-6">Catatan Kesehatan</h1>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Catatan Kesehatan Ternak</h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                    <i className="fas fa-plus mr-1"></i> Tambah Catatan Kesehatan
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ternak</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pemeriksaan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokter Hewan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {healthRecords.map((record, index) => (
                        <tr key={`health-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.cattleId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getExamTypeBadge(record.examType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getHealthStatusBadge(record.healthStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.veterinarian}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-primary hover:text-primaryDark mr-2"
                              onClick={() => viewCattleDetail(record.cattleId)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-blue-500 hover:text-blue-700">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DETAIL TERNAK */}
          {showCattleModal && selectedCattle && (
            <ModalCard
              isOpen={showCattleModal}
              onClose={closeCattleModal}
              title={`Detail Ternak ${selectedCattle.id}`}
              size="lg"
              footer={<button onClick={closeCattleModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Jenis</p>
                  <p className="font-semibold text-gray-800">{selectedCattle.type}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Kelamin</p>
                  <p className="font-semibold text-gray-800">{selectedCattle.gender}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Umur</p>
                  <p className="font-semibold text-gray-800">{selectedCattle.age} th</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Berat</p>
                  <p className="font-semibold text-gray-800">{selectedCattle.weight} kg</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Kesehatan</p>
                  {getHealthStatusBadge(selectedCattle.healthStatus)}
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-[11px] text-gray-500">Ketersediaan</p>
                  {getAvailabilityBadge(selectedCattle.availability)}
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Kesehatan</h4>
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                      <th className="px-3 py-2 text-left">Jenis</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Dokter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {healthRecords.filter(r=>r.cattleId===selectedCattle.id).map((r,i)=>(
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{formatDate(r.date)}</td>
                        <td className="px-3 py-2">{getExamTypeBadge(r.examType)}</td>
                        <td className="px-3 py-2">{getHealthStatusBadge(r.healthStatus)}</td>
                        <td className="px-3 py-2">{r.veterinarian}</td>
                      </tr>
                    ))}
                    {healthRecords.filter(r=>r.cattleId===selectedCattle.id).length===0 && (
                      <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-400">Belum ada catatan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ModalCard>
          )}

          {/* MODAL EDIT TERNAK - dengan tombol Simpan */}
          {showEditCattleModal && editCattle && (
            <ModalCard
              isOpen={showEditCattleModal}
              onClose={closeEditCattleModal}
              title={`Edit Data ${editCattle.id}`}
              size="lg"
              footer={
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={closeEditCattleModal}>Batal</button>
                  <button type="button" onClick={handleSaveEdit} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"><i className="fas fa-save mr-1"></i> Simpan</button>
                </div>
              }
            >
              {editSaveSuccess && (
                <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{editSaveSuccess}</div>
              )}
              <form onSubmit={(e)=>{e.preventDefault(); handleSaveEdit();}} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Sapi</label>
                    <input value={editCattle.id} disabled className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                    <input value={editCattle.type} onChange={e=>handleEditChange('type', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <select value={editCattle.gender} onChange={e=>handleEditChange('gender', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                      <option value="">Pilih</option>
                      <option value="Jantan">Jantan</option>
                      <option value="Betina">Betina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Umur (tahun)</label>
                    <input type="number" min="0" value={editCattle.age} onChange={e=>handleEditChange('age', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
                    <input type="number" min="0" value={editCattle.weight} onChange={e=>handleEditChange('weight', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" value={(editCattle.birthDate || '').slice(0,10)} onChange={e=>handleEditChange('birthDate', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesehatan</label>
                    <select value={editCattle.healthStatus} onChange={e=>handleEditChange('healthStatus', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                      <option value="sehat">Sehat</option>
                      <option value="perlu_periksa">Perlu Periksa</option>
                      <option value="sakit">Sakit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                    <select value={editCattle.availability} onChange={e=>handleEditChange('availability', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                      <option value="available">Tersedia</option>
                      <option value="in_transaction">Dalam Transaksi</option>
                      <option value="sold">Terjual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asal</label>
                    <select value={editCattle.origin} onChange={e=>handleEditChange('origin', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3">
                      <option value="beli">Dibeli</option>
                      <option value="lahir_sendiri">Lahir di Peternakan</option>
                    </select>
                  </div>
                  {editCattle.origin === 'lahir_sendiri' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Induk</label>
                        <input value={editCattle.motherId || ''} onChange={e=>handleEditChange('motherId', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Pejantan</label>
                        <input value={editCattle.fatherId || ''} onChange={e=>handleEditChange('fatherId', e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                      </div>
                    </>
                  )}
                </div>
                {/* Actions are in modal footer for visibility */}
              </form>
            </ModalCard>
          )}

          {/* MODAL DETAIL TRANSAKSI */}
          {showTransactionModal && selectedTransaction && (
            <ModalCard
              isOpen={showTransactionModal}
              onClose={closeTransactionModal}
              title={`Detail Transaksi ${selectedTransaction.id}`}
              size="lg"
              footer={<button onClick={closeTransactionModal} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark">Tutup</button>}
            >
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Tanggal</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Pembeli</p>
                  <p className="font-semibold text-gray-800">{selectedTransaction.buyerName}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Ternak</p>
                  <p className="font-semibold text-gray-800">{selectedTransaction.cattleId}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Jumlah</p>
                  <p className="font-semibold text-gray-800">{selectedTransaction.quantity}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Status Transaksi</p>
                  {getTransactionStatusBadge(selectedTransaction.status)}
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-[11px] text-gray-500">Verifikasi</p>
                  {getVerificationBadge(selectedTransaction.verificationStatus)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-[11px] text-gray-500 mb-1">Catatan</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{selectedTransaction.notes || '-'}</p>
              </div>
            </ModalCard>
          )}

          {/* AUTH MODAL Tetap */}
          <ModalCard
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            title="Autentikasi Diperlukan"
            size="md"
            footer={
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50" onClick={()=>setShowAuthModal(false)}>Batal</button>
                <button form="auth-form" type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Verifikasi</button>
              </div>
            }
          >
            <p className="text-sm text-gray-600 mb-4">Masukkan kode autentikasi untuk mengakses fitur transaksi.</p>
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded mb-3">{authError}</div>
            )}
            <form id="auth-form" onSubmit={handleAuthSubmit} className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kode Autentikasi</label>
                <input type="text" value={authCode} onChange={e=>setAuthCode(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="6 digit" required />
                <p className="text-[11px] text-gray-400 mt-1">Demo: 123456</p>
              </div>
            </form>
          </ModalCard>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PasarHewanDashboard;
