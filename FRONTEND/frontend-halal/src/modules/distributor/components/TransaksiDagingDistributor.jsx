import React, { useState, useEffect } from "react";

const TransaksiDagingDistributor = ({
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
    buyerType: 'HOREKA', // Default to HOREKA
    buyerId: '',
    beratDaging: '',
    beratJeroan: '',
    beratTulang: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [selectedDagingInfo, setSelectedDagingInfo] = useState(null);

  // Buyer options
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [dagingOptions, setDagingOptions] = useState([]);
  const [dagingLoading, setDagingLoading] = useState(false);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [dagingError, setDagingError] = useState('');
  const [buyerError, setBuyerError] = useState('');

  // Calculate total weight
  const totalBerat = (parseFloat(form.beratDaging) || 0) + (parseFloat(form.beratJeroan) || 0) + (parseFloat(form.beratTulang) || 0);

  // Fetch buyer list based on selected buyer type
  useEffect(() => {
    if (!form.buyerType) return;

    setBuyerLoading(true);
    setBuyerError('');

    const endpoint = form.buyerType === 'HOREKA' ? 'http://localhost:3000/horeka' : 'http://localhost:3000/endcustomer';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBuyerOptions(data.map(b => ({ id: b.id, name: b.nama || b.name || b.id })));
        } else if (data.data) {
          setBuyerOptions(data.data.map(b => ({ id: b.id, name: b.nama || b.name || b.id })));
        } else {
          setBuyerOptions([]);
        }
      })
      .catch(err => {
        setBuyerError('Gagal mengambil data pembeli');
        setBuyerOptions([]);
      })
      .finally(() => setBuyerLoading(false));
  }, [form.buyerType]);

  // Fetch daging list owned by distributor
  useEffect(() => {
    setDagingLoading(true);
    setDagingError('');

    // Get Distributor ID from localStorage user object
    const userRaw = localStorage.getItem('user');
    let distributorId = '';
    try {
      const user = userRaw ? JSON.parse(userRaw) : null;
      distributorId = user?.entityId || user?.id || '';
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    if (!distributorId) {
      setDagingError('Distributor ID tidak ditemukan. Silakan login ulang.');
      setDagingLoading(false);
      setDagingOptions([]);
      return;
    }

    fetch(`http://localhost:3000/distributor/${distributorId}/daging`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setDagingOptions(data.data.map(d => ({
            id: d.daging.id,
            label: d.daging.id ? d.daging.id.substring(0, 12) + '...' : 'N/A',
            availableWeight: d.availableWeight,
            totalOwned: d.totalOwned,
            totalSold: d.totalSold,
            fullData: d,
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

  // Handle "All In" button click - sell all available weight
  const handleAllIn = () => {
    if (selectedDagingInfo && selectedDagingInfo.fullData) {
      const dagingData = selectedDagingInfo.fullData.daging;
      const availableWeight = selectedDagingInfo.availableWeight;
      
      // Calculate proportional weights based on available weight
      const totalOriginal = dagingData.beratDaging + dagingData.beratJeroan + dagingData.beratTulang;
      const ratio = availableWeight / totalOriginal;
      
      setForm(f => ({
        ...f,
        beratDaging: (dagingData.beratDaging * ratio).toFixed(2),
        beratJeroan: (dagingData.beratJeroan * ratio).toFixed(2),
        beratTulang: (dagingData.beratTulang * ratio).toFixed(2),
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
      // Get Distributor ID from localStorage
      const userRaw = localStorage.getItem('user');
      let distributorId = '';
      try {
        const user = userRaw ? JSON.parse(userRaw) : null;
        distributorId = user?.entityId || user?.id || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      if (!distributorId) {
        setSubmitError('Distributor ID tidak ditemukan. Silakan login ulang.');
        setSubmitLoading(false);
        return;
      }

      if (!form.dagingId || !form.buyerId) {
        setSubmitError('Pilih daging dan pembeli.');
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
          penjualType: 'DISTRIBUTOR',
          penjualId: distributorId,
          pembeliType: form.buyerType,
          pembeliId: form.buyerId,
          dagingId: form.dagingId,
          type: 'daging',
          jumlahQty: 1,
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
      setForm({ dagingId: '', buyerType: 'HOREKA', buyerId: '', beratDaging: '', beratJeroan: '', beratTulang: '' });
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
      {/* Inline form for penjualan daging ke Horeka/EndCustomer */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Penjualan Daging ke Horeka/End Customer</h2>
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
                <option key={d.id} value={d.id}>
                  {d.label} - Tersedia: {d.availableWeight.toFixed(2)} kg (Dimiliki: {d.totalOwned.toFixed(2)} kg, Terjual: {d.totalSold.toFixed(2)} kg)
                </option>
              ))}
            </select>
            {selectedDagingInfo && (
              <div className="mt-1 text-xs text-gray-500">
                Berat Tersedia: {selectedDagingInfo.availableWeight.toFixed(2)} kg
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pembeli</label>
              <select
                value={form.buyerType}
                onChange={e => setForm(f => ({ ...f, buyerType: e.target.value, buyerId: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="HOREKA">Horeka</option>
                <option value="END_CUSTOMER">End Customer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
              <select
                value={form.buyerId}
                onChange={e => setForm(f => ({ ...f, buyerId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Pilih Pembeli</option>
                {buyerLoading && <option disabled>Memuat...</option>}
                {buyerError && <option disabled>{buyerError}</option>}
                {!buyerLoading && !buyerError && buyerOptions.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rincian Berat */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Rincian Berat Penjualan (kg)</h3>
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
            <div className="mt-2 text-sm font-semibold text-gray-700">
              Total: {totalBerat.toFixed(2)} kg
            </div>
            {selectedDagingInfo && totalBerat > selectedDagingInfo.availableWeight && (
              <div className="mt-1 text-xs text-red-600">
                ⚠️ Total berat melebihi berat daging yang tersedia ({selectedDagingInfo.availableWeight.toFixed(2)} kg)
              </div>
            )}
          </div>

          {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
          {submitSuccess && <div className="text-green-600 text-sm">{submitSuccess}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={submitLoading || (selectedDagingInfo && totalBerat > selectedDagingInfo.availableWeight)}
            >
              {submitLoading ? 'Memproses...' : 'Jual Daging'}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction history table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDagingTransactions && filteredDagingTransactions.length > 0 ? (
                filteredDagingTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.id?.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(tx.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.direction === 'incoming' ? (
                        <span className="text-green-600">↓ Masuk</span>
                      ) : (
                        <span className="text-blue-600">↑ Keluar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.penjualInfo?.nama || tx.penjualType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.pembeliInfo?.nama || tx.pembeliType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.totalBerat ? `${tx.totalBerat.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getVerificationBadge(tx.verificationStatus)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                      {tx.verificationStatus === 'PENDING' && tx.direction === 'incoming' && (
                        <button
                          onClick={() => {
                            setVerifyingTx(tx);
                            setShowVerifyModal(true);
                            setVerifyInputCode('');
                            setVerifyError('');
                            setVerifySuccess('');
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Verifikasi
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada transaksi daging
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TransaksiDagingDistributor;
