import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";

const JagalTransaksiPenyembelihan = () => {
  const API_BASE = "http://localhost:3000";

  // State management
  const [availableSapi, setAvailableSapi] = useState([]);
  const [transaksiPenyembelihan, setTransaksiPenyembelihan] = useState([]);
  const [jagalId, setJagalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sapiId: "",
    beratDaging: "",
    idPengecekanHalalSehat: "",
    tanggalPenyembelihan: new Date().toISOString().split("T")[0],
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Get jagal ID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "JAGAL") {
      // In real implementation, you would get jagal entity ID from profile
      // For now, we'll use a placeholder
      setJagalId("jagal-id-placeholder"); // Replace with actual jagal ID
    }
  }, []);

  // Fetch available sapi and transaksi penyembelihan
  useEffect(() => {
    const fetchData = async () => {
      if (!jagalId) return;

      try {
        setLoading(true);

        // Fetch available sapi
        const sapiResponse = await fetch(`${API_BASE}/api/transaksi-penyembelihan/available-sapi/JAGAL/${jagalId}`);
        if (sapiResponse.ok) {
          const sapiData = await sapiResponse.json();
          setAvailableSapi(sapiData.data);
        }

        // Fetch transaksi penyembelihan
        const transaksiResponse = await fetch(`${API_BASE}/api/transaksi-penyembelihan/entity/JAGAL/${jagalId}`);
        if (transaksiResponse.ok) {
          const transaksiData = await transaksiResponse.json();
          setTransaksiPenyembelihan(transaksiData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jagalId]);

  const refreshData = async () => {
    if (!jagalId) return;

    try {
      // Fetch available sapi
      const sapiResponse = await fetch(`${API_BASE}/api/transaksi-penyembelihan/available-sapi/JAGAL/${jagalId}`);
      if (sapiResponse.ok) {
        const sapiData = await sapiResponse.json();
        setAvailableSapi(sapiData.data);
      }

      // Fetch transaksi penyembelihan
      const transaksiResponse = await fetch(`${API_BASE}/api/transaksi-penyembelihan/entity/JAGAL/${jagalId}`);
      if (transaksiResponse.ok) {
        const transaksiData = await transaksiResponse.json();
        setTransaksiPenyembelihan(transaksiData.data);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate berat daging vs berat sapi
    if (name === "sapiId" || name === "beratDaging") {
      const selectedSapi = availableSapi.find((s) => s.id === (name === "sapiId" ? value : formData.sapiId));
      const beratDaging = parseFloat(name === "beratDaging" ? value : formData.beratDaging);

      if (selectedSapi && selectedSapi.beratSapi && beratDaging > selectedSapi.beratSapi) {
        setFormError(`Berat daging (${beratDaging} kg) tidak boleh melebihi berat sapi (${selectedSapi.beratSapi} kg)`);
      } else {
        setFormError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const selectedSapi = availableSapi.find((s) => s.id === formData.sapiId);
      if (!selectedSapi) {
        setFormError("Pilih sapi yang akan disembelih");
        return;
      }

      if (selectedSapi.beratSapi && parseFloat(formData.beratDaging) > selectedSapi.beratSapi) {
        setFormError(`Berat daging tidak boleh melebihi berat sapi (${selectedSapi.beratSapi} kg)`);
        return;
      }

      const requestData = {
        sapiId: formData.sapiId,
        beratDaging: parseFloat(formData.beratDaging),
        penyembelihId: jagalId,
        penyembelihType: "JAGAL",
        idPengecekanHalalSehat: formData.idPengecekanHalalSehat || null,
      };

      const response = await fetch(`${API_BASE}/api/transaksi-penyembelihan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormSuccess("Penyembelihan berhasil dilakukan!");
        setFormData({
          sapiId: "",
          beratDaging: "",
          idPengecekanHalalSehat: "",
          tanggalPenyembelihan: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);

        // Refresh data
        refreshData();
      } else {
        setFormError(result.error || "Gagal melakukan penyembelihan");
      }
    } catch (error) {
      setFormError("Terjadi kesalahan saat melakukan penyembelihan");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSapi = () => {
    return availableSapi.find((s) => s.id === formData.sapiId);
  };

  return (
    <DashboardLayout title="Transaksi Penyembelihan">
      <div className="space-y-6 bg-red-400">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi Penyembelihan</h1>
            <p className="text-gray-600">Kelola proses penyembelihan sapi menjadi daging</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <i className="fas fa-plus"></i>
            Sembelih Sapi
          </button>
        </div>

        {/* Success Message */}
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <i className="fas fa-check-circle mr-2"></i>
            {formSuccess}
          </div>
        )}

        {/* Form Penyembelihan */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Form Penyembelihan Sapi</h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pilih Sapi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Sapi *</label>
                  <select name="sapiId" value={formData.sapiId} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Pilih Sapi</option>
                    {availableSapi.map((sapi) => (
                      <option key={sapi.id} value={sapi.id}>
                        ID: {sapi.id.substring(0, 8)}... | {sapi.jenis} | {sapi.kelamin} |{sapi.beratSapi ? ` ${sapi.beratSapi} kg` : " Berat tidak diketahui"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Berat Daging */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Berat Daging (kg) *{getSelectedSapi()?.beratSapi && <span className="text-gray-500 text-xs ml-2">(Max: {getSelectedSapi().beratSapi} kg)</span>}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={getSelectedSapi()?.beratSapi || undefined}
                    name="beratDaging"
                    value={formData.beratDaging}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan berat daging"
                  />
                </div>

                {/* Tanggal Penyembelihan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penyembelihan</label>
                  <input
                    type="date"
                    name="tanggalPenyembelihan"
                    value={formData.tanggalPenyembelihan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* ID Pengecekan Halal Sehat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Pengecekan Halal Sehat (Opsional)</label>
                  <input
                    type="text"
                    name="idPengecekanHalalSehat"
                    value={formData.idPengecekanHalalSehat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan ID pengecekan halal sehat"
                  />
                </div>
              </div>

              {/* Informasi Sapi Terpilih */}
              {getSelectedSapi() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Informasi Sapi Terpilih:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <strong>Jenis:</strong> {getSelectedSapi().jenis}
                    </div>
                    <div>
                      <strong>Kelamin:</strong> {getSelectedSapi().kelamin}
                    </div>
                    <div>
                      <strong>Usia:</strong> {getSelectedSapi().usia} tahun
                    </div>
                    <div>
                      <strong>Berat:</strong> {getSelectedSapi().beratSapi || "Tidak diketahui"} kg
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading || !!formError} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cut"></i>
                      Lakukan Penyembelihan
                    </>
                  )}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Riwayat Penyembelihan */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Riwayat Penyembelihan</h2>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : transaksiPenyembelihan.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-cut text-4xl text-gray-300"></i>
              <p className="text-gray-500 mt-2">Belum ada riwayat penyembelihan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sapi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Sapi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat Daging</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transaksiPenyembelihan.map((transaksi) => (
                    <tr key={transaksi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(transaksi.timestamp).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{transaksi.sapiId.substring(0, 8)}...</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaksi.sapi ? (
                          <div>
                            <div>
                              {transaksi.sapi.jenis} - {transaksi.sapi.kelamin}
                            </div>
                            <div className="text-xs text-gray-500">{transaksi.sapi.beratSapi ? `${transaksi.sapi.beratSapi} kg` : "Berat tidak diketahui"}</div>
                          </div>
                        ) : (
                          "Data sapi tidak tersedia"
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{transaksi.daging ? `${transaksi.daging.berat} kg` : "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <i className="fas fa-check-circle mr-1"></i>
                          Selesai
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="font-mono text-xs">{transaksi.cid ? transaksi.cid.substring(0, 10) + "..." : "N/A"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-cow text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sapi Tersedia</p>
                <p className="text-2xl font-semibold text-gray-900">{availableSapi.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <i className="fas fa-cut text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Penyembelihan</p>
                <p className="text-2xl font-semibold text-gray-900">{transaksiPenyembelihan.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-drumstick-bite text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Daging</p>
                <p className="text-2xl font-semibold text-gray-900">{transaksiPenyembelihan.reduce((total, t) => total + (t.daging?.berat || 0), 0).toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JagalTransaksiPenyembelihan;
