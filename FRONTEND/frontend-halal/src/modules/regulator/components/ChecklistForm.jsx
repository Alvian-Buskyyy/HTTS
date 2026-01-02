import React from 'react';

const ChecklistForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  loading, 
  editingId,
  currentTab 
}) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'} text-blue-500`}></i>
        {editingId ? 'Edit Checklist' : 'Tambah Checklist Baru'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pertanyaan Checklist *
          </label>
          <textarea
            value={formData.pertanyaan}
            onChange={(e) => handleChange('pertanyaan', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Contoh: Apakah hewan berasal dari sumber yang terverifikasi halal?"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Pertanyaan ini akan ditampilkan kepada RPH saat proses {currentTab === 'PRA_PENYEMBELIHAN' ? 'sebelum' : 'setelah'} penyembelihan
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <input
            type="text"
            value={formData.kategori}
            onChange={(e) => handleChange('kategori', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Sumber Hewan, Proses Penyembelihan"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan kategori untuk mengelompokkan pertanyaan sejenis
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urutan Tampilan
          </label>
          <input
            type="number"
            value={formData.urutan}
            onChange={(e) => handleChange('urutan', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Urutan menentukan posisi tampilan checklist (mulai dari 0)
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition"
          disabled={loading}
        >
          <i className="fas fa-times mr-2"></i>
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-2 rounded-md transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Menyimpan...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              {editingId ? 'Update Checklist' : 'Simpan Checklist'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChecklistForm;
