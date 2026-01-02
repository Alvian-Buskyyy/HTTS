import { useState, useEffect } from 'react';
import { AUTH_CODE, STORAGE_KEYS } from '../config/constants';

export const useAuthentication = (processPageSetup) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authCode === AUTH_CODE) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError('');
      setAuthCode('');
      localStorage.setItem(STORAGE_KEYS.TRANSACTION_AUTH, 'true');
      if (processPageSetup) processPageSetup();
    } else {
      setAuthError('Kode autentikasi tidak valid. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (isAuthenticated && processPageSetup) {
      processPageSetup();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const transactionAuth = localStorage.getItem(STORAGE_KEYS.TRANSACTION_AUTH);
    if (transactionAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      const fromSidebar = localStorage.getItem(STORAGE_KEYS.FROM_SIDEBAR) === 'true';
      const fromDashboard = localStorage.getItem(STORAGE_KEYS.SHOW_TRANSACTION_FROM_DASHBOARD) === 'true';
      if (!fromSidebar && !fromDashboard) {
        setShowAuthModal(true);
        return;
      }
    }
    if (processPageSetup) processPageSetup();
  }, []);

  return {
    isAuthenticated,
    showAuthModal,
    authCode,
    setAuthCode,
    authError,
    handleAuthSubmit,
    setShowAuthModal,
  };
};
