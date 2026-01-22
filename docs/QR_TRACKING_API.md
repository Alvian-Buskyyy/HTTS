# QR Tracking API Documentation

## Endpoints

### 1. Track Sapi History
**Endpoint:** `GET /qr/sapi/:sapiId/track`

**Description:** Melacak riwayat kepemilikan dan transaksi sapi dari awal sampai saat ini.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sapi": {
      "id": "string",
      "jenis": "string",
      "kelamin": "string",
      "usia": number,
      "berat": number,
      "isProcessed": boolean,
      "processedAt": "datetime"
    },
    "currentOwner": {
      "type": "EntityType",
      "id": "string",
      "name": "string"
    },
    "history": [
      {
        "id": "string",
        "date": "datetime",
        "fromEntity": "EntityType",
        "fromName": "string",
        "toEntity": "EntityType",
        "toName": "string",
        "verified": boolean,
        "cid": "string",
        "notes": "string"
      }
    ],
    "healthStatus": {
      "sehat": [
        {
          "item": "string",
          "status": boolean,
          "category": "string"
        }
      ],
      "halalSehat": [
        {
          "item": "string",
          "status": boolean,
          "category": "string"
        }
      ]
    }
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/qr/sapi/123e4567-e89b-12d3-a456-426614174000/track \
  -H "Authorization: Bearer your_token_here"
```

---

### 2. Track Daging History
**Endpoint:** `GET /qr/daging/:dagingId/track`

**Description:** Melacak riwayat daging dari penyembelihan sampai distribusi ke konsumen akhir.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "daging": {
      "id": "string",
      "sapiId": "string",
      "beratDaging": number,
      "beratJeroan": number,
      "beratTulang": number,
      "totalBerat": number,
      "sudahDijual": boolean
    },
    "sapi": {
      "id": "string",
      "jenis": "string",
      "kelamin": "string",
      "usia": number,
      "berat": number
    },
    "rph": {
      "id": "string",
      "nama": "string",
      "sertifikatHalal": "string"
    },
    "currentOwner": {
      "type": "EntityType",
      "id": "string",
      "name": "string"
    },
    "halalStatus": {
      "status": "VerificationStatus",
      "verifiedAt": "datetime",
      "verifikasiJagal": boolean,
      "verifikasiRegulator": boolean
    },
    "history": [
      {
        "id": "string",
        "date": "datetime",
        "type": "slaughter" | "sale",
        "fromEntity": "EntityType",
        "fromName": "string",
        "toEntity": "EntityType",
        "toName": "string",
        "verified": boolean,
        "cid": "string",
        "details": {
          "beratDaging": number,
          "beratJeroan": number,
          "beratTulang": number,
          "totalBerat": number,
          "checklistPra": boolean,
          "checklistPasca": boolean
        },
        "notes": "string"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/qr/daging/987fcdeb-51a2-43f7-9c3e-8f2a9b7e4321/track \
  -H "Authorization: Bearer your_token_here"
```

---

## Frontend Integration

### PeternakTracking, JagalTracking, RphTracking, DistributorTracking

Semua tracking pages telah diupdate untuk menggunakan API baru:

```javascript
const handleScan = async (scannedId) => {
  const token = localStorage.getItem("token");
  
  // For Sapi
  const response = await fetch(`http://localhost:3000/qr/sapi/${scannedId}/track`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  // For Daging
  const response = await fetch(`http://localhost:3000/qr/daging/${scannedId}/track`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (response.ok) {
    const result = await response.json();
    setSelectedItem(result.data.sapi || result.data.daging);
    setTrackingHistory(result.data.history);
  }
};
```

---

## Data Types

### EntityType
```
PETERNAK | PASAR_HEWAN | JAGAL | RPH | DISTRIBUTOR | HOREKA | END_CUSTOMER
```

### VerificationStatus
```
PENDING | VERIFIED | REJECTED | CANCELLED
```

---

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Error Codes:**
- `404` - Sapi atau Daging tidak ditemukan
- `401` - Unauthorized (token tidak valid)
- `500` - Server error

---

## Features

### Sapi Tracking
✅ Riwayat kepemilikan lengkap dari peternak sampai jagal  
✅ Status kesehatan (sehat & halal sehat)  
✅ Informasi pemilik saat ini  
✅ Blockchain verification (CID)  
✅ Status processing (sudah menjadi daging atau belum)

### Daging Tracking  
✅ Riwayat dari penyembelihan sampai konsumen akhir  
✅ Informasi sapi asal  
✅ Detail RPH dan sertifikat halal  
✅ Status verifikasi halal (Jagal & Regulator)  
✅ Detail berat (daging, jeroan, tulang)  
✅ Checklist pra & pasca penyembelihan  
✅ Blockchain verification (CID)

---

## Implementation Status

### Backend ✅
- [x] qrController.js - trackSapi()
- [x] qrController.js - trackDaging()
- [x] qrRoutes.js - GET /qr/sapi/:sapiId/track
- [x] qrRoutes.js - GET /qr/daging/:dagingId/track
- [x] app.js - route integration

### Frontend ✅
- [x] PeternakTracking.jsx - using QR API
- [x] JagalTracking.jsx - using QR API
- [x] RphTracking.jsx - using QR API
- [x] DistributorTracking.jsx - using QR API
- [x] QRTracker.jsx - QR generator & scanner component
- [x] TrackingHistory.jsx - timeline display component
