# Quick Test Guide - Secure Two-Party OTP Verification

## Prerequisites

- Backend server running on `http://localhost:3000`
- Valid peternak and pasar hewan entities in the database
- Valid sapi records owned by the peternak

## Manual Testing Steps

### 1. Create Test Transaction

```bash
curl -X POST http://localhost:3000/transaksiPenjualan \
  -H "Content-Type: application/json" \
  -d '{
    "penjualType": "PETERNAK",
    "penjualId": "YOUR_PETERNAK_ID",
    "pembeliType": "PASAR_HEWAN",
    "pembeliId": "YOUR_PASAR_HEWAN_ID",
    "sapiId": "YOUR_SAPI_ID",
    "jumlahQty": 1,
    "type": "JUAL_BELI"
  }'
```

### 2. Test Seller-Only OTP Generation

**✅ Valid Request (Seller)**:

```bash
curl -X POST http://localhost:3000/transaksiPenjualan/TRANSACTION_ID/requestVerification \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "YOUR_PETERNAK_ID",
    "requesterType": "PETERNAK"
  }'
```

**❌ Invalid Request (Buyer)**:

```bash
curl -X POST http://localhost:3000/transaksiPenjualan/TRANSACTION_ID/requestVerification \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "YOUR_PASAR_HEWAN_ID",
    "requesterType": "PASAR_HEWAN"
  }'
```

_Expected: 403 error "Hanya penjual yang dapat memulai proses verifikasi bersama"_

### 3. Test Buyer-Cannot-Verify-First

**❌ Buyer Tries to Verify First**:

```bash
curl -X POST http://localhost:3000/transaksiPenjualan/TRANSACTION_ID/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "123456",
    "verifierRole": "buyer"
  }'
```

_Expected: 400 error "Penjual harus melakukan verifikasi terlebih dahulu..."_

### 4. Test Proper Verification Flow

**✅ Seller Verifies First**:

```bash
curl -X POST http://localhost:3000/transaksiPenjualan/TRANSACTION_ID/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "OTP_FROM_EMAIL",
    "verifierRole": "seller"
  }'
```

**✅ Buyer Verifies After Seller**:

```bash
curl -X POST http://localhost:3000/transaksiPenjualan/TRANSACTION_ID/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "SAME_OTP_FROM_EMAIL",
    "verifierRole": "buyer"
  }'
```

### 5. Verify Final Status

```bash
curl -X GET http://localhost:3000/transaksiPenjualan/TRANSACTION_ID
```

Expected final state:

```json
{
  "verificationStatus": "VERIFIED",
  "verifikasiPenjual": true,
  "verifikasiPembeli": true,
  "cid": "ipfs_hash_or_null",
  "timestamp": "2025-12-16T..."
}
```

## Frontend Testing

### Peternak (Seller) UI

1. Login as peternak
2. Navigate to Transaksi page
3. Create new transaction or find existing pending transaction
4. Click "Mulai Verifikasi Bersama" button
5. Verify that OTP is sent and verification modal opens
6. Enter OTP from email and verify as seller
7. Confirm success message mentions waiting for buyer

### Pasar Hewan (Buyer) UI

1. Login as pasar hewan
2. Navigate to Transfer page
3. Check incoming transactions
4. For pending transaction without seller verification: Button should show "Menunggu Penjual"
5. For pending transaction with seller verification: Button should show "Verifikasi (Pembeli)"
6. Click verification button and enter same OTP
7. Confirm transaction moves to VERIFIED status

## Expected Behaviors

### ✅ Should Work

- Seller can initiate verification
- Seller can verify with correct OTP
- Buyer can verify after seller with same OTP
- Transaction marked VERIFIED after both verify
- IPFS upload (with fallback if IPFS fails)

### ❌ Should Fail

- Buyer trying to initiate verification
- Buyer trying to verify before seller
- Wrong OTP code
- Verifying already verified transaction

## Database Validation

Check transaction status in database:

```sql
SELECT
  id,
  verificationStatus,
  verifikasiPenjual,
  verifikasiPembeli,
  verificationCode,
  cid,
  timestamp
FROM TransaksiPenjualan
WHERE id = 'YOUR_TRANSACTION_ID';
```

## Troubleshooting

### Common Issues

1. **403 Error on requestVerification**: Check requesterType matches penjualType
2. **400 Error on buyer verification**: Ensure seller has verified first
3. **IPFS Errors**: Check IPFS node is running (transaction should still proceed)
4. **Email Not Received**: Check email service configuration

### Debug Tips

- Check server logs for detailed error messages
- Verify entity IDs exist in database
- Ensure transaction is in PENDING status
- Confirm OTP matches exactly (case-sensitive)
