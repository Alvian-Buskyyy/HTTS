import React, { useState, useEffect } from "react";

const TransaksiDaging = ({
  filteredDagingTransactions = [],
  setVerifyingTx,
  setVerifyInputCode,
  setVerifyError,
  setVerifySuccess,
  setShowVerifyModal,
  setSelectedTransaction,
  setShowDetailModal,
  getVerificationBadge,
  formatDateTime,
}) => {
  // State for form
  const [form, setForm] = useState({ 
    dagingId: '', 
    distributorId: '', 
    beratDaging: '', 
    beratJeroan: '', 
    beratTulang: '' 
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [selectedDagingInfo, setSelectedDagingInfo] = useState(null);


  // Distributor list from backend
  const [distributorOptions, setDistributorOptions] = useState([]);
  const [dagingOptions, setDagingOptions] = useState([]);
  const [dagingLoading, setDagingLoading] = useState(false);
  const [distributorLoading, setDistributorLoading] = useState(false);
  const [dagingError, setDagingError] = useState('');
  const [distributorError, setDistributorError] = useState('');

  // Calculate total weight
  const totalBerat = (parseFloat(form.beratDaging) || 0) + (parseFloat(form.beratJeroan) || 0) + (parseFloat(form.beratTulang) || 0);

  // Fetch distributor list from backend
  useEffect(() => {
    setDistributorLoading(true);
    setDistributorError('');
    fetch('http://localhost:3000/distributor')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDistributorOptions(data.map(d => ({ id: d.id, name: d.nama || d.name || d.id })));
        } else if (data.data) {
          setDistributorOptions(data.data.map(d => ({ id: d.id, name: d.nama || d.name || d.id })));
        } else {
          setDistributorOptions([]);
        }
      })
      .catch(err => {
        setDistributorError('Gagal mengambil data distributor');
        setDistributorOptions([]);
      })
      .finally(() => setDistributorLoading(false));
  }, []);

  // Fetch daging list from backend on mount and after submit
  useEffect(() => {
    setDagingLoading(true);
    setDagingError('');
    // Get Jagal ID from localStorage user object
    const userRaw = localStorage.getItem('user');
    let jagalId = '';
    try {
      const user = userRaw ? JSON.parse(userRaw) : null;
      jagalId = user?.entityId || user?.id || '';
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    if (!jagalId) {
      setDagingError('Jagal ID tidak ditemukan. Silakan login ulang.');
      setDagingLoading(false);
      setDagingOptions([]);
      return;
    }
    fetch(`http://localhost:3000/daging/jagal/${jagalId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setDagingOptions(data.data.map(d => ({ 
            id: d.id, 
            label: d.id ? d.id.substring(0, 12) + '...' : 'N/A',
            beratTotal: d.beratTotal || 250,
            beratDaging: d.beratDaging || 0,
            beratJeroan: d.beratJeroan || 0,
            beratTulang: d.beratTulang || 0,
            fullData: d
          })));
        } else {
          setDagingOptions([]);
        }
      })
      .catch(err => {
        setDagingError('Gagal mengambil data daging');
        setDagingOptions([]);
      })
      .finally(() => setDagingLoading(false));
  }, [submitSuccess]);

  // Handle "All In" button click
  const handleAllIn = () => {
    if (selectedDagingInfo) {
      setForm(f => ({
        ...f,
        beratDaging: selectedDagingInfo.beratDaging.toString(),
        beratJeroan: selectedDagingInfo.beratJeroan.toString(),
        beratTulang: selectedDagingInfo.beratTulang.toString(),
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      // Get Jagal ID from localStorage user object
      const userRaw = localStorage.getItem('user');
      let jagalId = '';
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        jagalId = user?.entityId || user?.id || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      if (!jagalId) {
        setSubmitError('Jagal ID tidak ditemukan. Silakan login ulang.');
        setSubmitLoading(false);
        return;
      }
      if (!form.dagingId || !form.distributorId) {
        setSubmitError('Pilih daging dan distributor.');
        setSubmitLoading(false);
        return;
      }
      if (!form.beratDaging || !form.beratJeroan || !form.beratTulang) {
        setSubmitError('Isi semua rincian berat (daging, jeroan, tulang).');
        setSubmitLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/transaksiPenjualan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          penjualType: 'JAGAL',
          penjualId: jagalId,
          pembeliType: 'DISTRIBUTOR',
          pembeliId: form.distributorId,
          dagingId: form.dagingId,
          type: 'daging',
          beratDaging: parseFloat(form.beratDaging),
          beratJeroan: parseFloat(form.beratJeroan),
          beratTulang: parseFloat(form.beratTulang),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        // Enhanced error handling with details
        if (error.details) {
          setSubmitError(
            `${error.error}\n\nDetail:\n` +
            `- Berat Daging: ${error.details.beratDaging} kg\n` +
            `- Berat Jeroan: ${error.details.beratJeroan} kg\n` +
            `- Berat Tulang: ${error.details.beratTulang} kg\n` +
            `- Total Input: ${error.details.totalBeratInput} kg\n` +
            `- Sisa Tersedia: ${error.details.sisaDaging} kg`
          );
        } else {
          setSubmitError(error.error || 'Gagal membuat transaksi');
        }
        setSubmitLoading(false);
        return;
      }
      setSubmitSuccess('Transaksi penjualan daging berhasil dibuat!');
      setForm({ dagingId: '', distributorId: '', beratDaging: '', beratJeroan: '', beratTulang: '' });
      setSelectedDagingInfo(null);
      setTimeout(() => {
        setSubmitSuccess('');
      }, 1800);
    } catch (error) {
      setSubmitError(error.message || 'Gagal membuat transaksi');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      {/* Inline form for penjualan daging ke distributor */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Penjualan Daging ke Distributor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Daging</label>
            <select
              value={form.dagingId}
              onChange={e => {
                const selected = dagingOptions.find(d => d.id === e.target.value);
                setForm(f => ({ ...f, dagingId: e.target.value }));
                setSelectedDagingInfo(selected);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Pilih Daging</option>
              {dagingLoading && <option disabled>Memuat...</option>}
              {dagingError && <option disabled>{dagingError}</option>}
              {!dagingLoading && !dagingError && dagingOptions.map(d => (
                <option key={d.id} value={d.id}>{d.label} - Berat Total: {d.beratTotal} kg</option>
              ))}
            </select>
            {selectedDagingInfo && (
              <div className="mt-1 text-xs text-gray-500">
                Berat Total Daging: {selectedDagingInfo.beratTotal} kg
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distributor</label>
            <select
              value={form.distributorId}
              onChange={e => setForm(f => ({ ...f, distributorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Pilih Distributor</option>
              {distributorLoading && <option disabled>Memuat...</option>}
              {distributorError && <option disabled>{distributorError}</option>}
              {!distributorLoading && !distributorError && distributorOptions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Rincian Berat */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Rincian Berat Penjualan (kg)</h3>
              {selectedDagingInfo && (
                <button
                  type="button"
                  onClick={handleAllIn}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🎯 All In
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Berat Daging</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.beratDaging}
                  onChange={e => setForm(f => ({ ...f, beratDaging: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Berat Jeroan</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.beratJeroan}
                  onChange={e => setForm(f => ({ ...f, beratJeroan: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Berat Tulang</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.beratTulang}
                  onChange={e => setForm(f => ({ ...f, beratTulang: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm font-semibold text-gray-700">
                Total: {totalBerat.toFixed(2)} kg
              </div>
              {selectedDagingInfo && (
                <div className="text-xs text-gray-600">
                  Tersedia: {selectedDagingInfo.beratTotal.toFixed(2)} kg
                </div>
              )}
            </div>
            {selectedDagingInfo && totalBerat > selectedDagingInfo.beratTotal && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-sm">⚠️</span>
                  <div className="text-xs text-red-700">
                    <div className="font-semibold">Total berat melebihi ketersediaan!</div>
                    <div className="mt-1">
                      Input: {totalBerat.toFixed(2)} kg | Tersedia: {selectedDagingInfo.beratTotal.toFixed(2)} kg
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800 text-sm whitespace-pre-line">{submitError}</div>
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800 text-sm">{submitSuccess}</div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={submitLoading || (selectedDagingInfo && totalBerat > selectedDagingInfo.beratTotal)}
            >
              {submitLoading ? 'Memproses...' : 'Jual Daging'}
            </button>
          </div>
        </form>
      </div>
      {/* ...existing table code... */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penjual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Daging</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Verifikasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tindakan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDagingTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    Belum ada transaksi penjualan daging
                  </td>
                </tr>
              ) : (
                filteredDagingTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(tx.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.direction === 'outgoing' ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <i className="fas fa-arrow-up mr-1"></i>Keluar
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <i className="fas fa-arrow-down mr-1"></i>Masuk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{tx.sellerName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{tx.penjualType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{tx.buyerName || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{tx.pembeliType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.dagingId ? tx.dagingId.substring(0, 12) + '...' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(tx.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.cid ? (
                        <a
                          href={`https://ipfs.io/ipfs/${tx.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                          title={tx.cid}
                        >
                          <i className="fas fa-link"></i>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        {/* Verifikasi Bersama untuk transaksi daging */}
                        {tx.direction === 'outgoing' && (tx.verificationStatus === 'WAITING_BUYER' || tx.verificationStatus === 'PENDING') && (
                          <button
                            className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10"
                            onClick={() => {
                              setVerifyingTx(tx);
                              setVerifyInputCode('');
                              setVerifyError('');
                              setVerifySuccess('');
                              setShowVerifyModal(true);
                            }}
                          >
                            <i className="fas fa-key mr-1"></i>
                            Verifikasi Bersama
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Lihat Detail"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TransaksiDaging;
