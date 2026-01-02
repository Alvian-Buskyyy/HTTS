import React from 'react';

const ChecklistInfoCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pra-Penyembelihan Info */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <i className="fas fa-clipboard-list text-white text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2 text-lg">
              Checklist Pra-Penyembelihan
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Checklist yang harus dipenuhi RPH <strong>sebelum</strong> proses penyembelihan dimulai. 
              Digunakan untuk memverifikasi kondisi hewan, sumber, kesehatan, dan kesiapan proses.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700 font-medium">
                <i className="fas fa-lightbulb mr-1"></i>
                Contoh: Verifikasi sertifikat halal, kondisi fisik hewan, sumber hewan terverifikasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pasca-Penyembelihan Info */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
              <i className="fas fa-clipboard-check text-white text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2 text-lg">
              Checklist Pasca-Penyembelihan
            </h4>
            <p className="text-sm text-green-800 leading-relaxed">
              Checklist yang harus dipenuhi RPH <strong>setelah</strong> proses penyembelihan selesai. 
              Digunakan untuk memverifikasi kesesuaian proses, kebersihan, dan kualitas hasil.
            </p>
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-green-700 font-medium">
                <i className="fas fa-lightbulb mr-1"></i>
                Contoh: Verifikasi cara penyembelihan sesuai syariat, kebersihan area, penanganan daging
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panduan Penggunaan */}
      <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <i className="fas fa-book-open text-white text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-3 text-lg">
              <i className="fas fa-info-circle mr-2"></i>
              Panduan Penggunaan Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-purple-800 mb-2">
                  <i className="fas fa-check-circle text-purple-600 mr-1"></i>
                  Untuk Regulator:
                </h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Buat pertanyaan checklist yang jelas dan terukur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Gunakan kategori untuk mengelompokkan pertanyaan sejenis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Atur urutan tampilan agar logis dan sistematis</span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-800 mb-2">
                  <i className="fas fa-clipboard-list text-purple-600 mr-1"></i>
                  Untuk RPH:
                </h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Isi checklist pra-penyembelihan sebelum memulai proses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Isi checklist pasca-penyembelihan setelah proses selesai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-arrow-right text-purple-400 mt-1"></i>
                    <span>Semua item harus dicek untuk melanjutkan ke tahap berikutnya</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistInfoCard;
