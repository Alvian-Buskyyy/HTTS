# Struktur Modular Jagal Transaksi

Dokumentasi ini menjelaskan struktur folder dan file yang telah dibuat untuk memmodularisasi halaman JagalTransaksi.

## 📁 Struktur Folder

```
src/modules/jagal/
├── config/
│   └── constants.js                    # Konstanta dan konfigurasi aplikasi
├── services/
│   ├── transactionService.js          # API calls untuk transaksi penjualan
│   └── slaughterService.js            # API calls untuk penyembelihan
├── hooks/
│   ├── useAuthentication.js           # Hook untuk autentikasi
│   ├── useTransactionData.js          # Hook untuk data transaksi
│   └── useSlaughterData.js            # Hook untuk data penyembelihan
├── components/
│   ├── modals/
│   │   ├── AuthModal.jsx              # Modal autentikasi
│   │   ├── VerificationModal.jsx      # Modal verifikasi transaksi
│   │   └── SlaughterVerificationModal.jsx  # Modal verifikasi penyembelihan
│   └── filters/
│       └── TransactionFilter.jsx      # Komponen filter transaksi
├── utils/
│   └── transactionUtils.js            # Utility functions untuk transaksi
└── pages/
    └── JagalTransaksi.jsx             # Main component (simplified)
```

## 📝 Deskripsi File

### 1. **config/constants.js**
Berisi semua konstanta yang digunakan di aplikasi:
- API Base URL
- Transaction types & status
- Entity types
- Filter options
- Form initial states
- Local storage keys
- Auto-refresh intervals

**Keuntungan**: Mudah untuk mengubah konfigurasi di satu tempat

---

### 2. **services/transactionService.js**
Mengelola semua API calls untuk transaksi penjualan:
- `getAuthHeaders()` - Mendapatkan header autentikasi
- `getCurrentUser()` - Mendapatkan data user saat ini
- `getJagalEntityId()` - Mendapatkan ID entity Jagal
- `fetchAllEntities()` - Memuat semua entitas (buyer options)
- `fetchOwnedCattle()` - Memuat sapi milik Jagal
- `fetchOutgoingTransactions()` - Memuat transaksi keluar (Jagal sebagai penjual)
- `fetchIncomingTransactions()` - Memuat transaksi masuk (Jagal sebagai pembeli)
- `createTransaction()` - Membuat transaksi baru
- `requestVerificationCode()` - Request kode verifikasi
- `confirmBuyerVerification()` - Konfirmasi verifikasi pembeli
- `rejectVerification()` - Tolak verifikasi
- `cancelTransaction()` - Batalkan transaksi

**Keuntungan**: Semua logika API terpusat, mudah untuk testing dan maintenance

---

### 3. **services/slaughterService.js**
Mengelola semua API calls untuk penyembelihan:
- `fetchSapiJagal()` - Memuat sapi milik Jagal
- `fetchRPHList()` - Memuat daftar RPH
- `fetchDagingPendingVerifikasi()` - Memuat daging pending verifikasi
- `fetchRiwayatPenyembelihan()` - Memuat riwayat penyembelihan
- `daftarkanSapiKeRPH()` - Daftarkan sapi ke RPH
- `verifikasiHasilPenyembelihan()` - Verifikasi hasil penyembelihan
- `requestSlaughterVerificationCode()` - Request kode verifikasi penyembelihan
- `rejectSlaughterVerification()` - Tolak verifikasi penyembelihan

**Keuntungan**: Pemisahan concerns untuk fitur penyembelihan

---

### 4. **hooks/useAuthentication.js**
Custom hook untuk mengelola autentikasi:
- State management untuk autentikasi
- Auto-check autentikasi dari localStorage
- Handle submit autentikasi

**Keuntungan**: Logic autentikasi reusable

---

### 5. **hooks/useTransactionData.js**
Custom hook untuk mengelola data transaksi:
- Load entities (buyers/sellers)
- Load owned cattle
- Load outgoing transactions
- Load incoming transactions with auto-refresh
- Manual refresh function

**Keuntungan**: Data fetching logic terpisah dari UI

---

### 6. **hooks/useSlaughterData.js**
Custom hook untuk mengelola data penyembelihan:
- Load sapi Jagal
- Load RPH list
- Load daging pending
- Load riwayat penyembelihan
- Auto-refresh data

**Keuntungan**: Simplified slaughter data management

---

### 7. **components/modals/AuthModal.jsx**
Komponen modal untuk autentikasi:
- UI untuk input kode autentikasi
- Error handling
- Form validation

**Keuntungan**: UI component yang reusable

---

### 8. **components/modals/VerificationModal.jsx**
Komponen modal untuk verifikasi transaksi:
- Display transaction details
- Show verification code
- Input code from buyer
- Copy code functionality
- Verify/Reject actions

**Keuntungan**: Complex modal logic isolated

---

### 9. **components/modals/SlaughterVerificationModal.jsx**
Komponen modal untuk verifikasi penyembelihan:
- Display slaughter transaction details
- Show verification code
- Input code from RPH
- Copy code functionality
- Verify/Reject actions

**Keuntungan**: Specialized modal for slaughter verification

---

### 10. **components/filters/TransactionFilter.jsx**
Komponen untuk filter transaksi:
- Search input
- Status filter
- Verification status filter

**Keuntungan**: Reusable filter component

---

### 11. **utils/transactionUtils.js**
Utility functions untuk transaksi:
- `filterTransactions()` - Filter transaksi berdasarkan kriteria
- `getStatusBadgeClass()` - Get CSS class untuk status badge
- `getStatusText()` - Format status text
- `getVerificationStatusText()` - Format verification status text
- `formatDate()` - Format tanggal
- `formatDateTime()` - Format tanggal dan waktu
- `copyToClipboard()` - Copy text ke clipboard

**Keuntungan**: Helper functions yang reusable

---

## 🎯 Cara Menggunakan

### Import di JagalTransaksi.jsx:

```jsx
// Config & Constants
import { TRANSACTION_TYPES, INITIAL_TRANSACTION_FORM } from '../config/constants';

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
import { filterTransactions, getStatusBadgeClass } from '../utils/transactionUtils';
```

### Contoh Penggunaan Hook:

```jsx
const JagalTransaksi = () => {
  // Authentication
  const {
    isAuthenticated,
    showAuthModal,
    authCode,
    setAuthCode,
    authError,
    handleAuthSubmit,
  } = useAuthentication(processPageSetup);

  // Transaction Data
  const {
    transactions,
    incomingTransactions,
    availableCattle,
    buyers,
    entityOptions,
    refreshIncomingTransactions,
  } = useTransactionData();

  // Slaughter Data
  const {
    sapiJagal,
    rphOptions,
    dagingPending,
    riwayatPenyembelihan,
    refreshData,
  } = useSlaughterData();

  // ... rest of component
};
```

## ✅ Keuntungan Struktur Modular

1. **Separation of Concerns**: Setiap file memiliki tanggung jawab yang jelas
2. **Reusability**: Hooks dan components bisa digunakan di file lain
3. **Maintainability**: Mudah untuk mencari dan memperbaiki bugs
4. **Testability**: Setiap fungsi/hook bisa di-test secara terpisah
5. **Scalability**: Mudah menambah fitur baru tanpa mengubah struktur
6. **Readability**: Kode lebih mudah dibaca dan dipahami
7. **Collaboration**: Tim bisa bekerja di file yang berbeda tanpa conflict

## 📚 Best Practices

1. **Gunakan constants** untuk semua nilai yang hardcoded
2. **Service layer** untuk semua API calls
3. **Custom hooks** untuk logic yang kompleks
4. **Separate components** untuk UI yang reusable
5. **Utils** untuk helper functions
6. **Consistent naming** untuk file dan fungsi

## 🔄 Next Steps

File JagalTransaksi.jsx yang lama (2004 baris) sekarang bisa disederhanakan dengan menggunakan:
- Hooks yang sudah dibuat
- Services untuk API calls
- Components untuk UI
- Utils untuk helper functions

Kode akan menjadi lebih ringkas (estimasi ~500-800 baris) dan lebih mudah dipelihara.
