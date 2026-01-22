import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EndCustomerSidebar from "../components/EndCustomerSidebar";
import QRTracker from "../../../components/QRTracker";
import TrackingHistory from "../../../components/TrackingHistory";

const EndCustomerTracking = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);

  const handleScan = async (scannedId) => {
    let found = null;
    let history = [];

    // Cari daging di semua storage (end customer hanya bisa scan, tidak memiliki stock)
    const allDaging = [
      ...JSON.parse(localStorage.getItem("rphDagingLocal") || "[]"),
      ...JSON.parse(localStorage.getItem("distributorDaging") || "[]"),
      ...JSON.parse(localStorage.getItem("horekaDaging") || "[]"),
    ];
    
    found = allDaging.find(d => d.dagingId === scannedId || d.id === scannedId);

    if (found) {
      // Ambil riwayat transaksi daging dari semua entitas
      const allTransactions = [
        ...JSON.parse(localStorage.getItem("rphTransaksiDaging") || "[]"),
        ...JSON.parse(localStorage.getItem("distributorTransactions") || "[]"),
        ...JSON.parse(localStorage.getItem("horekaTransactions") || "[]"),
      ];
      
      const dagingTransactions = allTransactions.filter(t => 
        t.dagingId === scannedId || t.itemId === scannedId
      );
      
      history = dagingTransactions.map(t => ({
        entityName: t.buyerName || "Unknown",
        entityType: t.buyerType || "Entity",
        timestamp: t.date,
        transactionType: "Penjualan Daging",
        verificationStatus: t.verificationStatus,
        cid: t.cid,
      })).reverse(); // Reverse untuk menampilkan yang terlama dulu
    }

    if (found) {
      setSelectedItem(found);
      setTrackingHistory(history);
    } else {
      alert("Data tidak ditemukan! Pastikan QR Code atau ID yang Anda masukkan benar.");
      setSelectedItem(null);
      setTrackingHistory([]);
    }
  };

  return (
    <DashboardLayout title="QR Code Tracking" role="END_CUSTOMER" customSidebar={<EndCustomerSidebar />}>
      <div className="mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-600 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Cara Menggunakan Tracking</h3>
              <p className="text-sm text-blue-800">
                Scan QR Code yang tertera pada kemasan produk daging atau masukkan ID produk secara manual 
                untuk melihat riwayat kehalalan dan perjalanan produk dari peternakan hingga ke tangan Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Scanner Only */}
          <div>
            <QRTracker
              type="daging"
              data={null} // End customer tidak generate QR, hanya scan
              onScan={handleScan}
            />

            {selectedItem && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  Produk Terverifikasi
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-certificate text-green-600 text-xl"></i>
                      <span className="font-semibold text-green-900">Status Halal</span>
                    </div>
                    <p className="text-sm text-green-800">
                      {selectedItem.statusHalal 
                        ? "✓ Produk ini telah terverifikasi halal dan memenuhi standar kehalalan."
                        : "⚠ Belum terverifikasi. Silakan hubungi penjual untuk informasi lebih lanjut."}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>ID Produk:</strong> {selectedItem.dagingId || selectedItem.id}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Berat:</strong> {selectedItem.berat} kg
                    </p>
                    {selectedItem.sapiId && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Asal Sapi:</strong> {selectedItem.sapiId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tracking History */}
          <div>
            <TrackingHistory
              type="daging"
              data={selectedItem}
              history={trackingHistory}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EndCustomerTracking;
