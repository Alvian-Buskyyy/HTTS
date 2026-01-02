import React, { useState, useEffect } from 'react';

const ChecklistPascaForm = ({ transaksi, onCancel, onSuccess }) => {
  const API_BASE = 'http://localhost:3000';
  const [checklistItems, setChecklistItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const loadChecklist = async () => {
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/checklist-halal`, {
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        const data = await res.json();
        const pascaItems = data.data.filter(item => item.tipe === 'PASCA_PENYEMBELIHAN' && item.isAktif);
        setChecklistItems(pascaItems.sort((a, b) => a.urutan - b.urutan));
        
        // Initialize answers
        const initialAnswers = {};
        pascaItems.forEach(item => {
          initialAnswers[item.id] = { isChecked: false, catatan: '' };
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const handleCheckChange = (itemId, checked) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], isChecked: checked }
    }));
  };

  const handleCatatanChange = (itemId, catatan) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], catatan }
    }));
  };

  const allChecked = () => {
    return Object.values(answers).every(answer => answer.isChecked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!allChecked()) {
      alert('Semua item checklist harus dicentang sebelum melanjutkan');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/rph/submit-checklist-pasca`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          transaksiId: transaksi.id,
          answers: Object.entries(answers).map(([itemId, answer]) => ({
            itemChecklistId: itemId,
            isChecked: answer.isChecked,
            catatan: answer.catatan
          }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Checklist pasca-penyembelihan berhasil disubmit!');
        onSuccess();
      } else {
        alert(data.error || 'Gagal submit checklist');
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
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-clipboard-check text-white"></i>
          </div>
          Checklist Pasca-Penyembelihan
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Verifikasi hasil penyembelihan sesuai standar halal
        </p>
      </div>

      {/* Info Sapi */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-green-900 mb-2">Informasi Sapi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-green-700 font-medium">Jenis:</span>
            <p className="text-green-900">{transaksi.sapi.jenis}</p>
          </div>
          <div>
            <span className="text-green-700 font-medium">Kelamin:</span>
            <p className="text-green-900">{transaksi.sapi.kelamin}</p>
          </div>
          <div>
            <span className="text-green-700 font-medium">Usia:</span>
            <p className="text-green-900">{transaksi.sapi.usia} bulan</p>
          </div>
          <div>
            <span className="text-green-700 font-medium">Berat:</span>
            <p className="text-green-900">{transaksi.sapi.beratSapi} kg</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {checklistItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-info-circle text-4xl mb-3"></i>
              <p>Belum ada checklist pasca-penyembelihan yang dibuat oleh Regulator</p>
            </div>
          ) : (
            checklistItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      id={`check-${item.id}`}
                      checked={answers[item.id]?.isChecked || false}
                      onChange={(e) => handleCheckChange(item.id, e.target.checked)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`check-${item.id}`} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        {item.kategori && (
                          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                            {item.kategori}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium">{item.pertanyaan}</p>
                    </label>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        value={answers[item.id]?.catatan || ''}
                        onChange={(e) => handleCatatanChange(item.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows="2"
                        placeholder="Tambahkan catatan jika diperlukan..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress */}
        {checklistItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress Checklist</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.values(answers).filter(a => a.isChecked).length} / {checklistItems.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  allChecked() ? 'bg-green-500' : 'bg-green-400'
                }`}
                style={{
                  width: `${(Object.values(answers).filter(a => a.isChecked).length / checklistItems.length) * 100}%`
                }}
              />
            </div>
            {allChecked() && (
              <p className="text-sm text-green-600 font-medium mt-2">
                <i className="fas fa-check-circle mr-1"></i>
                Semua checklist sudah lengkap, siap untuk submit
              </p>
            )}
          </div>
        )}

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
            disabled={loading || !allChecked() || checklistItems.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Submit Checklist Pasca
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChecklistPascaForm;
