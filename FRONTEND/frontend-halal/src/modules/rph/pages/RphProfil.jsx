import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RphSidebar from '../components/RphSidebar';

// Mengadopsi JagalProfil (yang sebelumnya mengadopsi Peternak) dengan penyesuaian model RPH (sertifikat halal, JULEHA)
const RphProfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facilityName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    establishedYear: '',
    facilitySize: '',
    capacity: '',
    operationType: '',
    businessPermitNumber: '',
    halalCertificate: '',
    julehaName: '',
    julehaCertificate: '',
    supervisors: '',
    certifications: [],
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const mock = {
        id: 'RPH-8891',
        username: 'rph_bersama',
        name: 'PT RPH Bersama Sejahtera',
        email: 'admin@rphbersama.id',
        phone: '021-5556789',
        role: 'RPH',
        facilityName: 'RPH Bersama Sejahtera',
        address: 'Jl. Pemotongan Utama No. 45',
        city: 'Surabaya',
        province: 'Jawa Timur',
        postalCode: '60123',
        establishedYear: '2018',
        facilitySize: '3.500 m2',
        capacity: '55',
        operationType: 'Pemotongan & Distribusi',
        businessPermitNumber: 'IUP-RPH/2018/SBY/3321',
        halalCertificate: 'HALAL-MUI-2024-9981',
        julehaName: 'Ustadz Ahmad Rivai',
        julehaCertificate: 'JULEHA-2024-2231',
        supervisors: '3',
        certifications: ['Sertifikasi Halal MUI', 'Sertifikat JULEHA', 'NKV'],
        bio: 'RPH modern dengan fokus pada kepatuhan syariah dan standar higiene tinggi. Menyediakan layanan pemotongan dengan sistem traceability end-to-end.',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        joinDate: '2024-09-11',
        lastLogin: '2025-07-18T09:10:00'
      };
      setUserData(mock);
      setFormData({
        name: mock.name,
        email: mock.email,
        phone: mock.phone,
        facilityName: mock.facilityName,
        address: mock.address,
        city: mock.city,
        province: mock.province,
        postalCode: mock.postalCode,
        establishedYear: mock.establishedYear,
        facilitySize: mock.facilitySize,
        capacity: mock.capacity,
        operationType: mock.operationType,
        businessPermitNumber: mock.businessPermitNumber,
        halalCertificate: mock.halalCertificate,
        julehaName: mock.julehaName,
        julehaCertificate: mock.julehaCertificate,
        supervisors: mock.supervisors,
        certifications: mock.certifications,
        bio: mock.bio
      });
      setLoading(false);
    }, 700);
  }, []);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handlePasswordChange = (e) => { const { name, value } = e.target; setPasswordForm(p => ({ ...p, [name]: value })); setPasswordError(''); setPasswordSuccess(false); };
  const handleSubmit = (e) => { e.preventDefault(); setIsSubmitting(true); setTimeout(()=>{ setUserData(u => ({ ...u, ...formData })); setIsSubmitting(false); setIsEditing(false); setUpdateSuccess(true); setTimeout(()=>setUpdateSuccess(false), 3000); }, 900); };
  const handlePasswordSubmit = (e) => { e.preventDefault(); setIsSubmitting(true); if(passwordForm.newPassword !== passwordForm.confirmPassword){ setPasswordError('Konfirmasi password tidak sesuai.'); setIsSubmitting(false); return; } if(passwordForm.newPassword.length < 8){ setPasswordError('Password baru minimal 8 karakter.'); setIsSubmitting(false); return; } setTimeout(()=>{ setIsSubmitting(false); setPasswordSuccess(true); setPasswordForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); setTimeout(()=>setPasswordSuccess(false),3000); }, 900); };
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <DashboardLayout title="Profil RPH" role="RPH" customSidebar={<RphSidebar /> }>
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
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                <p className="text-gray-500 mb-2">{userData.facilityName}</p>
                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">RPH</div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Bergabung sejak</span><span className="font-medium">{formatDate(userData.joinDate)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Login terakhir</span><span className="font-medium">{formatDateTime(userData.lastLogin)}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 text-left">
              {updateSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Profil berhasil diperbarui!</span></div>)}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Fasilitas</h2>
                {!isEditing ? (
                  <button onClick={()=>setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm border-2 border-blue-400 shadow-md"><i className="fas fa-edit mr-1"></i> Edit Profil</button>
                ) : (
                  <button onClick={()=>setIsEditing(false)} className="text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded-md"><i className="fas fa-times mr-1"></i> Batal</button>
                )}
              </div>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500 mb-1">Nama Perusahaan</p><p className="font-medium">{userData.name}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Username</p><p className="font-medium">{userData.username}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Email</p><p className="font-medium">{userData.email}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nomor Telepon</p><p className="font-medium">{userData.phone}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nama Fasilitas</p><p className="font-medium">{userData.facilityName}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Tahun Berdiri</p><p className="font-medium">{userData.establishedYear}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Luas Fasilitas</p><p className="font-medium">{userData.facilitySize}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Kapasitas (Harian)</p><p className="font-medium">{userData.capacity}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Jenis Operasional</p><p className="font-medium">{userData.operationType}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nomor Izin Usaha</p><p className="font-medium">{userData.businessPermitNumber}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Sertifikat Halal</p><p className="font-medium">{userData.halalCertificate}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Nama JULEHA</p><p className="font-medium">{userData.julehaName}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">No Sertifikat JULEHA</p><p className="font-medium">{userData.julehaCertificate}</p></div>
                  <div><p className="text-sm text-gray-500 mb-1">Jumlah Penyelia</p><p className="font-medium">{userData.supervisors}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Alamat</p><p className="font-medium">{userData.address}, {userData.city}, {userData.province} {userData.postalCode}</p></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Sertifikasi</p><div className="flex flex-wrap gap-2">{userData.certifications.map((c,i)=>(<span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">{c}</span>))}</div></div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-500 mb-1">Tentang Fasilitas</p><p className="font-medium">{userData.bio}</p></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label><input name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label><input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Fasilitas</label><input name="facilityName" value={formData.facilityName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Berdiri</label><input name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Luas Fasilitas</label><input name="facilitySize" value={formData.facilitySize} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label><input name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Operasional</label><input name="operationType" value={formData.operationType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Izin Usaha</label><input name="businessPermitNumber" value={formData.businessPermitNumber} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Sertifikat Halal</label><input name="halalCertificate" value={formData.halalCertificate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama JULEHA</label><input name="julehaName" value={formData.julehaName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">No Sertifikat JULEHA</label><input name="julehaCertificate" value={formData.julehaCertificate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Penyelia</label><input name="supervisors" value={formData.supervisors} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label><input name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md py-2 px-3" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Tentang Fasilitas</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md py-2 px-3"></textarea></div>
                  <div className="md:col-span-2 flex justify-end"><button type="button" onClick={()=>setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 mr-3" disabled={isSubmitting}>Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button></div>
                </form>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Keamanan Akun</h2>
            <div className="max-w-md">
              {passwordSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Password berhasil diperbarui!</span></div>)}
              {passwordError && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><i className="fas fa-exclamation-circle mr-2"></i><span>{passwordError}</span></div>)}
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label><input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /></div>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label><input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /><p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p></div>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label><input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required /></div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-400" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Ubah Password'}</button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-left">
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

export default RphProfil;
