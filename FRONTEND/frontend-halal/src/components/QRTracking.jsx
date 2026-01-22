import React, { useState } from "react";
import QRCode from "qrcode.react";

/**
 * Komponen Universal untuk Generate & Scan QR Code
 * Menampilkan riwayat tracking sapi atau daging
 */
const QRTracking = ({ type = "sapi", data, role = "general" }) => {
  const [showQR, setShowQR] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scannedId, setScannedId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate QR Code value (bisa berupa URL atau ID)
  const getQRValue = () => {
    if (type === "sapi") {
      return `${window.location.origin}/track/sapi/${data?.id || ""}`;
    } else if (type === "daging") {
      return `${window.location.origin}/track/daging/${data?.id || ""}`;
    }
    return "";
  };

  // Fetch tracking data dari backend atau localStorage
  const fetchTrackingData = async (id, itemType) => {
    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const token = localStorage.getItem("token");

      if (itemType === "sapi") {
        // Fetch dari backend
        const response = await fetch(`http://localhost:3000/sapi/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Sapi tidak ditemukan");

        const sapiData = await response.json();

        // Fetch riwayat transaksi penjualan sapi
        const txResponse = await fetch(`http://localhost:3000/transaksiPenjualan`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allTransactions = await txResponse.json();
        const sapiTransactions = allTransactions.filter(
          (tx) => tx.sapiId === id && tx.status !== "cancelled"
        );

        // Build ownership history
        const ownershipHistory = sapiTransactions
          .sort((a, b) => new Date(a.tanggalTransaksi) - new Date(b.tanggalTransaksi))
          .map((tx) => ({
            date: tx.tanggalTransaksi,
            from: tx.penjualType || "Unknown",
            fromId: tx.penjualId,
            to: tx.pembeliType || "Unknown",
            toId: tx.pembeliId,
            status: tx.verificationStatus,
            cid: tx.cid,
          }));

        setTrackingData({
          type: "sapi",
          id: sapiData.id,
          jenis: sapiData.jenis,
          kelamin: sapiData.kelamin,
          usia: sapiData.usia,
          berat: sapiData.beratSapi,
          status: sapiData.status,
          currentOwner: sapiData.currentOwnerType || "Unknown",
          currentOwnerId: sapiData.currentOwnerId,
          ownershipHistory,
          jenisKelamin: sapiData.kelamin,
          createdAt: sapiData.createdAt,
        });
      } else if (itemType === "daging") {
        // Fetch daging dari backend
        const response = await fetch(`http://localhost:3000/daging/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Daging tidak ditemukan");

        const dagingData = await response.json();

        // Fetch sapi asal
        let sapiAsal = null;
        if (dagingData.sapiId) {
          const sapiRes = await fetch(`http://localhost:3000/sapi/${dagingData.sapiId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (sapiRes.ok) {
            sapiAsal = await sapiRes.json();
          }
        }

        // Fetch transaksi penyembelihan
        let penyembelihanData = null;
        if (dagingData.transaksiPenyembelihanId) {
          const penyRes = await fetch(
            `http://localhost:3000/transaksiPenyembelihan/${dagingData.transaksiPenyembelihanId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (penyRes.ok) {
            penyembelihanData = await penyRes.json();
          }
        }

        // Fetch riwayat transaksi penjualan daging
        const txResponse = await fetch(`http://localhost:3000/transaksiPenjualan`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allTransactions = await txResponse.json();
        const dagingTransactions = allTransactions.filter(
          (tx) => tx.dagingId === id && tx.status !== "cancelled"
        );

        const salesHistory = dagingTransactions
          .sort((a, b) => new Date(a.tanggalTransaksi) - new Date(b.tanggalTransaksi))
          .map((tx) => ({
            date: tx.tanggalTransaksi,
            from: tx.penjualType || "Unknown",
            fromId: tx.penjualId,
            to: tx.pembeliType || "Unknown",
            toId: tx.pembeliId,
            quantity: tx.quantity,
            status: tx.verificationStatus,
            cid: tx.cid,
          }));

        setTrackingData({
          type: "daging",
          id: dagingData.id,
          berat: dagingData.berat,
          status: dagingData.status,
          sapiAsal: sapiAsal
            ? {
                id: sapiAsal.id,
                jenis: sapiAsal.jenis,
                kelamin: sapiAsal.kelamin,
                usia: sapiAsal.usia,
              }
            : null,
          rph: penyembelihanData
            ? {
                rphId: penyembelihanData.rphId,
                tanggal: penyembelihanData.timestamp,
                idPengecekanHalalSehat: penyembelihanData.idPengecekanHalalSehat,
              }
            : null,
          salesHistory,
          currentOwner: dagingData.currentOwnerType || "Unknown",
          currentOwnerId: dagingData.currentOwnerId,
          createdAt: dagingData.createdAt,
        });
      }
    } catch (err) {
      console.error("Error fetching tracking data:", err);
      setError(err.message || "Gagal mengambil data tracking");
    } finally {
      setLoading(false);
    }
  };

  // Handle scan/input ID
  const handleScan = () => {
    if (!scannedId.trim()) {
      setError("Masukkan ID untuk tracking");
      return;
    }

    const itemType = scannedId.toLowerCase().startsWith("sapi") ? "sapi" : "daging";
    fetchTrackingData(scannedId, itemType);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateCid = (cid, start = 8, end = 8) => {
    if (!cid) return "-";
    if (cid.length <= start + end) return cid;
    return `${cid.substring(0, start)}...${cid.substring(cid.length - end)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-qrcode text-primary"></i>
            QR Code Tracking
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate QR Code atau scan untuk tracking riwayat {type === "sapi" ? "sapi" : "daging"}
          </p>
        </div>
      </div>

      {/* Generate QR Code Section (jika ada data) */}
      {data && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                QR Code untuk {type === "sapi" ? "Sapi" : "Daging"}: {data.id}
              </h3>
              <p className="text-sm text-gray-500">Scan QR code ini untuk melihat riwayat lengkap</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm"
            >
              <i className={`fas ${showQR ? "fa-eye-slash" : "fa-eye"} mr-2`}></i>
              {showQR ? "Sembunyikan" : "Tampilkan"} QR
            </button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
              <QRCode value={getQRValue()} size={256} level="H" includeMargin={true} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">ID: {data.id}</p>
                <p className="text-xs text-gray-500">Scan dengan aplikasi QR scanner</p>
              </div>
              <a
                href={getQRValue()}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {getQRValue()}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Scan/Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <i className="fas fa-search mr-2 text-primary"></i>
          Cari & Tracking {type === "sapi" ? "Sapi" : "Daging"}
        </h3>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={scannedId}
            onChange={(e) => setScannedId(e.target.value)}
            placeholder={`Masukkan ID ${type === "sapi" ? "Sapi" : "Daging"} (contoh: sapi-xxx atau daging-xxx)`}
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-search mr-2"></i>
                Cari
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        {/* Display Tracking Data */}
        {trackingData && (
          <div className="mt-6 border-t pt-6">
            {trackingData.type === "sapi" ? (
              <div className="space-y-6">
                {/* Sapi Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-cow"></i>
                    Informasi Sapi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID Sapi:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Jenis:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.jenis}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kelamin:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.kelamin}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Usia:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.usia} tahun</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Berat:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {trackingData.berat || "N/A"} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.status}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Pemilik Saat Ini:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {trackingData.currentOwner} ({trackingData.currentOwnerId})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ownership History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-primary"></i>
                    Riwayat Kepemilikan
                  </h4>

                  {trackingData.ownershipHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Belum ada riwayat transaksi kepemilikan
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {trackingData.ownershipHistory.map((item, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                  Transfer #{index + 1}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <div>
                                  <i className="fas fa-arrow-right text-green-600 mr-2"></i>
                                  <span className="text-gray-600">Dari:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {item.from} ({item.fromId})
                                  </span>
                                </div>
                                <div>
                                  <i className="fas fa-arrow-left text-blue-600 mr-2"></i>
                                  <span className="text-gray-600">Ke:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {item.to} ({item.toId})
                                  </span>
                                </div>
                                {item.cid && (
                                  <div className="mt-2">
                                    <i className="fas fa-fingerprint text-purple-600 mr-2"></i>
                                    <span className="text-gray-600">CID:</span>
                                    <a
                                      href={`https://ipfs.io/ipfs/${item.cid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="ml-2 text-primary hover:underline text-xs font-mono"
                                    >
                                      {truncateCid(item.cid)}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              {item.status === "verified" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Verified
                                </span>
                              )}
                              {item.status === "waiting_buyer" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  <i className="fas fa-clock mr-1"></i>
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Daging Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-drumstick-bite"></i>
                    Informasi Daging
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="md:col-span-3">
                      <span className="text-gray-600">ID Daging:</span>
                      <span className="ml-2 font-medium text-gray-900">{trackingData.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Berat Daging:</span>
                      <span className="ml-2 font-medium text-green-700">{trackingData.beratDaging || trackingData.berat} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Berat Jeroan:</span>
                      <span className="ml-2 font-medium text-orange-700">{trackingData.beratJeroan || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Berat Tulang:</span>
                      <span className="ml-2 font-medium text-gray-700">{trackingData.beratTulang || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Berat:</span>
                      <span className="ml-2 font-medium text-blue-700">{trackingData.totalBerat || trackingData.berat} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status Penjualan:</span>
                      <span className="ml-2">
                        {trackingData.sudahDijual ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Sudah Dijual
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <i className="fas fa-warehouse mr-1"></i>
                            Belum Dijual
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="text-gray-600">Pemilik Saat Ini:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {trackingData.currentOwnerName || trackingData.currentOwner}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">({trackingData.currentOwnerType || trackingData.currentOwner})</span>
                    </div>
                  </div>
                </div>

                {/* Halal Status */}
                {trackingData.halalStatus && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-certificate"></i>
                      Status Halal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2">
                          {trackingData.halalStatus.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                              <i className="fas fa-check-circle mr-1"></i>
                              HALAL TERVERIFIKASI
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <i className="fas fa-clock mr-1"></i>
                              {trackingData.halalStatus.status}
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Verifikasi:</span>
                        <span className="ml-2 font-medium text-gray-900">{formatDate(trackingData.halalStatus.verifiedAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Verifikasi Jagal:</span>
                        <span className="ml-2">
                          {trackingData.halalStatus.verifikasiJagal ? (
                            <span className="text-green-600"><i className="fas fa-check-circle"></i> Terverifikasi</span>
                          ) : (
                            <span className="text-red-600"><i className="fas fa-times-circle"></i> Belum</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Verifikasi Regulator:</span>
                        <span className="ml-2">
                          {trackingData.halalStatus.verifikasiRegulator ? (
                            <span className="text-green-600"><i className="fas fa-check-circle"></i> Terverifikasi</span>
                          ) : (
                            <span className="text-red-600"><i className="fas fa-times-circle"></i> Belum</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sapi Asal */}
                {trackingData.sapiAsal && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-cow"></i>
                      Sapi Asal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">ID Sapi:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {trackingData.sapiAsal.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jenis:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {trackingData.sapiAsal.jenis}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kelamin:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {trackingData.sapiAsal.kelamin}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Usia:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {trackingData.sapiAsal.usia} tahun
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* RPH Penyembelih */}
                {trackingData.rph && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-cut"></i>
                      Informasi Penyembelihan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Nama RPH:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {trackingData.rph.nama || trackingData.rph.rphId}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sertifikat Halal:</span>
                        <span className="ml-2">
                          {trackingData.rph.sertifikatHalal ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <i className="fas fa-certificate mr-1"></i>
                              {trackingData.rph.sertifikatHalal}
                            </span>
                          ) : (
                            <span className="text-gray-500">Tidak tersedia</span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Sembelih:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDate(trackingData.rph.tanggal)}
                        </span>
                      </div>
                      {trackingData.rph.idPengecekanHalalSehat && (
                        <div>
                          <span className="text-gray-600">Status Pemeriksaan:</span>
                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Halal & Sehat Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sales History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-exchange-alt text-primary"></i>
                    Riwayat Transaksi Penjualan
                  </h4>

                  {trackingData.salesHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Belum ada riwayat transaksi penjualan
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {trackingData.salesHistory.map((item, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                  Transaksi #{index + 1}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                              </div>
                              <div className="text-sm space-y-1">
                                {item.type === 'slaughter' && (
                                  <div className="mb-2">
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                      <i className="fas fa-cut mr-1"></i>
                                      Proses Penyembelihan
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <i className="fas fa-arrow-right text-green-600 mr-2"></i>
                                  <span className="text-gray-600">Dari:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {item.fromName || item.from}
                                  </span>
                                  <span className="ml-1 text-xs text-gray-500">({item.fromEntity || item.from})</span>
                                </div>
                                <div>
                                  <i className="fas fa-arrow-left text-blue-600 mr-2"></i>
                                  <span className="text-gray-600">Ke:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {item.toName || item.to}
                                  </span>
                                  <span className="ml-1 text-xs text-gray-500">({item.toEntity || item.to})</span>
                                </div>
                                {item.details && (
                                  <div className="mt-2 p-2 bg-gray-100 rounded">
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
                                {item.quantity && (
                                  <div>
                                    <i className="fas fa-weight text-orange-600 mr-2"></i>
                                    <span className="text-gray-600">Jumlah:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {item.quantity} kg
                                    </span>
                                  </div>
                                )}
                                {item.cid && (
                                  <div className="mt-2">
                                    <i className="fas fa-fingerprint text-purple-600 mr-2"></i>
                                    <span className="text-gray-600">CID:</span>
                                    <a
                                      href={`https://ipfs.io/ipfs/${item.cid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="ml-2 text-primary hover:underline text-xs font-mono"
                                    >
                                      {truncateCid(item.cid)}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              {item.status === "verified" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Verified
                                </span>
                              )}
                              {item.status === "waiting_buyer" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  <i className="fas fa-clock mr-1"></i>
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRTracking;
