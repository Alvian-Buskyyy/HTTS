import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import PeternakSidebar from "../components/PeternakSidebar";
import QRTracker from "../../../components/QRTracker";
import TrackingHistory from "../../../components/TrackingHistory";

const PeternakTracking = () => {
  const [activeTab, setActiveTab] = useState("sapi");
  const [selectedItem, setSelectedItem] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [mySapi, setMySapi] = useState([]);
  const [myDaging, setMyDaging] = useState([]);

  useEffect(() => {
    // Load data sapi milik peternak dari localStorage
    const sapiData = JSON.parse(localStorage.getItem("peternakSapi") || "[]");
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
    const filteredSapi = sapiData.filter(s => s.peternakId === userId);
    setMySapi(filteredSapi);

    // Load data daging (jika ada)
    const dagingData = JSON.parse(localStorage.getItem("peternakDaging") || "[]");
    setMyDaging(dagingData);
  }, []);

  const handleScan = async (scannedId) => {
    try {
      const token = localStorage.getItem("token");

      if (activeTab === "sapi") {
        // Use QR tracking API for sapi
        const response = await fetch(`http://localhost:3000/qr/sapi/${scannedId}/track`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setSelectedItem(result.data.sapi);
          
          const history = (result.data.history || []).map((item) => ({
            date: item.date,
            fromEntity: item.fromEntity,
            fromName: item.fromName,
            toEntity: item.toEntity,
            toName: item.toName,
            verified: item.verified,
            cid: item.cid,
          }));
          
          setTrackingHistory(history);
          return;
        }
      } else {
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
    <DashboardLayout title="QR Code Tracking" role="PETERNAK" customSidebar={<PeternakSidebar />}>
      <div className="mt-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            className={`py-3 px-5 text-base font-semibold border-b-2 transition ${
              activeTab === "sapi"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => {
              setActiveTab("sapi");
              setSelectedItem(null);
              setTrackingHistory([]);
            }}
          >
            <i className="fas fa-cow mr-2"></i>
            Tracking Sapi
          </button>
          <button
            className={`py-3 px-5 text-base font-semibold border-b-2 transition ${
              activeTab === "daging"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => {
              setActiveTab("daging");
              setSelectedItem(null);
              setTrackingHistory([]);
            }}
          >
            <i className="fas fa-drumstick-bite mr-2"></i>
            Tracking Daging
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Generator & Scanner */}
          <div>
            <QRTracker
              type={activeTab}
              data={selectedItem}
              onScan={handleScan}
            />

            {/* List items */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {activeTab === "sapi" ? "Sapi Saya" : "Daging Saya"}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeTab === "sapi" && mySapi.length > 0 ? (
                  mySapi.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        handleScan(item.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedItem?.id === item.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-gray-800">{item.jenis} - {item.kelamin}</p>
                      <p className="text-xs text-gray-500">ID: {item.id.substring(0, 12)}...</p>
                    </button>
                  ))
                ) : activeTab === "daging" && myDaging.length > 0 ? (
                  myDaging.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        handleScan(item.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedItem?.id === item.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-gray-800">Daging - {item.berat} kg</p>
                      <p className="text-xs text-gray-500">ID: {item.id.substring(0, 12)}...</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-inbox text-3xl mb-2"></i>
                    <p>Tidak ada {activeTab === "sapi" ? "sapi" : "daging"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div>
            <TrackingHistory
              type={activeTab}
              data={selectedItem}
              history={trackingHistory}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PeternakTracking;
