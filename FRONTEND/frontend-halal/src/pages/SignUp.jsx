import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LandingPageCSS from '../components/LandingPageCSS';

// CSS inline untuk memastikan konsistensi warna dengan LandingPage
const customStyles = `
  .bg-primary { background-color: #2a9df4; }
  .bg-primaryDark { background-color: #1a7bc9; }
  .bg-primaryLight { background-color: #e6f3fd; }
  .text-primary { color: #2a9df4; }
  .hover\\:bg-primaryDark:hover { background-color: #1a7bc9; }
  .hover\\:bg-primaryLight:hover { background-color: #e6f3fd; }
  .hover\\:text-primary:hover { color: #2a9df4; }
  .focus\\:ring-primary:focus { --tw-ring-color: #2a9df4; }
  .focus\\:border-primary:focus { border-color: #2a9df4; }
  .hover\\:border-primary:hover { border-color: #2a9df4; }
  .border-primary { border-color: #2a9df4; }
`;

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  
  const [dynamicFields, setDynamicFields] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleDynamicFieldChange = (e) => {
    const { name, value } = e.target;
    setDynamicFields({
      ...dynamicFields,
      [name]: value,
    });
  };
  
  // Handle role change to update dynamic fields
  useEffect(() => {
    if (!formData.role) {
      setDynamicFields({});
    }
  }, [formData.role]);
  
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert('Kata sandi tidak cocok!');
    return;
  }

  const payload = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    // ⬇️ WAJIB: kirim field profil sesuai role
    profileData: dynamicFields,
  };

  try {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Terjadi kesalahan saat mendaftar');
      return;
    }
    alert('Akun berhasil dibuat! Silakan masuk untuk melanjutkan.');
    navigate('/');
  } catch (err) {
    console.error('Error saat sign up:', err);
    alert('Terjadi kesalahan koneksi ke server.');
  }
};
  
  // Render dynamic fields based on selected role
  const renderDynamicFields = () => {
    switch(formData.role) {
      case 'PETERNAK':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Sapi</label>
              <input 
                type="number" 
                name="jumlahSapi" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Sertifikat NKV (opsional)</label>
              <input 
                type="file" 
                name="sertifikatNKV" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 block w-full py-2 px-3"
              />
            </div>
          </>
        );
      case 'PASAR_HEWAN':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Pasar</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Sapi</label>
              <input 
                type="number" 
                name="jumlahSapi" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Sertifikat NKV (opsional)</label>
              <input 
                type="file" 
                name="sertifikatNKV" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 block w-full py-2 px-3"
              />
            </div>
          </>
        );
      case 'JAGAL':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Sapi</label>
              <input 
                type="number" 
                name="jumlahSapi" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Daging</label>
              <input 
                type="number" 
                name="jumlahDaging" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Sertifikat NKV (opsional)</label>
              <input 
                type="file" 
                name="sertifikatNKV" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 block w-full py-2 px-3"
              />
            </div>
          </>
        );
      case 'RPH':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama RPH</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Penyelia</label>
              <input 
                type="number" 
                name="jumlahPenyelia" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama JULEHA (opsional)</label>
              <input 
                type="text" 
                name="namaJuleha" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Sertifikat JULEHA (opsional)</label>
              <input 
                type="text" 
                name="noSertifJuleha" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sertifikat NKV (opsional)</label>
              <input 
                type="file" 
                name="sertifikatNKV" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 block w-full py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sertifikat Halal (opsional)</label>
              <input 
                type="file" 
                name="sertifikatHalal" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 block w-full py-2 px-3"
              />
            </div>
          </>
        );
      case 'DISTRIBUTOR':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Usaha</label>
              <input 
                type="text" 
                name="namaUsaha" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fasilitas Penyimpanan</label>
              <input 
                type="text" 
                name="fasilitasPenyimpanan" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
          </>
        );
      case 'HOREKA':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <input 
                type="text" 
                name="alamat" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No Telepon</label>
              <input 
                type="tel" 
                name="noTelepon" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
          </>
        );
      case 'REGULATOR':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input 
                type="text" 
                name="nama" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instansi</label>
              <input 
                type="text" 
                name="instansi" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jabatan</label>
              <input 
                type="text" 
                name="jabatan" 
                onChange={handleDynamicFieldChange} 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
          </>
        );
      default:
        return (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Silakan pilih peran untuk melihat bidang khusus.</p>
          </div>
        );
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-primaryLight">
      <LandingPageCSS />
      {/* Inline style untuk memastikan konsistensi warna */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container-wider mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <i className="fas fa-shield-halved text-primary text-2xl mr-2"></i>
                  <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
                </Link>
              </div>
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors duration-300 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 hover:border-primary hover:bg-primaryLight">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sudah punya akun? <span className="font-semibold">Masuk</span></span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Sign Up Form */}
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Buat akun Anda</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Bergabung dengan Sistem Penelusuran <span className="text-primary font-medium">Halalan Thoyyiban</span>
              </p>
              <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    required 
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Peran</label>
                  <select 
                    id="role" 
                    name="role" 
                    required 
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary hover:border-primary sm:text-sm"
                  >
                    <option value="">Pilih Peran</option>
                    <option value="PETERNAK">Peternak (Farmer)</option>
                    <option value="PASAR_HEWAN">Pasar Hewan (Animal Market)</option>
                    <option value="JAGAL">Jagal (Slaughterer)</option>
                    <option value="RPH">RPH (Slaughterhouse)</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="HOREKA">HoReCa (Hotel/Restaurant/Catering)</option>
                    <option value="REGULATOR">Regulator</option>
                  </select>
                </div>
              </div>

              <div id="profile-fields" className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-primary mb-4">Informasi Profil</h3>
                
                {/* Dynamic fields will be loaded here based on role selection */}
                <div id="dynamic-fields" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderDynamicFields()}
                </div>
              </div>

              <div>
                <button type="submit" className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-300">
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i className="fas fa-user-plus"></i>
                  </span>
                  Daftar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-primary text-white py-8">
          <div className="container-wider mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p>© {new Date().getFullYear()} Halalan Thoyyiban Traceability System</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SignUp;
