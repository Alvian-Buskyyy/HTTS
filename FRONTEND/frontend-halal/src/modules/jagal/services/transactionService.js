import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Get authorization headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Get current user data
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return JSON.parse(userStr || '{}');
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
};

// Get Jagal entity ID
export const getJagalEntityId = () => {
  const user = getCurrentUser();
  return user?.entityId || user?.id;
};

// Fetch all entities (for buyer and transfer options)
export const fetchAllEntities = async () => {
  const endpoints = [
    { url: `${API_BASE_URL}/peternak`, type: 'PETERNAK', nameKey: 'nama' },
    { url: `${API_BASE_URL}/pasarHewan`, type: 'PASAR_HEWAN', nameKey: 'nama' },
    { url: `${API_BASE_URL}/jagal`, type: 'JAGAL', nameKey: 'nama' },
    { url: `${API_BASE_URL}/rph`, type: 'RPH', nameKey: 'nama' },
    { url: `${API_BASE_URL}/distributor`, type: 'DISTRIBUTOR', nameKey: 'namaUsaha' },
    { url: `${API_BASE_URL}/horeka`, type: 'HOREKA', nameKey: 'nama' },
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

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
};

// Fetch owned cattle (from verified transactions)
export const fetchOwnedCattle = async () => {
  const headers = getAuthHeaders();
  const user = getCurrentUser();
  const jagalEntityId = getJagalEntityId();

  const [txRes, sapiRes] = await Promise.all([
    fetch(`${API_BASE_URL}/transaksiPenjualan`, { headers }),
    fetch(`${API_BASE_URL}/sapi`, { headers })
  ]);

  const [txData, sapiData] = await Promise.all([txRes.json(), sapiRes.json()]);

  if (!txRes.ok) throw new Error(txData?.error || 'Gagal memuat transaksi');
  if (!sapiRes.ok) throw new Error(sapiData?.error || 'Gagal memuat sapi');

  const ownedIds = (Array.isArray(txData) ? txData : [])
    .filter(tp =>
      tp.pembeliType === 'JAGAL' &&
      String(tp.pembeliId || tp.jagalPembeliId) === String(jagalEntityId) &&
      tp.verificationStatus === 'VERIFIED'
    )
    .map(tp => tp.sapiId)
    .filter(Boolean);

  return (Array.isArray(sapiData) ? sapiData : [])
    .filter(s => ownedIds.includes(s.id))
    .map(s => ({
      id: s.id,
      type: s.jenis === 'other' ? s.customJenis : s.jenis,
      gender: s.kelamin,
      birthDate: s.tanggalLahir || new Date().toISOString().split('T')[0],
      weight: Number(s.berat) || 0,
      healthStatus: s.healthStatus || 'sehat',
      availability: 'available'
    }));
};

// Fetch outgoing transactions (Jagal as seller)
export const fetchOutgoingTransactions = async (buyers = []) => {
  const headers = getAuthHeaders();
  const user = getCurrentUser();
  const jagalEntityId = getJagalEntityId();

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan`, { headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error || 'Gagal memuat transaksi penjualan');

  const filtered = (Array.isArray(data) ? data : [])
    .filter(tp =>
      tp.penjualType === 'JAGAL' &&
      String(tp.penjualId || tp.jagalPenjualId) === String(jagalEntityId)
    );

  return filtered.map(tp => ({
    id: tp.id,
    date: tp.timestamp ? new Date(tp.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    buyerId: tp.pembeliId,
    buyerName: (() => {
      const found = buyers.find(b => b.type === tp.pembeliType && String(b.id) === String(tp.pembeliId));
      return found?.name || tp.pembeliId || '-';
    })(),
    buyerType: tp.pembeliType,
    cattleId: tp.sapiId || tp.dagingId || '-',
    quantity: tp.jumlahQty || 1,
    status: tp.verificationStatus === 'VERIFIED' ? 'verified' : 'pending',
    verificationStatus: tp.verificationStatus === 'VERIFIED' ? 'verified' : tp.verificationStatus === 'REJECTED' ? 'rejected' : 'waiting_buyer',
    blockchainHash: '',
    cid: tp.cid,
    verificationCode: tp.verificationCode,
  }));
};

// Fetch incoming transactions (Jagal as buyer)
export const fetchIncomingTransactions = async () => {
  const headers = getAuthHeaders();
  const jagalEntityId = getJagalEntityId();

  console.log('🔍 [API] Fetching incoming transactions for Jagal:', jagalEntityId);

  const endpoint = `${API_BASE_URL}/transaksiPenjualan/incoming/JAGAL/${jagalEntityId}`;
  const res = await fetch(endpoint, { headers });

  console.log('📡 [API] Response status:', res.status);

  const response = await res.json();
  console.log('📦 [API] Response data:', response);

  if (!res.ok) {
    throw new Error(response?.error || 'Gagal memuat transaksi masuk');
  }

  const incomingData = response?.data || [];

  return incomingData.map((tp) => ({
    id: tp.id,
    date: tp.timestamp ? new Date(tp.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    sellerId: tp.penjualId,
    sellerName: tp.sellerInfo?.nama || tp.penjualId || '-',
    sellerType: tp.penjualType,
    cattleId: tp.sapiId || tp.dagingId || '-',
    quantity: tp.jumlahQty || 1,
    status: tp.verificationStatus === 'VERIFIED' ? 'verified' : tp.verificationStatus === 'REJECTED' ? 'rejected' : 'pending',
    verificationStatus: tp.verificationStatus,
    blockchainHash: '',
    cid: tp.cid,
    verificationCode: tp.verificationCode,
    canAccept: tp.verificationStatus === 'PENDING' || tp.verificationStatus === 'WAITING_BUYER',
    rawData: tp
  }));
};

// Create new transaction
export const createTransaction = async (formData) => {
  const headers = getAuthHeaders();
  const user = getCurrentUser();
  const jagalEntityId = getJagalEntityId();

  const body = {
    penjualType: 'JAGAL',
    penjualId: jagalEntityId,
    pembeliType: formData.buyerType,
    pembeliId: formData.buyerId,
    sapiId: formData.cattleId,
    jumlahQty: parseInt(formData.quantity, 10) || 1,
    type: 'SAPI',
  };

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Gagal membuat transaksi');
  }

  return data;
};

// Request verification code
export const requestVerificationCode = async (transactionId) => {
  const headers = getAuthHeaders();
  const jagalEntityId = getJagalEntityId();

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan/${transactionId}/requestVerification`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      requesterId: jagalEntityId,
      requesterType: 'JAGAL',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Gagal membuat kode verifikasi');
  }

  return data;
};

// Verify transaction with role-based verification
export const verifyTransaction = async (transactionId, verificationCode, verifierRole) => {
  const headers = getAuthHeaders();

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan/${transactionId}/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ verificationCode, verifierRole }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Kode tidak cocok');
  }

  return data;
};

// Reject verification
export const rejectVerification = async (transactionId) => {
  const headers = getAuthHeaders();

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan/${transactionId}/reject`, {
    method: 'PUT',
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Gagal menolak verifikasi');
  }

  return data;
};

// Cancel transaction
export const cancelTransaction = async (transactionId) => {
  const headers = getAuthHeaders();

  const res = await fetch(`${API_BASE_URL}/transaksiPenjualan/${transactionId}/cancel`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ reason: 'Dibatalkan oleh pengguna' }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Gagal membatalkan transaksi');
  }

  return data;
};
