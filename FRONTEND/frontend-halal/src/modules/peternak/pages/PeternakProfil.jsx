import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';

const PeternakProfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Load user data
  useEffect(() => {
    // In a real application, fetch user data from API
    // For demo, we'll use mock data
    setTimeout(() => {
      const mockUserData = {
        id: 'P12345',
        username: 'sumitro27',
        name: 'Sumitro Wijaya',
        email: 'sumitro27@gmail.com',
        phone: '081298765432',
        role: 'PETERNAK',
        farmName: 'Peternakan Makmur Sejahtera',
        address: 'Jl. Merdeka No. 45, Desa Sukamaju',
        city: 'Yogyakarta',
        province: 'D.I. Yogyakarta',
        postalCode: '55281',
        establishedYear: '2010',
        farmSize: '8.5 hektar',
        cattleCount: '210',
        farmingType: 'Peternakan Sapi Potong dan Perah',
        businessPermitNumber: 'PIB/2010/YOG/12345',
        certifications: ['Sertifikasi Halal MUI', 'Sertifikasi Peternakan Sehat Kementan'],
        bio: 'Peternakan keluarga yang sudah berdiri sejak 2010, fokus pada pengembangan sapi lokal dengan standar kesejahteraan hewan yang tinggi. Menerapkan teknologi modern dan pakan organik untuk menghasilkan produk berkualitas premium.',
        profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
        joinDate: '2023-03-10',
        lastLogin: '2025-07-17T14:25:00'
      };
      
      setUserData(mockUserData);
      setFormData({
        name: mockUserData.name,
        email: mockUserData.email,
        phone: mockUserData.phone,
        farmName: mockUserData.farmName,
        address: mockUserData.address,
        city: mockUserData.city,
        province: mockUserData.province,
        postalCode: mockUserData.postalCode,
        establishedYear: mockUserData.establishedYear,
        farmSize: mockUserData.farmSize,
        cattleCount: mockUserData.cattleCount,
        farmingType: mockUserData.farmingType,
        businessPermitNumber: mockUserData.businessPermitNumber,
        certifications: mockUserData.certifications,
        bio: mockUserData.bio
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
    
    // Reset error/success messages when user starts typing again
    setPasswordError('');
    setPasswordSuccess(false);
  };
  
  // Handle profile form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update the user data with form data
      setUserData({
        ...userData,
        ...formData
      });
      
      setIsSubmitting(false);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Handle password change submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
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
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, send to backend
      setIsSubmitting(false);
      setPasswordSuccess(true);
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <DashboardLayout title="Profil Peternak" role="PETERNAK">
      {loading ? (
        <div className="flex items-center justify-center h-60 mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-16 p-6">
          <h1 className="text-2xl font-semibold text-blue-600 mb-6">Profil Peternak</h1>
          
          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
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
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                <p className="text-gray-500 mb-2">{userData.farmName}</p>
                
                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">
                  {userData.role === 'PETERNAK' ? 'Peternak' : userData.role}
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
            
            {/* Main Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Profil berhasil diperbarui!</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Personal</h2>
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
                    <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
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
                    <p className="text-sm text-gray-500 mb-1">Nama Peternakan</p>
                    <p className="font-medium">{userData.farmName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tahun Berdiri</p>
                    <p className="font-medium">{userData.establishedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Luas Peternakan</p>
                    <p className="font-medium">{userData.farmSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jumlah Ternak</p>
                    <p className="font-medium">{userData.cattleCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jenis Peternakan</p>
                    <p className="font-medium">{userData.farmingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nomor Izin Usaha</p>
                    <p className="font-medium">{userData.businessPermitNumber}</p>
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
                    <p className="text-sm text-gray-500 mb-1">Tentang Peternakan</p>
                    <p className="font-medium">{userData.bio}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peternakan</label>
                      <input 
                        type="text" 
                        name="farmName" 
                        value={formData.farmName} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        required 
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Luas Peternakan</label>
                      <input 
                        type="text" 
                        name="farmSize" 
                        value={formData.farmSize} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Ternak</label>
                      <input 
                        type="text" 
                        name="cattleCount" 
                        value={formData.cattleCount} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Peternakan</label>
                      <input 
                        type="text" 
                        name="farmingType" 
                        value={formData.farmingType} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Izin Usaha</label>
                      <input 
                        type="text" 
                        name="businessPermitNumber" 
                        value={formData.businessPermitNumber} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tentang Peternakan</label>
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
          
          {/* Security Settings */}
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
          
          {/* Activity Log */}
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
                    <td className="px-6 py-4 text-sm text-gray-900">Tambah data sapi</td>
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default PeternakProfil;
