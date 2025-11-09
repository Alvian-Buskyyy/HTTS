import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE = 'http://localhost:3000';

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    id: '—',
    username: '—',
    email: '—',
    role: 'ADMIN',
    profileImage: 'https://via.placeholder.com/128?text=ADMIN',
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.id || null;
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        let username = user?.username || '';
        let email = user?.email || '';
        let profileImage = null;
        let joinDate = user?.createdAt || new Date().toISOString();
        let lastLogin = new Date().toISOString();

        // Coba ambil data profil lengkap via user profile endpoint
        if (userId) {
          const res = await fetch(`${API_BASE}/users/${userId}/profile`, { headers });
          if (res.ok) {
            const up = await res.json();
            username = up?.username || username;
            email = up?.email || email;
            profileImage = up?.profile?.fotoProfil ? `${API_BASE}${up.profile.fotoProfil}` : null;
            joinDate = up?.createdAt || joinDate;
          } else {
            // Fallback ke profile controller
            const res2 = await fetch(`${API_BASE}/profile/${userId}`, { headers });
            if (res2.ok) {
              const up2 = await res2.json();
              username = up2?.username || username;
              email = up2?.email || email;
              profileImage = up2?.profile?.fotoProfil ? `${API_BASE}${up2.profile.fotoProfil}` : profileImage;
            }
          }
        }

        const mapped = {
          id: userId || '—',
          username: username || '—',
          email: email || '—',
          role: 'ADMIN',
          profileImage: profileImage || 'https://via.placeholder.com/128?text=ADMIN',
          joinDate,
          lastLogin,
        };

        setUserData(mapped);
        setFormData({ username: mapped.username !== '—' ? mapped.username : '', email: mapped.email !== '—' ? mapped.email : '' });
      } catch (e) {
        console.error('Gagal memuat profil Admin:', e);
        setError('Gagal memuat profil Admin');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cleanPayload = (payload) => {
    const cleaned = {};
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
    });
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    try {
      const payload = cleanPayload({ username: formData.username, email: formData.email });
      if (!userData.id || userData.id === '—') throw new Error('User ID tidak ditemukan');
      // Update data user (username/email) via userController
      const putRes = await fetch(`${API_BASE}/users/${userData.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const putText = await putRes.text();
      let putJson;
      try { putJson = JSON.parse(putText); } catch { putJson = { raw: putText }; }
      if (!putRes.ok) {
        throw new Error(`Gagal memperbarui user: ${putRes.status} ${JSON.stringify(putJson)}`);
      }

      // Update localStorage user agar konsisten di UI
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...current, username: putJson?.username || payload.username || current.username, email: putJson?.email || payload.email || current.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUserData((prev) => ({ ...prev, username: updatedUser.username, email: updatedUser.email }));
      setSuccess('Profil Admin berhasil diperbarui');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan profil');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
  };

  const handlePhotoUpload = async () => {
    setSuccess(null);
    setError(null);
    try {
      if (!photoFile) throw new Error('Silakan pilih file foto terlebih dahulu');
      if (!userData.id || userData.id === '—') throw new Error('User ID tidak ditemukan');
      const token = localStorage.getItem('token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const form = new FormData();
      form.append('fotoProfil', photoFile);
      form.append('userId', userData.id);
      const res = await fetch(`${API_BASE}/upload/profile-photo`, {
        method: 'POST',
        headers,
        body: form,
      });
      const txt = await res.text();
      let json; try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
      if (!res.ok) throw new Error(`Gagal mengunggah foto: ${res.status} ${JSON.stringify(json)}`);

      const newUrl = json?.profile?.fotoProfil ? `${API_BASE}${json.profile.fotoProfil}` : userData.profileImage;
      setUserData((prev) => ({ ...prev, profileImage: newUrl }));
      setSuccess('Foto profil berhasil diunggah');
      setPhotoFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat unggah foto');
    }
  };

  return (
    <DashboardLayout title="Profil Admin" role="ADMIN" customSidebar={<AdminSidebar /> }>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status */}
        {loading && (
          <div className="p-3 rounded bg-blue-50 text-blue-700 text-sm">Memuat profil…</div>
        )}
        {error && (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded bg-green-50 text-green-700 text-sm">{success}</div>
        )}

        {/* Kartu profil */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <img
              src={userData.profileImage}
              alt="Foto Profil"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <div className="text-lg font-semibold">{userData.username}</div>
              <div className="text-gray-500 text-sm">{userData.email}</div>
              <div className="text-xs text-gray-400 mt-1">Role: {userData.role}</div>
              <div className="text-xs text-gray-400">ID: {userData.id}</div>
            </div>
          </div>

          {/* Unggah Foto */}
          <div className="mt-4 flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <button type="button" onClick={handlePhotoUpload} className="px-3 py-1.5 bg-primary text-white rounded">
              Unggah Foto
            </button>
          </div>
        </div>

        {/* Form Edit */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Informasi Akun</h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <button type="button" className="px-3 py-1.5 border rounded" onClick={() => setIsEditing(true)}>Edit</button>
              ) : (
                <>
                  <button type="button" className="px-3 py-1.5 border rounded" onClick={() => { setIsEditing(false); setFormData({ username: userData.username, email: userData.email }); }}>Batal</button>
                  <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded">Simpan</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
