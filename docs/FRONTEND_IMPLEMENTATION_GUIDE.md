# Frontend Implementation Guide

## Overview
Panduan implementasi untuk Frontend Developer berdasarkan perubahan backend yang telah dilakukan.

## 1. Dashboard Inventaris Sapi per Entitas

### Endpoint
```
GET /sapi/entity/:entityType/:entityId
```

### Implementation Example (React)

```jsx
import { useState, useEffect } from 'react';

function DashboardInventarisSapi({ entityType, entityId }) {
  const [sapi, setSapi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSapi();
  }, [entityType, entityId]);

  const fetchSapi = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/sapi/entity/${entityType}/${entityId}`
      );
      const data = await response.json();
      setSapi(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sapi:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory-dashboard">
      <h2>Inventaris Sapi - {entityType}</h2>
      <div className="sapi-grid">
        {sapi.map((s) => (
          <div key={s.id} className="sapi-card">
            <h3>{s.jenis}</h3>
            <p>Usia: {s.usia} bulan</p>
            <p>Kelamin: {s.kelamin}</p>
            <p>Berat: {s.beratSapi} kg</p>
            <p>Asal: {s.asalType}</p>
            
            {/* Tombol Generate QR */}
            <button onClick={() => generateQR(s.id)}>
              Generate QR Code
            </button>
            
            {/* Info Pengecekan Kesehatan */}
            {s.pengecekanSehat?.length > 0 && (
              <div className="health-check">
                <span className="badge-success">
                  Sudah Cek Kesehatan
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Features to Implement
- ✅ Filter sapi berdasarkan entitas yang login
- ✅ Display informasi lengkap sapi (termasuk berat)
- ✅ Button untuk generate QR code
- ✅ Status pengecekan kesehatan
- ✅ Riwayat transaksi sapi

---

## 2. Landing Page - Section "Teman Halal"

### Endpoint
```
GET /entities/registered
```

### Implementation Example (React)

```jsx
import { useState, useEffect } from 'react';

function TemanHalalSection() {
  const [entities, setEntities] = useState({
    peternak: [],
    pasarHewan: [],
    jagal: [],
    rph: [],
    distributor: [],
    horeka: []
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const response = await fetch('http://localhost:3000/entities/registered');
      const data = await response.json();
      setEntities(data.grouped);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  return (
    <section className="teman-halal-section">
      <h2>Teman Halal Kami</h2>
      <p>Mitra terpercaya dalam sistem traceability halal</p>
      
      {/* Tabs untuk kategori */}
      <div className="tabs">
        <button onClick={() => setActiveTab('all')}>Semua</button>
        <button onClick={() => setActiveTab('peternak')}>Peternak</button>
        <button onClick={() => setActiveTab('pasarHewan')}>Pasar Hewan</button>
        <button onClick={() => setActiveTab('rph')}>RPH</button>
        <button onClick={() => setActiveTab('distributor')}>Distributor</button>
        <button onClick={() => setActiveTab('horeka')}>Horeka</button>
      </div>

      {/* Grid of entities */}
      <div className="entities-grid">
        {(activeTab === 'all' 
          ? [...entities.peternak, ...entities.pasarHewan, ...entities.rph, 
             ...entities.distributor, ...entities.horeka]
          : entities[activeTab]
        ).map((entity) => (
          <div key={entity.id} className="entity-card">
            <div className="entity-badge">{entity.type}</div>
            <h3>{entity.nama || entity.namaUsaha}</h3>
            <p>{entity.alamat}</p>
            <p>{entity.noTelepon}</p>
            {entity.sertifikatNKV && (
              <span className="badge-certified">Bersertifikat NKV</span>
            )}
            {entity.sertifikatHalal && (
              <span className="badge-certified">Bersertifikat Halal</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Design Suggestions
- Card-based layout untuk setiap entitas
- Badge untuk menunjukkan tipe entitas (Peternak, RPH, dll)
- Icon untuk sertifikat (NKV, Halal)
- Filter/tabs untuk kategori entitas
- Search functionality
- Map integration (optional) untuk lokasi entitas

---

## 3. QR Code Generation & Display

### Generate QR Code

```jsx
function QRCodeGenerator({ sapiId, dagingId }) {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sapiId: sapiId, 
          dagingId: dagingId 
        })
      });
      
      const data = await response.json();
      setQrImage(data.qrImage);
      setLoading(false);
    } catch (error) {
      console.error('Error generating QR:', error);
      setLoading(false);
    }
  };

  return (
    <div className="qr-generator">
      <button onClick={generateQR} disabled={loading}>
        {loading ? 'Generating...' : 'Generate QR Code'}
      </button>
      
      {qrImage && (
        <div className="qr-display">
          <img src={qrImage} alt="QR Code" />
          <button onClick={() => downloadQR(qrImage)}>
            Download QR
          </button>
          <button onClick={() => printQR(qrImage)}>
            Print QR
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function untuk download QR
function downloadQR(qrImage) {
  const link = document.createElement('a');
  link.href = qrImage;
  link.download = `qr-code-${Date.now()}.png`;
  link.click();
}

// Helper function untuk print QR
function printQR(qrImage) {
  const printWindow = window.open('', '', 'width=600,height=600');
  printWindow.document.write(`
    <html>
      <head><title>Print QR Code</title></head>
      <body style="text-align:center;">
        <img src="${qrImage}" style="max-width:100%;" />
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
```

---

## 4. Transaksi Penjualan dengan Validasi

### Form Transaksi Penjualan

```jsx
import { useState, useEffect } from 'react';

function FormTransaksiPenjualan() {
  const [formData, setFormData] = useState({
    penjualType: '',
    penjualId: '',
    pembeliType: '',
    pembeliId: '',
    sapiId: '',
    dagingId: '',
    jumlahQty: 1,
    type: 'SAPI'
  });
  
  const [entities, setEntities] = useState({});
  const [sapis, setSapis] = useState([]);
  const [validationStatus, setValidationStatus] = useState({
    penjual: null,
    pembeli: null
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    const response = await fetch('http://localhost:3000/entities/registered');
    const data = await response.json();
    setEntities(data.grouped);
  };

  const validateEntity = async (entityType, entityId, role) => {
    try {
      const response = await fetch('http://localhost:3000/entities/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId })
      });
      
      const data = await response.json();
      setValidationStatus(prev => ({
        ...prev,
        [role]: data.exists
      }));
      
      return data.exists;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi entitas sebelum submit
    const penjualValid = await validateEntity(
      formData.penjualType, 
      formData.penjualId, 
      'penjual'
    );
    const pembeliValid = await validateEntity(
      formData.pembeliType, 
      formData.pembeliId, 
      'pembeli'
    );

    if (!penjualValid || !pembeliValid) {
      alert('Entitas penjual atau pembeli tidak valid!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/transaksiPenjualan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Transaksi berhasil! IPFS CID: ${data.ipfsCid}`);
        // Reset form atau redirect
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Terjadi kesalahan saat membuat transaksi');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaksi-form">
      <h2>Form Transaksi Penjualan</h2>
      
      {/* Penjual */}
      <div className="form-group">
        <label>Tipe Penjual</label>
        <select 
          value={formData.penjualType}
          onChange={(e) => setFormData({...formData, penjualType: e.target.value})}
          required
        >
          <option value="">Pilih Tipe</option>
          <option value="PETERNAK">Peternak</option>
          <option value="PASAR_HEWAN">Pasar Hewan</option>
          <option value="JAGAL">Jagal</option>
          <option value="RPH">RPH</option>
          <option value="DISTRIBUTOR">Distributor</option>
          <option value="HOREKA">Horeka</option>
        </select>
      </div>

      <div className="form-group">
        <label>Penjual</label>
        <select 
          value={formData.penjualId}
          onChange={(e) => {
            setFormData({...formData, penjualId: e.target.value});
            validateEntity(formData.penjualType, e.target.value, 'penjual');
          }}
          required
        >
          <option value="">Pilih Penjual</option>
          {formData.penjualType && entities[formData.penjualType.toLowerCase()]?.map(entity => (
            <option key={entity.id} value={entity.id}>
              {entity.nama || entity.namaUsaha}
            </option>
          ))}
        </select>
        {validationStatus.penjual !== null && (
          <span className={validationStatus.penjual ? 'valid' : 'invalid'}>
            {validationStatus.penjual ? '✓ Valid' : '✗ Tidak ditemukan'}
          </span>
        )}
      </div>

      {/* Pembeli - similar structure */}
      <div className="form-group">
        <label>Tipe Pembeli</label>
        <select 
          value={formData.pembeliType}
          onChange={(e) => setFormData({...formData, pembeliType: e.target.value})}
          required
        >
          <option value="">Pilih Tipe</option>
          <option value="PETERNAK">Peternak</option>
          <option value="PASAR_HEWAN">Pasar Hewan</option>
          <option value="JAGAL">Jagal</option>
          <option value="RPH">RPH</option>
          <option value="DISTRIBUTOR">Distributor</option>
          <option value="HOREKA">Horeka</option>
        </select>
      </div>

      {/* Item yang dijual */}
      <div className="form-group">
        <label>Tipe Item</label>
        <select 
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          required
        >
          <option value="SAPI">Sapi</option>
          <option value="DAGING">Daging</option>
        </select>
      </div>

      {formData.type === 'SAPI' ? (
        <div className="form-group">
          <label>Pilih Sapi</label>
          <select 
            value={formData.sapiId}
            onChange={(e) => setFormData({...formData, sapiId: e.target.value})}
            required
          >
            <option value="">Pilih Sapi</option>
            {/* Fetch sapi dari inventory penjual */}
          </select>
        </div>
      ) : (
        <div className="form-group">
          <label>Pilih Daging</label>
          <select 
            value={formData.dagingId}
            onChange={(e) => setFormData({...formData, dagingId: e.target.value})}
            required
          >
            <option value="">Pilih Daging</option>
            {/* Fetch daging dari inventory penjual */}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Jumlah</label>
        <input 
          type="number" 
          value={formData.jumlahQty}
          onChange={(e) => setFormData({...formData, jumlahQty: parseInt(e.target.value)})}
          min="1"
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        Buat Transaksi
      </button>
    </form>
  );
}
```

---

## 5. Traceability Page (QR Scan Result)

### Page untuk menampilkan hasil scan QR

```jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function TraceabilitySapi() {
  const { sapiId } = useParams();
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraceability();
  }, [sapiId]);

  const fetchTraceability = async () => {
    try {
      // Fetch sapi detail
      const sapiRes = await fetch(`http://localhost:3000/sapi/${sapiId}`);
      const sapiData = await sapiRes.json();

      // Fetch transaksi penjualan
      const transaksiRes = await fetch(
        `http://localhost:3000/transaksiPenjualan?sapiId=${sapiId}`
      );
      const transaksiData = await transaksiRes.json();

      // Fetch pengecekan kesehatan
      const pengecekanRes = await fetch(
        `http://localhost:3000/pengecekanSehat?sapiId=${sapiId}`
      );
      const pengecekanData = await pengecekanRes.json();

      setTraceData({
        sapi: sapiData,
        transaksi: transaksiData,
        pengecekan: pengecekanData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching traceability:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading traceability data...</div>;
  if (!traceData) return <div>Data not found</div>;

  return (
    <div className="traceability-page">
      <h1>Traceability - Sapi</h1>
      
      {/* Informasi Sapi */}
      <section className="sapi-info">
        <h2>Informasi Sapi</h2>
        <div className="info-grid">
          <div><strong>ID:</strong> {traceData.sapi.id}</div>
          <div><strong>Jenis:</strong> {traceData.sapi.jenis}</div>
          <div><strong>Usia:</strong> {traceData.sapi.usia} bulan</div>
          <div><strong>Kelamin:</strong> {traceData.sapi.kelamin}</div>
          <div><strong>Berat:</strong> {traceData.sapi.beratSapi} kg</div>
          <div><strong>Asal:</strong> {traceData.sapi.asalType}</div>
        </div>
      </section>

      {/* Timeline Transaksi */}
      <section className="timeline">
        <h2>Riwayat Perjalanan</h2>
        <div className="timeline-container">
          {traceData.transaksi.map((t, index) => (
            <div key={t.id} className="timeline-item">
              <div className="timeline-marker">{index + 1}</div>
              <div className="timeline-content">
                <h3>{t.penjualType} → {t.pembeliType}</h3>
                <p>Tanggal: {new Date(t.timestamp).toLocaleDateString()}</p>
                <p>Jumlah: {t.jumlahQty}</p>
                <a href={`https://ipfs.io/ipfs/${t.cid}`} target="_blank">
                  View on IPFS
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pengecekan Kesehatan */}
      <section className="health-checks">
        <h2>Pengecekan Kesehatan</h2>
        {traceData.pengecekan.map((p) => (
          <div key={p.id} className="health-check-item">
            <span className={p.boolean ? 'pass' : 'fail'}>
              {p.boolean ? '✓' : '✗'}
            </span>
            <span>{p.itemSehat.nama}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 6. Required Routes (React Router)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard per entitas */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/inventaris" element={<DashboardInventarisSapi />} />
        
        {/* Transaksi */}
        <Route path="/transaksi/penjualan" element={<FormTransaksiPenjualan />} />
        <Route path="/transaksi/penyembelihan" element={<FormTransaksiPenyembelihan />} />
        
        {/* Traceability (hasil scan QR) */}
        <Route path="/trace/sapi/:sapiId" element={<TraceabilitySapi />} />
        <Route path="/trace/daging/:dagingId" element={<TraceabilityDaging />} />
        
        {/* QR Generator */}
        <Route path="/qr/generate" element={<QRGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 7. State Management Suggestions

### Context untuk User/Entity yang login

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchEntityData(userData.entityType, userData.entityId);
    }
  }, []);

  const fetchEntityData = async (entityType, entityId) => {
    const response = await fetch(
      `http://localhost:3000/entities/${entityType}/${entityId}`
    );
    const data = await response.json();
    setEntity(data.data);
  };

  const login = async (credentials) => {
    // Login logic
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    setUser(data.user);
    setEntity(data.entity);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setEntity(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, entity, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 8. CSS/Styling Suggestions

### Dashboard Cards
```css
.inventory-dashboard {
  padding: 2rem;
}

.sapi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.sapi-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.sapi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.badge-success {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}
```

### Teman Halal Section
```css
.teman-halal-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.entities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.entity-card {
  background: white;
  color: #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.entity-badge {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  margin-bottom: 1rem;
}
```

---

## 9. Additional Features to Implement

### Real-time Updates (WebSocket/SSE)
- Subscribe to transaksi updates
- Notifikasi ketika ada transaksi baru
- Update inventory real-time

### Search & Filter
- Search sapi by ID, jenis, etc
- Filter by status kesehatan
- Filter by date range

### Analytics Dashboard
- Jumlah sapi per entitas
- Grafik transaksi per bulan
- Status kesehatan overview

### Export Features
- Export data sapi ke Excel/CSV
- Print laporan transaksi
- Download QR codes in bulk

---

## 10. Testing Checklist

- [ ] Dashboard menampilkan sapi sesuai entitas yang login
- [ ] Form transaksi validasi entitas dengan benar
- [ ] Generate QR code berhasil dan bisa di-download
- [ ] Landing page menampilkan semua entitas terdaftar
- [ ] Scan QR redirect ke halaman traceability yang benar
- [ ] Traceability page menampilkan riwayat lengkap
- [ ] IPFS links berfungsi dengan baik
- [ ] Responsive design untuk mobile
- [ ] Error handling untuk semua API calls
- [ ] Loading states untuk semua async operations

---

## Support

Jika ada pertanyaan atau butuh bantuan implementasi, silakan kontak backend team atau refer ke:
- `BACKEND/API_DOCUMENTATION.md` - Complete API docs
- `BACKEND/CHANGELOG.md` - Changelog & summary
