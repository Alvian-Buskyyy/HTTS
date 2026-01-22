import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';
import TransaksiDaging from '../components/TransaksiDaging';

// Config & Constants
import { 
  TRANSACTION_TYPES, 
  INITIAL_TRANSACTION_FORM, 
  INITIAL_TRANSFER_FORM,
  INITIAL_SLAUGHTER_FORM,
  INITIAL_FILTER,
  STORAGE_KEYS 
} from '../config/constants';

// Services
import * as transactionService from '../services/transactionService';
import * as slaughterService from '../services/slaughterService';

// Hooks
import { useAuthentication } from '../hooks/useAuthentication';
import { useTransactionData } from '../hooks/useTransactionData';
import { useSlaughterData } from '../hooks/useSlaughterData';

// Components
import AuthModal from '../components/modals/AuthModal';
import VerificationModal from '../components/modals/VerificationModal';
import SlaughterVerificationModal from '../components/modals/SlaughterVerificationModal';
import TransactionFilter from '../components/filters/TransactionFilter';

// Utils
import { 
  filterTransactions, 
  getStatusBadgeClass,
  getStatusText,
  getVerificationStatusText,
  formatDate,
  formatDateTime,
  copyToClipboard 
} from '../utils/transactionUtils';

const JagalTransaksi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('sales');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [slaughterSuccess, setSlaughterSuccess] = useState(false);
  
  // Form State
  const [newTransaction, setNewTransaction] = useState(INITIAL_TRANSACTION_FORM);
  const [newTransfer, setNewTransfer] = useState(INITIAL_TRANSFER_FORM);
  const [slaughterForm, setSlaughterForm] = useState(INITIAL_SLAUGHTER_FORM);
  const [transactionFilter, setTransactionFilter] = useState(INITIAL_FILTER);
  
  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [verifyInputCode, setVerifyInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  
  // Slaughter Verification Modal State
  const [showVerifySlaughterModal, setShowVerifySlaughterModal] = useState(false);
  const [verifyingSlaughter, setVerifyingSlaughter] = useState(null);
  const [verifySlaughterInputCode, setVerifySlaughterInputCode] = useState('');
  const [verifySlaughterError, setVerifySlaughterError] = useState('');
  const [verifySlaughterSuccess, setVerifySlaughterSuccess] = useState('');
  
  // Custom Hooks
  const {
    isAuthenticated,
    showAuthModal,
    authCode,
    setAuthCode,
    authError,
    handleAuthSubmit,
  } = useAuthentication();
  
  const {
    transactions,
    setTransactions,
    incomingTransactions,
    setIncomingTransactions,
    availableCattle,
    buyers,
    entityOptions,
    entitiesLoading,
    entitiesError,
    refreshIncomingTransactions,
  } = useTransactionData();
  
  const {
    sapiJagal,
    rphOptions,
    dagingPending,
    riwayatPenyembelihan,
    refreshData: refreshSlaughterData,
  } = useSlaughterData();

  // State for available daging for sale
  const [availableDaging, setAvailableDaging] = useState([]);
  
  // State for daging transactions from new endpoint
  const [dagingTransactions, setDagingTransactions] = useState([]);
  const [dagingStats, setDagingStats] = useState({ total: 0, outgoing: 0, incoming: 0 });
  const [dagingLoading, setDagingLoading] = useState(false);

  // Debug log untuk incoming transactions
  React.useEffect(() => {
    console.log('🔄 [JAGAL STATE] Incoming transactions state changed:', {
      count: incomingTransactions.length,
      transactions: incomingTransactions,
      pending: incomingTransactions.filter(t => t.status === 'pending').length,
      verified: incomingTransactions.filter(t => t.status === 'verified').length,
      rejected: incomingTransactions.filter(t => t.status === 'rejected').length,
      canAccept: incomingTransactions.filter(t => t.canAccept).length,
      timestamp: new Date().toISOString()
    });
  }, [incomingTransactions]);

  // Fetch available daging for sale
  React.useEffect(() => {
    const fetchAvailableDaging = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get Jagal ID from localStorage
        const userRaw = localStorage.getItem('user');
        let jagalId = '';
        
        try {
          const user = userRaw ? JSON.parse(userRaw) : null;
          jagalId = user?.entityId || user?.id || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }

        if (!jagalId) {
          console.error('Jagal ID tidak ditemukan');
          setAvailableDaging([]);
          return;
        }

        console.log('🔍 Fetching daging for Jagal ID:', jagalId);

        // Use the new endpoint: /daging/jagal/:jagalId
        const response = await fetch(`http://localhost:3000/daging/jagal/${jagalId}`, {
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
        
        // Data sudah difilter di backend (VERIFIED & belum dijual)
        setAvailableDaging(result.data || []);
        
      } catch (error) {
        console.error('❌ Error fetching daging:', error);
        setAvailableDaging([]);
      }
    };

    if (activeTab === 'transfer') {
      fetchAvailableDaging();
    }
  }, [activeTab]);
  
  // Fetch daging transactions from new endpoint
  React.useEffect(() => {
    const fetchDagingTransactions = async () => {
      try {
        setDagingLoading(true);
        const token = localStorage.getItem('token');
        
        // Get Jagal ID from localStorage
        const userRaw = localStorage.getItem('user');
        let jagalId = '';
        
        try {
          const user = userRaw ? JSON.parse(userRaw) : null;
          jagalId = user?.entityId || user?.id || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }

        if (!jagalId) {
          console.error('Jagal ID tidak ditemukan');
          setDagingTransactions([]);
          setDagingLoading(false);
          return;
        }

        console.log('🔍 Fetching daging transactions for Jagal ID:', jagalId);

        // Use the new endpoint: /transaksiPenjualan/jagal/:jagalId/transactions
        const response = await fetch(`http://localhost:3000/transaksiPenjualan/jagal/${jagalId}/transactions`, {
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

  if (activeTab === 'transfer' && entityOptions.length > 0) {
    fetchDagingTransactions();
  }
}, [activeTab, transferSuccess, entityOptions]);

  // Handle stored cattle data from navigation
  useEffect(() => {
    const storedCattle = localStorage.getItem(STORAGE_KEYS.SELECTED_CATTLE_FOR_SALE);
    if (storedCattle) {
      try {
        const cattleData = JSON.parse(storedCattle);
        setNewTransaction(prev => ({ ...prev, cattleId: cattleData.id }));
        setShowTransactionForm(true);
        setActiveTab('sales');
        localStorage.removeItem(STORAGE_KEYS.SELECTED_CATTLE_FOR_SALE);
      } catch (error) {
        console.error('Error parsing stored cattle data:', error);
      }
    }

    const showFromDashboard = localStorage.getItem(STORAGE_KEYS.SHOW_TRANSACTION_FROM_DASHBOARD);
    if (showFromDashboard === 'true') {
      setActiveTab('sales');
      setShowTransactionForm(true);
      localStorage.removeItem(STORAGE_KEYS.SHOW_TRANSACTION_FROM_DASHBOARD);
    }
    localStorage.removeItem(STORAGE_KEYS.FROM_SIDEBAR);
  }, []);

  // Tab Change Handler
  const handleTabChange = (tab) => {
    console.log('🔄 [JAGAL TAB] Tab changed from', activeTab, 'to', tab);
    setActiveTab(tab);
  };

  // Transaction Handlers
  const handleNewTransaction = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        buyerId: newTransaction.buyerId,
        buyerType: newTransaction.buyerType,
        cattleId: newTransaction.cattleId,
        quantity: newTransaction.quantity,
        date: newTransaction.date,
        notes: newTransaction.notes
      };

      const result = await transactionService.createTransaction(formData);
      
      // Add to local state
      const buyer = buyers.find(b => b.id === newTransaction.buyerId);
      setTransactions(prev => [...prev, {
        id: result.data?.id || `TXN00${prev.length + 1}`,
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        buyerId: newTransaction.buyerId,
        buyerName: buyer?.name || '',
        buyerType: newTransaction.buyerType,
        cattleId: newTransaction.cattleId,
        quantity: newTransaction.quantity,
        status: 'pending',
        verificationStatus: 'waiting_buyer',
        blockchainHash: '',
        cid: result.data?.cid,
        notes: newTransaction.notes
      }]);

      setTransactionSuccess(true);
      setTimeout(() => {
        setShowTransactionForm(false);
        setTransactionSuccess(false);
        setNewTransaction(INITIAL_TRANSACTION_FORM);
      }, 2000);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(error.message || 'Gagal membuat transaksi. Coba lagi nanti.');
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

  const handleCancelTransaction = async (transactionId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) return;
    
    try {
      await transactionService.cancelTransaction(transactionId);
      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, status: 'cancelled', verificationStatus: 'CANCELLED' } : t
      ));
      alert('Transaksi berhasil dibatalkan');
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      alert(error.message || 'Gagal membatalkan transaksi');
    }
  };

  // Verification Handlers
  const handleRequestVerification = async (transactionId) => {
    try {
      const result = await transactionService.requestVerificationCode(transactionId);
      
      const updated = transactions.map(t => t.id === transactionId ? {
        ...t,
        verificationStatus: result.data?.verificationStatus === 'VERIFIED' ? 'verified' : 
                          result.data?.verificationStatus === 'REJECTED' ? 'rejected' : 'waiting_buyer',
        verificationCode: result.data?.verificationCode
      } : t);
      
      setTransactions(updated);
      setVerifyingTx(updated.find(t => t.id === transactionId));
      setVerifyInputCode('');
      setVerifyError('');
      setVerifySuccess('');
      setShowVerifyModal(true);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal meminta verifikasi');
    }
  };

  const handleCopyCode = async () => {
    if (!verifyingTx?.verificationCode) return;
    const success = await copyToClipboard(verifyingTx.verificationCode);
    if (success) {
      setVerifySuccess('Kode disalin ke clipboard');
      setTimeout(() => setVerifySuccess(''), 1500);
    } else {
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
        codeMatch: verifyInputCode.trim() === String(verifyingTx.verificationCode),
        inputLength: verifyInputCode.trim().length,
        expectedLength: String(verifyingTx.verificationCode).length,
        verificationStatus: verifyingTx.verificationStatus,
        transactionType: verifyingTx.type || 'N/A'
      });
      
      // Determine role based on transaction
      const role = verifyingTx.penjualId === localStorage.getItem('jagalId') ? 'seller' : 'buyer';
      
      const response = await fetch(`http://localhost:3000/transaksiPenjualan/${verifyingTx.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationCode: verifyInputCode.trim(),
          verifierRole: role
        }),
      });

      console.log('📡 [VERIFY] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [VERIFY] Verification failed:', {
          status: response.status,
          error: error,
          inputCode: verifyInputCode.trim(),
          expectedCode: verifyingTx.verificationCode
        });
        throw new Error(error.error || 'Verifikasi gagal');
      }

      const result = await response.json();
      console.log('✅ [VERIFY] Verification success:', result);
      
      const updated = transactions.map(t => t.id === verifyingTx.id ? {
        ...t,
        verificationStatus: 'verified',
        status: 'verified',
        cid: result.data?.cid || result.cid || t.cid,
      } : t);
      
      setTransactions(updated);
      
      // Update dagingTransactions if this is a daging transaction
      setDagingTransactions(prev => prev.map(t => t.id === verifyingTx.id ? {
        ...t,
        verificationStatus: 'VERIFIED',
        status: 'verified',
        cid: result.data?.cid || result.cid || t.cid,
      } : t));
      
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
      // Use direct API call for transaksi penjualan
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
      
      const updated = transactions.map(t => t.id === verifyingTx.id ? 
        { ...t, verificationStatus: 'rejected', status: 'rejected' } : t
      );
      setTransactions(updated);
      setShowVerifyModal(false);
      setVerifyingTx(null);
      setVerifyInputCode('');
      setVerifySuccess('');
      setVerifyError('');
      alert('Verifikasi transaksi telah ditolak');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal menolak verifikasi');
    }
  };

  // Incoming Transaction Handlers
  const handleAcceptIncomingTransaction = async (transactionId) => {
    if (!window.confirm('Terima transaksi ini dari pasar hewan?')) return;

    console.log('✅ [JAGAL ACCEPT] Starting accept transaction process...');
    
    try {
      const result = await transactionService.verifyTransaction(transactionId, 'AUTO_ACCEPT', 'buyer');
      
      setIncomingTransactions(prev => prev.map(tx =>
        tx.id === transactionId
          ? { ...tx, status: 'verified', verificationStatus: 'VERIFIED', canAccept: false }
          : tx
      ));

      alert('Transaksi berhasil diterima dan diverifikasi!');
      await refreshIncomingTransactions();
    } catch (error) {
      console.error('Error accepting transaction:', error);
      alert(error.message || 'Gagal menerima transaksi');
    }
  };

  const handleRejectIncomingTransaction = async (transactionId) => {
    if (!window.confirm('Tolak transaksi ini dari pasar hewan?')) return;
    
    try {
      await transactionService.rejectVerification(transactionId);
      
      setIncomingTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: 'rejected', verificationStatus: 'REJECTED', canAccept: false }
          : tx
      ));

      alert('Transaksi berhasil ditolak!');
      await refreshIncomingTransactions();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert(error.message || 'Gagal menolak transaksi');
    }
  };

  // Transfer Handlers (Penjualan Daging)
  const handleNewTransferSubmit = async (e) => {
    e.preventDefault();
    if (!newTransfer.cattleId || !newTransfer.recipient) return;
    
    try {
      // Get Jagal ID from localStorage user object
      const userRaw = localStorage.getItem('user');
      let jagalId = '';
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        jagalId = user?.entityId || user?.id || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      if (!jagalId) {
        alert('Jagal ID tidak ditemukan. Silakan login ulang.');
        return;
      }

      const [recipientType, recipientIdRaw] = String(newTransfer.recipient).split(':');
      const formData = {
        penjualType: 'JAGAL',
        penjualId: jagalId,
        pembeliType: recipientType,
        pembeliId: recipientIdRaw,
        dagingId: newTransfer.cattleId, // Using cattleId field for dagingId
        jumlahQty: 1,
        type: 'daging',
        notes: newTransfer.notes
      };

      // Use direct API call instead of transactionService
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
      
      const txItem = {
        id: result.data?.id || `TXN00${transactions.length + 1}`,
        date: newTransfer.date || new Date().toISOString().split('T')[0],
        buyerId: recipientIdRaw,
        buyerName: (entityOptions.find(e => e.type === recipientType && String(e.id) === String(recipientIdRaw))?.name) || '',
        buyerType: recipientType,
        cattleId: newTransfer.cattleId,
        quantity: 1,
        status: 'pending',
        verificationStatus: 'waiting_buyer',
        blockchainHash: '',
        cid: result.data?.cid,
        notes: newTransfer.notes
      };
      
      setTransactions(prev => [...prev, txItem]);
      setTransferSuccess(true);
      setNewTransfer(INITIAL_TRANSFER_FORM);

      // Request verification code for the new transaction
      try {
        const verifyResponse = await fetch(`http://localhost:3000/transaksiPenjualan/${txItem.id}/requestVerification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          
          // Update transaction with verification code
          const updatedTx = {
            ...txItem,
            verificationCode: verifyResult.data?.verificationCode || verifyResult.verificationCode,
            verificationStatus: 'waiting_buyer'
          };
          
          setTransactions(prev => prev.map(t => t.id === txItem.id ? updatedTx : t));
          
          // Refresh daging transactions list
          // Will trigger the useEffect to refetch data
          
          // Open verification modal
          setVerifyingTx(updatedTx);
          setVerifyInputCode('');
          setVerifyError('');
          setVerifySuccess('');
          setShowVerifyModal(true);
        }
      } catch (verifyError) {
        console.error('Error requesting verification:', verifyError);
        alert('Transaksi berhasil dibuat, tetapi gagal meminta kode verifikasi. Silakan coba verifikasi manual.');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal mengajukan transfer');
    } finally {
      setTimeout(() => setTransferSuccess(false), 2200);
    }
  };

  // Slaughter Handlers
  const handleSlaughterSubmit = async (e) => {
    e.preventDefault();
    
    if (!slaughterForm.rphId || !slaughterForm.sapiId) {
      alert('Mohon pilih RPH dan Sapi.');
      return;
    }

    try {
      await slaughterService.daftarkanSapiKeRPH(slaughterForm.sapiId, slaughterForm.rphId);
      
      setSlaughterSuccess(true);
      setTimeout(() => setSlaughterSuccess(false), 3000);
      setSlaughterForm(INITIAL_SLAUGHTER_FORM);
      
      // Refresh slaughter data
      await refreshSlaughterData();
      
      alert('Sapi berhasil didaftarkan untuk penyembelihan di RPH!');
    } catch (error) {
      console.error('Error submitting slaughter:', error);
      alert(error.message || 'Gagal mendaftarkan sapi');
    }
  };

  const handleVerifikasiHasilPenyembelihan = async (transaksiId, verificationCode) => {
    if (!window.confirm('Apakah Anda yakin ingin memverifikasi hasil penyembelihan ini?')) return;

    try {
      await slaughterService.verifikasiHasilPenyembelihan(transaksiId, verificationCode);
      
      alert('Verifikasi berhasil! Menunggu verifikasi dari Regulator.');
      await refreshSlaughterData();
    } catch (error) {
      console.error('Error verifying slaughter:', error);
      alert(error.message || 'Gagal memverifikasi hasil');
    }
  };

  // Slaughter Verification Modal Handlers
  const handleRequestSlaughterVerification = (id) => {
    const tx = dagingPending.find(d => d.id === id);
    if (!tx) return;
    setVerifyingSlaughter(tx);
    setVerifySlaughterInputCode('');
    setVerifySlaughterError('');
    setVerifySlaughterSuccess('');
    setShowVerifySlaughterModal(true);
  };

  const handleCopySlaughterCode = async () => {
    if (!verifyingSlaughter?.verificationCode) return;
    const success = await copyToClipboard(verifyingSlaughter.verificationCode);
    if (success) {
      setVerifySlaughterSuccess('Kode disalin ke clipboard');
      setTimeout(() => setVerifySlaughterSuccess(''), 1500);
    } else {
      setVerifySlaughterError('Gagal menyalin kode');
      setTimeout(() => setVerifySlaughterError(''), 2000);
    }
  };

  const handleConfirmSlaughter = async () => {
    if (!verifyingSlaughter) return;
    
    try {
      await handleVerifikasiHasilPenyembelihan(verifyingSlaughter.id, verifySlaughterInputCode);
      
      setVerifySlaughterSuccess('Verifikasi berhasil!');
      setVerifySlaughterError('');
      
      setTimeout(() => {
        setShowVerifySlaughterModal(false);
        setVerifyingSlaughter(null);
        setVerifySlaughterInputCode('');
        setVerifySlaughterSuccess('');
      }, 1200);
    } catch (error) {
      setVerifySlaughterError(error.message || 'Kode tidak cocok');
    }
  };

  const handleRejectSlaughter = async () => {
    if (!verifyingSlaughter) return;
    if (!window.confirm('Tolak verifikasi transaksi penyembelihan ini?')) return;
    
    try {
      await slaughterService.rejectSlaughterVerification(verifyingSlaughter.id);
      
      setShowVerifySlaughterModal(false);
      setVerifyingSlaughter(null);
      setVerifySlaughterInputCode('');
      setVerifySlaughterSuccess('');
      setVerifySlaughterError('');
      
      await refreshSlaughterData();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Gagal menolak verifikasi');
    }
  };

  // Helper functions for badges
  const getTransactionStatusBadge = (status) => {
    const className = getStatusBadgeClass(status);
    const text = getStatusText(status);
    return <span className={`px-2 py-1 rounded-full text-xs ${className}`}>{text}</span>;
  };

  const getVerificationBadge = (status) => {
    const statusMap = {
      'waiting_buyer': 'bg-yellow-100 text-yellow-800',
      'WAITING_BUYER': 'bg-yellow-100 text-yellow-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'VERIFIED': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    
    const text = getVerificationStatusText(status);
    const className = statusMap[status] || 'bg-gray-100 text-gray-800';
    
    return <span className={`px-2 py-1 rounded-full text-xs ${className}`}>{text}</span>;
  };

  // Filter transactions sapi
  const filteredSapiTransactions = filterTransactions(transactions, transactionFilter).filter(tx => tx.type === 'sapi' || !tx.type);
  // Filter transactions daging
  const filteredDagingTransactions = dagingTransactions.filter(tx => tx.type === 'daging' || tx.dagingId);
  // Filter transaksi masuk
  const filteredIncoming = filterTransactions(incomingTransactions, transactionFilter);

  return (
    <DashboardLayout title="Transaksi Penjualan" role="JAGAL" customSidebar={<JagalSidebar />}>
      {/* Auth Modal */}
      <AuthModal
        showAuthModal={showAuthModal}
        authCode={authCode}
        setAuthCode={setAuthCode}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
      />

      {/* Verification Modal */}
      <VerificationModal
        showVerifyModal={showVerifyModal}
        verifyingTx={verifyingTx}
        verifyInputCode={verifyInputCode}
        setVerifyInputCode={setVerifyInputCode}
        verifyError={verifyError}
        verifySuccess={verifySuccess}
        setShowVerifyModal={setShowVerifyModal}
        setVerifyingTx={setVerifyingTx}
        handleCopyCode={handleCopyCode}
        handleRequestVerification={handleRequestVerification}
        handleConfirmBuyer={handleConfirmBuyer}
        handleRejectVerification={handleRejectVerification}
      />

      {/* Slaughter Verification Modal */}
      <SlaughterVerificationModal
        showVerifySlaughterModal={showVerifySlaughterModal}
        verifyingSlaughter={verifyingSlaughter}
        verifySlaughterInputCode={verifySlaughterInputCode}
        setVerifySlaughterInputCode={setVerifySlaughterInputCode}
        verifySlaughterError={verifySlaughterError}
        verifySlaughterSuccess={verifySlaughterSuccess}
        setShowVerifySlaughterModal={setShowVerifySlaughterModal}
        setVerifyingSlaughter={setVerifyingSlaughter}
        handleCopySlaughterCode={handleCopySlaughterCode}
        handleRequestSlaughterVerification={handleRequestSlaughterVerification}
        handleConfirmSlaughter={handleConfirmSlaughter}
        handleRejectSlaughter={handleRejectSlaughter}
      />

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transaksi Penjualan</h1>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Transaksi Baru
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'sales', label: 'Penjualan Sapi', icon: 'fa-shopping-cart' },
                { id: 'transfer', label: 'Penjualan Daging', icon: 'fa-drumstick-bite' },
                { id: 'incoming', label: 'Pembelian', icon: 'fa-arrow-down', badge: incomingTransactions.filter(t => t.canAccept).length },
                { id: 'slaughter', label: 'Penyembelihan', icon: 'fa-cut' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`$
                    {activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Transaction Filter */}
        {(activeTab === 'sales' || activeTab === 'incoming') && (
          <TransactionFilter
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
          />
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSapiTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada transaksi penjualan sapi
                      </td>
                    </tr>
                  ) : (
                    filteredSapiTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium">{tx.buyerName}</div>
                            <div className="text-xs text-gray-400">{tx.buyerType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getTransactionStatusBadge(tx.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getVerificationBadge(tx.verificationStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewTransaction(tx.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {/* Verifikasi Bersama untuk transaksi sapi */}
                          {tx.status === 'pending' && tx.verificationStatus === 'waiting_buyer' && (
                            <button
                              onClick={() => {
                                setVerifyingTx(tx);
                                setVerifyInputCode('');
                                setVerifyError('');
                                setVerifySuccess('');
                                setShowVerifyModal(true);
                              }}
                              className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10"
                            >
                              <i className="fas fa-key mr-1"></i>
                              Verifikasi Bersama
                            </button>
                          )}
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleCancelTransaction(tx.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Incoming Tab */}
        {activeTab === 'incoming' && (
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
                      Penjual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sapi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIncoming.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada transaksi masuk
                      </td>
                    </tr>
                  ) : (
                    filteredIncoming.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tx.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium">{tx.sellerName}</div>
                            <div className="text-xs text-gray-400">{tx.sellerType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.cattleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getVerificationBadge(tx.verificationStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {tx.canAccept && (
                            <button
                              className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10"
                              onClick={() => {
                                setVerifyingTx(tx);
                                setVerifyInputCode('');
                                setVerifyError('');
                                setVerifySuccess('');
                                setShowVerifyModal(true);
                              }}
                              title="Verifikasi Bersama"
                            >
                              <i className="fas fa-key mr-1"></i>
                              Verifikasi Bersama
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transfer Tab - Penjualan Daging */}
        {activeTab === 'transfer' && (
          <TransaksiDaging
            filteredDagingTransactions={filteredDagingTransactions}
            setVerifyingTx={setVerifyingTx}
            setVerifyInputCode={setVerifyInputCode}
            setVerifyError={setVerifyError}
            setVerifySuccess={setVerifySuccess}
            setShowVerifyModal={setShowVerifyModal}
            setSelectedTransaction={setSelectedTransaction}
            setShowDetailModal={setShowDetailModal}
            getVerificationBadge={getVerificationBadge}
            formatDateTime={formatDateTime}
          />
        )}

        {/* Slaughter Tab */}
        {activeTab === 'slaughter' && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Transaksi Penyembelihan</h2>
            <p className="mb-6 text-gray-500">Silakan kelola transaksi penyembelihan di halaman khusus.</p>
            <a
              href="/jagal/penyembelihan"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium shadow"
            >
              Buka Halaman Penyembelihan
            </a>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Transaksi Baru</h2>
                <button
                  onClick={() => {
                    setShowTransactionForm(false);
                    setTransactionSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {transactionSuccess && (
                <div className="m-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  Transaksi berhasil dibuat!
                </div>
              )}

              <form onSubmit={handleNewTransaction} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Sapi
                  </label>
                  <select
                    value={newTransaction.cattleId}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, cattleId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Pilih Sapi</option>
                    {availableCattle.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.type} ({c.weight} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pembeli
                  </label>
                  <select
                    value={newTransaction.buyerId}
                    onChange={handleBuyerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Pilih Pembeli</option>
                    {entitiesLoading ? (
                      <option disabled>Memuat...</option>
                    ) : entitiesError ? (
                      <option disabled>{entitiesError}</option>
                    ) : (
                      buyers.map((b) => (
                        <option key={`${b.type}-${b.id}`} value={b.id}>
                          {b.name} ({b.type})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTransaction.quantity}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={newTransaction.notes}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Catatan tambahan (opsional)"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransactionForm(false);
                      setTransactionSuccess(false);
                    }}
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

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Detail Transaksi</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID Transaksi</p>
                    <p className="font-medium">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pembeli</p>
                    <p className="font-medium">{selectedTransaction.buyerName}</p>
                    <p className="text-xs text-gray-500">{selectedTransaction.buyerType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sapi</p>
                    <p className="font-medium">{selectedTransaction.cattleId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jumlah</p>
                    <p className="font-medium">{selectedTransaction.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getTransactionStatusBadge(selectedTransaction.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verifikasi</p>
                    {getVerificationBadge(selectedTransaction.verificationStatus)}
                  </div>
                  {selectedTransaction.cid && (
                    <div>
                      <p className="text-sm text-gray-600">IPFS CID</p>
                      <p className="font-mono text-xs break-all">{selectedTransaction.cid}</p>
                    </div>
                  )}
                </div>

                {selectedTransaction.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Catatan</p>
                    <p className="text-sm">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JagalTransaksi;
