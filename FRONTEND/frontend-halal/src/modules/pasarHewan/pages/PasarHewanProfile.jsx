import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';

const PasarHewanProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    ownerName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    establishedYear: '',
    capacity: '',
    regNumber: '',
    certifications: [],
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loadError, setLoadError] = useState('');

  // States for profile image upload (adopted from PeternakProfil)
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
          // Ikuti pola Peternak: jangan redirect, cukup hentikan loading
          setLoading(false);
          return;
        }

        const localUserData = JSON.parse(userDataStr);
        const userId = localUserData.id;

        // Ambil profil user terlebih dahulu untuk mendapatkan pasarHewanId yang benar
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
          // Jangan redirect; hentikan loading agar UI tidak kosong
          setLoading(false);
          return;
        }

        const user = await userResponse.json();
        const userProfile = userProfileResponse.ok ? await userProfileResponse.json() : null;

        // Coba endpoint berbasis userId terlebih dahulu agar pemetaan via Profile konsisten
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        try {
          const byUserRes = await fetch(`http://localhost:3000/pasarHewan/user/${userId}`, { headers });
          if (byUserRes.ok) {
            const pasarHewanByUser = await byUserRes.json();
            const combinedFromUser = {
              id: user.id,
              username: user.username,
              name: pasarHewanByUser?.nama || user.username || '',
              email: user.email,
              phone: pasarHewanByUser?.noTelepon || '',
              role: user.role,
              ownerName: pasarHewanByUser?.nama || '',
              address: pasarHewanByUser?.alamat || '',
              city: '',
              province: '',
              postalCode: '',
              establishedYear: '',
              capacity: (pasarHewanByUser?.jumlahSapi?.toString()) || '',
              regNumber: pasarHewanByUser?.sertifikatNKV || '',
              certifications: [],
              bio: '',
              profileImage: (
                userProfile?.profile?.profilePhoto
                  ? userProfile.profile.profilePhoto
                  : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
              ),
              joinDate: user.createdAt,
              lastLogin: user.updatedAt
            };

            setUserData(combinedFromUser);
            setFormData({
              name: combinedFromUser.name,
              username: combinedFromUser.username,
              email: combinedFromUser.email,
              phone: combinedFromUser.phone,
              ownerName: combinedFromUser.ownerName,
              address: combinedFromUser.address,
              city: combinedFromUser.city,
              province: combinedFromUser.province,
              postalCode: combinedFromUser.postalCode,
              establishedYear: combinedFromUser.establishedYear,
              capacity: combinedFromUser.capacity,
              regNumber: combinedFromUser.regNumber,
              certifications: combinedFromUser.certifications,
              bio: combinedFromUser.bio
            });
            setLoading(false);
            return; // selesai sukses via endpoint userId
          }
        } catch (_) { /* abaikan dan lanjut ke fallback ID */ }

        // Resolusi ID pasarHewan yang valid (angka) dari berbagai sumber
        const resolvedPasarHewanId = (
          // user.pasarHewanId dari relasi user
          user?.pasarHewanId ||
          // userProfile.user.pasarHewan?.id jika tersedia
          userProfile?.pasarHewan?.id ||
          // profile.pasarHewanId dari tabel profile
          userProfile?.profile?.pasarHewanId ||
          // fallback terakhir: localStorage.entityId (bisa gagal jika bukan angka)
          localUserData?.entityId
        );

        if (!resolvedPasarHewanId) {
          // Tidak ditemukan ID yang valid; gunakan data minimum dari user + profile
          const phFromProfile = userProfile?.pasarHewan || {};
          const combinedDataNoEntity = {
            id: user.id,
            username: user.username,
            name: phFromProfile?.nama || user.username || '',
            email: user.email,
            phone: phFromProfile?.noTelepon || '',
            role: user.role,
            ownerName: phFromProfile?.nama || '',
            address: phFromProfile?.alamat || '',
            city: '',
            province: '',
            postalCode: '',
            establishedYear: '',
            capacity: (phFromProfile?.jumlahSapi?.toString()) || '',
            regNumber: phFromProfile?.sertifikatNKV || '',
            certifications: [],
            bio: '',
            profileImage: (
              userProfile?.profile?.profilePhoto
                ? userProfile.profile.profilePhoto
                : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
            ),
            joinDate: user.createdAt,
            lastLogin: user.updatedAt
          };

          setUserData(combinedDataNoEntity);
          setFormData({
            name: combinedDataNoEntity.name,
            username: combinedDataNoEntity.username,
            email: combinedDataNoEntity.email,
            phone: combinedDataNoEntity.phone,
            ownerName: combinedDataNoEntity.ownerName,
            address: combinedDataNoEntity.address,
            city: combinedDataNoEntity.city,
            province: combinedDataNoEntity.province,
            postalCode: combinedDataNoEntity.postalCode,
            establishedYear: combinedDataNoEntity.establishedYear,
            capacity: combinedDataNoEntity.capacity,
            regNumber: combinedDataNoEntity.regNumber,
            certifications: combinedDataNoEntity.certifications,
            bio: combinedDataNoEntity.bio
          });

          setLoading(false);
          return;
        }

        // Ambil data entitas Pasar Hewan menggunakan ID yang valid (numeric)
        const pasarResponse = await fetch(`http://localhost:3000/pasarHewan/${resolvedPasarHewanId}`, { headers });

        if (!pasarResponse.ok) {
          // Jangan redirect; gunakan data dari userProfile jika tersedia
          const phFromProfile = userProfile?.pasarHewan || {};
          const combinedDataFallback = {
            id: user.id,
            username: user.username,
            name: phFromProfile?.nama || user.username || '',
            email: user.email,
            phone: phFromProfile?.noTelepon || '',
            role: user.role,
            ownerName: phFromProfile?.nama || '',
            address: phFromProfile?.alamat || '',
            city: '',
            province: '',
            postalCode: '',
            establishedYear: '',
            capacity: (phFromProfile?.jumlahSapi?.toString()) || '',
            regNumber: phFromProfile?.sertifikatNKV || '',
            certifications: [],
            bio: '',
            profileImage: (
              userProfile?.profile?.profilePhoto
                ? userProfile.profile.profilePhoto
                : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
            ),
            joinDate: user.createdAt,
            lastLogin: user.updatedAt
          };

          setUserData(combinedDataFallback);
          setFormData({
            name: combinedDataFallback.name,
            username: combinedDataFallback.username,
            email: combinedDataFallback.email,
            phone: combinedDataFallback.phone,
            ownerName: combinedDataFallback.ownerName,
            address: combinedDataFallback.address,
            city: combinedDataFallback.city,
            province: combinedDataFallback.province,
            postalCode: combinedDataFallback.postalCode,
            establishedYear: combinedDataFallback.establishedYear,
            capacity: combinedDataFallback.capacity,
            regNumber: combinedDataFallback.regNumber,
            certifications: combinedDataFallback.certifications,
            bio: combinedDataFallback.bio
          });
          setLoading(false);
          return;
        }

        const pasarHewan = await pasarResponse.json();

        const combinedData = {
          id: user.id,
          username: user.username,
          name: pasarHewan.nama || '',
          email: user.email,
          phone: pasarHewan.noTelepon || '',
          role: user.role,
          ownerName: pasarHewan.nama || '',
          address: pasarHewan.alamat || '',
          city: '',
          province: '',
          postalCode: '',
          establishedYear: '',
          capacity: (pasarHewan.jumlahSapi?.toString()) || '',
          regNumber: pasarHewan.sertifikatNKV || '',
          certifications: [],
          bio: '',
          profileImage: (
            userProfile?.profile?.profilePhoto
              ? userProfile.profile.profilePhoto
              : (userProfile?.profile?.fotoProfil ? `http://localhost:3000${userProfile.profile.fotoProfil}` : 'https://via.placeholder.com/150')
          ),
          joinDate: user.createdAt,
          lastLogin: user.updatedAt
        };

        setUserData(combinedData);
        setFormData({
          name: combinedData.name,
          username: combinedData.username,
          email: combinedData.email,
          phone: combinedData.phone,
          ownerName: combinedData.ownerName,
          address: combinedData.address,
          city: combinedData.city,
          province: combinedData.province,
          postalCode: combinedData.postalCode,
          establishedYear: combinedData.establishedYear,
          capacity: combinedData.capacity,
          regNumber: combinedData.regNumber,
          certifications: combinedData.certifications,
          bio: combinedData.bio
        });
      } catch (error) {
        console.error('Error fetching Pasar Hewan profile:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const localUserData = JSON.parse(userDataStr || '{}');
      const payload = {
        nama: formData.name,
        alamat: formData.address,
        noTelepon: formData.phone,
        jumlahSapi: formData.capacity !== '' ? (parseInt(formData.capacity) || 0) : undefined,
        sertifikatNKV: formData.regNumber || undefined
      };

      // Coba PUT berbasis userId terlebih dahulu
      let response = await fetch(`http://localhost:3000/pasarHewan/user/${localUserData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Jika gagal (mis. 404 mapping), fallback ke PUT berbasis ID entitas
      if (!response.ok) {
        // Resolve ID entitas via GET /pasarHewan/user/:userId, lalu fallback ke localStorage/entityId
        let resolvedId = null;
        try {
          const resId = await fetch(`http://localhost:3000/pasarHewan/user/${localUserData.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (resId.ok) {
            const dataId = await resId.json();
            resolvedId = dataId?.id || dataId?.data?.id || null;
          }
        } catch (_) {}
        if (!resolvedId) {
          resolvedId = localUserData?.pasarHewanId || localUserData?.entityId || null;
        }

        if (resolvedId) {
          response = await fetch(`http://localhost:3000/pasarHewan/${resolvedId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || 'Gagal memperbarui profil Pasar Hewan');
      }

      // Gunakan respons backend untuk sinkronisasi state yang pasti
      const updated = await response.json();
      const merged = {
        ...userData,
        name: updated?.nama ?? formData.name,
        phone: updated?.noTelepon ?? formData.phone,
        address: updated?.alamat ?? formData.address,
        capacity: (updated?.jumlahSapi != null ? String(updated.jumlahSapi) : formData.capacity),
        regNumber: updated?.sertifikatNKV ?? formData.regNumber,
      };
      setUserData(merged);
      setIsSubmitting(false);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert(`Gagal memperbarui profil. ${err?.message || 'Silakan coba lagi.'}`);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi password tidak sesuai.');
      setIsSubmitting(false);
      return;
    }
    if ((passwordForm.newPassword || '').length < 8) {
      setPasswordError('Password baru harus minimal 8 karakter.');
      setIsSubmitting(false);
      return;
    }
    setTimeout(() => {
      setIsSubmitting(false);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 2500);
    }, 800);
  };

  // Profile image selection & upload (adopted from PeternakProfil)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Auto-upload on select
      handleImageUpload(file).catch(() => {});
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsUploadingImage(true);
    setUploadImageError('');

    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('user');
      const localUserData = JSON.parse(userDataStr || '{}');
      const userId = localUserData.id;

      const uploadFormData = new FormData();
      uploadFormData.append('fotoProfil', file);
      uploadFormData.append('userId', userId);

      const response = await fetch('http://localhost:3000/upload/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout title="Profil Pasar Hewan" role="PASAR_HEWAN">
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4 p-6">
          {(!userData || loadError) && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span>{loadError || 'Gagal memuat data profil. Silakan refresh atau coba lagi nanti.'}</span>
            </div>
          )}
          {userData && (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-left">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 mb-4 relative">
                  <img
                    src={userData.profileImage}
                    alt={userData.name}
                    className="rounded-full w-full h-full object-cover border-4 border-primaryLight"
                  />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
                    <label className="cursor-pointer" title="Ubah foto profil">
                      <i className="fas fa-camera text-primary"></i>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                <p className="text-gray-500 mb-2">{userData.ownerName}</p>

                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">
                  Pasar Hewan
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Bergabung sejak</span>
                  <span className="font-medium">{formatDate(userData.joinDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Login terakhir</span>
                  <span className="font-medium">{formatDateTime(userData.lastLogin)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Profil berhasil diperbarui!</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Entitas</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm border-2 border-blue-400 shadow-md"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit Profil
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md"
                  >
                    <i className="fas fa-times mr-1"></i> Batal
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama Pasar Hewan</p>
                    <p className="font-medium">{userData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="font-medium">{userData.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nomor Telepon</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nomor Registrasi</p>
                    <p className="font-medium">{userData.regNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tahun Berdiri</p>
                    <p className="font-medium">{userData.establishedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kapasitas</p>
                    <p className="font-medium">{userData.capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pengelola</p>
                    <p className="font-medium">{userData.ownerName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Alamat</p>
                    <p className="font-medium">
                      {userData.address}, {userData.city}, {userData.province} {userData.postalCode}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Sertifikasi</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.certifications.map((cert, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Tentang Pasar</p>
                    <p className="font-medium">{userData.bio}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasar Hewan</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pengelola</label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Berdiri</label>
                      <input
                        type="text"
                        name="establishedYear"
                        value={formData.establishedYear}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                      <input
                        type="text"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Registrasi</label>
                      <input
                        type="text"
                        name="regNumber"
                        value={formData.regNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tentang Pasar</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mr-3"
                      disabled={isSubmitting}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </span>
                      ) : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Keamanan Akun</h2>

            <div className="max-w-md">
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Password berhasil diperbarui!</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses...' : 'Ubah Password'}
                </button>
              </form>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Log Aktivitas</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16 Juli 2025, 08:30</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Login ke sistem</td>
                    <td className="px-6 py-4 text-sm text-gray-500">192.168.1.1</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Sukses
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15 Juli 2025, 16:45</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Update data profil</td>
                    <td className="px-6 py-4 text-sm text-gray-500">192.168.1.1</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Sukses
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15 Juli 2025, 10:20</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Persetujuan permintaan verifikasi</td>
                    <td className="px-6 py-4 text-sm text-gray-500">192.168.1.1</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Sukses
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">14 Juli 2025, 14:15</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Login ke sistem</td>
                    <td className="px-6 py-4 text-sm text-gray-500">203.0.113.1</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Gagal
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PasarHewanProfile;
