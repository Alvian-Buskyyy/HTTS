import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';

const DistributorProfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', companyName:'', address:'', city:'', province:'', postalCode:'', siup:'', npwp:'', contactPerson:'', bio:'' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [distEntityId, setDistEntityId] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const API_BASE = 'http://localhost:3000';

  useEffect(()=>{
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
        let distributorId = user?.entityId || null;

        // Fallback: ambil distributorId dari /profile/:userId
        if (!distributorId && userId) {
          const profileRes = await fetch(`${API_BASE}/profile/${userId}`, { headers });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            distributorId = profileData?.distributor?.id || profileData?.distributorId || null;
          }
        }

        let distributorEntity = null;
        if (distributorId) {
          const distRes = await fetch(`${API_BASE}/distributor/${distributorId}`, { headers });
          if (distRes.ok) {
            distributorEntity = await distRes.json();
          }
        }

        // Ambil data profil pengguna (username, email, foto)
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
          id: distributorEntity?.id || distributorId || userId || '—',
          username,
          name: distributorEntity?.namaUsaha || user?.name || '—',
          email,
          phone: distributorEntity?.noTelepon || user?.phone || '—',
          companyName: distributorEntity?.namaUsaha || '—',
          address: distributorEntity?.alamat || '',
          city: '',
          province: '',
          postalCode: '',
          siup: '',
          npwp: '',
          contactPerson: '',
          bio: '',
          profileImage: profileImage || 'https://via.placeholder.com/128?text=DIST',
          joinDate,
          lastLogin
        };

        setUserData(mapped);
        setDistEntityId(distributorId || distributorEntity?.id || null);
        setFormData({
          name: mapped.name,
          email: mapped.email,
          phone: mapped.phone,
          companyName: mapped.companyName,
          address: mapped.address,
          city: mapped.city,
          province: mapped.province,
          postalCode: mapped.postalCode,
          siup: mapped.siup,
          npwp: mapped.npwp,
          contactPerson: mapped.contactPerson,
          bio: mapped.bio
        });
      } catch (e) {
        console.error('Gagal memuat profil Distributor:', e);
        setError('Gagal memuat profil Distributor');
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
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
      const distributorId = distEntityId || user?.entityId || null;

      const payload = {
        namaUsaha: formData.companyName || formData.name,
        alamat: formData.address,
        noTelepon: formData.phone
      };
      const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));

      let ok = false;
      // 1) User-first: coba update via /distributor/user/:userId
      if (userId) {
        const userPutRes = await fetch(`${API_BASE}/distributor/user/${userId}`, { method: 'PUT', headers, body: JSON.stringify(cleanPayload) });
        if (userPutRes.ok) {
          const updated = await userPutRes.json();
          setUserData(u => ({
            ...u,
            name: updated?.namaUsaha ?? u.name,
            companyName: updated?.namaUsaha ?? u.companyName,
            address: updated?.alamat ?? u.address,
            phone: updated?.noTelepon ?? u.phone
          }));
        } else {
          const errText = await userPutRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil Distributor'); } catch { setError('Gagal memperbarui profil Distributor'); }
        }
        ok = userPutRes.ok;
      }

      // 2) Fallback ke /distributor/:id bila user-first gagal
      if (!ok && distributorId) {
        const putRes = await fetch(`${API_BASE}/distributor/${distributorId}`, { method: 'PUT', headers, body: JSON.stringify(cleanPayload) });
        if (putRes.ok) {
          const updated = await putRes.json();
          setUserData(u => ({
            ...u,
            name: updated?.namaUsaha ?? u.name,
            companyName: updated?.namaUsaha ?? u.companyName,
            address: updated?.alamat ?? u.address,
            phone: updated?.noTelepon ?? u.phone
          }));
        } else {
          const errText = await putRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil Distributor'); } catch { setError('Gagal memperbarui profil Distributor'); }
        }
        ok = putRes.ok;
      }

      // Optional fallback ke /profile/:userId untuk sinkron data umum
      // 3) Fallback terakhir: sinkron data umum via /profile/:userId
      if (!ok && userId) {
        const profilePayload = {
          alamat: formData.address,
          noTelepon: formData.phone
        };
        const profRes = await fetch(`${API_BASE}/profile/${userId}`, { method: 'PUT', headers, body: JSON.stringify(Object.fromEntries(Object.entries(profilePayload).filter(([_, v]) => v !== undefined))) });
        if (profRes.ok) {
          const profData = await profRes.json();
          const updatedProfile = profData?.profile || profData; // handle bentuk respons
          setUserData(u => ({
            ...u,
            address: updatedProfile?.alamat ?? u.address,
            phone: updatedProfile?.noTelepon ?? u.phone
          }));
        } else {
          const errText = await profRes.text();
          try { const j = JSON.parse(errText); setError(j.error || 'Gagal memperbarui profil Distributor'); } catch { setError('Gagal memperbarui profil Distributor'); }
        }
        ok = profRes.ok;
      }

      if (!ok) throw new Error('Gagal memperbarui profil Distributor');

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
    <DashboardLayout title="Profil Distributor" role="DISTRIBUTOR" customSidebar={<DistributorSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
      ) : (
        <div className="mt-4 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-left">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 mb-4 relative">
                  <img src={userData.profileImage} alt={userData.name} className="rounded-full w-full h-full object-cover border-4 border-primaryLight" />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
                    <label className="cursor-pointer" title="Ubah foto profil">
                      <i className="fas fa-camera text-primary"></i>
                      <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                <p className="text-gray-500 mb-2">{userData.companyName}</p>
                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">DISTRIBUTOR</div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Bergabung sejak</span><span className="font-medium">{formatDate(userData.joinDate)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Login terakhir</span><span className="font-medium">{formatDateTime(userData.lastLogin)}</span></div>
                {error && (<div className="mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm"><i className="fas fa-exclamation-circle mr-1"></i>{error}</div>)}
                {photoUploading && (<div className="mt-2 text-xs text-gray-500">Mengunggah foto...</div>)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 text-left">
              {updateSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Profil berhasil diperbarui!</span></div>)}
              {error && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><i className="fas fa-exclamation-circle mr-2"></i><span>{error}</span></div>)}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Perusahaan</h2>
                {!isEditing ? (
                  <button type="button" onClick={()=>setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm border-2 border-blue-400 shadow-md"><i className="fas fa-edit mr-1"></i> Edit Profil</button>
                ) : (
                  <button type="button" onClick={()=>setIsEditing(false)} className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md"><i className="fas fa-times mr-1"></i> Batal</button>
                )}
              </div>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500 mb-1">Nama Perusahaan</p><p className="font-medium">{userData.name}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Username</p><p className="font-medium">{userData.username}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Email</p><p className="font-medium">{userData.email}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nomor Telepon</p><p className="font-medium">{userData.phone}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">SIUP</p><p className="font-medium">{userData.siup}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">NPWP</p><p className="font-medium">{userData.npwp}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Alamat</p><p className="font-medium">{userData.address}, {userData.city}, {userData.province} {userData.postalCode}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Contact Person</p><p className="font-medium">{userData.contactPerson}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Tentang Perusahaan</p><p className="font-medium">{userData.bio}</p></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(formData).map(([key, val]) => (
                    <div key={key} className={key==='bio' || key==='address' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                      {key==='bio' || key==='address' ? (
                        <textarea name={key} value={val} onChange={handleInputChange} rows={key==='bio'?3:2} className="w-full border border-gray-300 rounded-md py-2 px-3"></textarea>
                      ) : (
                        <input name={key} value={val} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2 flex justify-end">
                    <button type="button" onClick={()=>setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mr-3" disabled={isSubmitting}>Batal</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DistributorProfil;
