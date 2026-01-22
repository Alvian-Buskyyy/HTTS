import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import HorekaSidebar from "../components/HorekaSidebar";
import QRTracker from "../../../components/QRTracker";
import TrackingHistory from "../../../components/TrackingHistory";

const HorekaTracking = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [myDaging, setMyDaging] = useState([]);

  useEffect(() => {
    // Load data daging milik horeka
    const dagingData = JSON.parse(localStorage.getItem("horekaDaging") || "[]");
    setMyDaging(dagingData);
  }, []);

  const handleScan = async (scannedId) => {
    let found = null;
    let history = [];

    // Cari daging di semua storage
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
      }));

      // Tambahkan owner saat ini
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      history.unshift({
        entityName: currentUser.name || "Horeka",
        entityType: "HOREKA",
        timestamp: found.receivedAt || new Date().toISOString(),
        transactionType: "Diterima Horeka",
        verificationStatus: "verified",
      });
    }

    if (found) {
      setSelectedItem(found);
      setTrackingHistory(history);
    } else {
      alert("Data tidak ditemukan!");
      setSelectedItem(null);
      setTrackingHistory([]);
    }
  };

  return (
    <DashboardLayout title="QR Code Tracking" role="HOREKA" customSidebar={<HorekaSidebar />}>
      <div className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Generator & Scanner */}
          <div>
            <QRTracker
              type="daging"
              data={selectedItem}
              onScan={handleScan}
            />

            {/* List items */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Daging Horeka
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {myDaging.length > 0 ? (
                  myDaging.map((item) => (
                    <button
                      key={item.dagingId || item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        handleScan(item.dagingId || item.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedItem?.dagingId === item.dagingId
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-gray-800">Daging - {item.berat} kg</p>
                      <p className="text-xs text-gray-500">ID: {(item.dagingId || item.id).substring(0, 12)}...</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-inbox text-3xl mb-2"></i>
                    <p>Tidak ada daging</p>
                  </div>
                )}
              </div>
            </div>
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

export default HorekaTracking;
