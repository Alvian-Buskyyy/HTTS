import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faDrumstickBite, faShoppingCart, faCheckCircle, faUser, 
  faCog, faSignOutAlt, faBars, faBell, faUtensils, faTruck, 
  faCheckDouble, faQrcode, faTag, faEye, faFilter, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const HorecaPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [horecaData, setHorecaData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activities, setActivities] = useState([]);
  // Profil HoReCa
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [horekaEntityId, setHorekaEntityId] = useState(null);
  const [userData, setUserData] = useState({ id:'—', username:'', name:'', email:'', phone:'', address:'', profileImage:'', joinDate:'', lastLogin:'' });
  const [formData, setFormData] = useState({ name:'', address:'', phone:'', tanggalPenerimaan:'', kondisiProduk:'' });

  const API_BASE = 'http://localhost:3000';
  
  useEffect(() => {
    // Fetch horeca data from API
    const fetchHorecaData = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/horeca/current');
        const data = await response.json();
        setHorecaData(data);
      } catch (error) {
        console.error('Error fetching horeca data:', error);
      }
    };

    // Fetch inventory from API
    const fetchInventory = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/daging');
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    // Fetch purchases from API
    const fetchPurchases = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch('/api/transaksi-penjualan');
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    // Fetch activities
    const fetchActivities = async () => {
      try {
        // This could be a combined API that gets different activities
        const response = await fetch('/api/activity');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchHorecaData();
    fetchInventory();
    fetchPurchases();
    fetchActivities();
  }, []);

  // Fetch Profil HoReCa
  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        setError('');
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user?.id;
        let horekaId = user?.entityId || null;

        // Fallback ambil entityId dari profil
        if (!horekaId && userId) {
          const profileRes = await fetch(`${API_BASE}/profile/${userId}`, { headers });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            horekaId = profileData?.horeka?.id || profileData?.horekaId || null;
          }
        }

        // Fetch entity HoReCa
        let horekaEntity = null;
        if (horekaId) {
          const horekaRes = await fetch(`${API_BASE}/horeka/${horekaId}`, { headers });
          if (horekaRes.ok) {
            horekaEntity = await horekaRes.json();
          }
        }

        // Fetch user profile (username, email, foto)
        let username = user?.username || '';
        let email = user?.email || '';
        let profileImage = null;
        let joinDate = user?.createdAt || new Date().toISOString();
        let lastLogin = new Date().toISOString();
        if (userId) {
          const userProfileRes = await fetch(`${API_BASE}/profile/${userId}`, { headers });
          if (userProfileRes.ok) {
            const up = await userProfileRes.json();
            username = up?.username || username;
            email = up?.email || email;
            profileImage = up?.profile?.fotoProfil ? `${API_BASE}${up.profile.fotoProfil}` : null;
          }
        }

        const mapped = {
          id: horekaEntity?.id || horekaId || userId || '—',
          username,
          name: horekaEntity?.nama || user?.name || '—',
          email,
          phone: horekaEntity?.noTelepon || user?.phone || '',
          address: horekaEntity?.alamat || '',
          profileImage: profileImage || 'https://via.placeholder.com/128?text=HOREKA',
          joinDate,
          lastLogin
        };

        setUserData(mapped);
        setHorekaEntityId(horekaId || horekaEntity?.id || null);
        setFormData({
          name: mapped.name,
          address: mapped.address,
          phone: mapped.phone,
          tanggalPenerimaan: horekaEntity?.tanggalPenerimaan || '',
          kondisiProduk: horekaEntity?.kondisiProduk || ''
        });
      } catch (e) {
        console.error('Gagal memuat profil HoReCa:', e);
        setError('Gagal memuat profil HoReCa');
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }); } catch { return '—'; }
  };
  const formatDateTime = (d) => {
    try { return new Date(d).toLocaleString('id-ID'); } catch { return '—'; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user?.id;
      const entityId = horekaEntityId || user?.entityId || null;

      const payload = {
        nama: formData.name,
        alamat: formData.address,
        noTelepon: formData.phone,
        tanggalPenerimaan: formData.tanggalPenerimaan || undefined,
        kondisiProduk: formData.kondisiProduk || undefined,
      };
      const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

      let ok = false;
      if (entityId) {
        const putRes = await fetch(`${API_BASE}/horeka/${entityId}`, { method: 'PUT', headers, body: JSON.stringify(cleanPayload) });
        if (!putRes.ok) {
          const errText = await putRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil HoReCa'); } catch { setError('Gagal memperbarui profil HoReCa'); }
        }
        ok = putRes.ok;
      }

      // Fallback opsional ke /profile/:userId untuk data umum
      if (!ok && userId) {
        const profilePayload = {
          alamat: formData.address,
          noTelepon: formData.phone
        };
        const profRes = await fetch(`${API_BASE}/profile/${userId}`, { method: 'PUT', headers, body: JSON.stringify(Object.fromEntries(Object.entries(profilePayload).filter(([_, v]) => v !== undefined))) });
        if (!profRes.ok) {
          const errText = await profRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil HoReCa'); } catch { setError('Gagal memperbarui profil HoReCa'); }
        }
        ok = profRes.ok;
      }

      if (!ok) throw new Error('Gagal memperbarui profil HoReCa');

      setUserData(u => ({ ...u, name: formData.name, address: formData.address, phone: formData.phone }));
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(()=>setUpdateSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoUploading(true);
      setError('');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user?.id || userData?.id;
      const token = localStorage.getItem('token');

      const form = new FormData();
      form.append('fotoProfil', file);
      form.append('userId', String(userId));

      const res = await fetch(`${API_BASE}/upload/profile-photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form
      });

      if (!res.ok) throw new Error('Gagal mengunggah foto profil');
      const data = await res.json();
      const url = data?.fotoProfil ? `${API_BASE}${data.fotoProfil}` : null;
      setUserData(u => ({ ...u, profileImage: url || u.profileImage }));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal mengunggah foto');
    } finally {
      setPhotoUploading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Calculate stats
  const calculateStats = () => {
    // Calculate total meat weight
    const totalMeat = inventory.reduce((total, item) => total + (item.berat || 0), 0) || 85;
    
    // Calculate purchases this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const purchasesThisWeek = purchases.filter(purchase => 
      new Date(purchase.timestamp) > oneWeekAgo
    ).length || 8;
    
    // Calculate daily usage (rough estimate - could be more complex in real app)
    const dailyUsage = Math.round(totalMeat / 7) || 12;
    
    // Verified products - in this case always 100%
    const verifiedProducts = "100%";
    
    return {
      totalMeat,
      purchasesThisWeek,
      dailyUsage,
      verifiedProducts
    };
  };

  const stats = calculateStats();

  // Function to handle scanning QR code
  const handleScanQR = () => {
    // This would typically open a camera or file picker
    console.log('Scanning QR code');
    alert('QR code scanner would open here');
  };

  return (
    <div className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg lg:w-64 lg:flex-shrink-0 border-r lg:block ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:block'}`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-center lg:justify-start">
          <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-2xl mr-2" />
          <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
        </div>
        {/* Menu Items */}
        <div className="py-4">
          <div className="px-4 py-2">
            <p className="text-xs uppercase text-gray-500 font-semibold">Utama</p>
          </div>
          <Link 
            to="#dashboard" 
            onClick={() => handlePageChange('dashboard')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'dashboard' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faHome} className="w-6" />
            <span>Dasbor</span>
          </Link>
          <Link 
            to="#inventory" 
            onClick={() => handlePageChange('inventory')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'inventory' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faDrumstickBite} className="w-6" />
            <span>Inventaris Daging</span>
          </Link>
          <Link 
            to="#purchases" 
            onClick={() => handlePageChange('purchases')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'purchases' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="w-6" />
            <span>Riwayat Pembelian</span>
          </Link>
          <Link 
            to="#verification" 
            onClick={() => handlePageChange('verification')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'verification' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="w-6" />
            <span>Verifikasi Halal</span>
          </Link>
          <div className="px-4 py-2 mt-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Akun</p>
          </div>
          <Link 
            to="#profile" 
            onClick={() => handlePageChange('profile')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'profile' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faUser} className="w-6" />
            <span>Profil</span>
          </Link>
          <Link 
            to="#settings" 
            onClick={() => handlePageChange('settings')}
            className={`flex items-center px-4 py-3 text-gray-700 ${activePage === 'settings' ? 'bg-primaryLight border-r-4 border-primary' : 'hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faCog} className="w-6" />
            <span>Pengaturan</span>
          </Link>
          <Link to="/" className="flex items-center px-4 py-3 text-red-500 hover:bg-gray-100">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
            <span>Keluar</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10 sticky top-0">
          <div className="flex items-center justify-between p-4">
            <button 
              className="lg:hidden text-gray-600 focus:outline-none"
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 focus:outline-none">
                <FontAwesomeIcon icon={faBell} className="text-xl" />
              </button>
              <div className="relative">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {horecaData ? horecaData.nama : 'Restoran Barokah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {activePage === 'profile' ? (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Profil HoReCa</h1>
              {loadingProfile ? (
                <div className="text-gray-500">Memuat profil...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Kartu Profil */}
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <div className="w-32 h-32 mb-4 relative mx-auto">
                      <img src={userData.profileImage} alt={userData.name} className="rounded-full w-full h-full object-cover border-4 border-primaryLight" />
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
                        <label className="cursor-pointer" title="Ubah foto profil">
                          <span className="text-primary text-sm">Ubah</span>
                          <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">{userData.name || '—'}</h2>
                    <p className="text-gray-500">{userData.username || '—'}</p>
                    <div className="mt-4 border-t border-gray-200 pt-4 text-left">
                      <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Bergabung sejak</span><span className="font-medium">{formatDate(userData.joinDate)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Login terakhir</span><span className="font-medium">{formatDateTime(userData.lastLogin)}</span></div>
                      {error && (<div className="mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>)}
                      {photoUploading && (<div className="mt-2 text-xs text-gray-500">Mengunggah foto...</div>)}
                    </div>
                  </div>

                  {/* Form Profil */}
                  <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 text-left">
                    {updateSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">Profil berhasil diperbarui!</div>)}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">Informasi HoReCa</h2>
                      {!isEditing ? (
                        <button type="button" onClick={()=>setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm">Edit Profil</button>
                      ) : (
                        <button type="button" onClick={()=>setIsEditing(false)} className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md">Batal</button>
                      )}
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Restoran</label>
                          <input type="text" value={formData.name} onChange={e=>setFormData(f=>({ ...f, name: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Nama usaha" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                          <input type="text" value={formData.phone} onChange={e=>setFormData(f=>({ ...f, phone: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="0812xxxxx" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                          <input type="text" value={formData.address} onChange={e=>setFormData(f=>({ ...f, address: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Alamat lengkap" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Penerimaan</label>
                          <input type="date" value={formData.tanggalPenerimaan} onChange={e=>setFormData(f=>({ ...f, tanggalPenerimaan: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Produk</label>
                          <input type="text" value={formData.kondisiProduk} onChange={e=>setFormData(f=>({ ...f, kondisiProduk: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Beku/Segar/Dll" />
                        </div>
                      </div>
                      <div className="mt-6">
                        <button type="submit" disabled={!isEditing || isSubmitting} className={`px-4 py-2 rounded-md text-white ${isEditing? 'bg-primary hover:bg-primaryDark':'bg-gray-300 cursor-not-allowed'}`}>
                          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dasbor HoReCa</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-primaryLight p-3 mr-4">
                <FontAwesomeIcon icon={faDrumstickBite} className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Daging (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalMeat}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FontAwesomeIcon icon={faShoppingCart} className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pembelian Minggu Ini</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.purchasesThisWeek}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Penggunaan Harian (kg)</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.dailyUsage}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FontAwesomeIcon icon={faCheckDouble} className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Produk Terverifikasi</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.verifiedProducts}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & QR Code Scanner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
                <a href="#" className="text-primary text-sm">Lihat Semua</a>
              </div>
              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.slice(0, 4).map((activity, index) => {
                    // Define activity types for visualization
                    let icon, bgColor, textColor;
                    
                    if (activity.type === 'purchase') {
                      icon = faShoppingCart;
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-600';
                    } else if (activity.type === 'verification') {
                      icon = faCheckCircle;
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-600';
                    } else if (activity.type === 'menu') {
                      icon = faUtensils;
                      bgColor = 'bg-yellow-100';
                      textColor = 'text-yellow-600';
                    } else {
                      icon = faTag;
                      bgColor = 'bg-purple-100';
                      textColor = 'text-purple-600';
                    }
                    
                    return (
                      <div className="flex items-start" key={index}>
                        <div className={`rounded-full ${bgColor} p-2 mr-4`}>
                          <FontAwesomeIcon icon={icon} className={textColor} />
                        </div>
                        <div>
                          <p className="text-gray-800">{activity.message}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="rounded-full bg-green-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Membeli 15kg daging sapi dari Distributor Al-Baraka</p>
                        <p className="text-gray-500 text-sm">Hari ini, 10:30</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Memverifikasi status halal untuk pasokan daging hari ini</p>
                        <p className="text-gray-500 text-sm">Kemarin, 15:45</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-yellow-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faUtensils} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Memperbarui menu dengan hidangan halal baru</p>
                        <p className="text-gray-500 text-sm">Kemarin, 11:20</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-2 mr-4">
                        <FontAwesomeIcon icon={faTag} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">Menerima pembaruan harga dari pemasok</p>
                        <p className="text-gray-500 text-sm">15 Juli 2025, 09:15</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* QR Code Scanner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Verifikasi Daging</h2>
              <div className="text-center mb-4">
                <div className="bg-gray-100 w-40 h-40 mx-auto flex flex-col items-center justify-center rounded-lg">
                  <FontAwesomeIcon icon={faQrcode} className="text-6xl text-primary mb-2" />
                  <p className="text-xs text-gray-500">Bidikan Kamera</p>
                </div>
              </div>
              <button 
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition mb-2"
                onClick={handleScanQR}
              >
                Pindai Kode QR
              </button>
              <p className="text-xs text-gray-500 text-center">
                Pindai kode QR kemasan daging untuk memverifikasi status halal
              </p>
            </div>
          </div>

          {/* Meat Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Inventaris Daging</h2>
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Cari..." 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2" 
                />
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <FontAwesomeIcon icon={faFilter} className="mr-1" /> Filter
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pembelian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Halal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory && inventory.length > 0 ? (
                    inventory.slice(0, 3).map((item, index) => {
                      const meatTypes = ['Daging Sapi (Has Dalam)', 'Daging Sapi (Has Luar)', 'Daging Sapi (Giling)'];
                      const meatType = meatTypes[index % meatTypes.length];
                      
                      const suppliers = ['Distributor Al-Baraka', 'Distributor Rahmat', 'Distributor Al-Baraka'];
                      const supplier = suppliers[index % suppliers.length];
                      
                      const weights = [15, 20, 10];
                      const weight = weights[index % weights.length];
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`MT-2023-00${54 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{meatType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{supplier}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.berat || weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Terverifikasi
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faQrcode} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0054</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Dalam)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">15</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0053</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Luar)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">20</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">MT-2023-0051</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Giling)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">10</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Terverifikasi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faQrcode} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Pembelian Terbaru</h2>
              <a href="#" className="text-primary text-sm">Lihat Semua Pembelian</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemasok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lihat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases && purchases.length > 0 ? (
                    purchases.slice(0, 3).map((purchase, index) => {
                      const meatTypes = ['Daging Sapi (Has Dalam)', 'Daging Sapi (Has Luar)', 'Daging Sapi (Giling)'];
                      const meatType = meatTypes[index % meatTypes.length];
                      
                      const suppliers = ['Distributor Al-Baraka', 'Distributor Rahmat', 'Distributor Al-Baraka'];
                      const supplier = suppliers[index % suppliers.length];
                      
                      const weights = [15, 20, 10];
                      const weight = weights[index % weights.length];
                      
                      return (
                        <tr key={purchase.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{`TR-${5678 - index}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(purchase.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{supplier}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{meatType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{purchase.jumlahQty || weight}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Selesai
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-primary hover:text-primaryDark">
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5678</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Dalam)</td>
                        <td className="px-6 py-4 whitespace-nowrap">15</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5677</td>
                        <td className="px-6 py-4 whitespace-nowrap">16 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Rahmat</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Has Luar)</td>
                        <td className="px-6 py-4 whitespace-nowrap">20</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">TR-5676</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 Jul 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap">Distributor Al-Baraka</td>
                        <td className="px-6 py-4 whitespace-nowrap">Daging Sapi (Giling)</td>
                        <td className="px-6 py-4 whitespace-nowrap">10</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-primary hover:text-primaryDark">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
          &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </div>
  );
};

export default HorecaPage;
