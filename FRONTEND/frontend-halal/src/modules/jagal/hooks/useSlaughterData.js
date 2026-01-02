import { useState, useEffect } from 'react';
import {
  fetchSapiJagal,
  fetchRPHList,
  fetchDagingPendingVerifikasi,
  fetchRiwayatPenyembelihan
} from '../services/slaughterService';
import { REFRESH_INTERVALS } from '../config/constants';

export const useSlaughterData = () => {
  const [sapiJagal, setSapiJagal] = useState([]);
  const [rphOptions, setRphOptions] = useState([]);
  const [dagingPending, setDagingPending] = useState([]);
  const [riwayatPenyembelihan, setRiwayatPenyembelihan] = useState([]);
  const [slaughters, setSlaughters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all slaughter-related data
  const loadSlaughterData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [sapiData, rphData, dagingData, riwayatData] = await Promise.allSettled([
        fetchSapiJagal(),
        fetchRPHList(),
        fetchDagingPendingVerifikasi(),
        fetchRiwayatPenyembelihan()
      ]);

      if (sapiData.status === 'fulfilled') {
        setSapiJagal(sapiData.value);
      }
      if (rphData.status === 'fulfilled') {
        setRphOptions(rphData.value);
      }
      if (dagingData.status === 'fulfilled') {
        setDagingPending(dagingData.value);
      }
      if (riwayatData.status === 'fulfilled') {
        setRiwayatPenyembelihan(riwayatData.value);
      }
    } catch (err) {
      console.error('Error loading slaughter data:', err);
      setError('Gagal memuat data penyembelihan');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSlaughterData();

    // Auto-refresh every 1 minute
    const interval = setInterval(loadSlaughterData, REFRESH_INTERVALS.SLAUGHTER_DATA);
    
    return () => clearInterval(interval);
  }, []);

  return {
    sapiJagal,
    setSapiJagal,
    rphOptions,
    setRphOptions,
    dagingPending,
    setDagingPending,
    riwayatPenyembelihan,
    setRiwayatPenyembelihan,
    slaughters,
    setSlaughters,
    isLoading,
    error,
    refreshData: loadSlaughterData,
  };
};
