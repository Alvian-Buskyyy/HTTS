# API Documentation - Transaksi Penyembelihan (Updated)

## Overview

Enhanced transaksi penyembelihan system with simplified form input and proper validation for meat slaughter process.

## Business Rules

### Penyembelihan Process

1. **JAGAL** can slaughter sapi they own
2. **RPH** can slaughter sapi that have been sold to them (verified transactions)
3. **Berat daging** cannot exceed **berat sapi**
4. Each sapi can only be slaughtered once
5. After slaughter, sapi ownership is nullified and daging is created
6. Jagal's jumlahSapi decreases and jumlahDaging increases

## API Endpoints

### Create Transaksi Penyembelihan (Simplified)

**POST** `/api/transaksi-penyembelihan/`

Simplified endpoint for slaughtering sapi into daging.

**Request Body:**

```json
{
  "sapiId": "uuid-sapi",
  "beratDaging": 150.5,
  "penyembelihId": "uuid-jagal-or-rph",
  "penyembelihType": "JAGAL",
  "idPengecekanHalalSehat": "uuid-optional"
}
```

**Validations:**

- `beratDaging` must not exceed `sapi.beratSapi`
- Sapi must not have been slaughtered before
- For JAGAL: must own the sapi
- For RPH: must have verified transaction for the sapi
- Optional halal health check validation

**Response:**

```json
{
  "message": "Sapi berhasil disembelih dan dikonversi menjadi daging",
  "data": {
    "id": "transaksi-uuid",
    "sapiId": "sapi-uuid",
    "penyembelihType": "JAGAL",
    "penyembelihId": "jagal-uuid",
    "timestamp": "2025-12-14T10:00:00Z",
    "cid": "ipfs-hash"
  },
  "daging": {
    "id": "daging-uuid",
    "sapiId": "sapi-uuid",
    "berat": 150.5
  },
  "ipfsCid": "ipfs-hash"
}
```

### Get Available Sapi for Penyembelihan

**GET** `/api/transaksi-penyembelihan/available-sapi/:entityType/:entityId`

Get list of sapi that can be slaughtered by the entity.

**Parameters:**

- `entityType`: JAGAL | RPH
- `entityId`: UUID of the entity

**Response:**

```json
{
  "message": "Sapi yang tersedia untuk penyembelihan",
  "data": [
    {
      "id": "sapi-uuid",
      "jenis": "Sapi Bali",
      "kelamin": "Jantan",
      "usia": 3,
      "beratSapi": 250.0,
      "jagalId": "jagal-uuid",
      "pengecekanSehat": [...],
      "pengecekanHalalSehat": [...]
    }
  ]
}
```

### Get Transaksi Penyembelihan by Entity

**GET** `/api/transaksi-penyembelihan/entity/:entityType/:entityId`

Get slaughter transaction history for specific entity.

**Parameters:**

- `entityType`: JAGAL | RPH
- `entityId`: UUID of the entity

**Response:**

```json
{
  "message": "Transaksi penyembelihan berhasil diambil",
  "data": [
    {
      "id": "transaksi-uuid",
      "penyembelihType": "JAGAL",
      "penyembelihId": "jagal-uuid",
      "sapiId": "sapi-uuid",
      "timestamp": "2025-12-14T10:00:00Z",
      "cid": "ipfs-hash",
      "sapi": {
        "id": "sapi-uuid",
        "jenis": "Sapi Bali",
        "kelamin": "Jantan",
        "beratSapi": 250.0
      },
      "daging": {
        "id": "daging-uuid",
        "berat": 150.5
      }
    }
  ]
}
```

## Frontend Form Requirements

### Form Fields (Simplified)

1. **Pilih Sapi** (dropdown) - Required

   - Shows: ID, jenis, kelamin, berat sapi
   - Only available sapi (not slaughtered yet)

2. **Berat Daging (kg)** (number input) - Required

   - Validation: must not exceed berat sapi
   - Step: 0.1, min: 0.1
   - Shows max value from selected sapi

3. **Tanggal Penyembelihan** (date input) - Auto-filled with today

4. **ID Pengecekan Halal Sehat** (text input) - Optional

### Form Validation

- Real-time validation for berat daging vs berat sapi
- Error display for validation failures
- Success message after successful slaughter
- Loading state during submission

### Display Components

1. **Statistics Cards**

   - Sapi Tersedia
   - Total Penyembelihan
   - Total Daging (kg)

2. **Transaction History Table**
   - Tanggal
   - ID Sapi (truncated)
   - Info Sapi (jenis, kelamin, berat)
   - Berat Daging
   - Status (always "Selesai")
   - CID (truncated)

## Error Handling

### Validation Errors (400)

- Berat daging exceeds berat sapi
- Sapi already slaughtered
- Invalid ownership/permissions
- Invalid entity types

### Not Found (404)

- Sapi not found
- Entity not found
- Pengecekan halal sehat not found

### Example Usage

```javascript
// Get available sapi for jagal
GET / api / transaksi - penyembelihan / available - sapi / JAGAL / jagal - uuid;

// Slaughter sapi
POST / api / transaksi -
  penyembelihan /
    {
      sapiId: "sapi-123",
      beratDaging: 180.5,
      penyembelihId: "jagal-456",
      penyembelihType: "JAGAL",
    };

// Get slaughter history
GET / api / transaksi - penyembelihan / entity / JAGAL / jagal - 456;
```

## Database Changes After Slaughter

1. **Sapi**: ownership fields set to null
2. **Daging**: new record created with sapiId and berat
3. **TransaksiPenyembelihan**: transaction recorded
4. **Jagal**: jumlahSapi -1, jumlahDaging +1
5. **IPFS**: transaction data uploaded for immutability
