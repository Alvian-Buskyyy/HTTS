import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

// Mengadopsi struktur PeternakSettings dengan penyesuaian konteks Jagal
const JagalSettings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const [account, setAccount] = useState({
    facilityName: '',
    responsibleName: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'Asia/Jakarta',
    language: 'id'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    slaughterAlerts: true,
    distributionUpdates: true,
    verificationEvents: true
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareContact: false,
    allowAnalytics: true
  });

  const [security, setSecurity] = useState({
    twoFactor: false
  });

  const [integration, setIntegration] = useState({
    walletAddress: ''
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('jagalSettings') || '{}');
      if (saved.account) setAccount(saved.account);
      if (saved.notifications) setNotifications(saved.notifications);
      if (saved.privacy) setPrivacy(saved.privacy);
      if (saved.security) setSecurity(saved.security);
      if (saved.integration) setIntegration(saved.integration);
    } catch {}
  }, []);

  const saveSettings = (section) => {
    const existing = JSON.parse(localStorage.getItem('jagalSettings') || '{}');
    const payload = {
      account: existing.account || account,
      notifications: existing.notifications || notifications,
      privacy: existing.privacy || privacy,
      security: existing.security || security,
      integration: existing.integration || integration,
    };
    if (section === 'account') payload.account = account;
    if (section === 'notifications') payload.notifications = notifications;
    if (section === 'privacy') payload.privacy = privacy;
    if (section === 'security') payload.security = security;
    if (section === 'integration') payload.integration = integration;
    localStorage.setItem('jagalSettings', JSON.stringify(payload));
    alert('Pengaturan disimpan');
  };

  const exportData = () => {
    const exportObj = {
      settings: JSON.parse(localStorage.getItem('jagalSettings') || '{}'),
      slaughterRecords: JSON.parse(localStorage.getItem('slaughterRecords') || '[]'),
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jagal_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLocalData = () => {
    if (!confirm('Hapus data lokal (catatan pemotongan & pengaturan)? Tindakan ini tidak bisa dibatalkan.')) return;
    localStorage.removeItem('slaughterRecords');
    localStorage.removeItem('jagalSettings');
    alert('Data lokal dibersihkan');
  };

  const TabButton = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${activeTab === id ? 'bg-primaryLight text-primary font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
    >
      <i className={`fas ${icon} w-4 text-sm`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <DashboardLayout title="Pengaturan" role="JAGAL" customSidebar={<JagalSidebar /> }>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 p-6">
        <aside className="md:col-span-1 bg-white rounded-lg border border-gray-100 p-3 h-fit">
          <p className="px-2 text-xs text-gray-500 uppercase tracking-wide mb-2">Menu Pengaturan</p>
          <div className="space-y-1">
            <TabButton id="account" icon="fa-user-cog" label="Akun" />
            <TabButton id="notifications" icon="fa-bell" label="Notifikasi" />
            <TabButton id="privacy" icon="fa-user-shield" label="Privasi" />
            <TabButton id="security" icon="fa-shield-alt" label="Keamanan" />
            <TabButton id="integration" icon="fa-link" label="Integrasi" />
            <TabButton id="data" icon="fa-database" label="Data & Backup" />
          </div>
        </aside>
        <main className="md:col-span-3">
          {activeTab === 'account' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Akun</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nama Fasilitas</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.facilityName} onChange={e=>setAccount({...account, facilityName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Penanggung Jawab</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.responsibleName} onChange={e=>setAccount({...account, responsibleName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.email} onChange={e=>setAccount({...account, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">No. Telepon</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.phone} onChange={e=>setAccount({...account, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Alamat</label>
                  <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="2" value={account.address} onChange={e=>setAccount({...account, address: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Zona Waktu</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.timezone} onChange={e=>setAccount({...account, timezone: e.target.value})}>
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bahasa</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.language} onChange={e=>setAccount({...account, language: e.target.value})}>
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={()=>saveSettings('account')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button>
              </div>
            </section>
          )}
          {activeTab === 'notifications' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Notifikasi</h2>
              <div className="space-y-3">
                {[
                  { key:'email', label:'Email'},
                  { key:'whatsapp', label:'WhatsApp'},
                  { key:'slaughterAlerts', label:'Peringatan Jadwal Pemotongan'},
                  { key:'distributionUpdates', label:'Update Distribusi'},
                  { key:'verificationEvents', label:'Event Verifikasi'},
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-gray-700">{item.label}</span>
                    <input type="checkbox" checked={notifications[item.key]} onChange={()=>setNotifications({...notifications, [item.key]: !notifications[item.key]})} />
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={()=>saveSettings('notifications')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button>
              </div>
            </section>
          )}
          {activeTab === 'privacy' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Privasi</h2>
              <div className="space-y-3">
                {[
                  { key:'publicProfile', label:'Tampilkan profil fasilitas secara publik'},
                  { key:'shareContact', label:'Bagikan kontak kepada pihak terverifikasi'},
                  { key:'allowAnalytics', label:'Izinkan analitik penggunaan anonim'},
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-gray-700">{item.label}</span>
                    <input type="checkbox" checked={privacy[item.key]} onChange={()=>setPrivacy({...privacy, [item.key]: !privacy[item.key]})} />
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={()=>saveSettings('privacy')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button>
              </div>
            </section>
          )}
          {activeTab === 'security' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Keamanan</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 border rounded-md">
                  <span className="text-gray-700">Aktifkan 2FA (kode OTP saat aksi sensitif)</span>
                  <input type="checkbox" checked={security.twoFactor} onChange={()=>setSecurity({...security, twoFactor: !security.twoFactor})} />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="password" placeholder="Kata sandi saat ini" className="border rounded-md px-3 py-2" />
                  <input type="password" placeholder="Kata sandi baru" className="border rounded-md px-3 py-2" />
                  <input type="password" placeholder="Ulangi kata sandi baru" className="border rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={()=>saveSettings('security')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button>
              </div>
            </section>
          )}
          {activeTab === 'integration' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Integrasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Alamat Dompet Blockchain (opsional)</label>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="0x..." value={integration.walletAddress} onChange={e=>setIntegration({...integration, walletAddress: e.target.value})} />
                  <p className="text-xs text-gray-500 mt-1">Digunakan untuk penandaan transaksi on-chain (bila diaktifkan).</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={()=>saveSettings('integration')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button>
              </div>
            </section>
          )}
          {activeTab === 'data' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Data & Backup</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={exportData} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"><i className="fas fa-download mr-2"></i>Export Data</button>
                <button onClick={clearLocalData} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"><i className="fas fa-trash mr-2"></i>Hapus Data Lokal</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default JagalSettings;
