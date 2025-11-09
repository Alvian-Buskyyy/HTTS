import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const RegulatorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [regEntityId, setRegEntityId] = useState(null);
  const [userData, setUserData] = useState({ id:'—', username:'', email:'', role:'REGULATOR', name:'', instansi:'', jabatan:'', profileImage:'', joinDate:'', lastLogin:'' });
  const [formData, setFormData] = useState({ name:'', instansi:'', jabatan:'' });

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user?.id;
        let regulatorId = user?.entityId || null;

        // Fallback ambil entityId via profil
        if (!regulatorId && userId) {
          const profileRes = await fetch(`${API_BASE}/profile/${userId}`, { headers });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            regulatorId = profileData?.regulator?.id || profileData?.regulatorId || null;
          }
        }

        // Fetch entity Regulator
        let regulatorEntity = null;
        if (regulatorId) {
          const regRes = await fetch(`${API_BASE}/Regulator/${regulatorId}`, { headers });
          if (regRes.ok) {
            regulatorEntity = await regRes.json();
          } else {
            // Coba dengan lowercase path jika diperlukan
            const regRes2 = await fetch(`${API_BASE}/regulator/${regulatorId}`, { headers });
            if (regRes2.ok) regulatorEntity = await regRes2.json();
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
          id: regulatorEntity?.id || regulatorId || userId || '—',
          username,
          email,
          role: 'REGULATOR',
          name: regulatorEntity?.nama || user?.name || '—',
          instansi: regulatorEntity?.instansi || '',
          jabatan: regulatorEntity?.jabatan || '',
          profileImage: profileImage || 'https://via.placeholder.com/128?text=REG',
          joinDate,
          lastLogin
        };

        setUserData(mapped);
        setRegEntityId(regulatorId || regulatorEntity?.id || null);
        setFormData({ name: mapped.name, instansi: mapped.instansi, jabatan: mapped.jabatan });
      } catch (e) {
        console.error('Gagal memuat profil Regulator:', e);
        setError('Gagal memuat profil Regulator');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }); } catch { return '—'; } };
  const formatDateTime = (d) => { try { return new Date(d).toLocaleString('id-ID'); } catch { return '—'; } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const entityId = regEntityId;
      const payload = {
        nama: formData.name,
        instansi: formData.instansi || undefined,
        jabatan: formData.jabatan || undefined,
      };
      const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

      let ok = false;
      if (entityId) {
        // Coba PUT dengan dua kemungkinan jalur (case sensitivity)
        let putRes = await fetch(`${API_BASE}/Regulator/${entityId}`, { method: 'PUT', headers, body: JSON.stringify(cleanPayload) });
        if (!putRes.ok) {
          putRes = await fetch(`${API_BASE}/regulator/${entityId}`, { method: 'PUT', headers, body: JSON.stringify(cleanPayload) });
        }
        if (!putRes.ok) {
          const errText = await putRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil Regulator'); } catch { setError('Gagal memperbarui profil Regulator'); }
        }
        ok = putRes.ok;
      }

      if (!ok) throw new Error('Gagal memperbarui profil Regulator');

      setUserData(u => ({ ...u, name: formData.name, instansi: formData.instansi, jabatan: formData.jabatan }));
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

  return (
    <DashboardLayout role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kartu Profil */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 text-left">
          {updateSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">Profil berhasil diperbarui!</div>)}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Informasi Regulator</h2>
            {!isEditing ? (
              <button type="button" onClick={()=>setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm">Edit Profil</button>
            ) : (
              <button type="button" onClick={()=>setIsEditing(false)} className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md">Batal</button>
            )}
          </div>
          {loading ? (
            <div className="text-gray-500">Memuat profil...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData(f=>({ ...f, name: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instansi</label>
                  <input type="text" value={formData.instansi} onChange={e=>setFormData(f=>({ ...f, instansi: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Nama instansi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input type="text" value={formData.jabatan} onChange={e=>setFormData(f=>({ ...f, jabatan: e.target.value }))} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md ${!isEditing?'bg-gray-50':''}`} placeholder="Jabatan" />
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" disabled={!isEditing || isSubmitting} className={`px-4 py-2 rounded-md text-white ${isEditing? 'bg-primary hover:bg-primaryDark':'bg-gray-300 cursor-not-allowed'}`}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegulatorProfile;
