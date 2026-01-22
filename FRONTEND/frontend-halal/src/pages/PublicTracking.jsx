import React from "react";
import QRTracking from "../../../components/QRTracking";

/**
 * Halaman publik untuk tracking sapi/daging via QR Code
 * Bisa diakses tanpa login
 */
const PublicTracking = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <i className="fas fa-qrcode text-primary mr-3"></i>
            Tracking Halal & Keamanan Pangan
          </h1>
          <p className="text-lg text-gray-600">
            Lacak riwayat sapi dan daging untuk memastikan kehalalan dan keamanannya
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full p-3">
                <i className="fas fa-cow text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Tracking Sapi</h3>
                <p className="text-sm text-blue-700">
                  Lihat riwayat kepemilikan, status kesehatan, dan verifikasi halal sapi dari peternak hingga RPH
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 text-white rounded-full p-3">
                <i className="fas fa-drumstick-bite text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Tracking Daging</h3>
                <p className="text-sm text-green-700">
                  Lacak asal sapi, RPH penyembelih, sertifikat halal-sehat, dan riwayat distribusi daging
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Tracking Component */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <QRTracking type="sapi" role="public" />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            <i className="fas fa-shield-alt mr-2 text-primary"></i>
            Sistem Traceability Halal berbasis Blockchain & IPFS
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTracking;
