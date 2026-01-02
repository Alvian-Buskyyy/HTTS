import { useState, useEffect } from 'react';
import {
  fetchAllEntities,
  fetchOwnedCattle,
  fetchOutgoingTransactions,
  fetchIncomingTransactions
} from '../services/transactionService';
import { REFRESH_INTERVALS } from '../config/constants';

export const useTransactionData = () => {
  const [transactions, setTransactions] = useState([]);
  const [incomingTransactions, setIncomingTransactions] = useState([]);
  const [availableCattle, setAvailableCattle] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState('');

  // Load entities
  useEffect(() => {
    const loadEntities = async () => {
      try {
        setEntitiesLoading(true);
        setEntitiesError('');
        const combined = await fetchAllEntities();
        
        if (combined.length) {
          setBuyers(combined);
          setEntityOptions(combined);
        } else {
          setEntitiesError('Gagal memuat daftar entitas.');
        }
      } catch (err) {
        console.error('Error loading entities:', err);
        setEntitiesError('Gagal memuat daftar entitas.');
      } finally {
        setEntitiesLoading(false);
      }
    };

    loadEntities();
  }, []);

  // Load owned cattle
  useEffect(() => {
    const loadCattle = async () => {
      try {
        const cattle = await fetchOwnedCattle();
        setAvailableCattle(cattle);
      } catch (err) {
        console.warn('Gagal memuat sapi milik Jagal:', err.message);
        setAvailableCattle([]);
      }
    };

    loadCattle();
  }, []);

  // Load outgoing transactions
  useEffect(() => {
    const loadOutgoingTransactions = async () => {
      try {
        const mapped = await fetchOutgoingTransactions(buyers);
        setTransactions(prev => {
          const ids = new Set();
          const merged = [...mapped];
          merged.forEach(m => ids.add(m.id));
          prev.forEach(p => { if (!ids.has(p.id)) merged.push(p); });
          return merged;
        });
      } catch (err) {
        console.warn('Gagal memuat transaksi penjualan:', err.message);
      }
    };

    if (buyers.length > 0) {
      loadOutgoingTransactions();
    }
  }, [buyers]);

  // Load incoming transactions with auto-refresh
  useEffect(() => {
    const loadIncomingTransactions = async () => {
      try {
        const mapped = await fetchIncomingTransactions();
        setIncomingTransactions(mapped);
      } catch (err) {
        console.error('Error fetching incoming transactions:', err);
      }
    };

    loadIncomingTransactions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadIncomingTransactions, REFRESH_INTERVALS.INCOMING_TRANSACTIONS);
    
    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const refreshIncomingTransactions = async () => {
    try {
      const mapped = await fetchIncomingTransactions();
      setIncomingTransactions(mapped);
    } catch (err) {
      console.error('Error refreshing incoming transactions:', err);
    }
  };

  return {
    transactions,
    setTransactions,
    incomingTransactions,
    setIncomingTransactions,
    availableCattle,
    setAvailableCattle,
    buyers,
    entityOptions,
    entitiesLoading,
    entitiesError,
    refreshIncomingTransactions,
  };
};
