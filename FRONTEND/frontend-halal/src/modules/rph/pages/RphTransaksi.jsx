import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import RphSidebar from "../components/RphSidebar";

// RPH Transaksi: menu bar sama dengan JagalTransaksi (sales, slaughter, verification, history)
const RphTransaksi = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const handleTabChange = (tab) => setActiveTab(tab);

  // Sales states
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ buyerId: "", buyerName: "", buyerType: "", sapiId: "", qty: 1, date: "", notes: "" });
  const [cattle, setCattle] = useState([]);
  // Daging transfer states
  const [dagingList, setDagingList] = useState([]);
  const [dagingTx, setDagingTx] = useState([]);
  const [dagingForm, setDagingForm] = useState({ dagingId: "", qty: 1, buyerId: "", buyerName: "", buyerType: "", date: "", notes: "" });
  const [dagingSuccess, setDagingSuccess] = useState(false);
  // Daging verification modal states
  const [showVerifyDagingModal, setShowVerifyDagingModal] = useState(false);
  const [verifyingDaging, setVerifyingDaging] = useState(null);
  const [verifyDagingInputCode, setVerifyDagingInputCode] = useState("");
  const [verifyDagingError, setVerifyDagingError] = useState("");
  const [verifyDagingSuccess, setVerifyDagingSuccess] = useState("");
  // Transfer states
  const [newTransfer, setNewTransfer] = useState({ cattleId: "", recipient: "", date: "", notes: "" });
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Dynamic entity options for recipients/buyers
  const [entityOptions, setEntityOptions] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState("");

  useEffect(() => {
    const API_BASE = "http://localhost:3000";
    const fetchAllEntities = async () => {
      try {
        setEntitiesLoading(true);
        setEntitiesError("");
        const endpoints = [
          { url: `${API_BASE}/peternak`, type: "PETERNAK", nameKey: "nama" },
          { url: `${API_BASE}/pasarHewan`, type: "PASAR_HEWAN", nameKey: "nama" },
          { url: `${API_BASE}/jagal`, type: "JAGAL", nameKey: "nama" },
          { url: `${API_BASE}/rph`, type: "RPH", nameKey: "nama" },
          { url: `${API_BASE}/distributor`, type: "DISTRIBUTOR", nameKey: "namaUsaha" },
          { url: `${API_BASE}/horeka`, type: "HOREKA", nameKey: "nama" },
        ];
        const results = await Promise.allSettled(
          endpoints.map(async (ep) => {
            const res = await fetch(ep.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data.map((item) => ({ id: item.id, name: item[ep.nameKey] || item.nama || item.namaUsaha || "—", type: ep.type }));
          })
        );
        const combined = results
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value)
          .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        setEntityOptions(combined);
      } catch (e) {
        setEntitiesError("Gagal memuat entitas");
      } finally {
        setEntitiesLoading(false);
      }
    };
    fetchAllEntities();
  }, []);

  // Slaughter states
  const [slaughters, setSlaughters] = useState([]);
  const [slaughterSuccess, setSlaughterSuccess] = useState(false);
  const [slaughterForm, setSlaughterForm] = useState({
    sapiId: "",
    beratDaging: "",
    idPengecekanHalalSehat: "",
  });
  const [selectedSlaughter, setSelectedSlaughter] = useState(null);
  const [showSlaughterDetail, setShowSlaughterDetail] = useState(false);
  const [availableSapiForSlaughter, setAvailableSapiForSlaughter] = useState([]);
  const [rphId, setRphId] = useState("");
  const [slaughterLoading, setSlaughterLoading] = useState(false);
  const [slaughterError, setSlaughterError] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("cattleList") || "[]");
      setCattle(raw.map((c) => ({ id: c.id, jenis: c.jenis === "other" ? c.customJenis : c.jenis })));
    } catch {
      setCattle([]);
    }
    try {
      setDagingList(JSON.parse(localStorage.getItem("rphDagingLocal") || "[]"));
    } catch {
      setDagingList([]);
    }
    try {
      setDagingTx(JSON.parse(localStorage.getItem("rphTransaksiDaging") || "[]"));
    } catch {
      setDagingTx([]);
    }

    // Get RPH ID from user data
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "RPH") {
      // In real implementation, you would get RPH entity ID from profile
      setRphId("rph-id-placeholder"); // Replace with actual RPH ID
    }
  }, []);

  // Fetch available sapi and slaughter history when RPH ID is available
  useEffect(() => {
    if (rphId) {
      fetchAvailableSapiForSlaughter();
      fetchSlaughterHistory();
    }
  }, [rphId]);

  const fetchAvailableSapiForSlaughter = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/transaksi-penyembelihan/available-sapi/RPH/${rphId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSapiForSlaughter(data.data);
      } else {
        console.error("Failed to fetch available sapi for slaughter");
      }
    } catch (error) {
      console.error("Error fetching available sapi for slaughter:", error);
    }
  }, [rphId]);

  const fetchSlaughterHistory = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/transaksi-penyembelihan/entity/RPH/${rphId}`);
      if (response.ok) {
        const data = await response.json();
        setSlaughters(data.data);
      } else {
        console.error("Failed to fetch slaughter history");
      }
    } catch (error) {
      console.error("Error fetching slaughter history:", error);
    }
  }, [rphId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTransactions((prev) => [
      {
        id: "TX-" + Date.now(),
        date: form.date || new Date().toISOString().split("T")[0],
        buyerId: form.buyerId,
        buyerName: form.buyerName,
        buyerType: form.buyerType,
        cattleId: form.sapiId,
        quantity: Number(form.qty) || 1,
        status: "pending",
        verificationStatus: "waiting_buyer",
        notes: form.notes,
      },
      ...prev,
    ]);
    setShowForm(false);
    setForm({ buyerId: "", buyerName: "", buyerType: "", sapiId: "", qty: 1, date: "", notes: "" });
  };
  const handleNewTransferSubmit = (e) => {
    e.preventDefault();
    if (!newTransfer.cattleId || !newTransfer.recipient) return;
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 2000);
    setNewTransfer({ cattleId: "", recipient: "", date: "", notes: "" });
  };

  const list = transactions.filter((t) => (filter === "all" ? true : t.status === filter));
  const truncateCid = (cid, left = 8, right = 8) => {
    if (!cid) return "";
    return cid.length > left + right ? `${cid.slice(0, left)}...${cid.slice(-right)}` : cid;
  };
  const formatDate = (d) => new Date(d).toLocaleDateString("id-ID");
  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu</span>;
      case "verified":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case "completed":
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Selesai</span>;
      case "cancelled":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Dibatalkan</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };
  const getVerificationBadge = (status) => {
    switch (status) {
      case "waiting_buyer":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu Pembeli</span>;
      case "verified":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case "rejected":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };
  const handleDagingSubmit = (e) => {
    e.preventDefault();
    if (!dagingForm.dagingId) return;
    const payload = {
      id: "TD-" + Date.now(),
      dagingId: dagingForm.dagingId,
      qty: Number(dagingForm.qty) || 1,
      buyerId: dagingForm.buyerId || undefined,
      buyerName: dagingForm.buyerName,
      buyerType: dagingForm.buyerType,
      date: dagingForm.date || new Date().toISOString().split("T")[0],
      notes: dagingForm.notes,
      status: "pending",
      verificationStatus: "waiting_buyer",
    };
    const updated = [payload, ...dagingTx];
    setDagingTx(updated);
    localStorage.setItem("rphTransaksiDaging", JSON.stringify(updated));
    setDagingSuccess(true);
    setTimeout(() => setDagingSuccess(false), 1600);
    setDagingForm({ dagingId: "", qty: 1, buyerName: "", buyerType: "", date: "", notes: "" });
  };
  const handleRequestDagingVerification = (id) => {
    const tx = dagingTx.find((t) => t.id === id);
    if (!tx) return;
    setVerifyingDaging(tx);
    setVerifyDagingInputCode("");
    setVerifyDagingError("");
    setVerifyDagingSuccess("");
    if (!tx.verify || !tx.verify.code) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const updated = dagingTx.map((t) =>
        t.id === id
          ? {
              ...t,
              verify: { sellerSigned: true, buyerSigned: false, code },
              verificationStatus: "waiting_buyer",
            }
          : t
      );
      setDagingTx(updated);
      localStorage.setItem("rphTransaksiDaging", JSON.stringify(updated));
      setVerifyingDaging({ ...tx, verify: { sellerSigned: true, buyerSigned: false, code }, verificationStatus: "waiting_buyer" });
    }
    setShowVerifyDagingModal(true);
  };
  const handleCopyDagingCode = async () => {
    if (!verifyingDaging?.verify?.code) return;
    try {
      await navigator.clipboard.writeText(verifyingDaging.verify.code);
      setVerifyDagingSuccess("Kode disalin");
      setTimeout(() => setVerifyDagingSuccess(""), 1200);
    } catch {
      setVerifyDagingError("Gagal menyalin");
      setTimeout(() => setVerifyDagingError(""), 1500);
    }
  };
  const handleConfirmDaging = () => {
    if (!verifyingDaging) return;
    const expected = verifyingDaging.verify?.code || "";
    if (verifyDagingInputCode.trim() !== expected) {
      setVerifyDagingError("Kode tidak cocok");
      return;
    }
    const updated = dagingTx.map((t) =>
      t.id === verifyingDaging.id
        ? {
            ...t,
            verificationStatus: "verified",
            status: "verified",
            verify: { ...(t.verify || {}), buyerSigned: true },
            blockchainHash: t.blockchainHash || "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 10),
          }
        : t
    );
    setDagingTx(updated);
    localStorage.setItem("rphTransaksiDaging", JSON.stringify(updated));
    setVerifyDagingSuccess("Terverifikasi");
    setVerifyDagingError("");
    setTimeout(() => {
      setShowVerifyDagingModal(false);
      setVerifyingDaging(null);
      setVerifyDagingInputCode("");
      setVerifyDagingSuccess("");
    }, 900);
  };
  const handleRejectDaging = () => {
    if (!verifyingDaging) return;
    if (!window.confirm("Tolak verifikasi transaksi daging ini?")) return;
    const updated = dagingTx.map((t) => (t.id === verifyingDaging.id ? { ...t, verificationStatus: "rejected" } : t));
    setDagingTx(updated);
    localStorage.setItem("rphTransaksiDaging", JSON.stringify(updated));
    setShowVerifyDagingModal(false);
    setVerifyingDaging(null);
    setVerifyDagingInputCode("");
    setVerifyDagingSuccess("");
    setVerifyDagingError("");
  };
  // Verification modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingTx, setVerifyingTx] = useState(null);
  const [verifyInputCode, setVerifyInputCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");

  const handleRequestVerification = (transactionId) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;
    setVerifyingTx(tx);
    setVerifyInputCode("");
    setVerifyError("");
    setVerifySuccess("");
    if (!tx.verify || !tx.verify.code) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const updated = transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              verify: { sellerSigned: true, buyerSigned: false, code },
              verificationStatus: "waiting_buyer",
            }
          : t
      );
      setTransactions(updated);
      setVerifyingTx({ ...tx, verify: { sellerSigned: true, buyerSigned: false, code } });
    }
    setShowVerifyModal(true);
  };
  const handleCopyCode = async () => {
    if (!verifyingTx?.verify?.code) return;
    try {
      await navigator.clipboard.writeText(verifyingTx.verify.code);
      setVerifySuccess("Kode disalin");
      setTimeout(() => setVerifySuccess(""), 1200);
    } catch {
      setVerifyError("Gagal menyalin");
      setTimeout(() => setVerifyError(""), 1500);
    }
  };
  const handleConfirmBuyer = () => {
    if (!verifyingTx) return;
    const expected = verifyingTx.verify?.code || "";
    if (verifyInputCode.trim() !== expected) {
      setVerifyError("Kode tidak cocok");
      return;
    }
    const updated = transactions.map((t) =>
      t.id === verifyingTx.id
        ? {
            ...t,
            verificationStatus: "verified",
            status: "verified",
            verify: { ...(t.verify || {}), buyerSigned: true },
            blockchainHash: t.blockchainHash || "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 10),
          }
        : t
    );
    setTransactions(updated);
    setVerifySuccess("Terverifikasi");
    setVerifyError("");
    setTimeout(() => {
      setShowVerifyModal(false);
      setVerifyingTx(null);
      setVerifyInputCode("");
      setVerifySuccess("");
    }, 900);
  };
  const handleRejectVerification = () => {
    if (!verifyingTx) return;
    if (!window.confirm("Tolak verifikasi transaksi ini?")) return;
    const updated = transactions.map((t) => (t.id === verifyingTx.id ? { ...t, verificationStatus: "rejected" } : t));
    setTransactions(updated);
    setShowVerifyModal(false);
    setVerifyingTx(null);
    setVerifyInputCode("");
    setVerifySuccess("");
    setVerifyError("");
  };
  const handleSlaughterSubmit = async (e) => {
    e.preventDefault();
    setSlaughterLoading(true);
    setSlaughterError("");
    setSlaughterSuccess(false);

    // Validate minimal fields
    if (!slaughterForm.sapiId || !slaughterForm.beratDaging) {
      setSlaughterError("Mohon isi Sapi dan Berat Daging.");
      setSlaughterLoading(false);
      return;
    }

    // Check if berat daging doesn't exceed berat sapi
    const selectedSapi = availableSapiForSlaughter.find((s) => s.id === slaughterForm.sapiId);
    if (selectedSapi && selectedSapi.beratSapi && parseFloat(slaughterForm.beratDaging) > selectedSapi.beratSapi) {
      setSlaughterError(`Berat daging (${slaughterForm.beratDaging} kg) tidak boleh melebihi berat sapi (${selectedSapi.beratSapi} kg)`);
      setSlaughterLoading(false);
      return;
    }

    try {
      const requestData = {
        sapiId: slaughterForm.sapiId,
        beratDaging: parseFloat(slaughterForm.beratDaging),
        penyembelihId: rphId,
        penyembelihType: "RPH",
        idPengecekanHalalSehat: slaughterForm.idPengecekanHalalSehat || null,
      };

      const response = await fetch("http://localhost:3000/api/transaksi-penyembelihan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        setSlaughterSuccess(true);
        setSlaughterForm({ sapiId: "", beratDaging: "", idPengecekanHalalSehat: "" });

        // Refresh data
        fetchAvailableSapiForSlaughter();
        fetchSlaughterHistory();

        setTimeout(() => setSlaughterSuccess(false), 3000);
      } else {
        setSlaughterError(result.error || "Gagal melakukan penyembelihan");
      }
    } catch (error) {
      setSlaughterError("Terjadi kesalahan saat melakukan penyembelihan");
      console.error("Error:", error);
    } finally {
      setSlaughterLoading(false);
    }
  };

  const getSelectedSapiForSlaughter = () => {
    return availableSapiForSlaughter.find((s) => s.id === slaughterForm.sapiId);
  };

  const handleSlaughterInputChange = (e) => {
    const { name, value } = e.target;
    setSlaughterForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate berat daging vs berat sapi
    if (name === "sapiId" || name === "beratDaging") {
      const selectedSapi = availableSapiForSlaughter.find((s) => s.id === (name === "sapiId" ? value : slaughterForm.sapiId));
      const beratDaging = parseFloat(name === "beratDaging" ? value : slaughterForm.beratDaging);

      if (selectedSapi && selectedSapi.beratSapi && beratDaging > selectedSapi.beratSapi) {
        setSlaughterError(`Berat daging (${beratDaging} kg) tidak boleh melebihi berat sapi (${selectedSapi.beratSapi} kg)`);
      } else {
        setSlaughterError("");
      }
    }
  };

  const openDetail = (tx) => {
    setSelectedTx(tx);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout title="Transaksi Penjualan" role="RPH" customSidebar={<RphSidebar />}>
      <div className="mt-4 min-h-[70vh] overflow-y-auto pr-1">
        <div className="flex border-b border-gray-200 mb-8 gap-2">
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "sales" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("sales")}
          >
            Transaksi Penjualan
          </button>
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "slaughter" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("slaughter")}
          >
            Transaksi Penyembelihan
          </button>
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "verification" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("verification")}
          >
            Verifikasi Transaksi
          </button>
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("history")}
          >
            Riwayat Transaksi
          </button>
        </div>

        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-truck text-primary"></i> Transfer Sapi
                </h2>
                <p className="text-sm text-gray-500">Ajukan pemindahan sapi ke entitas tujuan.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {transferSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                    <i className="fas fa-check-circle mr-1"></i> Transfer berhasil diajukan.
                  </div>
                )}
                <form onSubmit={handleNewTransferSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Sapi</label>
                      <select
                        value={newTransfer.cattleId}
                        onChange={(e) => setNewTransfer({ ...newTransfer, cattleId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Pilih ID Sapi</option>
                        {cattle.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id} - {c.jenis}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan</label>
                      <select
                        value={newTransfer.recipient}
                        onChange={(e) => setNewTransfer({ ...newTransfer, recipient: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Pilih Tujuan</option>
                        {entityOptions.map((ent) => (
                          <option key={`${ent.type}-${ent.id}`} value={`${ent.type}:${ent.id}`}>
                            {ent.type} - {ent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transfer</label>
                      <input
                        type="date"
                        value={newTransfer.date}
                        onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                      <textarea
                        rows="2"
                        value={newTransfer.notes}
                        onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Opsional"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                      Ajukan Transfer
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-drumstick-bite text-primary"></i> Transfer Daging
                </h2>
                <p className="text-sm text-gray-500">Catat pemindahan/penjualan daging.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {dagingSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                    <i className="fas fa-check-circle mr-1"></i> Transaksi daging disimpan.
                  </div>
                )}
                <form onSubmit={handleDagingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Daging</label>
                      <select
                        value={dagingForm.dagingId}
                        onChange={(e) => setDagingForm((prev) => ({ ...prev, dagingId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Pilih daging</option>
                        {dagingList.map((d) => (
                          <option key={d.dagingId} value={d.dagingId}>
                            {d.dagingId} - {d.sapiId} ({d.berat} kg)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                      <input type="number" min="1" value={dagingForm.qty} onChange={(e) => setDagingForm((prev) => ({ ...prev, qty: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
                      <select
                        value={dagingForm.buyerId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "LAINNYA") {
                            setDagingForm((prev) => ({ ...prev, buyerId: "", buyerType: "LAINNYA", buyerName: "" }));
                          } else {
                            const [type, id] = val.split(":");
                            const ent = entityOptions.find((o) => `${o.type}:${o.id}` === val);
                            setDagingForm((prev) => ({ ...prev, buyerId: id, buyerType: type, buyerName: ent?.name || "" }));
                          }
                        }}
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="">Pilih pembeli</option>
                        {entityOptions.map((ent) => (
                          <option key={`${ent.type}-${ent.id}`} value={`${ent.type}:${ent.id}`}>
                            {ent.type} - {ent.name}
                          </option>
                        ))}
                        <option value="LAINNYA">Lainnya</option>
                      </select>
                    </div>
                    {dagingForm.buyerType === "LAINNYA" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli (Lainnya)</label>
                        <input value={dagingForm.buyerName} onChange={(e) => setDagingForm((prev) => ({ ...prev, buyerName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="Masukkan nama pembeli" />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                      <textarea
                        rows="2"
                        value={dagingForm.notes}
                        onChange={(e) => setDagingForm((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Opsional"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Transaksi Penjualan</h1>
              <div className="flex items-center gap-2">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="all">Semua</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Terverifikasi</option>
                </select>
                <button onClick={() => setShowForm(true)} className="px-3 py-2 bg-primary text-white rounded text-sm">
                  <i className="fas fa-plus mr-2"></i>Transaksi Baru
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <i className="fas fa-cow text-primary"></i> Sapi
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Tanggal</th>
                        <th className="px-4 py-2">CID</th>
                        <th className="px-4 py-2">Pembeli</th>
                        <th className="px-4 py-2">Sapi</th>
                        <th className="px-4 py-2">Qty</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {list.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-primary">{t.id}</td>
                          <td className="px-4 py-2">{formatDate(t.date)}</td>
                          <td className="px-4 py-2">
                            {t.cid ? (
                              <a href={`https://ipfs.io/ipfs/${t.cid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title={t.cid}>
                                {truncateCid(t.cid, 8, 8)}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{t.buyerName || t.buyerId}</td>
                          <td className="px-4 py-2">{t.cattleId}</td>
                          <td className="px-4 py-2">{t.quantity}</td>
                          <td className="px-4 py-2">{getTransactionStatusBadge(t.status)}</td>
                          <td className="px-4 py-2">
                            <button className="text-primary text-xs hover:underline" onClick={() => openDetail(t)}>
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                      {list.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-gray-500">
                            Belum ada transaksi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="my-6 border-t border-gray-200"></div>

                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <i className="fas fa-drumstick-bite text-primary"></i> Daging
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">CID</th>
                        <th className="px-4 py-2">Daging</th>
                        <th className="px-4 py-2">Qty</th>
                        <th className="px-4 py-2">Pembeli</th>
                        <th className="px-4 py-2">Tanggal</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dagingTx.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-primary">{t.id}</td>
                          <td className="px-4 py-2">
                            {t.cid ? (
                              <a href={`https://ipfs.io/ipfs/${t.cid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title={t.cid}>
                                {truncateCid(t.cid, 8, 8)}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{t.dagingId}</td>
                          <td className="px-4 py-2">{t.qty}</td>
                          <td className="px-4 py-2">{t.buyerName || "-"}</td>
                          <td className="px-4 py-2">{t.date}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">{t.status}</span>
                          </td>
                        </tr>
                      ))}
                      {dagingTx.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-gray-500">
                            Belum ada transaksi daging.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={() => setShowForm(false)}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Buat Transaksi</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Pembeli</label>
                        <input value={form.buyerName} onChange={(e) => setForm((prev) => ({ ...prev, buyerName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" placeholder="Nama pembeli" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Tipe Pembeli</label>
                        <select value={form.buyerType} onChange={(e) => setForm((prev) => ({ ...prev, buyerType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                          <option value="">Pilih tipe</option>
                          <option value="DISTRIBUTOR">Distributor</option>
                          <option value="HOREKA">HOREKA</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Sapi</label>
                        <select value={form.sapiId} onChange={(e) => setForm((prev) => ({ ...prev, sapiId: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                          <option value="">Pilih sapi</option>
                          {cattle.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.id} - {c.jenis}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Jumlah</label>
                        <input type="number" min="1" value={form.qty} onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-600">Catatan</label>
                        <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" rows={3} placeholder="Catatan tambahan" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">
                        Batal
                      </button>
                      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "verification" && (
          <div className="bg-white rounded-lg shadow p-6 space-y-8">
            <h2 className="text-lg font-semibold text-gray-800">Verifikasi Transaksi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{transactions.filter((t) => t.verificationStatus === "waiting_buyer").length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Terverifikasi</p>
                <p className="text-2xl font-semibold text-green-600">{transactions.filter((t) => t.verificationStatus === "verified").length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-red-600">{transactions.filter((t) => t.verificationStatus === "rejected").length}</p>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-800">Verifikasi Transaksi Penjualan Sapi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{t.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(t.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(t.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {t.verificationStatus === "waiting_buyer" && (
                            <>
                              <button className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10" onClick={() => handleRequestVerification(t.id)}>
                                Verifikasi Bersama
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => {
                                  setVerifyingTx(t);
                                  setShowVerifyModal(true);
                                }}
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="my-4 border-t border-gray-200"></div>
            <h3 className="text-base font-semibold text-gray-800">Verifikasi Transaksi Penjualan Daging</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dagingTx.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{t.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(t.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.buyerName || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.dagingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(t.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {(t.verificationStatus === "waiting_buyer" || !t.verificationStatus) && (
                            <>
                              <button className="px-3 py-1 rounded text-xs border border-primary text-primary bg-white hover:bg-primary/10" onClick={() => handleRequestDagingVerification(t.id)}>
                                Verifikasi Bersama
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => {
                                  setVerifyingDaging(t);
                                  setShowVerifyDagingModal(true);
                                }}
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={() => setShowVerifyModal(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Verifikasi Transaksi</h3>
                <button onClick={() => setShowVerifyModal(false)} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {verifyingTx && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border rounded">
                    <div className="text-xs text-gray-500">Kode Verifikasi</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-mono tracking-widest">{verifyingTx.verify?.code || "-"}</div>
                      <button type="button" onClick={handleCopyCode} className="text-xs px-2 py-1 border rounded hover:bg-gray-100">
                        <i className="fas fa-copy mr-1"></i>Salin
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Masukkan Kode dari Pembeli</label>
                    <input value={verifyInputCode} onChange={(e) => setVerifyInputCode(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="6 digit" />
                  </div>
                  {verifyError && <div className="text-xs text-red-600">{verifyError}</div>}
                  {verifySuccess && <div className="text-xs text-green-600">{verifySuccess}</div>}
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={handleRejectVerification} className="px-3 py-2 border rounded text-sm text-red-600 border-red-300 hover:bg-red-50">
                      Tolak
                    </button>
                    <button onClick={handleConfirmBuyer} className="px-3 py-2 bg-primary text-white rounded text-sm">
                      Konfirmasi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showDetailModal && selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">ID Transaksi</div>
                  <div className="col-span-2 font-medium">{selectedTx.id}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Tanggal</div>
                  <div className="col-span-2">{formatDate(selectedTx.date)}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Pembeli</div>
                  <div className="col-span-2">{selectedTx.buyerName || selectedTx.buyerId || "-"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Sapi</div>
                  <div className="col-span-2">{selectedTx.cattleId}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Jumlah</div>
                  <div className="col-span-2">{selectedTx.quantity}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">CID</div>
                  <div className="col-span-2">
                    {selectedTx.cid ? (
                      <a href={`https://ipfs.io/ipfs/${selectedTx.cid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title={selectedTx.cid}>
                        {truncateCid(selectedTx.cid, 10, 10)}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
                {selectedTx.blockchainHash && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-gray-500">Blockchain</div>
                    <div className="col-span-2 font-mono text-xs" title={selectedTx.blockchainHash}>
                      {truncateCid(selectedTx.blockchainHash, 10, 10)}
                    </div>
                  </div>
                )}
                {selectedTx.notes && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-gray-500">Catatan</div>
                    <div className="col-span-2">{selectedTx.notes}</div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Status</div>
                  <div className="col-span-2">{getTransactionStatusBadge(selectedTx.status)}</div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {showVerifyDagingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={() => setShowVerifyDagingModal(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Verifikasi Transaksi Daging</h3>
                <button onClick={() => setShowVerifyDagingModal(false)} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {verifyingDaging && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border rounded">
                    <div className="text-xs text-gray-500">Kode Verifikasi</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-mono tracking-widest">{verifyingDaging.verify?.code || "-"}</div>
                      <button type="button" onClick={handleCopyDagingCode} className="text-xs px-2 py-1 border rounded hover:bg-gray-100">
                        <i className="fas fa-copy mr-1"></i>Salin
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Masukkan Kode dari Pembeli</label>
                    <input value={verifyDagingInputCode} onChange={(e) => setVerifyDagingInputCode(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="6 digit" />
                  </div>
                  {verifyDagingError && <div className="text-xs text-red-600">{verifyDagingError}</div>}
                  {verifyDagingSuccess && <div className="text-xs text-green-600">{verifyDagingSuccess}</div>}
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={handleRejectDaging} className="px-3 py-2 border rounded text-sm text-red-600 border-red-300 hover:bg-red-50">
                      Tolak
                    </button>
                    <button onClick={handleConfirmDaging} className="px-3 py-2 bg-primary text-white rounded text-sm">
                      Konfirmasi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter((t) => t.status === "completed" || t.status === "cancelled")
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{t.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(t.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.buyerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{t.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getTransactionStatusBadge(t.status)}</td>
                      </tr>
                    ))}
                  {transactions.filter((t) => t.status === "completed" || t.status === "cancelled").length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                        Belum ada riwayat transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "slaughter" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-cut text-primary"></i> Transaksi Penyembelihan
              </h2>
              <p className="text-sm text-gray-500">Catat proses penyembelihan sapi pada RPH.</p>
            </div>

            {slaughterSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                <i className="fas fa-check-circle mr-1"></i> Penyembelihan berhasil dilakukan!
              </div>
            )}

            {slaughterError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                <i className="fas fa-exclamation-triangle mr-1"></i> {slaughterError}
              </div>
            )}

            <form onSubmit={handleSlaughterSubmit} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sapi *</label>
                  <select name="sapiId" value={slaughterForm.sapiId} onChange={handleSlaughterInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                    <option value="">Pilih Sapi</option>
                    {availableSapiForSlaughter.map((sapi) => (
                      <option key={sapi.id} value={sapi.id}>
                        ID: {sapi.id.substring(0, 8)}... | {sapi.jenis} | {sapi.kelamin} |{sapi.beratSapi ? ` ${sapi.beratSapi} kg` : " Berat tidak diketahui"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Berat Daging (kg) *{getSelectedSapiForSlaughter()?.beratSapi && <span className="text-gray-500 text-xs ml-2">(Max: {getSelectedSapiForSlaughter().beratSapi} kg)</span>}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={getSelectedSapiForSlaughter()?.beratSapi || undefined}
                    name="beratDaging"
                    value={slaughterForm.beratDaging}
                    onChange={handleSlaughterInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan berat daging"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Pengecekan Halal-Sehat (Opsional)</label>
                  <input
                    type="text"
                    name="idPengecekanHalalSehat"
                    value={slaughterForm.idPengecekanHalalSehat}
                    onChange={handleSlaughterInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Contoh: IHS-001"
                  />
                </div>
              </div>

              {/* Informasi Sapi Terpilih */}
              {getSelectedSapiForSlaughter() && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Informasi Sapi Terpilih:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <strong>Jenis:</strong> {getSelectedSapiForSlaughter().jenis}
                    </div>
                    <div>
                      <strong>Kelamin:</strong> {getSelectedSapiForSlaughter().kelamin}
                    </div>
                    <div>
                      <strong>Usia:</strong> {getSelectedSapiForSlaughter().usia} tahun
                    </div>
                    <div>
                      <strong>Berat:</strong> {getSelectedSapiForSlaughter().beratSapi || "Tidak diketahui"} kg
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button type="submit" disabled={slaughterLoading || !!slaughterError} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition text-sm flex items-center gap-2">
                  {slaughterLoading ? (
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
              </div>
            </form>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border rounded-lg p-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <i className="fas fa-cow text-xl"></i>
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-sm font-medium text-gray-600">Sapi Tersedia</p>
                    <p className="text-2xl font-semibold text-gray-900">{availableSapiForSlaughter.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <i className="fas fa-cut text-xl"></i>
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-sm font-medium text-gray-600">Total Penyembelihan</p>
                    <p className="text-2xl font-semibold text-gray-900">{slaughters.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <i className="fas fa-drumstick-bite text-xl"></i>
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-sm font-medium text-gray-600">Total Daging</p>
                    <p className="text-2xl font-semibold text-gray-900">{slaughters.reduce((total, s) => total + (s.daging?.berat || 0), 0).toFixed(1)} kg</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Penyembelihan</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat Daging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slaughters.length === 0 ? (
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center" colSpan={7}>
                        {slaughterLoading ? (
                          <div className="flex items-center justify-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Memuat data...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-8">
                            <i className="fas fa-cut text-4xl text-gray-300 mb-2"></i>
                            <p>Belum ada riwayat penyembelihan</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    slaughters.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{new Date(item.timestamp).toLocaleDateString("id-ID")}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.sapiId ? item.sapiId.substring(0, 8) + "..." : "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {item.sapi ? (
                            <div>
                              <div>
                                {item.sapi.jenis} - {item.sapi.kelamin}
                              </div>
                              <div className="text-xs text-gray-500">
                                Usia: {item.sapi.usia} tahun |{item.sapi.beratSapi ? ` Berat: ${item.sapi.beratSapi} kg` : " Berat tidak diketahui"}
                              </div>
                            </div>
                          ) : (
                            "Data sapi tidak tersedia"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{item.daging ? `${item.daging.berat} kg` : "N/A"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Selesai
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {item.cid ? (
                            <a href={`https://ipfs.io/ipfs/${item.cid}`} target="_blank" rel="noreferrer" title={item.cid} className="text-primary hover:underline font-mono text-xs">
                              {truncateCid(item.cid, 8, 8)}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            className="text-primary hover:underline text-xs"
                            onClick={() => {
                              setSelectedSlaughter(item);
                              setShowSlaughterDetail(true);
                            }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showSlaughterDetail && selectedSlaughter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10" onClick={() => setShowSlaughterDetail(false)}>
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detail Penyembelihan</h3>
                <button onClick={() => setShowSlaughterDetail(false)} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">ID Transaksi</div>
                  <div className="col-span-2 font-medium">{selectedSlaughter.id}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Tanggal</div>
                  <div className="col-span-2">{new Date(selectedSlaughter.timestamp).toLocaleDateString("id-ID")}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Waktu</div>
                  <div className="col-span-2">{new Date(selectedSlaughter.timestamp).toLocaleTimeString("id-ID")}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">ID Sapi</div>
                  <div className="col-span-2 font-mono text-xs">{selectedSlaughter.sapiId}</div>
                </div>
                {selectedSlaughter.sapi && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">Jenis Sapi</div>
                      <div className="col-span-2">{selectedSlaughter.sapi.jenis}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">Kelamin</div>
                      <div className="col-span-2">{selectedSlaughter.sapi.kelamin}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">Usia</div>
                      <div className="col-span-2">{selectedSlaughter.sapi.usia} tahun</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">Berat Sapi</div>
                      <div className="col-span-2">{selectedSlaughter.sapi.beratSapi || "Tidak diketahui"} kg</div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Berat Daging</div>
                  <div className="col-span-2 font-medium text-green-600">{selectedSlaughter.daging ? `${selectedSlaughter.daging.berat} kg` : "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">ID Pengecekan</div>
                  <div className="col-span-2">{selectedSlaughter.idPengecekanHalalSehat || "Tidak ada"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">CID IPFS</div>
                  <div className="col-span-2">
                    {selectedSlaughter.cid ? (
                      <a href={`https://ipfs.io/ipfs/${selectedSlaughter.cid}`} target="_blank" rel="noreferrer" title={selectedSlaughter.cid} className="text-primary hover:underline font-mono text-xs">
                        {selectedSlaughter.cid}
                      </a>
                    ) : (
                      <span className="text-gray-400">Belum tersedia</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-gray-500">Status</div>
                  <div className="col-span-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i>
                      Selesai
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowSlaughterDetail(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RphTransaksi;
