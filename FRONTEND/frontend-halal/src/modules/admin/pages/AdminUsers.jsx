import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE = 'http://localhost:3000';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ username:'', email:'', password:'', role:'PETERNAK' });
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState({ show:false, message:'', type:'' });

  useEffect(()=>{ fetchUsers(); }, []);

  const showNotification = (message, type) => {
    setNotification({ show:true, message, type });
    setTimeout(()=> setNotification({ show:false, message:'', type:'' }), 2500);
  };

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if(!res.ok) throw new Error('Gagal mengambil data pengguna');
      setUsers(await res.json());
    } catch(err){ setError(err.message); showNotification(err.message,'error'); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => { const {name,value} = e.target; setFormData(prev=>({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/signup`, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }, body: JSON.stringify(formData) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Gagal membuat pengguna');
      showNotification('Pengguna berhasil ditambahkan','success');
      setFormData({ username:'', email:'', password:'', role:'PETERNAK' });
      fetchUsers();
    } catch(err){ showNotification(err.message,'error'); }
    finally { setIsCreating(false); }
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm('Hapus pengguna ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userId}`, { method:'DELETE', headers:{ 'Authorization': `Bearer ${token}` } });
      if(!res.ok) throw new Error('Gagal menghapus pengguna');
      showNotification('Pengguna dihapus','success');
      fetchUsers();
    } catch(err){ showNotification('Terjadi kesalahan: '+err.message,'error'); }
  };

  return (
    <DashboardLayout title="Kelola Users" role="ADMIN" customSidebar={<AdminSidebar /> }>
      <div className="space-y-6">
        {notification.show && (
          <div className={`p-3 rounded-md text-sm ${notification.type==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{notification.message}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Tambah Pengguna</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nama Pengguna</label>
                <input name="username" value={formData.username} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required minLength={6} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  {['ADMIN','PETERNAK','PASAR_HEWAN','JAGAL','RPH','DISTRIBUTOR','HOREKA','REGULATOR'].map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" className={`w-full bg-primary text-white rounded-md py-2 ${isCreating? 'opacity-60':''}`} disabled={isCreating}>
                {isCreating? 'Menambahkan...' : 'Tambah Pengguna'}
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Daftar Pengguna</h2>
              <button onClick={fetchUsers} className="px-3 py-2 text-sm rounded border hover:bg-gray-50"><i className="fas fa-rotate mr-1"></i>Refresh</button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
            ) : error ? (
              <div className="text-red-600 text-sm">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-gray-500 text-sm">Tidak ada pengguna</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                      <th className="px-4 py-2 text-left">Nama</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-4 py-2 text-left">{u.username}</td>
                        <td className="px-4 py-2 text-left text-gray-600">{u.email}</td>
                        <td className="px-4 py-2 text-left">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{u.role}</span>
                        </td>
                        <td className="px-4 py-2 text-left">
                          <button onClick={()=>handleDeleteUser(u.id)} className="text-red-600 hover:text-red-700 text-sm">Hapus</button>
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
    </DashboardLayout>
  );
};

export default AdminUsers;
