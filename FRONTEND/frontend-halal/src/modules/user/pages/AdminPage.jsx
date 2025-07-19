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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Kirim form untuk membuat user baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat pengguna baru');
      }
      
      // Reset form data
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'PETERNAK'
      });
      
      // Refresh user list
      fetchUsers();
      
      showNotification('Pengguna berhasil ditambahkan', 'success');
    } catch (err) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error');
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
      
      // Refresh user list
      fetchUsers();
      
      showNotification('Pengguna berhasil dihapus', 'success');
    } catch (err) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error');
    }
  };

  // Tampilkan notifikasi
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark"
        >
          {isCreating ? 'Batal' : '+ Tambah User Baru'}
        </button>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}
      
      {/* Form for creating new user */}
      {isCreating && (
        <div className="bg-white p-4 rounded-md shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Tambah User Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PETERNAK">Peternak</option>
                  <option value="PASAR_HEWAN">Pasar Hewan</option>
                  <option value="JAGAL">Jagal</option>
                  <option value="RPH">RPH</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="HOREKA">HoReCa</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REGULATOR">Regulator</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan User'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Users Table */}
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-4">Daftar Pengguna</h2>
        
        {loading ? (
          <div className="text-center py-4">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
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
  );
};

export default AdminPage;
