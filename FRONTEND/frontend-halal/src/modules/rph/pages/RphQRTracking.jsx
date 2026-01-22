import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import RphSidebar from "../components/RphSidebar";
import QRTracking from "../../../components/QRTracking";

const RphQRTracking = () => {
  const [mySapi, setMySapi] = useState([]);
  const [myDaging, setMyDaging] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("sapi"); // 'sapi' or 'daging'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("userData"));

      // Fetch sapi
      const sapiResponse = await fetch(`http://localhost:3000/sapi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (sapiResponse.ok) {
        const allSapi = await sapiResponse.json();
        const filtered = allSapi.filter(
          (s) => s.currentOwnerType === "RPH" && s.currentOwnerId === userData.id
        );
        setMySapi(filtered);
      }

      // Fetch daging
      const dagingResponse = await fetch(`http://localhost:3000/daging`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (dagingResponse.ok) {
        const allDaging = await dagingResponse.json();
        const filtered = allDaging.filter(
          (d) => d.currentOwnerType === "RPH" && d.currentOwnerId === userData.id
        );
        setMyDaging(filtered);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="QR Code & Tracking" role="RPH" customSidebar={<RphSidebar />}>
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setSelectedType("sapi");
              setSelectedItem(null);
            }}
            className={`py-3 px-5 text-base font-semibold border-b-2 transition ${
              selectedType === "sapi"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <i className="fas fa-cow mr-2"></i>
            Sapi
          </button>
          <button
            onClick={() => {
              setSelectedType("daging");
              setSelectedItem(null);
            }}
            className={`py-3 px-5 text-base font-semibold border-b-2 transition ${
              selectedType === "daging"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <i className="fas fa-drumstick-bite mr-2"></i>
            Daging
          </button>
        </div>

        {/* List Items */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className={`fas ${selectedType === "sapi" ? "fa-cow" : "fa-drumstick-bite"} mr-2 text-primary`}></i>
            {selectedType === "sapi" ? "Sapi di RPH Anda" : "Daging di RPH Anda"}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-2"></i>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : selectedType === "sapi" ? (
            mySapi.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Tidak ada sapi di RPH Anda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySapi.map((sapi) => (
                  <div
                    key={sapi.id}
                    onClick={() => setSelectedItem(sapi)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedItem?.id === sapi.id
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
            )
          ) : (
            myDaging.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Tidak ada daging di RPH Anda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDaging.map((daging) => (
                  <div
                    key={daging.id}
                    onClick={() => setSelectedItem(daging)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedItem?.id === daging.id
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
            )
          )}
        </div>

        {/* QR Tracking Component */}
        {selectedItem && <QRTracking type={selectedType} data={selectedItem} role="rph" />}
      </div>
    </DashboardLayout>
  );
};

export default RphQRTracking;
