import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const RegulatorVerifikasiHalal = () => {
  const [dagingPending, setDagingPending] = useState([]);
  const [riwayatVerifikasi, setRiwayatVerifikasi] = useState([]);
  
  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingDaging, setVerifyingDaging] = useState(null);
  const [jagalCode, setJagalCode] = useState('');
  const [regulatorCode, setRegulatorCode] = useState('');
  const [verifyInputJagalCode, setVerifyInputJagalCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const dagingRes = await fetch(`${API_BASE}/transaksiPenyembelihan/regulator/daging-pending`, { headers });
      if (dagingRes.ok) {
        const dagingData = await dagingRes.json();
        setDagingPending(dagingData.data || []);
      }

      const riwayatRes = await fetch(`${API_BASE}/transaksiPenyembelihan/riwayat`, { headers });
      if (riwayatRes.ok) {
        const riwayatData = await riwayatRes.json();
        setRiwayatVerifikasi(riwayatData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleVerifikasiHalal = async (daging) => {
    // Open verification modal and request code
    setVerifyingDaging(daging);
    setShowVerifyModal(true);
    setVerifyError('');
    setVerifySuccess('');
    setVerifyInputJagalCode('');
    setJagalCode('');
    setRegulatorCode('');
    setLoadingCode(true);
    
    // Request verification code from backend
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/regulator/request-verification-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ transaksiId: daging.transaksiPenyembelihan?.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal meminta kode verifikasi');
      
      setRegulatorCode(data.regulatorCode);
      setJagalCode(data.jagalCode);
      setVerifySuccess('Kode verifikasi berhasil dikirim ke email Anda!');
      setTimeout(() => setVerifySuccess(''), 3000);
    } catch (error) {
      console.error('Error requesting verification code:', error);
      setVerifyError('Gagal meminta kode verifikasi: ' + error.message);
    } finally {
      setLoadingCode(false);
    }
  };
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(regulatorCode);
      setVerifySuccess('Kode berhasil disalin!');
      setTimeout(() => setVerifySuccess(''), 3000);
    } catch (error) {
      setVerifyError('Gagal menyalin kode');
    }
  };
  
  const handleConfirmVerification = async () => {
    if (!verifyInputJagalCode.trim()) {
      setVerifyError('Masukkan kode konfirmasi dari Jagal');
      return;
    }
    
    // Validate that entered code matches the Jagal code we received
    if (verifyInputJagalCode !== jagalCode) {
      setVerifyError('Kode Jagal tidak sesuai. Pastikan Anda memasukkan kode yang benar dari Jagal.');
      return;
    }
    
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/regulator/verifikasi-halal`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dagingId: verifyingDaging.id,
          jagalCode: verifyInputJagalCode,
          regulatorCode: regulatorCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memverifikasi');
      
      setVerifySuccess('Verifikasi berhasil! ' + (data.isCompleted ? 'Status halal sudah VERIFIED.' : 'Menunggu verifikasi dari Jagal.'));
      
      setTimeout(async () => {
        setShowVerifyModal(false);
        setVerifyingDaging(null);
        setJagalCode('');
        setRegulatorCode('');
        setVerifyInputJagalCode('');
        
        // Refresh data
        await fetchData();
      }, 2000);
    } catch (error) {
      console.error('Error verifying:', error);
      setVerifyError('Gagal memverifikasi: ' + error.message);
    }
  };
  
  const handleRejectVerification = () => {
    setShowVerifyModal(false);
    setVerifyingDaging(null);
    setJagalCode('');
    setRegulatorCode('');
    setVerifyInputJagalCode('');
    setVerifyError('');
    setVerifySuccess('');
  };

  return (
    <DashboardLayout title="Verifikasi Halal" role="REGULATOR" customSidebar={<RegulatorSidebar />}>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Pending Verifikasi</p>
                <p className="text-2xl font-bold text-gray-800">{dagingPending.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Terverifikasi</p>
                <p className="text-2xl font-bold text-gray-800">
                  {riwayatVerifikasi.filter(t => t.status === 'VERIFIED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <i className="fas fa-certificate text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-800">{riwayatVerifikasi.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Verification Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <i className="fas fa-shield-halved text-emerald-600"></i>
              Daging Menunggu Verifikasi Halal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Verifikasi hasil penyembelihan bersama Jagal untuk memastikan kehalalan
            </p>
          </div>
          
          <div className="p-6">
            {dagingPending.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                <p className="text-gray-600">Tidak ada daging yang menunggu verifikasi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dagingPending.map(daging => (
                  <div key={daging.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">Daging #{daging.id.slice(0, 8)}</h4>
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                        Pending
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">RPH:</span>
                        <span className="font-medium">{daging.rph?.nama || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jagal:</span>
                        <span className="font-medium">{daging.jagal?.nama || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sapi:</span>
                        <span className="font-medium">{daging.sapi?.jenis || '-'}</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600 block">Daging</span>
                            <span className="font-bold text-green-700">{daging.beratDaging} kg</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Jeroan</span>
                            <span className="font-bold text-blue-700">{daging.beratJeroan} kg</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Tulang</span>
                            <span className="font-bold text-gray-700">{daging.beratTulang} kg</span>
                          </div>
                        </div>
                        <div className="text-xs font-bold border-t mt-2 pt-2 text-right">
                          Total: {parseFloat(daging.beratDaging) + parseFloat(daging.beratJeroan) + parseFloat(daging.beratTulang)} kg
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs pt-2">
                        <span className="text-gray-600">Verifikasi Jagal:</span>
                        <span className={daging.verifikasiJagal ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                          {daging.verifikasiJagal ? '✓ Sudah' : '⏳ Belum'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleVerifikasiHalal(daging)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition font-medium shadow-sm"
                    >
                      <i className="fas fa-shield-alt mr-2"></i>
                      Request Verifikasi Bersama
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <i className="fas fa-history text-indigo-600"></i>
              Riwayat Verifikasi
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RPH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jagal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sapi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verifikasi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riwayatVerifikasi.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center" colSpan="7">
                      Belum ada riwayat verifikasi
                    </td>
                  </tr>
                ) : (
                  riwayatVerifikasi.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {new Date(item.tanggalPendaftaran).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{item.rph?.nama || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{item.jagal?.nama || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{item.sapi?.jenis || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {item.status === 'VERIFIED' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            ✓ Verified
                          </span>
                        ) : item.status === 'PENDING_REGULATOR_VERIFICATION' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Pending Regulator
                          </span>
                        ) : item.status === 'PENDING_JAGAL_VERIFICATION' ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Pending Jagal
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            {item.status}
                          </span>
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
      </div>

      {/* Verification Modal */}
      {showVerifyModal && verifyingDaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i className="fas fa-shield-alt text-emerald-600"></i>
                Verifikasi Halal Bersama Jagal
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Jagal:</span>
                  <span className="font-medium">{verifyingDaging.jagal?.nama || '-'}</span>
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
            
            {loadingCode ? (
              <div className="mb-4 p-6 text-center">
                <i className="fas fa-spinner fa-spin text-3xl text-primary mb-2"></i>
                <p className="text-sm text-gray-600">Mengirim kode verifikasi...</p>
              </div>
            ) : (
              <>
                {regulatorCode && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-key mr-1"></i>
                      Kode Verifikasi Anda (Regulator)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={regulatorCode}
                        readOnly
                        className="flex-1 bg-emerald-50 border border-emerald-300 rounded-md px-3 py-2 text-center font-mono text-lg font-bold tracking-wider"
                      />
                      <button
                        onClick={handleCopyCode}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition text-sm"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <i className="fas fa-info-circle mr-1"></i>
                      Kode ini telah dikirim ke email Anda. Bagikan kepada <strong>Jagal</strong>
                    </p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-shield-check mr-1"></i>
                    Kode Konfirmasi dari Jagal
                  </label>
                  <input
                    type="text"
                    value={verifyInputJagalCode}
                    onChange={(e) => setVerifyInputJagalCode(e.target.value)}
                    placeholder="Masukkan kode dari Jagal"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jagal akan memberikan kode setelah menerima kode Anda
                  </p>
                  {jagalCode && (
                    <p className="text-xs text-blue-600 mt-2">
                      <i className="fas fa-info-circle mr-1"></i>
                      Expected: {jagalCode} (untuk validasi internal)
                    </p>
                  )}
                </div>
              </>
            )}
            
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
                disabled={!verifyInputJagalCode.trim() || loadingCode}
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

export default RegulatorVerifikasiHalal;
