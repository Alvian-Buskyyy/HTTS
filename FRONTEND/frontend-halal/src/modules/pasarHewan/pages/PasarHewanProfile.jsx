import React, { useState } from 'react';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock profile data
  const [profileData, setProfileData] = useState({
    name: 'Pasar Hewan Al-Falah',
    email: 'pasarhewan.alfalah@example.com',
    phone: '08123456789',
    address: 'Jl. Pasar Hewan No. 123, Kec. Cilandak, Jakarta Selatan',
    regNumber: 'PH-2023-001',
    establishedDate: '2010-05-15',
    ownerName: 'H. Ahmad Fauzi',
    capacity: '200 ekor',
    description: 'Pasar Hewan Al-Falah merupakan salah satu pasar hewan terbesar di Jakarta Selatan yang telah beroperasi sejak tahun 2010. Kami memfasilitasi perdagangan ternak yang halal dan sehat dengan standar pengelolaan modern.',
    photoUrl: 'https://example.com/placeholder.jpg'
  });
  
  // State for form edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({...profileData});
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle save profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData({...formData});
    setIsEditMode(false);
    // Here you would typically make an API call to update the profile
  };

  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="profile" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm z-10 sticky top-0">
            <div className="flex items-center justify-between p-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 focus:outline-none"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 focus:outline-none">
                  <i className="fas fa-bell text-xl"></i>
                </button>
                <div className="relative">
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <i className="fas fa-user"></i>
                    </div>
                    <span className="text-gray-700 font-medium">{profileData.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Profile Content */}
          <main className="flex-1 p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Profil Pasar Hewan</h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Profile Header with Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-primary to-primaryDark relative">
                <button 
                  className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition"
                  title="Ubah Foto Sampul"
                >
                  <i className="fas fa-camera text-gray-700"></i>
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="px-6 py-4">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 mr-4 overflow-hidden flex items-center justify-center relative">
                    <i className="fas fa-building text-5xl text-gray-400"></i>
                    <button 
                      className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-1 rounded-full hover:bg-opacity-100 transition"
                      title="Ubah Foto Profil"
                    >
                      <i className="fas fa-camera text-sm text-gray-700"></i>
                    </button>
                  </div>
                  <div className="mt-4 md:mt-0 flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                    <p className="text-gray-600">
                      <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                      {profileData.address}
                    </p>
                  </div>
                  {!isEditMode && (
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Profil
                    </button>
                  )}
                </div>
                
                {isEditMode ? (
                  <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasar Hewan</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Registrasi</label>
                        <input 
                          type="text" 
                          name="regNumber"
                          value={formData.regNumber}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
                        <input 
                          type="text" 
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berdiri</label>
                        <input 
                          type="date" 
                          name="establishedDate"
                          value={formData.establishedDate}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                        <input 
                          type="text" 
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea 
                        rows="4" 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setFormData({...profileData});
                          setIsEditMode(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Kontak</h3>
                        <div className="space-y-2">
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-envelope w-5 text-primary mr-2"></i>
                            {profileData.email}
                          </p>
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-phone w-5 text-primary mr-2"></i>
                            {profileData.phone}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Informasi Umum</h3>
                        <div className="space-y-2">
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-id-card w-5 text-primary mr-2"></i>
                            No. Registrasi: {profileData.regNumber}
                          </p>
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-calendar w-5 text-primary mr-2"></i>
                            Berdiri Sejak: {new Date(profileData.establishedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-user w-5 text-primary mr-2"></i>
                            Pemilik: {profileData.ownerName}
                          </p>
                          <p className="flex items-center text-gray-800">
                            <i className="fas fa-warehouse w-5 text-primary mr-2"></i>
                            Kapasitas: {profileData.capacity}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Tentang</h3>
                      <p className="text-gray-800 whitespace-pre-line">{profileData.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="bg-white p-4 border-t text-center text-gray-500 text-sm">
            &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanProfile;
