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
    notes: ''
  });
  
  // Sample data - in real implementation, this would come from API
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
      notes: 'Transaksi normal'
    }
  ]);
  
  const [availableCattle, setAvailableCattle] = useState([
    {
      id: 'SP001',
      type: 'Sapi Jantan',
      gender: 'Jantan',
      birthDate: '2021-03-15',
      weight: 450,
      healthStatus: 'sehat',
      availability: 'available'
    },
    {
      id: 'SP002', 
      type: 'Sapi Betina',
      gender: 'Betina',
      birthDate: '2020-08-22',
      weight: 380,
      healthStatus: 'sehat',
      availability: 'available'
    },
    {
      id: 'KB001',
      type: 'Kambing Jantan',
      gender: 'Jantan', 
      birthDate: '2022-01-10',
      weight: 65,
      healthStatus: 'perlu_periksa',
      availability: 'available'
    }
  ]);
  
  const [buyers, setBuyers] = useState([
    { id: 'PASAR_HEWAN-123', name: 'Pasar Hewan Al-Falah', type: 'PASAR_HEWAN' },
    { id: 'PASAR_HEWAN-124', name: 'Pasar Hewan Baraka', type: 'PASAR_HEWAN' },
    { id: 'JAGAL-125', name: 'Jagal Berkah', type: 'JAGAL' },
    { id: 'RPH-126', name: 'RPH Al-Baraka', type: 'RPH' }
  ]);

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

  // Handle form submission for new transaction
  const handleNewTransaction = (e) => {
    e.preventDefault();
    // In real app, submit transaction to API
    console.log('New transaction:', newTransaction);
    
    // Simulate successful transaction
    setTransactions([...transactions, {
      id: `TXN00${transactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      buyerId: newTransaction.buyerId,
      buyerName: buyers.find(b => b.id === newTransaction.buyerId)?.name || '',
      buyerType: newTransaction.buyerType,
      cattleId: newTransaction.cattleId,
      quantity: newTransaction.quantity,
      status: 'pending',
      verificationStatus: 'waiting_buyer',
      blockchainHash: '',
      notes: newTransaction.notes
    }]);
    
    setTransactionSuccess(true);
    setTimeout(() => {
      setShowTransactionForm(false);
      setTransactionSuccess(false);
      setNewTransaction({
        buyerId: '',
        buyerName: '',
        buyerType: '',
        cattleId: '',
        quantity: 1,
        notes: ''
      });
    }, 2000);
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

  // Request verification
  const handleRequestVerification = (transactionId) => {
    alert(`Permintaan verifikasi dikirim untuk: ${transactionId}`);
    // In real app, send request to API
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
    switch(status) {
      case 'waiting_buyer':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu Pembeli</span>;
      case 'verified':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <DashboardLayout
      title="Transaksi Penjualan"
      role="PETERNAK"
      customSidebar={<PeternakSidebar activeSection="transaksi" />}
    >
      <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Transaksi Penjualan</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-2 px-4 text-left text-sm font-medium border-b-2 ${activeTab === 'sales' ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}
          onClick={() => handleTabChange('sales')}
        >
          Transaksi Penjualan
        </button>
        <button 
          className={`py-2 px-4 text-left text-sm font-medium border-b-2 ${activeTab === 'verification' ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}
          onClick={() => handleTabChange('verification')}
        >
          Verifikasi Transaksi
        </button>
        <button 
          className={`py-2 px-4 text-left text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300 hover:text-gray-700'}`}
          onClick={() => handleTabChange('history')}
        >
          Riwayat Transaksi
        </button>
      </div>

      {/* Transaksi Penjualan Tab Content */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Transaksi Penjualan</h2>
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm"
              onClick={() => setShowTransactionForm(!showTransactionForm)}
            >
              <i className="fas fa-plus mr-1"></i> Buat Transaksi Baru
            </button>
          </div>

          {/* Form Transaksi Baru */}
          {showTransactionForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Buat Transaksi Penjualan Baru</h3>
              <form onSubmit={handleNewTransaction}>
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
                    onClick={() => setShowTransactionForm(false)}
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter(t => transactionFilter.status === 'all' || t.status === transactionFilter.status)
                  .filter(t => transactionFilter.search === '' || 
                    t.id.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                    t.buyerName.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                    t.cattleId.toLowerCase().includes(transactionFilter.search.toLowerCase())
                  )
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{transaction.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{getTransactionStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{getVerificationBadge(transaction.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button 
                          className="text-blue-500 hover:text-blue-700 mr-3"
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
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verifikasi Transaksi Tab Content */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Verifikasi Transaksi</h2>
          
          {/* Statistik Verifikasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {transactions.filter(t => t.verificationStatus === 'waiting_buyer').length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Terverifikasi</p>
              <p className="text-2xl font-semibold text-green-600">
                {transactions.filter(t => t.verificationStatus === 'verified').length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-2xl font-semibold text-red-600">
                {transactions.filter(t => t.verificationStatus === 'rejected').length}
              </p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.buyerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.cattleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{getVerificationBadge(transaction.verificationStatus)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {transaction.blockchainHash ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tercatat
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      {transaction.verificationStatus === 'waiting_buyer' && (
                        <button 
                          className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primaryDark mr-1"
                          onClick={() => handleRequestVerification(transaction.id)}
                        >
                          Minta Verifikasi
                        </button>
                      )}
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
