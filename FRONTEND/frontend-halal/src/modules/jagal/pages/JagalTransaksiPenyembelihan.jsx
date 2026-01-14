import React, { useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

import { useSlaughterData } from '../hooks/useSlaughterData';


const JagalTransaksiPenyembelihan = () => {
  const [slaughterForm, setSlaughterForm] = useState({ rphId: '', sapiId: '' });
  const [slaughterSuccess, setSlaughterSuccess] = useState(false);

  // Use slaughter data hook
  const {
    sapiJagal,
    setSapiJagal,
    rphOptions,
    setRphOptions,
    dagingPending,
    setDagingPending,
    riwayatPenyembelihan,
    setRiwayatPenyembelihan,
    isLoading,
    error,
    refreshData,
  } = useSlaughterData();

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingDaging, setVerifyingDaging] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyInputCode, setVerifyInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  const handleSlaughterSubmit = async (e) => {
    e.preventDefault();
    console.log('submitting slaughter form:', slaughterForm);
    if (!slaughterForm.rphId || !slaughterForm.sapiId) {
      alert('Mohon pilih RPH dan Sapi.');
      return;
    }
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const payload = { rphId: slaughterForm.rphId, sapiId: slaughterForm.sapiId };
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/daftarkan`, {
        method: 'POST', headers, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftarkan sapi untuk penyembelihan');
      setSlaughterSuccess(true);
      setTimeout(() => setSlaughterSuccess(false), 3000);
      setSlaughterForm({ rphId: '', sapiId: '' });
      await refreshData();
      alert('Sapi berhasil didaftarkan untuk penyembelihan di RPH!');
    } catch (error) {
      console.error('Error submitting slaughter:', error);
      alert('Gagal mendaftarkan sapi: ' + error.message);
    }
  };

  const handleVerifikasiHasilPenyembelihan = async (daging) => {
    // Open verification modal and request code
    setVerifyingDaging(daging);
    setShowVerifyModal(true);
    setVerifyError('');
    setVerifySuccess('');
    setVerifyInputCode('');
    
    // Request verification code from backend
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/request-verification-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ transaksiId: daging.transaksiPenyembelihan?.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal meminta kode verifikasi');
      setVerificationCode(data.verificationCode);
      if (data.emailSent) {
        setVerifySuccess('Kode verifikasi berhasil dikirim ke email Anda!');
        setTimeout(() => setVerifySuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error requesting verification code:', error);
      setVerifyError('Gagal meminta kode verifikasi: ' + error.message);
    }
  };
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setVerifySuccess('Kode berhasil disalin! Bagikan ke Regulator.');
      setTimeout(() => setVerifySuccess(''), 3000);
    } catch (error) {
      setVerifyError('Gagal menyalin kode');
    }
  };
  
  const handleConfirmVerification = async () => {
    if (!verifyInputCode.trim()) {
      setVerifyError('Masukkan kode konfirmasi dari Regulator');
      return;
    }
    
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/verifikasi-hasil`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dagingId: verifyingDaging.id,
          verificationCode: verifyInputCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memverifikasi hasil penyembelihan');
      
      setVerifySuccess('Verifikasi berhasil! ' + (data.isCompleted ? 'Status halal sudah VERIFIED.' : 'Menunggu verifikasi dari Regulator.'));
      
      setTimeout(async () => {
        setShowVerifyModal(false);
        setVerifyingDaging(null);
        setVerificationCode('');
        setVerifyInputCode('');
        
        // Refresh data
        const dagingRes = await fetch(`${API_BASE}/transaksiPenyembelihan/jagal/daging-pending`, { headers });
        if (dagingRes.ok) {
          const dagingData = await dagingRes.json();
          setDagingPending(dagingData.data || []);
        }
        const riwayatRes = await fetch(`${API_BASE}/transaksiPenyembelihan/riwayat`, { headers });
        if (riwayatRes.ok) {
          const riwayatData = await riwayatRes.json();
          setRiwayatPenyembelihan(riwayatData.data || []);
        }
      }, 2000);
    } catch (error) {
      console.error('Error verifying:', error);
      setVerifyError('Gagal memverifikasi: ' + error.message);
    }
  };
  
  const handleRejectVerification = () => {
    setShowVerifyModal(false);
    setVerifyingDaging(null);
    setVerificationCode('');
    setVerifyInputCode('');
    setVerifyError('');
    setVerifySuccess('');
  };

  return (
    <DashboardLayout title="Transaksi Penyembelihan" role="JAGAL" customSidebar={<JagalSidebar />}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-cut text-primary"></i> Transaksi Penyembelihan</h2>
          <p className="text-sm text-gray-500">Daftarkan sapi untuk disembelih di RPH</p>
        </div>
      </div>
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">
          <i className="fas fa-spinner fa-spin mr-1"></i> Memuat data penyembelihan...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          <i className="fas fa-exclamation-circle mr-1"></i> {error}
        </div>
      )}
      {slaughterSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          <i className="fas fa-check-circle mr-1"></i> Sapi berhasil didaftarkan untuk penyembelihan!
        </div>
      )}
      <form onSubmit={handleSlaughterSubmit} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Daftarkan Sapi ke RPH</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RPH *</label>
            <select value={slaughterForm.rphId} onChange={e=>setSlaughterForm({...slaughterForm, rphId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="">Pilih RPH</option>
              {rphOptions.map(r => (<option key={r.id} value={r.id}>{r.nama || r.id}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sapi *</label>
            <select value={slaughterForm.sapiId} onChange={e=>setSlaughterForm({...slaughterForm, sapiId:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="">Pilih Sapi</option>
              {sapiJagal.map(sapi => (
                <option key={sapi.id} value={sapi.id}>{sapi.jenis} - {sapi.kelamin} ({sapi.beratSapi ? sapi.beratSapi + ' kg' : 'tanpa berat'})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{sapiJagal.length} sapi tersedia</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition text-sm font-medium shadow-sm">
            <i className="fas fa-paper-plane mr-1"></i>
            Daftarkan ke RPH
          </button>
        </div>
      </form>
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Hasil Penyembelihan - Menunggu Verifikasi Anda</h3>
        {dagingPending.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="fas fa-inbox text-gray-300 text-4xl mb-2"></i>
            <p className="text-gray-600">Tidak ada daging yang menunggu verifikasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dagingPending.map(daging => (
              <div key={daging.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">Daging #{daging.id.slice(0, 8)}</h4>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    Pending
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RPH:</span>
                    <span className="font-medium">{daging.rph?.nama || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sapi:</span>
                    <span className="font-medium">{daging.sapi?.jenis || '-'}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Daging:</span>
                      <span className="font-semibold text-green-700">{daging.beratDaging} kg</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Jeroan:</span>
                      <span className="font-semibold text-blue-700">{daging.beratJeroan} kg</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Tulang:</span>
                      <span className="font-semibold text-gray-700">{daging.beratTulang} kg</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t mt-1 pt-1">
                      <span>Total:</span>
                      <span>{parseFloat(daging.beratDaging) + parseFloat(daging.beratJeroan) + parseFloat(daging.beratTulang)} kg</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Verifikasi Regulator:</span>
                    <span className={daging.verifikasiRegulator ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                      {daging.verifikasiRegulator ? '✓ Sudah' : '⏳ Belum'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleVerifikasiHasilPenyembelihan(daging)}
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm transition font-medium shadow-sm"
                >
                  <i className="fas fa-shield-alt mr-1"></i>
                  Request Verifikasi Bersama
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Riwayat Transaksi Penyembelihan</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RPH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sapi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riwayatPenyembelihan.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center" colSpan="6">Belum ada riwayat penyembelihan</td>
                </tr>
              ) : (
                riwayatPenyembelihan.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-800">{
                      (() => {
                        // Ambil hanya sebelum 'T' pakai regex
                        const match = item.tanggalPendaftaran?.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})/);
                        return match ? match[1] : '-';
                      })()
                    }</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.rph?.nama || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.sapi?.jenis || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.status === 'PENDING_RPH' ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Pending RPH</span>
                      ) : item.status === 'PENDING_JAGAL_VERIFICATION' ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Pending Jagal</span>
                      ) : item.status === 'PENDING_REGULATOR_VERIFICATION' ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Pending Regulator</span>
                      ) : item.status === 'VERIFIED' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">✓ Verified</span>
                      ) : item.status === 'REJECTED' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">✗ Rejected</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">{item.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {item.daging ? `${parseFloat(item.daging.beratDaging) + parseFloat(item.daging.beratJeroan) + parseFloat(item.daging.beratTulang)} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {item.daging ? (
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.daging.verifikasiJagal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            Jagal: {item.daging.verifikasiJagal ? '✓' : '✗'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.daging.verifikasiRegulator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            Regulator: {item.daging.verifikasiRegulator ? '✓' : '✗'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Belum diproses</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Verification Modal */}
      {showVerifyModal && verifyingDaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i className="fas fa-shield-alt text-emerald-600"></i>
                Verifikasi Hasil Penyembelihan
              </h3>
              <button onClick={handleRejectVerification} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daging ID:</span>
                  <span className="font-medium">#{verifyingDaging.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sapi:</span>
                  <span className="font-medium">{verifyingDaging.sapi?.jenis || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RPH:</span>
                  <span className="font-medium">{verifyingDaging.rph?.nama || '-'}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 block">Daging</span>
                      <span className="font-bold text-green-700">{verifyingDaging.beratDaging} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Jeroan</span>
                      <span className="font-bold text-blue-700">{verifyingDaging.beratJeroan} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Tulang</span>
                      <span className="font-bold text-gray-700">{verifyingDaging.beratTulang} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {verifyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {verifyError}
              </div>
            )}
            
            {verifySuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                {verifySuccess}
              </div>
            )}
            
            {verificationCode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-key mr-1"></i>
                  Kode Verifikasi Anda
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    readOnly
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-center font-mono text-lg font-bold tracking-wider"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition text-sm"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Kode ini telah dikirim ke email Anda. Bagikan kepada <strong>Regulator</strong> untuk melakukan verifikasi bersama
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-shield-check mr-1"></i>
                Kode Konfirmasi dari Regulator
              </label>
              <input
                type="text"
                value={verifyInputCode}
                onChange={(e) => setVerifyInputCode(e.target.value)}
                placeholder="Masukkan kode dari Regulator"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Regulator akan memberikan kode setelah menerima kode Anda
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleRejectVerification}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                <i className="fas fa-times mr-1"></i>
                Batal
              </button>
              <button
                onClick={handleConfirmVerification}
                disabled={!verifyInputCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check-circle mr-1"></i>
                Konfirmasi Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JagalTransaksiPenyembelihan;
