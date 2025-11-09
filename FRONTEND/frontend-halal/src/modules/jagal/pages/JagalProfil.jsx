import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

const JagalProfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '', // mempertahankan skema yang sama dengan peternak
    address: '',
    city: '',
    province: '',
    postalCode: '',
    establishedYear: '',
    farmSize: '',
    cattleCount: '',
    farmingType: '',
    businessPermitNumber: '',
    certifications: [],
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // States untuk unggah foto profil (mengikuti pola Peternak/PasarHewan)
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userDataStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userDataStr || !token) {
          setLoading(false);
          return;
        }

        const localUserData = JSON.parse(userDataStr);
        const userId = localUserData.id;

        const [userResponse, userProfileResponse] = await Promise.all([
          fetch(`http://localhost:3000/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`http://localhost:3000/users/${userId}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!userResponse.ok) {
          setLoading(false);
          return;
        }

        const user = await userResponse.json();
        const userProfile = userProfileResponse.ok ? await userProfileResponse.json() : null;

        // 1) Coba ambil Jagal via userId endpoint (mapping via Profile di backend)
        try {
          const jagalByUserRes = await fetch(`http://localhost:3000/jagal/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (jagalByUserRes.ok) {
            const jagalByUser = await jagalByUserRes.json();
            const profileImage = (
              userProfile?.profile?.profilePhoto
                ? userProfile.profile.profilePhoto
                : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
            );
            const combinedFromUser = {
              id: user.id,
              username: user.username,
              name: jagalByUser.nama || user.username || '',
              email: user.email,
              phone: jagalByUser.noTelepon || '',
              role: user.role,
              farmName: jagalByUser.nama || '',
              address: jagalByUser.alamat || '',
              city: '',
              province: '',
              postalCode: '',
              establishedYear: '',
              farmSize: '',
              cattleCount: (jagalByUser.jumlahSapi?.toString()) || '',
              farmingType: '',
              businessPermitNumber: jagalByUser.sertifikatNKV || '',
              certifications: [],
              bio: '',
              profileImage,
              joinDate: user.createdAt,
              lastLogin: user.updatedAt
            };

            setUserData(combinedFromUser);
            setFormData({
              name: combinedFromUser.name,
              email: combinedFromUser.email,
              phone: combinedFromUser.phone,
              farmName: combinedFromUser.farmName,
              address: combinedFromUser.address,
              city: combinedFromUser.city,
              province: combinedFromUser.province,
              postalCode: combinedFromUser.postalCode,
              establishedYear: combinedFromUser.establishedYear,
              farmSize: combinedFromUser.farmSize,
              cattleCount: combinedFromUser.cattleCount,
              farmingType: combinedFromUser.farmingType,
              businessPermitNumber: combinedFromUser.businessPermitNumber,
              certifications: combinedFromUser.certifications,
              bio: combinedFromUser.bio
            });
            return; // selesai sukses via endpoint userId
          }
        } catch (_) { /* abaikan dan lanjut ke fallback */ }

        const resolvedJagalId = (
          user?.jagalId ||
          userProfile?.jagal?.id ||
          userProfile?.profile?.jagalId ||
          localUserData?.entityId
        );

        const buildCombinedFromProfile = () => {
          const jg = userProfile?.jagal || {};
          const profileImage = (
            userProfile?.profile?.profilePhoto
              ? userProfile.profile.profilePhoto
              : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
          );
          const combined = {
            id: user.id,
            username: user.username,
            name: jg?.nama || user.username || '',
            email: user.email,
            phone: jg?.noTelepon || '',
            role: user.role,
            farmName: jg?.nama || '',
            address: jg?.alamat || '',
            city: '',
            province: '',
            postalCode: '',
            establishedYear: '',
            farmSize: '',
            cattleCount: (jg?.jumlahSapi?.toString()) || '',
            farmingType: '',
            businessPermitNumber: jg?.sertifikatNKV || '',
            certifications: [],
            bio: '',
            profileImage,
            joinDate: user.createdAt,
            lastLogin: user.updatedAt
          };
          return combined;
        };

        if (!resolvedJagalId) {
          const combinedDataNoEntity = buildCombinedFromProfile();
          setUserData(combinedDataNoEntity);
          setFormData({
            name: combinedDataNoEntity.name,
            email: combinedDataNoEntity.email,
            phone: combinedDataNoEntity.phone,
            farmName: combinedDataNoEntity.farmName,
            address: combinedDataNoEntity.address,
            city: combinedDataNoEntity.city,
            province: combinedDataNoEntity.province,
            postalCode: combinedDataNoEntity.postalCode,
            establishedYear: combinedDataNoEntity.establishedYear,
            farmSize: combinedDataNoEntity.farmSize,
            cattleCount: combinedDataNoEntity.cattleCount,
            farmingType: combinedDataNoEntity.farmingType,
            businessPermitNumber: combinedDataNoEntity.businessPermitNumber,
            certifications: combinedDataNoEntity.certifications,
            bio: combinedDataNoEntity.bio
          });
          setLoading(false);
          return;
        }

        const jagalResponse = await fetch(`http://localhost:3000/jagal/${resolvedJagalId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!jagalResponse.ok) {
          const combinedDataFallback = buildCombinedFromProfile();
          setUserData(combinedDataFallback);
          setFormData({
            name: combinedDataFallback.name,
            email: combinedDataFallback.email,
            phone: combinedDataFallback.phone,
            farmName: combinedDataFallback.farmName,
            address: combinedDataFallback.address,
            city: combinedDataFallback.city,
            province: combinedDataFallback.province,
            postalCode: combinedDataFallback.postalCode,
            establishedYear: combinedDataFallback.establishedYear,
            farmSize: combinedDataFallback.farmSize,
            cattleCount: combinedDataFallback.cattleCount,
            farmingType: combinedDataFallback.farmingType,
            businessPermitNumber: combinedDataFallback.businessPermitNumber,
            certifications: combinedDataFallback.certifications,
            bio: combinedDataFallback.bio
          });
          setLoading(false);
          return;
        }

        const jagal = await jagalResponse.json();
        const profileImage = (
          userProfile?.profile?.profilePhoto
            ? userProfile.profile.profilePhoto
            : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
        );

        const combinedData = {
          id: user.id,
          username: user.username,
          name: jagal.nama || '',
          email: user.email,
          phone: jagal.noTelepon || '',
          role: user.role,
          farmName: jagal.nama || '',
          address: jagal.alamat || '',
          city: '',
          province: '',
          postalCode: '',
          establishedYear: '',
          farmSize: '',
          cattleCount: (jagal.jumlahSapi?.toString()) || '',
          farmingType: '',
          businessPermitNumber: jagal.sertifikatNKV || '',
          certifications: [],
          bio: '',
          profileImage,
          joinDate: user.createdAt,
          lastLogin: user.updatedAt
        };

        setUserData(combinedData);
        setFormData({
          name: combinedData.name,
          email: combinedData.email,
          phone: combinedData.phone,
          farmName: combinedData.farmName,
          address: combinedData.address,
          city: combinedData.city,
          province: combinedData.province,
          postalCode: combinedData.postalCode,
          establishedYear: combinedData.establishedYear,
          farmSize: combinedData.farmSize,
          cattleCount: combinedData.cattleCount,
          farmingType: combinedData.farmingType,
          businessPermitNumber: combinedData.businessPermitNumber,
          certifications: combinedData.certifications,
          bio: combinedData.bio
        });
      } catch (error) {
        console.error('Error fetching Jagal profile:', error);
        setLoadError('Gagal memuat data profil. Silakan refresh atau coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateError('');
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const localUser = JSON.parse(userStr || '{}');
      // Siapkan payload dan filter field undefined agar tidak menimpa nilai di backend
      const rawPayload = {
        nama: formData.farmName || formData.name,
        alamat: formData.address,
        noTelepon: formData.phone,
        jumlahSapi: formData.cattleCount ? parseInt(formData.cattleCount) || 0 : undefined,
        sertifikatNKV: formData.businessPermitNumber || undefined
      };
      const payload = Object.fromEntries(Object.entries(rawPayload).filter(([_, v]) => v !== undefined));

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1) Coba update via endpoint berbasis userId terlebih dahulu
      const userUpdateRes = await fetch(`http://localhost:3000/jagal/user/${localUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const syncFromUpdated = (updated) => {
        const mapped = {
          name: updated?.nama ?? formData.name,
          email: userData?.email ?? formData.email,
          phone: updated?.noTelepon ?? formData.phone,
          farmName: updated?.nama ?? formData.farmName,
          address: updated?.alamat ?? formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          establishedYear: formData.establishedYear,
          farmSize: formData.farmSize,
          cattleCount: (updated?.jumlahSapi !== undefined && updated?.jumlahSapi !== null)
            ? String(updated.jumlahSapi)
            : formData.cattleCount,
          farmingType: formData.farmingType,
          businessPermitNumber: updated?.sertifikatNKV ?? formData.businessPermitNumber,
          certifications: formData.certifications,
          bio: formData.bio
        };
        setUserData((prev) => ({
          ...prev,
          name: mapped.name,
          phone: mapped.phone,
          farmName: mapped.farmName,
          address: mapped.address,
          cattleCount: mapped.cattleCount,
          businessPermitNumber: mapped.businessPermitNumber
        }));
        setFormData(mapped);
      };

      if (userUpdateRes.ok) {
        const updated = await userUpdateRes.json();
        syncFromUpdated(updated);
        setIsSubmitting(false);
        setIsEditing(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 2500);
        return;
      }

      // 2) Fallback: resolve jagalId dan update via /jagal/:id
      let jagalId = null;
      try {
        const upRes = await fetch(`http://localhost:3000/users/${localUser.id}/profile`, { headers });
        if (upRes.ok) {
          const up = await upRes.json();
          jagalId = up?.jagal?.id || up?.profile?.jagalId || null;
        }
      } catch (_) {
        jagalId = null;
      }
      if (!jagalId) {
        jagalId = localUser?.entityId || localUser?.jagalId || null;
      }

      const idUpdateRes = await fetch(`http://localhost:3000/jagal/${jagalId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!idUpdateRes.ok) {
        // Tangkap pesan error dari backend jika ada
        let msg = 'Gagal memperbarui profil Jagal';
        try {
          const j = await idUpdateRes.json();
          msg = j.error || msg;
        } catch {
          const t = await idUpdateRes.text();
          msg = t || msg;
        }
        throw new Error(msg);
      }

      const updatedFallback = await idUpdateRes.json();
      syncFromUpdated(updatedFallback);
      setIsSubmitting(false);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setUpdateError(err?.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi password tidak sesuai.');
      setIsSubmitting(false);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password baru harus minimal 8 karakter.');
      setIsSubmitting(false);
      return;
    }
    setTimeout(() => {
      setIsSubmitting(false);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 900);
  };

  // Unggah foto profil mengikuti pola PasarHewan/Peternak
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      handleImageUpload(file).catch(() => {});
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploadingImage(true);
    setUploadImageError('');
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const localUser = JSON.parse(userStr || '{}');
      const userId = localUser.id;

      const uploadFormData = new FormData();
      uploadFormData.append('fotoProfil', file);
      uploadFormData.append('userId', userId);

      const response = await fetch('http://localhost:3000/upload/profile-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Gagal mengunggah foto profil');
      }

      const result = await response.json();
      setUserData((prev) => ({
        ...prev,
        profileImage: result.fotoProfil ? `http://localhost:3000${result.fotoProfil}` : imagePreview
      }));

      setIsUploadingImage(false);
      setSelectedImage(null);
      setImagePreview(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadImageError('Gagal mengunggah foto profil. Silakan coba lagi.');
      setIsUploadingImage(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <DashboardLayout title="Profil Jagal" role="JAGAL" customSidebar={<JagalSidebar /> }>
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-6">
          {!userData && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{loadError || 'Gagal memuat data profil. Silakan refresh atau coba lagi nanti.'}</span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-left">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 mb-4 relative">
                  {userData && (
                    <img src={userData.profileImage} alt={userData?.name || 'Profil'} className="rounded-full w-full h-full object-cover border-4 border-primaryLight" />
                  )}
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
                    <label className="cursor-pointer" title="Ubah foto profil">
                      <i className="fas fa-camera text-primary"></i>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData?.name || '-'}</h2>
                <p className="text-gray-500 mb-2">{userData?.farmName || '-'}</p>
                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">Jagal</div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Bergabung sejak</span><span className="font-medium">{userData ? formatDate(userData.joinDate) : '-'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Login terakhir</span><span className="font-medium">{userData ? formatDateTime(userData.lastLogin) : '-'}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Profil berhasil diperbarui!</span></div>
              )}
              {updateError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><i className="fas fa-times-circle mr-2"></i><span>{updateError}</span></div>
              )}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Fasilitas</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm border-2 border-blue-400 shadow-md"><i className="fas fa-edit mr-1"></i> Edit Profil</button>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md"><i className="fas fa-times mr-1"></i> Batal</button>
                )}
              </div>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div><p className="text-sm text-gray-500 mb-1">Nama Penanggung Jawab</p><p className="font-medium">{userData?.name || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Username</p><p className="font-medium">{userData?.username || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Email</p><p className="font-medium">{userData?.email || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nomor Telepon</p><p className="font-medium">{userData?.phone || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nama Fasilitas</p><p className="font-medium">{userData?.farmName || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Tahun Berdiri</p><p className="font-medium">{userData?.establishedYear || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Luas Fasilitas</p><p className="font-medium">{userData?.farmSize || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Kapasitas / Jumlah Sapi (Harian)</p><p className="font-medium">{userData?.cattleCount || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Jenis Operasional</p><p className="font-medium">{userData?.farmingType || '-'}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nomor Izin Usaha</p><p className="font-medium">{userData?.businessPermitNumber || '-'}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Alamat</p><p className="font-medium">{userData ? `${userData.address}, ${userData.city}, ${userData.province} ${userData.postalCode}` : '-'}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Sertifikasi</p><div className="flex flex-wrap gap-2">{(userData?.certifications || []).map((cert, i) => (<span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">{cert}</span>))}</div></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Tentang Fasilitas</p><p className="font-medium">{userData?.bio || '-'}</p></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Penanggung Jawab</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Fasilitas</label><input type="text" name="farmName" value={formData.farmName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Berdiri</label><input type="text" name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Luas Fasilitas</label><input type="text" name="farmSize" value={formData.farmSize} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas / Jumlah Sapi</label><input type="text" name="cattleCount" value={formData.cattleCount} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Operasional</label><input type="text" name="farmingType" value={formData.farmingType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Izin Usaha</label><input type="text" name="businessPermitNumber" value={formData.businessPermitNumber} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Kota</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label><input type="text" name="province" value={formData.province} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Tentang Fasilitas</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mr-3" disabled={isSubmitting}>Batal</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400" disabled={isSubmitting}>{isSubmitting ? (<span className="flex items-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Menyimpan...</span>) : 'Simpan Perubahan'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Keamanan Akun</h2>
            <div className="max-w-md">
              {passwordSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Password berhasil diperbarui!</span></div>)}
              {passwordError && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><i className="fas fa-exclamation-circle mr-2"></i><span>{passwordError}</span></div>)}
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label><input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label><input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /><p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p></div>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label><input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Ubah Password'}</button>
              </form>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Log Aktivitas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18 Juli 2025, 07:45</td><td className="px-6 py-4 text-sm text-gray-900">Login ke sistem</td><td className="px-6 py-4 text-sm text-gray-500">192.168.10.5</td><td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sukses</span></td></tr>
                  <tr><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">17 Juli 2025, 15:10</td><td className="px-6 py-4 text-sm text-gray-900">Update data profil</td><td className="px-6 py-4 text-sm text-gray-500">192.168.10.5</td><td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sukses</span></td></tr>
                  <tr><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">17 Juli 2025, 09:30</td><td className="px-6 py-4 text-sm text-gray-900">Input hasil pemotongan</td><td className="px-6 py-4 text-sm text-gray-500">192.168.10.5</td><td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sukses</span></td></tr>
                  <tr><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16 Juli 2025, 18:22</td><td className="px-6 py-4 text-sm text-gray-900">Login ke sistem</td><td className="px-6 py-4 text-sm text-gray-500">203.0.113.15</td><td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Gagal</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JagalProfil;
