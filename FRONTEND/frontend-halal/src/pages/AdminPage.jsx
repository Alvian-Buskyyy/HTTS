import React, { useState, useEffect } from 'react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PETERNAK',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  // Ambil data user dari API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data pengguna');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      showNotification('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit form untuk membuat user baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat pengguna');
      }
      
      showNotification('Pengguna berhasil ditambahkan!', 'success');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'PETERNAK',
      });
      
      // Refresh user list
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Hapus user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus pengguna');
      }
      
      showNotification('Pengguna berhasil dihapus!', 'success');
      fetchUsers();
    } catch (err) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error');
    }
  };

  // Tampilkan notifikasi
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola pengguna sistem Halalan Thoyyiban</p>
        </header>

        {/* Notification */}
        {notification.show && (
          <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah User */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Tambah Pengguna Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 mb-2">Nama Pengguna</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="role" className="block text-gray-700 mb-2">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="ADMIN">Admin</option>
                  <option value="PETERNAK">Peternak</option>
                  <option value="PASAR_HEWAN">Pasar Hewan</option>
                  <option value="JAGAL">Jagal</option>
                  <option value="RPH">RPH</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="HOREKA">Horeka</option>
                  <option value="REGULATOR">Regulator</option>
                </select>
              </div>
              
              <button
                type="submit"
                className={`w-full bg-primary hover:bg-primaryDark text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menambahkan...
                  </span>
                ) : 'Tambah Pengguna'}
              </button>
            </form>
          </div>

          {/* Daftar User */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Daftar Pengguna</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada pengguna yang ditemukan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                            ${user.role === 'PETERNAK' ? 'bg-green-100 text-green-800' : ''}
                            ${user.role === 'PASAR_HEWAN' ? 'bg-blue-100 text-blue-800' : ''}
                            ${user.role === 'JAGAL' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${user.role === 'RPH' ? 'bg-red-100 text-red-800' : ''}
                            ${user.role === 'DISTRIBUTOR' ? 'bg-indigo-100 text-indigo-800' : ''}
                            ${user.role === 'HOREKA' ? 'bg-pink-100 text-pink-800' : ''}
                            ${user.role === 'REGULATOR' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
