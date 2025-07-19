import React, { useState } from 'react';
import PasarHewanSidebar from '../components/PasarHewanSidebar';

const PasarHewanSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  
  // Handle save settings
  const handleSaveAccount = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to save the account settings
    alert('Pengaturan akun berhasil disimpan');
  };
  
  return (
    <div className="font-sans antialiased bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar */}
        <PasarHewanSidebar activeSection="settings" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
                    <span className="text-gray-700 font-medium">Pasar Hewan Al-Falah</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Settings Content */}
          <main className="flex-1 p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pengaturan</h1>
            
            {/* Settings Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b">
                <nav className="flex">
                  <button 
                    onClick={() => setActiveTab('account')}
                    className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'account' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <i className="fas fa-user-circle mr-2"></i>
                    Akun
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <i className="fas fa-bell mr-2"></i>
                    Notifikasi
                  </button>
                  <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'privacy' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    <i className="fas fa-shield-alt mr-2"></i>
                    Privasi
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
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
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                      >
                        Simpan Perubahan
                      </button>
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

export default PasarHewanSettings;
