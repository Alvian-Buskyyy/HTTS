import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import HorekaSidebar from "../components/HorekaSidebar";
import QRTracking from "../../../components/QRTracking";

const HorekaQRTracking = () => {
  const [myDaging, setMyDaging] = useState([]);
  const [selectedDaging, setSelectedDaging] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyDaging();
  }, []);

  const fetchMyDaging = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData"));

      const response = await fetch(`http://localhost:3000/daging`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allDaging = await response.json();
        const filtered = allDaging.filter(
          (d) => d.currentOwnerType === "HOREKA" && d.currentOwnerId === userData.id
        );
        setMyDaging(filtered);
      }
    } catch (error) {
      console.error("Error fetching daging:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="QR Code & Tracking" role="Horeka" customSidebar={<HorekaSidebar />}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-drumstick-bite mr-2 text-primary"></i>
            Daging di Horeka
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-2"></i>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : myDaging.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Tidak ada daging di horeka</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDaging.map((daging) => (
                <div
                  key={daging.id}
                  onClick={() => setSelectedDaging(daging)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedDaging?.id === daging.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                      Daging
                    </span>
                    <span className="text-xs text-gray-500">{daging.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">ID: {daging.id}</p>
                  <p className="text-xs text-gray-600">Berat: {daging.berat} kg</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDaging && <QRTracking type="daging" data={selectedDaging} role="horeka" />}
      </div>
    </DashboardLayout>
  );
};

export default HorekaQRTracking;
