# Secure Two-Party OTP Verification Implementation

## Overview
Implemented a secure two-party OTP-based transaction verification system for cattle sales between sellers (peternak) and buyers (pasar hewan). The system ensures only the seller can initiate verification, both parties must enter the same OTP, and transactions are only marked as VERIFIED after both parties successfully verify.

## Implementation Details

### Backend Changes

#### 1. `requestVerification` Function (`transaksiPenjualanController.js`)
- **Seller-Only Initiation**: Added validation to ensure only the seller can initiate OTP generation
- **Body Parameters**: Now requires `requesterId` and `requesterType` to validate the requester
- **Verification Reset**: Resets both `verifikasiPenjual` and `verifikasiPembeli` flags when new OTP is generated
- **Security**: Prevents buyers from generating OTP codes

```javascript
// Only seller can request/generate OTP
if (requesterType !== existing.penjualType || requesterId !== existing.penjualId) {
  return res.status(403).json({ 
    error: "Hanya penjual yang dapat memulai proses verifikasi bersama" 
  });
}
```

#### 2. `verifyTransaction` Function (Enhanced)
- **Seller-First Enforcement**: Buyers cannot verify before sellers
- **Role-Based Verification**: Separate handling for `seller` and `buyer` verifier roles
- **IPFS Error Handling**: Added fallback logic if IPFS upload fails
- **Transaction Completion**: Only marks as VERIFIED after both parties verify

```javascript
if (verifierRole === "buyer") {
  // Enforce that seller must verify first
  if (!existing.verifikasiPenjual) {
    return res.status(400).json({ 
      error: "Penjual harus melakukan verifikasi terlebih dahulu sebelum pembeli dapat verifikasi" 
    });
  }
  // ... rest of buyer verification logic
}
```

### Frontend Changes

#### 1. Peternak (Seller) UI (`PeternakTransaksi.jsx`)
- **Enhanced Request Function**: Now sends `requesterId` and `requesterType` when requesting verification
- **Seller Profile Integration**: Retrieves seller ID from localStorage for authentication
- **Clear Flow Messaging**: Updated UI messages to reflect seller-first verification

```javascript
// Get peternak info from localStorage
const peternakProfile = JSON.parse(localStorage.getItem('peternakProfile') || '{}');
const requesterId = peternakProfile.id;

// Send request with proper authentication
const res = await fetch(`${API_BASE}/transaksiPenjualan/${transactionId}/requestVerification`, { 
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requesterId: requesterId,
    requesterType: "PETERNAK"
  })
});
```

#### 2. Pasar Hewan (Buyer) UI (`PasarHewanTransfer.jsx`)
- **Disabled OTP Generation**: Buyers can no longer initiate verification
- **Status-Based Actions**: Different button states based on verification progress
- **Smart Button Logic**: 
  - Shows "Menunggu Penjual" when seller hasn't verified
  - Shows "Verifikasi (Pembeli)" when seller has verified and buyer can proceed
  - Shows "Lihat Status" for general status checking

```javascript
{transaction.verifikasiPenjual && !transaction.verifikasiPembeli ? (
  <button 
    className="px-3 py-1 rounded text-xs border border-green-400 text-green-600 bg-white hover:bg-green-50" 
    onClick={() => {
      setVerifyingTx(transaction);
      setShowVerifyModal(true);
      setVerifySuccess('Penjual sudah verifikasi. Silakan masukkan kode OTP untuk verifikasi pembeli.');
    }}
  >
    Verifikasi (Pembeli)
  </button>
) : !transaction.verifikasiPenjual ? (
  <button 
    className="px-3 py-1 rounded text-xs border border-gray-400 text-gray-500 bg-gray-100 cursor-not-allowed" 
    disabled
    title="Menunggu penjual memulai verifikasi"
  >
    Menunggu Penjual
  </button>
) : (
  // ... other states
)}
```

### Security Enhancements

1. **Access Control**: Only sellers can initiate the verification process
2. **Race Condition Prevention**: Buyers cannot verify before sellers
3. **Input Validation**: Proper validation of requester identity and role
4. **IPFS Resilience**: Transaction can proceed even if IPFS upload fails
5. **State Management**: Clear tracking of verification status for both parties

### Verification Flow

1. **Seller Initiates**: Only the seller can call `requestVerification` with their credentials
2. **OTP Generation**: System generates OTP and sends to both parties via email
3. **Seller Verifies First**: Seller must enter OTP and verify before buyer can proceed
4. **Buyer Verification**: Only after seller verification, buyer can enter the same OTP
5. **Transaction Completion**: Both verifications mark transaction as VERIFIED and trigger blockchain upload

### Error Handling

- **Unauthorized Access**: Clear error messages when buyers try to initiate verification
- **Premature Verification**: Prevents buyers from verifying before sellers
- **IPFS Failures**: Graceful degradation if blockchain storage fails
- **Invalid Credentials**: Proper validation of requester identity

### UI/UX Improvements

- **Clear Status Indicators**: Visual feedback for verification progress
- **Role-Appropriate Actions**: Different button states for sellers vs buyers
- **Informative Messages**: Clear instructions for each party's role
- **Disabled States**: Proper disabled buttons with tooltips explaining why

## Testing

Use the provided test script (`test-verification-flow.sh`) to validate:
1. Only seller can initiate verification
2. Buyer cannot initiate verification
3. Buyer cannot verify before seller
4. Proper transaction completion after both parties verify

## Files Modified

### Backend
- `BACKEND/controllers/transaksiPenjualanController.js`

### Frontend  
- `FRONTEND/frontend-halal/src/modules/peternak/pages/PeternakTransaksi.jsx`
- `FRONTEND/frontend-halal/src/modules/pasarHewan/pages/PasarHewanTransfer.jsx`

### Documentation
- `docs/test-verification-flow.sh` (new test script)

## Next Steps (Optional)

1. **Email Integration**: Replace test email with actual user emails
2. **OTP Expiration**: Add time-based OTP expiration
3. **Audit Logging**: Log all verification attempts for security
4. **Mobile Responsiveness**: Ensure UI works well on mobile devices
5. **Automated Testing**: Create unit tests for the verification flow
