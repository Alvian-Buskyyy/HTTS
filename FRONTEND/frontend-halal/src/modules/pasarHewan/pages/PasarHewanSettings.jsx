import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';

const PasarHewanSettings = () => {
  const [activeTab, setActiveTab] = useState('account');
  
  // Account settings state
  const [accountForm, setAccountForm] = useState({
    email: 'pasarhewan.alfalah@example.com',
    username: 'pasarhewan_alfalah',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newLivestock: true,
    transferRequests: true,
    healthUpdates: true,
    systemUpdates: false,
    newsletter: false
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    shareContactInfo: true,
    allowDataAnalytics: true
  });
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactor: false
  });
  // Integration settings state
  const [integration, setIntegration] = useState({
    walletAddress: ''
  });

  // Load saved settings from localStorage (adopt PeternakSettings pattern)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pasarHewanSettings') || '{}');
      if (saved.account) setAccountForm((prev) => ({ ...prev, ...saved.account }));
      if (saved.notifications) setNotifications((prev) => ({ ...prev, ...saved.notifications }));
      if (saved.privacy) setPrivacySettings((prev) => ({ ...prev, ...saved.privacy }));
      if (saved.security) setSecurity((prev) => ({ ...prev, ...saved.security }));
      if (saved.integration) setIntegration((prev) => ({ ...prev, ...saved.integration }));
    } catch (_) {
      // ignore parse errors
    }
  }, []);

  // Persist settings to localStorage on change
  useEffect(() => {
    const payload = {
      account: accountForm,
      notifications,
      privacy: privacySettings,
      security,
      integration,
    };
    localStorage.setItem('pasarHewanSettings', JSON.stringify(payload));
  }, [accountForm, notifications, privacySettings, security, integration]);
  
  // Handle account form changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm({
      ...accountForm,
      [name]: value
    });
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting]
    });
  };
  
  // Handle privacy toggle
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };
  // Handle security toggle
  const handleSecurityToggle = (setting) => {
    setSecurity({
      ...security,
      [setting]: !security[setting]
    });
  };
  
  // Handle save settings
  const handleSaveAccount = (e) => {
    e.preventDefault();
    // Persist account section explicitly and show feedback (mirrors PeternakSettings UX)
    try {
      const existing = JSON.parse(localStorage.getItem('pasarHewanSettings') || '{}');
      const payload = {
        account: accountForm,
        notifications: existing.notifications || notifications,
        privacy: existing.privacy || privacySettings,
        security: existing.security || security,
        integration: existing.integration || integration,
      };
      localStorage.setItem('pasarHewanSettings', JSON.stringify(payload));
    } catch (_) {}
    alert('Pengaturan akun berhasil disimpan');
  };
  // Generic save per section
  const saveSettings = (section) => {
    const existing = JSON.parse(localStorage.getItem('pasarHewanSettings') || '{}');
    const payload = {
      account: existing.account || accountForm,
      notifications: existing.notifications || notifications,
      privacy: existing.privacy || privacySettings,
      security: existing.security || security,
      integration: existing.integration || integration,
    };
    if (section === 'notifications') payload.notifications = notifications;
    if (section === 'privacy') payload.privacy = privacySettings;
    if (section === 'security') payload.security = security;
    if (section === 'integration') payload.integration = integration;
    localStorage.setItem('pasarHewanSettings', JSON.stringify(payload));
    alert('Pengaturan disimpan');
  };
  // Data export & clear
  const exportData = () => {
    const exportObj = {
      settings: JSON.parse(localStorage.getItem('pasarHewanSettings') || '{}'),
      cattleList: JSON.parse(localStorage.getItem('cattleList') || '[]'),
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pasarhewan_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const clearLocalData = () => {
    if (!confirm('Hapus data lokal (ternak & pengaturan)? Tindakan ini tidak bisa dibatalkan.')) return;
    localStorage.removeItem('cattleList');
    localStorage.removeItem('pasarHewanSettings');
    alert('Data lokal dibersihkan');
  };
  
  // Tombol tab vertikal seperti di PeternakSettings
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
    <DashboardLayout title="Pengaturan" role="PASAR_HEWAN">
      <div className="mt-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Menu kiri */}
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

          {/* Konten kanan */}
          <main className="md:col-span-3">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <form onSubmit={handleSaveAccount} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Informasi Akun</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            name="email"
                            value={accountForm.email}
                            onChange={handleAccountChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input 
                            type="text" 
                            name="username"
                            value={accountForm.username}
                            onChange={handleAccountChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Ubah Password</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                          <input 
                            type="password" 
                            name="currentPassword"
                            value={accountForm.currentPassword}
                            onChange={handleAccountChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                          <input 
                            type="password" 
                            name="newPassword"
                            value={accountForm.newPassword}
                            onChange={handleAccountChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                          <input 
                            type="password" 
                            name="confirmPassword"
                            value={accountForm.confirmPassword}
                            onChange={handleAccountChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Pengaturan Notifikasi</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Aktifkan Notifikasi Email</h3>
                            <p className="text-sm text-gray-500">Terima notifikasi via email</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="emailNotifications"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.emailNotifications}
                              onChange={() => handleNotificationToggle('emailNotifications')}
                            />
                            <label 
                              htmlFor="emailNotifications"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                              style={{ 
                                content: '""',
                              }}
                            >
                              <span 
                                className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.emailNotifications ? 'transform translate-x-6' : ''}`}
                                style={{ 
                                  content: '""',
                                }}
                              ></span>
                            </label>
                          </div>
                        </div>
                        
                        <hr />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Ternak Baru</h3>
                            <p className="text-sm text-gray-500">Notifikasi saat ada ternak baru</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="newLivestock"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.newLivestock}
                              onChange={() => handleNotificationToggle('newLivestock')}
                            />
                            <label 
                              htmlFor="newLivestock"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.newLivestock ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.newLivestock ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Permintaan Transfer</h3>
                            <p className="text-sm text-gray-500">Notifikasi permintaan transfer ternak</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="transferRequests"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.transferRequests}
                              onChange={() => handleNotificationToggle('transferRequests')}
                            />
                            <label 
                              htmlFor="transferRequests"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.transferRequests ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.transferRequests ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Update Kesehatan</h3>
                            <p className="text-sm text-gray-500">Notifikasi pembaruan kesehatan ternak</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="healthUpdates"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.healthUpdates}
                              onChange={() => handleNotificationToggle('healthUpdates')}
                            />
                            <label 
                              htmlFor="healthUpdates"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.healthUpdates ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.healthUpdates ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <hr />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Update Sistem</h3>
                            <p className="text-sm text-gray-500">Notifikasi pembaruan sistem</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="systemUpdates"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.systemUpdates}
                              onChange={() => handleNotificationToggle('systemUpdates')}
                            />
                            <label 
                              htmlFor="systemUpdates"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.systemUpdates ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.systemUpdates ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Newsletter</h3>
                            <p className="text-sm text-gray-500">Terima newsletter bulanan</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="newsletter"
                              className="opacity-0 w-0 h-0"
                              checked={notifications.newsletter}
                              onChange={() => handleNotificationToggle('newsletter')}
                            />
                            <label 
                              htmlFor="newsletter"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${notifications.newsletter ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${notifications.newsletter ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        onClick={() => saveSettings('notifications')}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Pengaturan Privasi</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Profil Publik</h3>
                            <p className="text-sm text-gray-500">Memungkinkan profil Anda terlihat oleh publik</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="publicProfile"
                              className="opacity-0 w-0 h-0"
                              checked={privacySettings.publicProfile}
                              onChange={() => handlePrivacyToggle('publicProfile')}
                            />
                            <label 
                              htmlFor="publicProfile"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${privacySettings.publicProfile ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${privacySettings.publicProfile ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Bagikan Info Kontak</h3>
                            <p className="text-sm text-gray-500">Bagikan informasi kontak dengan entitas terhubung</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="shareContactInfo"
                              className="opacity-0 w-0 h-0"
                              checked={privacySettings.shareContactInfo}
                              onChange={() => handlePrivacyToggle('shareContactInfo')}
                            />
                            <label 
                              htmlFor="shareContactInfo"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${privacySettings.shareContactInfo ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${privacySettings.shareContactInfo ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Analitik Data</h3>
                            <p className="text-sm text-gray-500">Izinkan penggunaan data untuk analitik dan peningkatan sistem</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="allowDataAnalytics"
                              className="opacity-0 w-0 h-0"
                              checked={privacySettings.allowDataAnalytics}
                              onChange={() => handlePrivacyToggle('allowDataAnalytics')}
                            />
                            <label 
                              htmlFor="allowDataAnalytics"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${privacySettings.allowDataAnalytics ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${privacySettings.allowDataAnalytics ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-md font-medium text-gray-800 mb-2">Lainnya</h3>
                      <button className="text-red-600 hover:text-red-800 flex items-center">
                        <i className="fas fa-trash-alt mr-2"></i>
                        Hapus Akun
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Menghapus akun akan menghilangkan semua data dan tidak dapat dikembalikan.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        onClick={() => saveSettings('privacy')}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Keamanan</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Aktifkan 2FA</h3>
                            <p className="text-sm text-gray-500">Tambahkan lapisan keamanan ekstra</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                            <input 
                              type="checkbox" 
                              id="twoFactor"
                              className="opacity-0 w-0 h-0"
                              checked={security.twoFactor}
                              onChange={() => handleSecurityToggle('twoFactor')}
                            />
                            <label 
                              htmlFor="twoFactor"
                              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-200 ease-in ${security.twoFactor ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in ${security.twoFactor ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        onClick={() => saveSettings('security')}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
                {/* Integration Settings */}
                {activeTab === 'integration' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Integrasi</h2>
                      <div className="grid grid-cols-1 gap-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                          <input 
                            type="text" 
                            value={integration.walletAddress}
                            onChange={(e) => setIntegration({ ...integration, walletAddress: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0x..."
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        onClick={() => saveSettings('integration')}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
                {/* Data & Backup */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Data & Backup</h2>
                      <div className="flex items-center gap-3">
                        <button onClick={exportData} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Export Data</button>
                        <button onClick={clearLocalData} className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50">Bersihkan Data Lokal</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Mengekspor pengaturan dan daftar ternak dari localStorage</p>
                    </div>
                  </div>
                )}
              </main>
            </div>
        <footer className="bg-white p-4 border rounded-md text-center text-gray-500 text-sm mt-6">
          &copy; 2025 Sistem Penelusuran Halalan Thoyyiban
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default PasarHewanSettings;
