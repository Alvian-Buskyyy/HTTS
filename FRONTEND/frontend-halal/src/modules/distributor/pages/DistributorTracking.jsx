import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import DistributorSidebar from "../components/DistributorSidebar";
import QRTracker from "../../../components/QRTracker";
import TrackingHistory from "../../../components/TrackingHistory";

const DistributorTracking = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [myDaging, setMyDaging] = useState([]);

  useEffect(() => {
    // Load data daging milik distributor
    const dagingData = JSON.parse(localStorage.getItem("distributorDaging") || "[]");
    setMyDaging(dagingData);
  }, []);

  const handleScan = async (scannedId) => {
    try {
      const token = localStorage.getItem("token");

      // Use QR tracking API for daging
      const response = await fetch(`http://localhost:3000/qr/daging/${scannedId}/track`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedItem(result.data.daging);
        
        const history = (result.data.history || []).map((item) => ({
          date: item.date,
          fromEntity: item.fromEntity,
          fromName: item.fromName,
          toEntity: item.toEntity,
          toName: item.toName,
          verified: item.verified,
          cid: item.cid,
          type: item.type,
        }));
        
        setTrackingHistory(history);
        return;
      }

      alert("Data tidak ditemukan!");
      setSelectedItem(null);
      setTrackingHistory([]);
    } catch (error) {
      console.error("Error scanning:", error);
      alert("Terjadi kesalahan saat memindai QR Code");
    }
  };

  return (
    <DashboardLayout title="QR Code Tracking" role="DISTRIBUTOR" customSidebar={<DistributorSidebar />}>
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
                Daging Distributor
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

export default DistributorTracking;
