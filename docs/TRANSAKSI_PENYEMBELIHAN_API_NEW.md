# API Documentation - Transaksi Penyembelihan

## Overview

API Transaksi Penyembelihan menangani alur penyembelihan sapi antara Jagal dan RPH dengan proses:

1. **Jagal** mendaftarkan sapi miliknya ke RPH tertentu
2. **RPH** melihat sapi yang didaftarkan dan memproses penyembelihan
3. **Regulator** melakukan verifikasi halal pada daging hasil penyembelihan

## Authentication

Semua endpoint memerlukan authentication dengan Bearer token di header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints untuk Jagal

### 1. Melihat Sapi Milik Jagal

**GET** `/api/transaksi-penyembelihan/jagal/sapi`

**Response:**

```json
{
  "message": "Daftar sapi milik jagal",
  "data": [
    {
      "id": "sapi_id",
      "usia": 3,
      "jenis": "Brahman",
      "kelamin": "Jantan",
      "beratSapi": 450.5,
      "jagal": {
        "id": "jagal_id",
        "nama": "Jagal ABC"
      }
    }
  ]
}
```

### 2. Melihat Daftar RPH yang Tersedia

**GET** `/api/transaksi-penyembelihan/jagal/rph`

**Response:**

```json
{
  "message": "Daftar RPH yang tersedia",
  "data": [
    {
      "id": "rph_id",
      "nama": "RPH Modern",
      "alamat": "Jl. Industri No. 123",
      "noTelepon": "021-1234567",
      "sertifikatHalal": "MUI-001",
      "namaJuleha": "Dr. Ahmad",
      "noSertifJuleha": "JULEHA-001"
    }
  ]
}
```

### 3. Mendaftarkan Sapi untuk Penyembelihan

**POST** `/api/transaksi-penyembelihan/jagal/daftarkan`

**Request Body:**

```json
{
  "sapiId": "sapi_id",
  "rphId": "rph_id"
}
```

**Response:**

```json
{
  "message": "Sapi berhasil didaftarkan untuk penyembelihan",
  "data": {
    "id": "transaksi_id",
    "jagalId": "jagal_id",
    "rphId": "rph_id",
    "sapiId": "sapi_id",
    "status": "PENDING",
    "tanggalPendaftaran": "2024-01-15T10:30:00.000Z",
    "sapi": {
      "usia": 3,
      "jenis": "Brahman",
      "beratSapi": 450.5
    },
    "rph": {
      "nama": "RPH Modern"
    }
  },
  "ipfsCid": "QmXXXXX..."
}
```

---

## Endpoints untuk RPH

### 1. Melihat Sapi yang Didaftarkan ke RPH

**GET** `/api/transaksi-penyembelihan/rph/sapi-pending`

**Response:**

```json
{
  "message": "Daftar sapi yang didaftarkan untuk penyembelihan di RPH ini",
  "data": [
    {
      "id": "transaksi_id",
      "status": "PENDING",
      "tanggalPendaftaran": "2024-01-15T10:30:00.000Z",
      "sapi": {
        "id": "sapi_id",
        "usia": 3,
        "jenis": "Brahman",
        "beratSapi": 450.5,
        "jagal": {
          "nama": "Jagal ABC"
        }
      },
      "jagal": {
        "nama": "Jagal ABC",
        "noTelepon": "081234567890"
      }
    }
  ]
}
```

### 2. Memproses Penyembelihan

**POST** `/api/transaksi-penyembelihan/rph/proses-penyembelihan`

**Request Body:**

```json
{
  "transaksiId": "transaksi_id",
  "beratDaging": 250.5,
  "beratJeroan": 45.2,
  "beratTulang": 80.3
}
```

**Response:**

```json
{
  "message": "Penyembelihan berhasil diproses dan entitas daging telah dibuat untuk Jagal",
  "transaksi": {
    "id": "transaksi_id",
    "status": "PROCESSED",
    "tanggalPemrosesan": "2024-01-15T14:30:00.000Z",
    "beratDaging": 250.5,
    "beratJeroan": 45.2,
    "beratTulang": 80.3,
    "totalBerat": 376.0
  },
  "daging": {
    "id": "daging_id",
    "jagalId": "jagal_id",
    "rphId": "rph_id",
    "beratDaging": 250.5,
    "beratJeroan": 45.2,
    "beratTulang": 80.3,
    "totalBerat": 376.0,
    "statusHalal": "PENDING",
    "kodeVerifikasiHalal": "VH-1642234200000-ABC123"
  },
  "ipfsCid": "QmYYYYY..."
}
```

---

## Endpoints untuk Regulator

### 1. Melihat Daging yang Perlu Verifikasi Halal

**GET** `/api/transaksi-penyembelihan/regulator/daging-pending`

**Response:**

```json
{
  "message": "Daftar daging yang perlu verifikasi halal",
  "data": [
    {
      "id": "daging_id",
      "beratDaging": 250.5,
      "beratJeroan": 45.2,
      "beratTulang": 80.3,
      "statusHalal": "PENDING",
      "kodeVerifikasiHalal": "VH-1642234200000-ABC123",
      "sapi": {
        "jenis": "Brahman",
        "usia": 3
      },
      "jagal": {
        "nama": "Jagal ABC"
      },
      "rph": {
        "nama": "RPH Modern",
        "sertifikatHalal": "MUI-001"
      },
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

### 2. Verifikasi Halal Daging

**POST** `/api/transaksi-penyembelihan/regulator/verifikasi-halal`

**Request Body:**

```json
{
  "dagingId": "daging_id",
  "statusVerifikasi": "VERIFIED"
}
```

_statusVerifikasi: "VERIFIED" atau "REJECTED"_

**Response:**

```json
{
  "message": "Status halal daging berhasil diverifikasi sebagai VERIFIED",
  "daging": {
    "id": "daging_id",
    "statusHalal": "VERIFIED",
    "kodeVerifikasiHalal": "VH-1642234200000-ABC123"
  },
  "ipfsCid": "QmZZZZZ..."
}
```

---

## Endpoints untuk Riwayat dan Statistik

### 1. Riwayat Transaksi Penyembelihan

**GET** `/api/transaksi-penyembelihan/riwayat`

Menampilkan riwayat berdasarkan role user:

- **Jagal**: Transaksi yang didaftarkan oleh jagal tersebut
- **RPH**: Transaksi yang diproses oleh RPH tersebut

**Response:**

```json
{
  "message": "Riwayat transaksi penyembelihan",
  "data": [
    {
      "id": "transaksi_id",
      "status": "PROCESSED",
      "tanggalPendaftaran": "2024-01-15T10:30:00.000Z",
      "tanggalPemrosesan": "2024-01-15T14:30:00.000Z",
      "sapi": {
        "jenis": "Brahman",
        "usia": 3
      },
      "daging": {
        "totalBerat": 376.0,
        "statusHalal": "VERIFIED"
      }
    }
  ]
}
```

### 2. Statistik Penyembelihan

**GET** `/api/transaksi-penyembelihan/statistik`

**Response untuk Jagal:**

```json
{
  "message": "Statistik penyembelihan",
  "data": {
    "totalPendaftaran": 15,
    "totalSelesai": 12,
    "totalDaging": 12,
    "totalPending": 3
  }
}
```

**Response untuk RPH:**

```json
{
  "message": "Statistik penyembelihan",
  "data": {
    "totalDiterima": 25,
    "totalDiproses": 20,
    "totalPending": 5
  }
}
```

---

## Endpoints Umum

### 1. Semua Transaksi Penyembelihan (Admin)

**GET** `/api/transaksi-penyembelihan/`

### 2. Detail Transaksi Penyembelihan

**GET** `/api/transaksi-penyembelihan/detail/:id`

---

## Error Codes

- **400**: Bad Request - Data tidak valid atau request body salah
- **401**: Unauthorized - Token tidak valid atau tidak ada
- **403**: Forbidden - User tidak memiliki akses ke resource
- **404**: Not Found - Resource tidak ditemukan
- **405**: Method Not Allowed - Endpoint tidak diizinkan
- **500**: Internal Server Error - Error server

## Validation Rules

1. **Berat total** hasil penyembelihan tidak boleh melebihi berat sapi
2. **Sapi** harus milik jagal yang mendaftarkan
3. **RPH** harus valid dan terdaftar di sistem
4. **Sapi** tidak boleh sudah disembelih sebelumnya
5. **Status verifikasi** hanya boleh "VERIFIED" atau "REJECTED"

## IPFS Integration

Setiap transaksi disimpan di IPFS dengan struktur:

```json
{
  "action": "PENDAFTARAN_PENYEMBELIHAN|PEMROSESAN_PENYEMBELIHAN|VERIFIKASI_HALAL_DAGING",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    /* transaction details */
  }
}
```

## Blockchain Integration

CID IPFS disimpan dalam smart contract untuk memastikan integritas data dan traceability.
