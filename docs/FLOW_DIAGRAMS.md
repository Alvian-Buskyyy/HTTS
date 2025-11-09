# System Flow Diagrams - HTTS

## 1. Complete Traceability Flow

```
┌─────────────┐
│  PETERNAK   │
│             │
│ Input Sapi  │
│ - Usia      │
│ - Jenis     │
│ - Kelamin   │
│ - Berat ✨  │
│ - Asal      │
└──────┬──────┘
       │
       │ Generate QR
       ↓
┌─────────────┐
│  QR CODE    │
│  (Sapi)     │
└──────┬──────┘
       │
       │ Transaksi Penjualan
       │ → Upload to IPFS ✨
       ↓
┌─────────────┐
│ PASAR HEWAN │
│             │
│ Inventory   │
│ Sapi        │
└──────┬──────┘
       │
       │ Pengecekan
       │ Kesehatan
       ↓
┌─────────────┐
│ VETERINARIAN│
│             │
│ Health Check│
│ ✓ Sehat     │
└──────┬──────┘
       │
       │ Transaksi Penjualan
       │ → Upload to IPFS ✨
       ↓
┌─────────────┐
│  JAGAL/RPH  │
│             │
│ Pengecekan  │
│ Halal Sehat │
└──────┬──────┘
       │
       │ Penyembelihan
       │ → Upload to IPFS ✨
       ↓
┌─────────────┐
│   DAGING    │
│             │
│ - Berat     │
│ - From Sapi │
└──────┬──────┘
       │
       │ Generate QR
       ↓
┌─────────────┐
│  QR CODE    │
│  (Daging)   │
└──────┬──────┘
       │
       │ Transaksi Penjualan
       │ → Upload to IPFS ✨
       ↓
┌─────────────┐
│ DISTRIBUTOR │
│             │
│ Inventory   │
│ Daging      │
└──────┬──────┘
       │
       │ Transaksi Penjualan
       │ → Upload to IPFS ✨
       ↓
┌─────────────┐
│   HOREKA    │
│             │
│ Restaurant/ │
│ Hotel       │
└──────┬──────┘
       │
       │ Serve to
       ↓
┌─────────────┐
│ END CUSTOMER│
│             │
│ Scan QR →   │
│ See Full    │
│ History     │
└─────────────┘
```

---

## 2. Data Flow to IPFS

```
┌──────────────────────────────────────────┐
│         TRANSACTION CREATED              │
│                                          │
│  {                                       │
│    penjualType: "PETERNAK",              │
│    penjualId: "uuid",                    │
│    pembeliType: "PASAR_HEWAN",           │
│    pembeliId: "uuid",                    │
│    sapiId: "uuid",                       │
│    jumlahQty: 1,                         │
│    timestamp: "2025-11-02T..."           │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ JSON.stringify()
               ↓
┌──────────────────────────────────────────┐
│         UPLOAD TO IPFS                   │
│                                          │
│  ipfs.add(jsonString)                    │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Returns CID
               ↓
┌──────────────────────────────────────────┐
│         GET CID                          │
│                                          │
│  CID: "QmXxXxXxXxXxXxXxXxXx..."         │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Save to Database
               ↓
┌──────────────────────────────────────────┐
│         DATABASE RECORD                  │
│                                          │
│  TransaksiPenjualan {                    │
│    id: "uuid",                           │
│    penjualType: "PETERNAK",             │
│    penjualId: "uuid",                    │
│    ...                                   │
│    cid: "QmXxXxXxXxXxXxXx..." ✨        │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Return to Client
               ↓
┌──────────────────────────────────────────┐
│         API RESPONSE                     │
│                                          │
│  {                                       │
│    message: "Success...",                │
│    data: { /* transaction */ },          │
│    ipfsCid: "QmXxXxXxXx..." ✨          │
│  }                                       │
└──────────────────────────────────────────┘
```

---

## 3. Entity Validation Flow

```
┌──────────────────────────────────────────┐
│    USER CREATES TRANSACTION              │
│                                          │
│  POST /transaksiPenjualan                │
│  {                                       │
│    penjualType: "PETERNAK",             │
│    penjualId: "uuid-123",               │
│    pembeliType: "PASAR_HEWAN",          │
│    pembeliId: "uuid-456",               │
│    ...                                   │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Step 1: Validate Penjual
               ↓
┌──────────────────────────────────────────┐
│    CHECK PENJUAL EXISTS                  │
│                                          │
│  prisma.peternak.findUnique({            │
│    where: { id: "uuid-123" }             │
│  })                                      │
│                                          │
│  ✓ Found or ✗ Not Found                 │
└──────────────┬───────────────────────────┘
               │
               │ If Not Found → Return Error
               │ If Found → Step 2
               ↓
┌──────────────────────────────────────────┐
│    CHECK PEMBELI EXISTS                  │
│                                          │
│  prisma.pasarHewan.findUnique({          │
│    where: { id: "uuid-456" }             │
│  })                                      │
│                                          │
│  ✓ Found or ✗ Not Found                 │
└──────────────┬───────────────────────────┘
               │
               │ If Not Found → Return Error
               │ If Found → Step 3
               ↓
┌──────────────────────────────────────────┐
│    VALIDATE ITEM (SAPI/DAGING)           │
│                                          │
│  prisma.sapi.findUnique({                │
│    where: { id: sapiId }                 │
│  })                                      │
│                                          │
│  ✓ Found or ✗ Not Found                 │
└──────────────┬───────────────────────────┘
               │
               │ All Valid → Step 4
               ↓
┌──────────────────────────────────────────┐
│    UPLOAD TO IPFS                        │
│                                          │
│  const cid = await uploadToIPFS(data)    │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Step 5: Create Transaction
               ↓
┌──────────────────────────────────────────┐
│    CREATE TRANSACTION RECORD             │
│                                          │
│  prisma.transaksiPenjualan.create({      │
│    data: { ..., cid }                    │
│  })                                      │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Step 6: Update Ownership
               ↓
┌──────────────────────────────────────────┐
│    UPDATE SAPI OWNERSHIP                 │
│                                          │
│  prisma.sapi.update({                    │
│    where: { id: sapiId },                │
│    data: {                               │
│      peternakId: null,                   │
│      pasarHewanId: "uuid-456" ✨        │
│    }                                     │
│  })                                      │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Return Success
               ↓
┌──────────────────────────────────────────┐
│    RETURN SUCCESS RESPONSE               │
│                                          │
│  {                                       │
│    message: "Transaksi berhasil...",     │
│    data: { /* transaction */ },          │
│    ipfsCid: "QmXxXx..." ✨              │
│  }                                       │
└──────────────────────────────────────────┘
```

---

## 4. QR Code Generation Flow

```
┌──────────────────────────────────────────┐
│    USER REQUESTS QR CODE                 │
│                                          │
│  POST /qr/generate                       │
│  {                                       │
│    sapiId: "uuid-sapi"                   │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Step 1: Fetch Sapi Data
               ↓
┌──────────────────────────────────────────┐
│    GET SAPI WITH RELATIONS               │
│                                          │
│  prisma.sapi.findUnique({                │
│    where: { id: "uuid-sapi" },           │
│    include: {                            │
│      peternak: true,                     │
│      transaksiPenjualan: true,           │
│      pengecekanSehat: true,              │
│      pengecekanHalalSehat: true          │
│    }                                     │
│  })                                      │
└──────────────┬───────────────────────────┘
               │
               │ Step 2: Prepare QR Data
               ↓
┌──────────────────────────────────────────┐
│    CREATE QR DATA OBJECT                 │
│                                          │
│  {                                       │
│    type: "SAPI",                         │
│    id: "uuid-sapi",                      │
│    jenis: "Limosin",                     │
│    usia: 24,                             │
│    beratSapi: 450.5,                     │
│    asalType: "PETERNAK",                 │
│    asalId: "uuid-peternak",              │
│    traceUrl: "http://...trace/sapi/..." │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Step 3: Generate QR Image
               ↓
┌──────────────────────────────────────────┐
│    GENERATE QR CODE IMAGE                │
│                                          │
│  QRCode.toDataURL(JSON.stringify(data))  │
│                                          │
│  Returns: "data:image/png;base64,..."    │
└──────────────┬───────────────────────────┘
               │
               │ Step 4: Save to Database
               ↓
┌──────────────────────────────────────────┐
│    SAVE QR RECORD                        │
│                                          │
│  prisma.qR.create({                      │
│    data: {                               │
│      sapiId: "uuid-sapi",                │
│      urlQR: "data:image/png;base64,..."  │
│    }                                     │
│  })                                      │
└──────────────┬───────────────────────────┘
               │
               │ Return QR Image
               ↓
┌──────────────────────────────────────────┐
│    RETURN QR CODE                        │
│                                          │
│  {                                       │
│    message: "QR Code berhasil...",       │
│    qr: { /* QR record */ },              │
│    qrImage: "data:image/png;base64,..." ✨│
│  }                                       │
└──────────────────────────────────────────┘
```

---

## 5. Dashboard Inventory Flow (Frontend)

```
┌──────────────────────────────────────────┐
│    USER LOGS IN AS PETERNAK              │
│                                          │
│  User ID: "user-123"                     │
│  Entity Type: "PETERNAK"                 │
│  Entity ID: "peternak-456"               │
└──────────────┬───────────────────────────┘
               │
               │ Navigate to Dashboard
               ↓
┌──────────────────────────────────────────┐
│    DASHBOARD PAGE LOADS                  │
│                                          │
│  useEffect(() => {                       │
│    fetchInventory()                      │
│  }, [])                                  │
└──────────────┬───────────────────────────┘
               │
               │ API Call
               ↓
┌──────────────────────────────────────────┐
│    FETCH SAPI BY ENTITY                  │
│                                          │
│  GET /sapi/entity/PETERNAK/peternak-456  │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Returns Sapi List
               ↓
┌──────────────────────────────────────────┐
│    DISPLAY SAPI CARDS                    │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Limosin │ │ Brahman │ │ Ongole  │    │
│  │ 24 bln  │ │ 30 bln  │ │ 18 bln  │    │
│  │ 450 kg  │ │ 520 kg  │ │ 380 kg  │    │
│  │         │ │         │ │         │    │
│  │ [Gen QR]│ │ [Gen QR]│ │ [Gen QR]│    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ User Clicks "Generate QR"
               ↓
┌──────────────────────────────────────────┐
│    GENERATE QR CODE                      │
│                                          │
│  POST /qr/generate                       │
│  { sapiId: "uuid-sapi-1" }               │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Display QR in Modal
               ↓
┌──────────────────────────────────────────┐
│    SHOW QR CODE MODAL                    │
│                                          │
│    ┌────────────────────┐                │
│    │   [QR CODE IMAGE]  │                │
│    │   ▓▓▓▓▓▓▓▓▓▓▓▓▓   │                │
│    │   ▓           ▓   │                │
│    │   ▓  QR CODE  ▓   │                │
│    │   ▓           ▓   │                │
│    │   ▓▓▓▓▓▓▓▓▓▓▓▓▓   │                │
│    │                    │                │
│    │  [Download] [Print]│                │
│    └────────────────────┘                │
│                                          │
└──────────────────────────────────────────┘
```

---

## 6. Landing Page "Teman Halal" Flow

```
┌──────────────────────────────────────────┐
│    VISITOR OPENS LANDING PAGE            │
│                                          │
│  URL: http://localhost:5173/             │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Page Loads
               ↓
┌──────────────────────────────────────────┐
│    FETCH REGISTERED ENTITIES             │
│                                          │
│  GET /entities/registered                │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Returns All Entities
               ↓
┌──────────────────────────────────────────┐
│    DISPLAY "TEMAN HALAL" SECTION         │
│                                          │
│  ╔══════════════════════════════════════╗│
│  ║      TEMAN HALAL KAMI                ║│
│  ║  Mitra Terpercaya dalam Sistem      ║│
│  ╚══════════════════════════════════════╝│
│                                          │
│  [Semua] [Peternak] [RPH] [Distributor] │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ PETERNAK │ │ PETERNAK │ │   RPH    │ │
│  │ Pak Budi │ │ Bu Ani   │ │ RPH Maju │ │
│  │ ✓ NKV    │ │ ✓ NKV    │ │ ✓ Halal  │ │
│  │ Jakarta  │ │ Bandung  │ │ Jakarta  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │DISTRIBUTOR│ │  HOREKA  │ │  HOREKA  │ │
│  │ PT. XYZ  │ │ Rest ABC │ │ Hotel 123│ │
│  │ Jakarta  │ │ Jakarta  │ │ Bali     │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

---

## 7. Traceability Page Flow (QR Scan)

```
┌──────────────────────────────────────────┐
│    END CUSTOMER SCANS QR CODE            │
│                                          │
│  QR Data: {                              │
│    type: "DAGING",                       │
│    id: "uuid-daging",                    │
│    traceUrl: "http://.../daging/uuid"    │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Redirect to Trace URL
               ↓
┌──────────────────────────────────────────┐
│    TRACEABILITY PAGE LOADS               │
│                                          │
│  /trace/daging/uuid-daging               │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Fetch Data
               ↓
┌──────────────────────────────────────────┐
│    FETCH COMPLETE HISTORY                │
│                                          │
│  1. GET /daging/:dagingId                │
│  2. GET /sapi/:sapiId (from daging)      │
│  3. GET /transaksiPenjualan?sapiId=...   │
│  4. GET /transaksiPenyembelihan?sapiId=..│
│  5. GET /pengecekanSehat?sapiId=...      │
│  6. GET /pengecekanHalalSehat?sapiId=... │
│                                          │
└──────────────┬───────────────────────────┘
               │
               │ Display Timeline
               ↓
┌──────────────────────────────────────────┐
│    DISPLAY TRACEABILITY TIMELINE         │
│                                          │
│  ╔══════════════════════════════════════╗│
│  ║   TRACEABILITY - DAGING              ║│
│  ╚══════════════════════════════════════╝│
│                                          │
│  📍 ASAL SAPI                            │
│     • Peternak: Pak Budi                 │
│     • Jenis: Limosin                     │
│     • Berat: 450 kg                      │
│     • [IPFS: QmXxXx...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 TRANSAKSI 1                          │
│     • Dari: Peternak → Pasar Hewan      │
│     • Tanggal: 1 Jan 2025               │
│     • [IPFS: QmYyYy...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 CEK KESEHATAN                        │
│     ✓ Tidak ada penyakit                │
│     ✓ Kondisi sehat                     │
│     • [IPFS: QmZzZz...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 TRANSAKSI 2                          │
│     • Dari: Pasar Hewan → RPH           │
│     • Tanggal: 5 Jan 2025               │
│     • [IPFS: QmAaAa...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 CEK HALAL & SEHAT                    │
│     ✓ Halal (RPH Bersertifikat)         │
│     ✓ Juleha: Ahmad (Sertifikat #123)   │
│     • [IPFS: QmBbBb...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 PENYEMBELIHAN                        │
│     • RPH: RPH Maju Jaya                │
│     • Daging: 250 kg                    │
│     • Tanggal: 6 Jan 2025               │
│     • [IPFS: QmCcCc...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 TRANSAKSI 3                          │
│     • Dari: RPH → Distributor           │
│     • [IPFS: QmDdDd...]                  │
│                                          │
│  ↓                                       │
│                                          │
│  📍 TRANSAKSI 4                          │
│     • Dari: Distributor → Horeka        │
│     • [IPFS: QmEeEe...]                  │
│                                          │
│  ✓ VERIFIED & HALAL                     │
│                                          │
└──────────────────────────────────────────┘
```

---

## Legend

- ✨ = New feature/field
- ✓ = Valid/Passed
- ✗ = Invalid/Failed
- → = Process flow
- ↓ = Next step
- CID = Content Identifier (IPFS hash)

---

**These diagrams show the complete flow of the system from input to final traceability!**
