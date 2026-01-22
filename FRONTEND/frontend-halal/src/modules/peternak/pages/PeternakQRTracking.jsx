import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import PeternakSidebar from "../components/PeternakSidebar";
import QRTracking from "../../../components/QRTracking";

const PeternakQRTracking = () => {
  const [mySapi, setMySapi] = useState([]);
  const [selectedSapi, setSelectedSapi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMySapi();
  }, []);

  const fetchMySapi = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData"));

      const response = await fetch(`http://localhost:3000/sapi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allSapi = await response.json();
        // Filter sapi yang dimiliki peternak ini
        const filtered = allSapi.filter(
          (s) => s.currentOwnerType === "PETERNAK" && s.currentOwnerId === userData.id
        );
        setMySapi(filtered);
      }
    } catch (error) {
      console.error("Error fetching sapi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="QR Code & Tracking" role="Peternak" customSidebar={<PeternakSidebar />}>
      <div className="space-y-6">
        {/* List Sapi Peternak */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-cow mr-2 text-primary"></i>
            Sapi Anda
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-2"></i>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : mySapi.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Anda belum memiliki sapi</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySapi.map((sapi) => (
                <div
                  key={sapi.id}
                  onClick={() => setSelectedSapi(sapi)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedSapi?.id === sapi.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      {sapi.jenis}
                    </span>
                    <span className="text-xs text-gray-500">{sapi.kelamin}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">ID: {sapi.id}</p>
                  <p className="text-xs text-gray-600">
                    Usia: {sapi.usia} tahun | Berat: {sapi.beratSapi || "N/A"} kg
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Tracking Component */}
        {selectedSapi && <QRTracking type="sapi" data={selectedSapi} role="peternak" />}
      </div>
    </DashboardLayout>
  );
};

export default PeternakQRTracking;
