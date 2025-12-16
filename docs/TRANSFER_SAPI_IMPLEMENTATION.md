# Transfer Sapi Implementation - Test Guide

## Overview
Implementation complete untuk fitur transfer sapi dari Pasar Hewan ke Jagal dengan sistem verifikasi OTP yang sama seperti transaksi penjualan biasa.

## Backend Changes

### 1. Controller - transaksiPenjualanController.js
- ✅ **transferSapi endpoint** ditambahkan untuk handle transfer dari Pasar Hewan ke Jagal
- ✅ **Validasi lengkap**: Pasar Hewan exists, Jagal exists, sapi dimiliki Pasar Hewan
- ✅ **OTP generation** dan email notification otomatis
- ✅ **Transaction record** dibuat dengan verifikasiPenjual=true, verifikasiPembeli=false
- ✅ **Compatible dengan existing verification flow** menggunakan type "SAPI"

### 2. Routes - transaksiPenjualanRoutes.js
- ✅ **POST /transaksiPenjualan/transfer** endpoint added

## Frontend Changes

### 1. PasarHewanTransfer.jsx
- ✅ **Transfer form** dengan field selection yang tepat (hanya Jagal)
- ✅ **Form submission** yang proper dengan backend integration
- ✅ **Loading states** dan error handling
- ✅ **Success notification** dengan pesan yang jelas
- ✅ **Transfer transactions** muncul di outgoing transactions table
- ✅ **Visual indicators** untuk membedakan transfer vs penjualan biasa
- ✅ **OTP verification** untuk transfer menggunakan system yang sama

## Testing Steps

### 1. Prerequisites
- Backend server running di localhost:3000
- Frontend running di development mode
- Email service configured (OTP dikirim ke taktujik@gmail.com)
- User login sebagai Pasar Hewan

### 2. Test Transfer Creation
1. **Navigate** ke Pasar Hewan → Transfer Sapi page
2. **Select** tab "Transaksi Keluar" 
3. **Scroll** ke section "Transfer Sapi ke Jagal"
4. **Fill form**:
   - ID Sapi: pilih dari dropdown (harus ada sapi milik Pasar Hewan)
   - Jagal Tujuan: pilih dari dropdown (hanya Jagal yang muncul)
   - Tanggal Transfer: optional
   - Catatan: optional
5. **Click** "Ajukan Transfer ke Jagal"
6. **Verify**:
   - Loading state muncul
   - Success message: "Transfer sapi ke Jagal berhasil dibuat! OTP telah dikirim untuk verifikasi."
   - Form direset
   - Transfer muncul di table transactions dengan icon truck dan label "Transfer"

### 3. Test OTP Verification Flow
1. **Check email** taktujik@gmail.com untuk OTP code
2. **Navigate** ke tab "Verifikasi Transaksi"
3. **Find** transfer transaction yang baru dibuat
4. **Verify status**: "Menunggu Pembeli" (karena Pasar Hewan sudah auto-verify)
5. **Click** "Detail" untuk melihat informasi lengkap
6. **Simulate Jagal verification**:
   - Login sebagai Jagal (atau use same verification modal)
   - Enter OTP code dari email
   - Verify status changes ke "Terverifikasi"
   - CID generated dan transaction complete

### 4. Test Data Integration
1. **Refresh page** - transfer transactions tetap muncul
2. **Check** incoming transactions for Jagal - transfer should appear
3. **Verify** ownership transfer in database (sapi.jagalId should be updated)
4. **Check** entity counters (pasarHewan.jumlahSapi decreased, jagal.jumlahSapi increased)

## Key Features Implemented

### ✅ OTP Automatic Sending
- Transfer dibuat → OTP langsung dikirim ke email
- Tidak ada step "Request OTP" terpisah
- Pasar Hewan auto-verify sebagai penjual

### ✅ Jagal-Only Recipients  
- Form hanya menampilkan entitas tipe JAGAL
- Validation di backend untuk ensure hanya Jagal yang bisa jadi recipient

### ✅ Same Verification Flow
- Transfer menggunakan system verifikasi OTP yang sama persis dengan transaksi penjualan
- Both parties harus verify dengan OTP yang sama
- Blockchain recording setelah both parties verify

### ✅ UI/UX Consistency
- Transfer form integrated dengan transaction management UI
- Visual indicators untuk membedakan transfer vs regular sales
- Loading states dan proper error handling
- Auto-refresh untuk status updates

### ✅ Backend Integration  
- Transfer stored di transaksiPenjualan table dengan type SAPI
- Compatible dengan existing verification endpoints
- Proper ownership transfer setelah verification complete
- Email notifications untuk success/completion

## Next Steps
- [ ] Add transfer transaction filtering (separate filter untuk Transfer vs Penjualan)
- [ ] Add transfer history tracking
- [ ] Consider adding bulk transfer untuk multiple sapi
- [ ] Add transfer cancellation before verification

## Notes
- Transfer menggunakan type "SAPI" instead of "TRANSFER" untuk compatibility dengan existing validation flow
- OTP dikirim ke email admin (taktujik@gmail.com) untuk testing
- Auto-refresh setiap 30 detik untuk status updates
- Manual refresh button tersedia untuk immediate updates
