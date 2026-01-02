import React from 'react';

const ChecklistTable = ({ items, tipe, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pertanyaan Checklist
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Kategori
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Urutan
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-clipboard-list text-6xl mb-4 opacity-30"></i>
                  <p className="text-lg font-medium text-gray-500">
                    Belum Ada Checklist {tipe === 'PRA_PENYEMBELIHAN' ? 'Pra-Penyembelihan' : 'Pasca-Penyembelihan'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Klik tombol "Tambah Checklist" untuk menambahkan pertanyaan baru
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                    </div>
                    <span className="flex-1">{item.pertanyaan}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {item.kategori ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <i className="fas fa-tag mr-1"></i>
                      {item.kategori}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-semibold">
                    {item.urutan}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  {item.isAktif ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <i className="fas fa-circle text-green-500 text-xs mr-1.5"></i>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      <i className="fas fa-circle text-gray-400 text-xs mr-1.5"></i>
                      Nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                      title="Edit checklist"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {item.isAktif && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        title="Nonaktifkan checklist"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {items.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <i className="fas fa-info-circle mr-2"></i>
            Total <strong>{items.length}</strong> checklist {tipe === 'PRA_PENYEMBELIHAN' ? 'pra-penyembelihan' : 'pasca-penyembelihan'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChecklistTable;
