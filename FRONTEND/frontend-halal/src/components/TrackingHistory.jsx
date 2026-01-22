import React from "react";

const TrackingHistory = ({ type, data, history }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500">Scan QR Code atau masukkan ID untuk melihat riwayat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-history text-primary"></i> Riwayat Tracking
      </h2>

      {/* Data Detail */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">
          {type === "sapi" ? "Informasi Sapi" : "Informasi Daging"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">ID:</span>
            <span className="ml-2 font-medium">{data.id}</span>
          </div>
          {type === "sapi" && (
            <>
              <div>
                <span className="text-gray-600">Jenis:</span>
                <span className="ml-2 font-medium">{data.jenis}</span>
              </div>
              <div>
                <span className="text-gray-600">Kelamin:</span>
                <span className="ml-2 font-medium">{data.kelamin}</span>
              </div>
              <div>
                <span className="text-gray-600">Usia:</span>
                <span className="ml-2 font-medium">{data.usia} tahun</span>
              </div>
              <div>
                <span className="text-gray-600">Berat:</span>
                <span className="ml-2 font-medium">{data.beratSapi || "-"} kg</span>
              </div>
              <div>
                <span className="text-gray-600">Status Halal:</span>
                <span className={`ml-2 font-medium ${data.statusHalal ? "text-green-600" : "text-yellow-600"}`}>
                  {data.statusHalal ? "✓ Halal" : "Belum Diverifikasi"}
                </span>
              </div>
            </>
          )}
          {type === "daging" && (
            <>
              <div>
                <span className="text-gray-600">Berat:</span>
                <span className="ml-2 font-medium">{data.berat} kg</span>
              </div>
              <div>
                <span className="text-gray-600">Asal Sapi:</span>
                <span className="ml-2 font-medium">{data.sapiId}</span>
              </div>
              <div>
                <span className="text-gray-600">RPH:</span>
                <span className="ml-2 font-medium">{data.rphId || "-"}</span>
              </div>
              <div>
                <span className="text-gray-600">Status Halal:</span>
                <span className={`ml-2 font-medium ${data.statusHalal ? "text-green-600" : "text-yellow-600"}`}>
                  {data.statusHalal ? "✓ Halal" : "Belum Diverifikasi"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ownership History */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <i className="fas fa-exchange-alt text-primary"></i>
          Riwayat Kepemilikan
        </h3>
        
        {history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    <i className={`fas ${index === 0 ? "fa-check-circle" : "fa-circle"}`}></i>
                  </div>
                  {index !== history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {item.type === 'slaughter' && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              <i className="fas fa-cut mr-1"></i>
                              Proses Penyembelihan
                            </span>
                          </div>
                        )}
                        <div className="space-y-1">
                          <div>
                            <i className="fas fa-arrow-right text-green-600 mr-2"></i>
                            <span className="text-gray-600">Dari:</span>
                            <span className="ml-2 font-semibold text-gray-800">
                              {item.fromName || item.entityName || 'Unknown'}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">({item.fromEntity || item.entityType})</span>
                          </div>
                          <div>
                            <i className="fas fa-arrow-left text-blue-600 mr-2"></i>
                            <span className="text-gray-600">Ke:</span>
                            <span className="ml-2 font-semibold text-gray-800">
                              {item.toName || 'Unknown'}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">({item.toEntity})</span>
                          </div>
                        </div>
                      </div>
                      {item.verified && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <i className="fas fa-check-circle mr-1"></i>
                          Verified
                        </span>
                      )}
                      {index === 0 && !item.verified && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          <i className="fas fa-clock mr-1"></i>
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <i className="fas fa-calendar mr-2 text-gray-400"></i>
                        {formatDate(item.date || item.timestamp)}
                      </p>
                      {item.details && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <i className="fas fa-drumstick-bite text-green-600 mr-1"></i>
                              Daging: <span className="font-semibold">{item.details.beratDaging || 0} kg</span>
                            </div>
                            <div>
                              <i className="fas fa-heart text-red-600 mr-1"></i>
                              Jeroan: <span className="font-semibold">{item.details.beratJeroan || 0} kg</span>
                            </div>
                            <div>
                              <i className="fas fa-bone text-gray-600 mr-1"></i>
                              Tulang: <span className="font-semibold">{item.details.beratTulang || 0} kg</span>
                            </div>
                            <div>
                              <i className="fas fa-weight text-blue-600 mr-1"></i>
                              Total: <span className="font-semibold">{item.details.totalBerat || 0} kg</span>
                            </div>
                            {item.details.checklistPra !== undefined && (
                              <div className="col-span-2">
                                <i className="fas fa-tasks text-purple-600 mr-1"></i>
                                Checklist: Pra-{item.details.checklistPra ? '✓' : '✗'} | Pasca-{item.details.checklistPasca ? '✓' : '✗'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {item.transactionType && (
                        <p className="mt-1">
                          <i className="fas fa-exchange-alt mr-2 text-gray-400"></i>
                          {item.transactionType}
                        </p>
                      )}
                      {item.verificationStatus && (
                        <p className="mt-1">
                          <i className={`fas fa-${item.verificationStatus === "verified" ? "check-circle text-green-600" : "clock text-yellow-600"} mr-2`}></i>
                          {item.verificationStatus === "verified" ? "Terverifikasi" : "Menunggu Verifikasi"}
                        </p>
                      )}
                      {item.cid && (
                        <p className="mt-1 font-mono text-xs">
                          <i className="fas fa-link mr-2 text-gray-400"></i>
                          <a 
                            href={`https://ipfs.io/ipfs/${item.cid}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            Lihat di IPFS
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="fas fa-inbox text-gray-300 text-3xl mb-2"></i>
            <p className="text-gray-500 text-sm">Belum ada riwayat kepemilikan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingHistory;
