// API Configuration
export const API_BASE_URL = 'http://localhost:3000';

// Transaction Types
export const TRANSACTION_TYPES = {
  SALES: 'sales',
  PURCHASES: 'purchases',
  SLAUGHTER: 'slaughter',
  TRANSFER: 'transfer',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WAITING_BUYER: 'waiting_buyer',
};

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  WAITING_BUYER: 'WAITING_BUYER',
};

// Slaughter Status
export const SLAUGHTER_STATUS = {
  PENDING_RPH: 'PENDING_RPH',
  PENDING_JAGAL_VERIFICATION: 'PENDING_JAGAL_VERIFICATION',
  PENDING_REGULATOR_VERIFICATION: 'PENDING_REGULATOR_VERIFICATION',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

// Entity Types
export const ENTITY_TYPES = {
  PETERNAK: 'PETERNAK',
  PASAR_HEWAN: 'PASAR_HEWAN',
  JAGAL: 'JAGAL',
  RPH: 'RPH',
  DISTRIBUTOR: 'DISTRIBUTOR',
  HOREKA: 'HOREKA',
};

// Filter Options
export const FILTER_OPTIONS = {
  STATUS: {
    ALL: 'all',
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },
  VERIFICATION_STATUS: {
    ALL: 'all',
    WAITING_BUYER: 'waiting_buyer',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },
};

// Form Initial States
export const INITIAL_TRANSACTION_FORM = {
  buyerId: '',
  buyerName: '',
  buyerType: '',
  cattleId: '',
  quantity: 1,
  date: '',
  notes: '',
};

export const INITIAL_TRANSFER_FORM = {
  cattleId: '',
  recipient: '',
  date: '',
  notes: '',
};

export const INITIAL_SLAUGHTER_FORM = {
  rphId: '',
  sapiId: '',
};

export const INITIAL_FILTER = {
  status: 'all',
  verificationStatus: 'all',
  search: '',
};

// Authentication
export const AUTH_CODE = '123456'; // For demo purposes

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  TRANSACTION_AUTH: 'transactionAuth',
  FROM_SIDEBAR: 'fromSidebar',
  SHOW_TRANSACTION_FROM_DASHBOARD: 'showTransactionFromDashboard',
  SELECTED_CATTLE_FOR_SALE: 'selectedCattleForSale',
};

// Auto Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  INCOMING_TRANSACTIONS: 30000, // 30 seconds
  SLAUGHTER_DATA: 60000, // 1 minute
};
