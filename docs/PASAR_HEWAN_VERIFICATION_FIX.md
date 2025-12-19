# Perbaikan Tombol Verifikasi Pembeli - Pasar Hewan

## Masalah yang Diperbaiki

**Masalah Awal**: Setelah penjual (peternak) melakukan verifikasi OTP dengan benar, tombol verifikasi di pembeli (pasar hewan) masih belum aktif/tidak bisa diklik untuk memasukkan kode OTP.

## Analisis Masalah

1. **Data Mapping Tidak Lengkap**: Field `verifikasiPenjual` dan `verifikasiPembeli` dari backend tidak dimapping dengan benar ke state frontend
2. **Data Tidak Ter-refresh**: Setelah penjual verifikasi, data di pasar hewan tidak terupdate otomatis
3. **Kondisi Tombol Salah**: Logic untuk menampilkan tombol verifikasi kurang tepat

## Perbaikan yang Dilakukan

### 1. **Perbaikan Data Mapping**

```javascript
// Sebelum
verify: {
  sellerSigned: !!t.verifikasiPenjual,
  buyerSigned: !!t.verifikasiPembeli,
  code: t.verificationCode || ''
},

// Sesudah - Menambah field langsung
verifikasiPenjual: !!t.verifikasiPenjual, // Add this field directly
verifikasiPembeli: !!t.verifikasiPembeli, // Add this field directly
verify: {
  sellerSigned: !!t.verifikasiPenjual,
  buyerSigned: !!t.verifikasiPembeli,
  code: t.verificationCode || ''
},
```

### 2. **Fungsi Refresh Data Otomatis**

```javascript
const refreshTransactionData = async () => {
  // Re-fetch data terbaru dari backend
  const resIncoming = await fetch(`${API_BASE}/transaksiPenjualan/incoming/PASAR_HEWAN/${pasarHewanId}`);
  // Update state dengan data fresh
  setTransactions((prevTransactions) => {
    return prevTransactions.map((existingTx) => {
      const updatedTx = incomingTx.find((t) => t.id === existingTx.id);
      if (updatedTx && existingTx.direction === "incoming") {
        return {
          ...existingTx,
          verifikasiPenjual: !!updatedTx.verifikasiPenjual,
          verifikasiPembeli: !!updatedTx.verifikasiPembeli,
          // ... update fields lainnya
        };
      }
      return existingTx;
    });
  });
};
```

### 3. **Perbaikan Logic Tombol**

```javascript
{
  transaction.verifikasiPenjual && !transaction.verifikasiPembeli ? (
    // TOMBOL AKTIF: Penjual sudah verifikasi, pembeli belum
    <button
      className="px-3 py-1 rounded text-xs border border-green-400 text-green-600 bg-white hover:bg-green-50"
      onClick={() => {
        setVerifyingTx(transaction);
        setShowVerifyModal(true);
        setVerifySuccess("Penjual sudah verifikasi. Silakan masukkan kode OTP untuk verifikasi pembeli.");
      }}
    >
      <i className="fas fa-handshake mr-1"></i>Verifikasi (Pembeli)
    </button>
  ) : transaction.verifikasiPenjual === false && transaction.verifikasiPembeli === false ? (
    // TOMBOL DISABLED: Menunggu penjual
    <button className="px-3 py-1 rounded text-xs border border-gray-400 text-gray-500 bg-gray-100 cursor-not-allowed" disabled title="Menunggu penjual memulai dan melakukan verifikasi">
      <i className="fas fa-clock mr-1"></i>Menunggu Penjual
    </button>
  ) : (
    // TOMBOL REFRESH: Untuk status lainnya
    <button
      className="px-3 py-1 rounded text-xs border border-blue-400 text-blue-600 bg-white hover:bg-blue-50"
      onClick={() => {
        refreshTransactionData(); // Refresh data first
        handleRequestVerification(transaction.id);
      }}
    >
      <i className="fas fa-sync mr-1"></i>Refresh Status
    </button>
  );
}
```

### 4. **Auto-refresh Berkala**

```javascript
// Auto-refresh data every 30 seconds for better UX
useEffect(() => {
  const interval = setInterval(() => {
    refreshTransactionData();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

### 5. **Perbaikan Fungsi handleRequestVerification**

```javascript
const handleRequestVerification = async (id) => {
  // Refresh data terlebih dahulu
  await refreshTransactionData();

  // Get updated transaction
  const updatedTx = transactions.find((t) => t.id === id) || tx;

  // Check status dan beri feedback yang tepat
  if (updatedTx.verifikasiPenjual && !updatedTx.verifikasiPembeli) {
    // Seller has verified, buyer can now verify
    setVerifySuccess("Penjual sudah verifikasi. Silakan masukkan kode OTP untuk verifikasi pembeli.");
  } else if (!updatedTx.verifikasiPenjual) {
    // Seller hasn't verified yet
    setVerifyError("Penjual belum melakukan verifikasi. Silakan tunggu penjual untuk memulai verifikasi.");
  }
};
```

## Flow Verifikasi yang Diperbaiki

1. **Peternak (Penjual)**:

   - Klik "Mulai Verifikasi Bersama"
   - Masukkan OTP dan verifikasi
   - `verifikasiPenjual` menjadi `true`

2. **Pasar Hewan (Pembeli)**:
   - Data auto-refresh atau manual refresh
   - Tombol "Verifikasi (Pembeli)" menjadi aktif
   - Klik tombol dan masukkan OTP yang sama
   - Transaksi menjadi VERIFIED setelah kedua pihak verifikasi

## Fitur Tambahan

- **Auto-refresh**: Data ter-refresh otomatis setiap 30 detik
- **Manual refresh**: Tombol "Refresh Status" untuk update manual
- **Better UX**: Clear feedback messages dan visual indicators
- **Error handling**: Proper error messages untuk berbagai kondisi

## Testing

Untuk test flow ini:

1. Login sebagai peternak, buat transaksi, lakukan verifikasi
2. Login sebagai pasar hewan, refresh data (manual atau tunggu auto-refresh)
3. Tombol "Verifikasi (Pembeli)" harus aktif
4. Masukkan OTP yang sama dengan peternak
5. Transaksi seharusnya berhasil diverifikasi kedua pihak

## Files yang Dimodifikasi

- `FRONTEND/frontend-halal/src/modules/pasarHewan/pages/PasarHewanTransfer.jsx`
  - Added `refreshTransactionData()` function
  - Fixed data mapping for `verifikasiPenjual` and `verifikasiPembeli`
  - Improved button logic and conditions
  - Added auto-refresh functionality
  - Enhanced error handling and user feedback
