import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Fetch sapi milik Jagal
export const fetchSapiJagal = async () => {
  const headers = getAuthHeaders();
  
  // Get jagalId from user data
  const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
  let jagalId = '';
  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    jagalId = user?.entityId || user?.id || '';
  } catch (e) {
    throw new Error('Jagal ID tidak ditemukan');
  }
  
  if (!jagalId) {
    throw new Error('Jagal ID tidak valid');
  }
  
  // Gunakan endpoint /sapi/entity/JAGAL/:jagalId dari sapiRoutes
  const res = await fetch(`${API_BASE_URL}/sapi/entity/JAGAL/${jagalId}`, { headers });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || 'Gagal memuat sapi Jagal');
  }
  
  const data = await res.json();
  // Filter hanya sapi yang belum diproses untuk penyembelihan
  const sapiList = Array.isArray(data) ? data.filter(s => !s.isProcessed) : [];
  return sapiList;
};

// Fetch daftar RPH
export const fetchRPHList = async () => {
  const headers = getAuthHeaders();
  
  // Gunakan endpoint /rph dari rphRoutes untuk mendapatkan semua RPH
  const res = await fetch(`${API_BASE_URL}/rph`, { headers });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || 'Gagal memuat daftar RPH');
  }
  
  const data = await res.json();
  // rphController.getAllRPH returns array directly, not wrapped in data property
  return Array.isArray(data) ? data : [];
};

// Fetch daging pending verifikasi Jagal
export const fetchDagingPendingVerifikasi = async () => {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/jagal/daging-pending`, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || 'Gagal memuat daging pending');
  }
  
  const data = await res.json();
  return data.data || [];
};

// Fetch riwayat transaksi penyembelihan
export const fetchRiwayatPenyembelihan = async () => {
  const headers = getAuthHeaders();
  
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/riwayat`, { headers });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || 'Gagal memuat riwayat penyembelihan');
  }
  
  const data = await res.json();
  return data.data || [];
};

// Daftarkan sapi ke RPH
export const daftarkanSapiKeRPH = async (sapiId, rphId) => {
  const headers = getAuthHeaders();
  
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/jagal/daftarkan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sapiId, rphId }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal mendaftarkan sapi ke RPH');
  }
  
  return data;
};

// Verifikasi hasil penyembelihan
export const verifikasiHasilPenyembelihan = async (dagingId) => {
  const headers = getAuthHeaders();
  
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/jagal/verifikasi-hasil`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dagingId }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal memverifikasi hasil penyembelihan');
  }
  
  return data;
};

// Request verification code (if needed)
export const requestSlaughterVerificationCode = async (transaksiId) => {
  const headers = getAuthHeaders();
  
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/${transaksiId}/requestVerification`, {
    method: 'POST',
    headers,
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal membuat kode verifikasi');
  }
  
  return data;
};

// Reject slaughter verification
export const rejectSlaughterVerification = async (transaksiId) => {
  const headers = getAuthHeaders();
  
  const res = await fetch(`${API_BASE_URL}/transaksiPenyembelihan/${transaksiId}/reject`, {
    method: 'PUT',
    headers,
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.error || 'Gagal menolak verifikasi');
  }
  
  return data;
};
