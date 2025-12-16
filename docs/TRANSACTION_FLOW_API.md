# API Documentation - Transaction Flow Enhancement

## Overview

Enhanced transaction system with proper business flow validation and incoming/outgoing transaction tracking.

## Business Flow Rules

### Sapi Transactions (Livestock)

1. **PETERNAK → PASAR_HEWAN**: Peternak menjual sapi ke Pasar Hewan
2. **PASAR_HEWAN → JAGAL**: Pasar Hewan menjual sapi ke Jagal
3. **JAGAL → RPH**: Jagal mengirim sapi ke RPH untuk disembelih

### Daging Transactions (Meat)

4. **JAGAL → DISTRIBUTOR**: Jagal menjual daging ke Distributor
5. **RPH → DISTRIBUTOR**: RPH menjual daging ke Distributor
6. **DISTRIBUTOR → HOREKA**: Distributor menjual daging ke Restaurant/Hotel
7. **DISTRIBUTOR → END_CUSTOMER**: Distributor menjual daging ke End Customer

## New API Endpoints

### Get Incoming Transactions

**GET** `/api/transaksi-penjualan/incoming/:entityType/:entityId`

Mendapatkan semua transaksi dimana entitas tersebut adalah pembeli/penerima.

**Parameters:**

- `entityType`: PETERNAK | PASAR_HEWAN | JAGAL | RPH | DISTRIBUTOR | HOREKA
- `entityId`: UUID of the entity

**Response:**

```json
{
  "message": "Transaksi incoming berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "penjualType": "PETERNAK",
      "penjualId": "uuid",
      "pembeliType": "PASAR_HEWAN",
      "pembeliId": "uuid",
      "sapiId": "uuid",
      "jumlahQty": 1,
      "verificationStatus": "PENDING",
      "verificationCode": "123456",
      "sellerInfo": {
        "nama": "Peternak ABC",
        "alamat": "...",
        "noTelepon": "..."
      },
      "sapi": { ... },
      "timestamp": "2025-12-14T10:00:00Z"
    }
  ]
}
```

### Get Outgoing Transactions

**GET** `/api/transaksi-penjualan/outgoing/:entityType/:entityId`

Mendapatkan semua transaksi dimana entitas tersebut adalah penjual.

**Parameters:**

- `entityType`: PETERNAK | PASAR_HEWAN | JAGAL | RPH | DISTRIBUTOR | HOREKA
- `entityId`: UUID of the entity

**Response:**

```json
{
  "message": "Transaksi outgoing berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "penjualType": "PETERNAK",
      "penjualId": "uuid",
      "pembeliType": "PASAR_HEWAN",
      "pembeliId": "uuid",
      "sapiId": "uuid",
      "jumlahQty": 1,
      "verificationStatus": "VERIFIED",
      "buyerInfo": {
        "nama": "Pasar Hewan XYZ",
        "alamat": "...",
        "noTelepon": "..."
      },
      "sapi": { ... },
      "timestamp": "2025-12-14T10:00:00Z"
    }
  ]
}
```

## Enhanced Transaction Creation

### Create Transaction

**POST** `/api/transaksi-penjualan/`

Enhanced with business flow validation and ownership verification.

**Request Body:**

```json
{
  "penjualType": "PETERNAK",
  "penjualId": "uuid",
  "pembeliType": "PASAR_HEWAN",
  "pembeliId": "uuid",
  "sapiId": "uuid", // For sapi transactions
  "dagingId": "uuid", // For daging transactions
  "jumlahQty": 1,
  "type": "SAPI" // or "DAGING"
}
```

**Validation Rules:**

1. **Ownership Validation**: Penjual harus memiliki kepemilikan atas item yang dijual
2. **Business Flow Validation**: Transaksi harus sesuai dengan alur bisnis yang diizinkan
3. **Entity Validation**: Semua entitas harus ada dalam sistem

**Response:**

```json
{
  "message": "Transaksi penjualan dibuat. Menunggu verifikasi pembeli.",
  "data": {
    "id": "uuid",
    "verificationCode": "123456",
    "verificationStatus": "PENDING",
    ...
  }
}
```

## Transaction Verification Flow

### 1. Request Verification

**POST** `/api/transaksi-penjualan/:id/requestVerification`

Generate/regenerate verification code.

### 2. Confirm Transaction (Buyer)

**POST** `/api/transaksi-penjualan/:id/confirmBuyer`

**Request Body:**

```json
{
  "code": "123456"
}
```

**Actions Performed:**

1. Validate verification code
2. Upload transaction data to IPFS
3. Update transaction status to VERIFIED
4. Transfer ownership of sapi/daging
5. Update jumlah sapi counters for entities

### 3. Reject Transaction

**POST** `/api/transaksi-penjualan/:id/rejectVerification`

Reject the transaction and mark as REJECTED.

## Ownership Transfer Rules

### For Sapi Transactions:

- Updates sapi ownership fields (peternakId, pasarHewanId, jagalId)
- Updates jumlahSapi counters for both entities
- Special handling for RPH: sapi ownership is nullified (will be converted to daging)

### For Daging Transactions:

- Ownership tracked through transaction history
- No direct ownership fields in daging table
- Validation based on previous verified transactions

## Error Handling

### Business Rule Violations:

- **400**: Invalid transaction flow
- **400**: Ownership validation failed
- **400**: Invalid verification code

### Not Found:

- **404**: Entity not found
- **404**: Sapi/Daging not found
- **404**: Transaction not found

### Example Usage

```javascript
// Get incoming transactions for a Pasar Hewan
GET /api/transaksi-penjualan/incoming/PASAR_HEWAN/uuid-pasar-hewan

// Create sapi transaction from Peternak to Pasar Hewan
POST /api/transaksi-penjualan/
{
  "penjualType": "PETERNAK",
  "penjualId": "peternak-uuid",
  "pembeliType": "PASAR_HEWAN",
  "pembeliId": "pasar-uuid",
  "sapiId": "sapi-uuid",
  "jumlahQty": 1,
  "type": "SAPI"
}

// Buyer confirms the transaction
POST /api/transaksi-penjualan/transaction-uuid/confirmBuyer
{
  "code": "123456"
}
```
