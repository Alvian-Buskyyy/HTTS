import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import DistributorSidebar from '../components/DistributorSidebar';

const DistributorSettings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [account, setAccount] = useState({ companyName:'', email:'', phone:'', address:'', siup:'', npwp:'', contactPerson:'', timezone:'Asia/Jakarta', language:'id' });
  const [notifications, setNotifications] = useState({ email:true, whatsapp:true, deliveryUpdates:true, verificationEvents:true });
  const [privacy, setPrivacy] = useState({ publicProfile:false, shareContact:false, allowAnalytics:true });
  const [security, setSecurity] = useState({ twoFactor:false });

  useEffect(()=>{ try{ const saved = JSON.parse(localStorage.getItem('distributorSettings')||'{}'); if(saved.account) setAccount(saved.account); if(saved.notifications) setNotifications(saved.notifications); if(saved.privacy) setPrivacy(saved.privacy); if(saved.security) setSecurity(saved.security);}catch{} },[]);

  const saveSettings = (section) => { const existing = JSON.parse(localStorage.getItem('distributorSettings')||'{}'); const payload = { account: existing.account || account, notifications: existing.notifications || notifications, privacy: existing.privacy || privacy, security: existing.security || security }; if(section==='account') payload.account = account; if(section==='notifications') payload.notifications = notifications; if(section==='privacy') payload.privacy = privacy; if(section==='security') payload.security = security; localStorage.setItem('distributorSettings', JSON.stringify(payload)); alert('Pengaturan disimpan'); };
  const clearLocalData = () => { if(!confirm('Hapus data lokal Distributor?')) return; localStorage.removeItem('distributorSettings'); alert('Data lokal dihapus'); };

  const TabButton = ({ id, icon, label }) => (<button onClick={()=>setActiveTab(id)} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${activeTab===id?'bg-primaryLight text-primary font-medium':'hover:bg-gray-100 text-gray-700'}`}><i className={`fas ${icon} w-4 text-sm`}></i><span>{label}</span></button>);

  return (
    <DashboardLayout title="Pengaturan" role="DISTRIBUTOR" customSidebar={<DistributorSidebar /> }>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 p-6">
        <aside className="md:col-span-1 bg-white rounded-lg border border-gray-100 p-3 h-fit text-left">
          <p className="px-2 text-xs text-gray-500 uppercase tracking-wide mb-2">Menu Pengaturan</p>
          <div className="space-y-1">
            <TabButton id="account" icon="fa-user-cog" label="Akun" />
            <TabButton id="notifications" icon="fa-bell" label="Notifikasi" />
            <TabButton id="privacy" icon="fa-user-shield" label="Privasi" />
            <TabButton id="security" icon="fa-shield-alt" label="Keamanan" />
            <TabButton id="data" icon="fa-database" label="Data & Backup" />
          </div>
        </aside>
        <main className="md:col-span-3">
          {activeTab==='account' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Akun</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-600 mb-1">Nama Perusahaan</label><input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.companyName} onChange={e=>setAccount({...account, companyName:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.email} onChange={e=>setAccount({...account, email:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-600 mb-1">No. Telepon</label><input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.phone} onChange={e=>setAccount({...account, phone:e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Alamat</label><textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="2" value={account.address} onChange={e=>setAccount({...account, address:e.target.value})}></textarea></div>
                <div><label className="block text-sm text-gray-600 mb-1">SIUP</label><input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.siup} onChange={e=>setAccount({...account, siup:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-600 mb-1">NPWP</label><input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.npwp} onChange={e=>setAccount({...account, npwp:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Contact Person</label><input className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.contactPerson} onChange={e=>setAccount({...account, contactPerson:e.target.value})} /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Zona Waktu</label><select className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.timezone} onChange={e=>setAccount({...account, timezone:e.target.value})}><option value="Asia/Jakarta">WIB (Asia/Jakarta)</option><option value="Asia/Makassar">WITA (Asia/Makassar)</option><option value="Asia/Jayapura">WIT (Asia/Jayapura)</option></select></div>
                <div><label className="block text-sm text-gray-600 mb-1">Bahasa</label><select className="w-full border border-gray-300 rounded-md px-3 py-2" value={account.language} onChange={e=>setAccount({...account, language:e.target.value})}><option value="id">Indonesia</option><option value="en">English</option></select></div>
              </div>
              <div className="flex justify-end mt-4"><button onClick={()=>saveSettings('account')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button></div>
            </section>
          )}
          {activeTab==='notifications' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Notifikasi</h2>
              <div className="space-y-3">
                {[{key:'email',label:'Email'},{key:'whatsapp',label:'WhatsApp'},{key:'deliveryUpdates',label:'Update Pengiriman'},{key:'verificationEvents',label:'Event Verifikasi'}].map(i=> (
                  <label key={i.key} className="flex items-center justify-between p-3 border rounded-md"><span className="text-gray-700">{i.label}</span><input type="checkbox" checked={notifications[i.key]} onChange={()=>setNotifications({...notifications,[i.key]:!notifications[i.key]})} /></label>
                ))}
              </div>
              <div className="flex justify-end mt-4"><button onClick={()=>saveSettings('notifications')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button></div>
            </section>
          )}
          {activeTab==='privacy' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pengaturan Privasi</h2>
              <div className="space-y-3">
                {[{key:'publicProfile',label:'Tampilkan profil perusahaan secara publik'},{key:'shareContact',label:'Bagikan kontak kepada pihak terverifikasi'},{key:'allowAnalytics',label:'Izinkan analitik penggunaan anonim'}].map(i=> (
                  <label key={i.key} className="flex items-center justify-between p-3 border rounded-md"><span className="text-gray-700">{i.label}</span><input type="checkbox" checked={privacy[i.key]} onChange={()=>setPrivacy({...privacy,[i.key]:!privacy[i.key]})} /></label>
                ))}
              </div>
              <div className="flex justify-end mt-4"><button onClick={()=>saveSettings('privacy')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button></div>
            </section>
          )}
          {activeTab==='security' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Keamanan</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 border rounded-md"><span className="text-gray-700">Aktifkan 2FA (kode OTP saat aksi sensitif)</span><input type="checkbox" checked={security.twoFactor} onChange={()=>setSecurity({...security,twoFactor:!security.twoFactor})} /></label>
              </div>
              <div className="flex justify-end mt-4"><button onClick={()=>saveSettings('security')} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark">Simpan</button></div>
            </section>
          )}
          {activeTab==='data' && (
            <section className="bg-white rounded-lg border border-gray-100 p-5 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Data & Backup</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={()=>{ const exportObj = { settings: JSON.parse(localStorage.getItem('distributorSettings')||'{}'), daging: JSON.parse(localStorage.getItem('rphDagingLocal')||'[]') }; const blob = new Blob([JSON.stringify(exportObj,null,2)], { type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_distributor_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url); }} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"><i className="fas fa-download mr-2"></i>Export Data</button>
                <button onClick={clearLocalData} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"><i className="fas fa-trash mr-2"></i>Hapus Data Lokal</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default DistributorSettings;
