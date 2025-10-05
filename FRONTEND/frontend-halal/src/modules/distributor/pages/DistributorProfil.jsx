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

  useEffect(()=>{
    setTimeout(()=>{
      const mock = { id:'DIST-8891', username:'dist_bersama', name:'PT Distributor Nusantara', email:'admin@distnusantara.id', phone:'021-554433', companyName:'PT Distributor Nusantara', address:'Jl. Niaga Raya No. 12', city:'Bandung', province:'Jawa Barat', postalCode:'40221', siup:'SIUP-2020-8891', npwp:'12.345.678.9-012.000', contactPerson:'Budi Santoso', bio:'Distributor daging terpercaya untuk HOREKA dan ritel.', profileImage:'https://randomuser.me/api/portraits/men/33.jpg', joinDate:'2023-04-12', lastLogin:'2025-07-20T10:12:00' };
      setUserData(mock);
      setFormData({ name: mock.name, email: mock.email, phone: mock.phone, companyName: mock.companyName, address: mock.address, city: mock.city, province: mock.province, postalCode: mock.postalCode, siup: mock.siup, npwp: mock.npwp, contactPerson: mock.contactPerson, bio: mock.bio });
      setLoading(false);
    }, 500);
  },[]);

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleSubmit = (e) => { e.preventDefault(); setIsSubmitting(true); setTimeout(()=>{ setUserData(u=>({ ...u, ...formData })); setIsSubmitting(false); setIsEditing(false); setUpdateSuccess(true); setTimeout(()=>setUpdateSuccess(false), 2500); }, 800); };

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
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                <p className="text-gray-500 mb-2">{userData.companyName}</p>
                <div className="inline-block bg-primaryLight text-primary px-3 py-1 rounded-full text-sm font-medium mt-2 mb-4">DISTRIBUTOR</div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Bergabung sejak</span><span className="font-medium">{formatDate(userData.joinDate)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Login terakhir</span><span className="font-medium">{formatDateTime(userData.lastLogin)}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 text-left">
              {updateSuccess && (<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><i className="fas fa-check-circle mr-2"></i><span>Profil berhasil diperbarui!</span></div>)}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Informasi Perusahaan</h2>
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
