import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LandingPageCSS from '../../common/components/LandingPageCSS';

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
      return;
    }
    
    // Reset dynamic fields when role changes
    setDynamicFields({});
  }, [formData.role]);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    
    if (!formData.role) {
      newErrors.role = 'Silakan pilih peran';
    }
    
    // Validate dynamic fields based on role
    if (formData.role === 'PETERNAK') {
      if (!dynamicFields.farmName) {
        newErrors.farmName = 'Nama peternakan harus diisi';
      }
      if (!dynamicFields.farmAddress) {
        newErrors.farmAddress = 'Alamat peternakan harus diisi';
      }
    }
    
    if (formData.role === 'PASAR_HEWAN') {
      if (!dynamicFields.marketName) {
        newErrors.marketName = 'Nama pasar hewan harus diisi';
      }
      if (!dynamicFields.marketAddress) {
        newErrors.marketAddress = 'Alamat pasar hewan harus diisi';
      }
    }
    
    if (formData.role === 'RPH') {
      if (!dynamicFields.slaughterhouseName) {
        newErrors.slaughterhouseName = 'Nama RPH harus diisi';
      }
      if (!dynamicFields.slaughterhouseAddress) {
        newErrors.slaughterhouseAddress = 'Alamat RPH harus diisi';
      }
      if (!dynamicFields.certificationNumber) {
        newErrors.certificationNumber = 'Nomor sertifikasi halal harus diisi';
      }
    }
    
    if (formData.role === 'JAGAL') {
      if (!dynamicFields.butcherName) {
        newErrors.butcherName = 'Nama jagal harus diisi';
      }
      if (!dynamicFields.butcherAddress) {
        newErrors.butcherAddress = 'Alamat jagal harus diisi';
      }
    }
    
    if (formData.role === 'DISTRIBUTOR') {
      if (!dynamicFields.distributorName) {
        newErrors.distributorName = 'Nama distributor harus diisi';
      }
      if (!dynamicFields.distributorAddress) {
        newErrors.distributorAddress = 'Alamat distributor harus diisi';
      }
    }
    
    if (formData.role === 'HOREKA') {
      if (!dynamicFields.businessName) {
        newErrors.businessName = 'Nama usaha harus diisi';
      }
      if (!dynamicFields.businessType) {
        newErrors.businessType = 'Jenis usaha harus dipilih';
      }
      if (!dynamicFields.businessAddress) {
        newErrors.businessAddress = 'Alamat usaha harus diisi';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submit triggered');
    console.log('formData:', formData);
    console.log('dynamicFields:', dynamicFields);

    const isValid = validateForm();
    if (!isValid) {
      console.log('Form not valid, errors:', errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Prepare data for API
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...dynamicFields
      };

      console.log('Data sent to API:', userData);

      // Call API to register user
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      console.log('API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mendaftar');
      }

      setSubmitSuccess(true);

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render dynamic fields based on selected role
  const renderDynamicFields = () => {
    switch (formData.role) {
      case 'PETERNAK':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-1">Nama Peternakan</label>
              <input 
                type="text" 
                id="farmName" 
                name="farmName" 
                value={dynamicFields.farmName || ''}
                onChange={handleDynamicFieldChange}
                className={`w-full p-3 border ${errors.farmName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Masukkan nama peternakan"
              />
              {errors.farmName && <p className="text-red-500 text-xs mt-1">{errors.farmName}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="farmAddress" className="block text-sm font-medium text-gray-700 mb-1">Alamat Peternakan</label>
              <textarea 
                id="farmAddress" 
                name="farmAddress" 
                value={dynamicFields.farmAddress || ''}
                onChange={handleDynamicFieldChange}
                className={`w-full p-3 border ${errors.farmAddress ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Masukkan alamat peternakan"
                rows={3}
              />
              {errors.farmAddress && <p className="text-red-500 text-xs mt-1">{errors.farmAddress}</p>}
            </div>
          </>
        );
      
      // Add other role-specific fields
      
      default:
        return null;
    }
  };
  
  return (
    <>
      <style>{customStyles}</style>
      <LandingPageCSS />
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
          <div className="flex justify-center">
            <img src="/img/logo.png" alt="Logo" className="h-12 w-auto" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w">
            Sudah punya akun?{' '}
            <Link to="/" className="font-medium text-primary hover:text-primaryDark">
              Login di sini
            </Link>
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-green-800">
                    Registrasi berhasil! Mengalihkan ke halaman login...
                  </p>
                </div>
              </div>
            ) : submitError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-800">
                    {submitError}
                  </p>
                </div>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Masukkan username"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Masukkan email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Buat password (minimal 8 karakter)"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Masukkan password yang sama"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai</label>
                <select 
                  id="role" 
                  name="role" 
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">-- Pilih Peran --</option>
                  <option value="PETERNAK">Peternak</option>
                  <option value="PASAR_HEWAN">Pasar Hewan</option>
                  <option value="JAGAL">Jagal</option>
                  <option value="RPH">RPH</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="HOREKA">HoReCa</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>
              
              {/* Dynamic fields based on selected role */}
              {formData.role && renderDynamicFields()}

              <div>
                <button 
                  type="submit" 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <Link to="/" className="flex items-center justify-center text-sm text-gray-600 hover:text-primary">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Halaman Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
