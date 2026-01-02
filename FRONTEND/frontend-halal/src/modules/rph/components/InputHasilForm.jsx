import React, { useState } from 'react';

const InputHasilForm = ({ transaksi, onCancel, onSuccess }) => {
  const API_BASE = 'http://localhost:3000';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    beratDaging: '',
    beratJeroan: '',
    beratTulang: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTotalBerat = () => {
    const daging = parseFloat(formData.beratDaging) || 0;
    const jeroan = parseFloat(formData.beratJeroan) || 0;
    const tulang = parseFloat(formData.beratTulang) || 0;
    return daging + jeroan + tulang;
  };

  const getEfisiensi = () => {
    if (!transaksi.sapi.beratSapi) return 0;
    return (getTotalBerat() / transaksi.sapi.beratSapi) * 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = getTotalBerat();
    if (total === 0) {
      alert('Berat tidak boleh semua nol');
      return;
    }

    if (transaksi.sapi.beratSapi && total > transaksi.sapi.beratSapi) {
      alert(`Total berat (${total.toFixed(2)} kg) melebihi berat sapi (${transaksi.sapi.beratSapi} kg)`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/rph/input-hasil-penyembelihan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          transaksiId: transaksi.id,
          beratDaging: parseFloat(formData.beratDaging),
          beratJeroan: parseFloat(formData.beratJeroan),
          beratTulang: parseFloat(formData.beratTulang)
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Hasil penyembelihan berhasil diinput! Menunggu verifikasi Jagal dan Regulator.');
        onSuccess();
      } else {
        alert(data.error || 'Gagal input hasil penyembelihan');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-weight text-white"></i>
          </div>
          Input Hasil Penyembelihan
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Masukkan berat hasil penyembelihan untuk setiap komponen
        </p>
      </div>

      {/* Info Sapi */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-purple-900 mb-2">Informasi Sapi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-purple-700 font-medium">Jenis:</span>
            <p className="text-purple-900">{transaksi.sapi.jenis}</p>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Kelamin:</span>
            <p className="text-purple-900">{transaksi.sapi.kelamin}</p>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Usia:</span>
            <p className="text-purple-900">{transaksi.sapi.usia} bulan</p>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Berat Awal:</span>
            <p className="text-purple-900 font-bold">{transaksi.sapi.beratSapi} kg</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-drumstick-bite text-red-500 mr-1"></i>
              Berat Daging (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.beratDaging}
              onChange={(e) => handleChange('beratDaging', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-heart text-pink-500 mr-1"></i>
              Berat Jeroan (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.beratJeroan}
              onChange={(e) => handleChange('beratJeroan', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="fas fa-bone text-gray-500 mr-1"></i>
              Berat Tulang (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.beratTulang}
              onChange={(e) => handleChange('beratTulang', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.0"
              required
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 mb-6 border border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Hasil</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Total Berat</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalBerat().toFixed(2)}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Berat Sapi</p>
              <p className="text-2xl font-bold text-gray-900">{transaksi.sapi.beratSapi || '-'}</p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Efisiensi</p>
              <p className={`text-2xl font-bold ${getEfisiensi() > 100 ? 'text-red-600' : getEfisiensi() >= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                {getEfisiensi().toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {getEfisiensi() > 100 ? 'Melebihi!' : getEfisiensi() >= 60 ? 'Baik' : 'Rendah'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Selisih</p>
              <p className={`text-2xl font-bold ${transaksi.sapi.beratSapi - getTotalBerat() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {(transaksi.sapi.beratSapi - getTotalBerat()).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">kg</p>
            </div>
          </div>
          
          {getEfisiensi() > 100 && (
            <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <strong>Peringatan:</strong> Total berat hasil melebihi berat sapi awal!
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <i className="fas fa-times mr-2"></i>
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || getTotalBerat() === 0 || getEfisiensi() > 100}
            className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Simpan Hasil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputHasilForm;
