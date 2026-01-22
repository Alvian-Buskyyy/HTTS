import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRTracker = ({ type, data, onScan }) => {
  const [scanMode, setScanMode] = useState(false);
  const [scanInput, setScanInput] = useState("");

  const handleScan = () => {
    if (scanInput.trim()) {
      onScan(scanInput.trim());
      setScanInput("");
    }
  };

  const generateQRValue = () => {
    if (type === "sapi") {
      return JSON.stringify({
        type: "SAPI",
        id: data.id,
        jenis: data.jenis,
        timestamp: new Date().toISOString(),
      });
    } else if (type === "daging") {
      return JSON.stringify({
        type: "DAGING",
        id: data.id,
        sapiId: data.sapiId,
        timestamp: new Date().toISOString(),
      });
    }
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-qrcode text-primary"></i> QR Code Tracking
        </h2>
        <button
          onClick={() => setScanMode(!scanMode)}
          className={`px-4 py-2 rounded-md text-sm transition ${
            scanMode
              ? "bg-gray-200 text-gray-700"
              : "bg-primary text-white hover:bg-primaryDark"
          }`}
        >
          <i className={`fas ${scanMode ? "fa-times" : "fa-camera"} mr-2`}></i>
          {scanMode ? "Tutup Scanner" : "Scan QR Code"}
        </button>
      </div>

      {!scanMode && data && (
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <QRCodeSVG value={generateQRValue()} size={200} level="H" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {type === "sapi" ? "Scan QR Code untuk melihat riwayat sapi" : "Scan QR Code untuk melihat riwayat daging"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID: {data.id}
            </p>
          </div>
        </div>
      )}

      {scanMode && (
        <div className="space-y-4">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <i className="fas fa-camera text-blue-600 text-4xl mb-3"></i>
            <p className="text-sm text-gray-700 mb-4">
              Masukkan ID dari QR Code atau barcode untuk melacak riwayat
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleScan()}
                placeholder="Masukkan ID Sapi atau Daging"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleScan}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
              >
                <i className="fas fa-search mr-2"></i>
                Lacak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRTracker;
