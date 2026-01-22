import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import JagalSidebar from "../components/JagalSidebar";
import QRTracker from "../../../components/QRTracker";
import TrackingHistory from "../../../components/TrackingHistory";

const JagalTracking = () => {
  const [activeType, setActiveType] = useState("sapi");
  const [selectedItem, setSelectedItem] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [myItems, setMyItems] = useState({ sapi: [], daging: [] });

  // Load jagal's sapi and daging
  useEffect(() => {
    const loadMyItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        let jagalId = "";

        try {
          const user = userRaw ? JSON.parse(userRaw) : null;
          jagalId = user?.entityId || user?.id || "";
        } catch (e) {
          console.error("Error parsing user data:", e);
        }

        if (!jagalId) {
          console.error("Jagal ID tidak ditemukan");
          return;
        }

        // Load sapi from jagal endpoint
        const sapiResponse = await fetch(`http://localhost:3000/sapi/jagal/${jagalId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (sapiResponse.ok) {
          const sapiResult = await sapiResponse.json();
          // Handle both array and object responses
          const sapiData = Array.isArray(sapiResult) ? sapiResult : (sapiResult.data || sapiResult || []);
          setMyItems((prev) => ({ ...prev, sapi: sapiData }));
        }

        // Load daging from jagal endpoint
        const dagingResponse = await fetch(`http://localhost:3000/daging/jagal/${jagalId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (dagingResponse.ok) {
          const dagingResult = await dagingResponse.json();
          // Handle both array and object responses
          const dagingData = Array.isArray(dagingResult) ? dagingResult : (dagingResult.data || dagingResult || []);
          setMyItems((prev) => ({ ...prev, daging: dagingData }));
        }
      } catch (error) {
        console.error("Error loading items:", error);
      }
    };

    loadMyItems();
  }, []);

  const handleScan = async (scannedId) => {
    try {
      const token = localStorage.getItem("token");

      // Try to find in sapi first
      if (activeType === "sapi") {
        const sapiItem = myItems.sapi.find(
          (s) => s.id === scannedId || s.earTagId === scannedId
        );

        if (sapiItem) {
          setSelectedItem(sapiItem);
          await buildSapiHistory(sapiItem.id, token);
          return;
        }
      }

      // Try to find in daging
      if (activeType === "daging") {
        const dagingItem = myItems.daging.find((d) => d.id === scannedId);

        if (dagingItem) {
          setSelectedItem(dagingItem);
          await buildDagingHistory(dagingItem.id, token);
          return;
        }
      }

      alert("Item tidak ditemukan. Pastikan ID sudah benar dan item ada di kepemilikan Anda.");
    } catch (error) {
      console.error("Error scanning:", error);
      alert("Terjadi kesalahan saat memindai QR Code");
    }
  };

  const buildSapiHistory = async (sapiId, token) => {
    try {
      // Use new QR tracking API
      const response = await fetch(`http://localhost:3000/qr/sapi/${sapiId}/track`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Transform API response to match TrackingHistory component format
        const history = (result.data?.history || []).map((item) => ({
          date: item.date,
          fromEntity: item.fromEntity,
          fromName: item.fromName,
          toEntity: item.toEntity,
          toName: item.toName,
          verified: item.verified,
          cid: item.cid,
        }));

        setTrackingHistory(history);
      } else {
        setTrackingHistory([]);
      }
    } catch (error) {
      console.error("Error building sapi history:", error);
      setTrackingHistory([]);
    }
  };

  const buildDagingHistory = async (dagingId, token) => {
    try {
      // Use new QR tracking API
      const response = await fetch(`http://localhost:3000/qr/daging/${dagingId}/track`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Transform API response to match TrackingHistory component format
        const history = (result.data?.history || []).map((item) => ({
          date: item.date,
          fromEntity: item.fromEntity,
          fromName: item.fromName,
          toEntity: item.toEntity,
          toName: item.toName,
          verified: item.verified,
          cid: item.cid,
          type: item.type, // 'slaughter' or 'sale'
          details: item.details
        }));

        setTrackingHistory(history);
      } else {
        setTrackingHistory([]);
      }
    } catch (error) {
      console.error("Error building daging history:", error);
      setTrackingHistory([]);
    }
  };

  const handleGenerateQR = (item) => {
    setSelectedItem(item);
    if (activeType === "sapi") {
      buildSapiHistory(item.id, localStorage.getItem("token"));
    } else {
      buildDagingHistory(item.id, localStorage.getItem("token"));
    }
  };

  return (
    <DashboardLayout title="QR Tracking" role="JAGAL" customSidebar={<JagalSidebar />}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primaryDark text-white rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-2">QR Code Tracking</h1>
          <p className="text-sm opacity-90">
            Lacak riwayat kepemilikan dan status halal sapi atau daging dengan QR Code
          </p>
        </div>

        {/* Type Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveType("sapi");
                  setSelectedItem(null);
                  setTrackingHistory([]);
                }}
                className={`${
                  activeType === "sapi"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <i className="fas fa-cow"></i>
                Tracking Sapi
              </button>
              <button
                onClick={() => {
                  setActiveType("daging");
                  setSelectedItem(null);
                  setTrackingHistory([]);
                }}
                className={`${
                  activeType === "daging"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <i className="fas fa-drumstick-bite"></i>
                Tracking Daging
              </button>
            </nav>
          </div>
        </div>

        {/* QR Scanner/Generator */}
        <QRTracker
          type={activeType}
          data={selectedItem}
          onScan={handleScan}
        />

        {/* My Items List */}
        {!selectedItem && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className={`fas ${activeType === "sapi" ? "fa-cow" : "fa-drumstick-bite"} text-primary`}></i>
              {activeType === "sapi" ? "Sapi Saya" : "Daging Saya"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myItems[activeType].length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-2"></i>
                  <p>Tidak ada {activeType} yang tersedia</p>
                </div>
              ) : (
                myItems[activeType].map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleGenerateQR(item)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {activeType === "sapi" ? item.earTagId || item.id : item.id}
                        </p>
                        {activeType === "sapi" && (
                          <>
                            <p className="text-sm text-gray-600">{item.jenis}</p>
                            <p className="text-xs text-gray-500">{item.berat} kg</p>
                          </>
                        )}
                        {activeType === "daging" && (
                          <>
                            <p className="text-sm text-gray-600">Sapi: {item.sapiId}</p>
                            <p className="text-xs text-gray-500">{item.beratKg} kg</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateQR(item);
                        }}
                        className="text-primary hover:text-primaryDark"
                      >
                        <i className="fas fa-qrcode text-xl"></i>
                      </button>
                    </div>
                    {activeType === "sapi" && item.statusKesehatan && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.statusKesehatan === "SEHAT" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.statusKesehatan}
                      </span>
                    )}
                    {activeType === "daging" && item.statusVerifikasi && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.statusVerifikasi === "VERIFIED" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.statusVerifikasi}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tracking History */}
        {selectedItem && trackingHistory.length > 0 && (
          <>
            <TrackingHistory
              type={activeType}
              data={selectedItem}
              history={trackingHistory}
            />
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setTrackingHistory([]);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Kembali ke Daftar
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JagalTracking;
