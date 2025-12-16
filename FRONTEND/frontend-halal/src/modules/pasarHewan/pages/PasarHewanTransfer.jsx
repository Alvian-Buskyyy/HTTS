import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";

const PasarHewanTransfer = () => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Tabs and UI state
  const [activeTab, setActiveTab] = useState("incoming");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyInputCode, setVerifyInputCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [verifyingTx, setVerifyingTx] = useState(null);

  // Filters and forms
  const [transactionFilter, setTransactionFilter] = useState({ status: "all", search: "" });
  const [newTransaction, setNewTransaction] = useState({
    buyerId: "",
    buyerName: "",
    buyerType: "",
    cattleId: "",
    quantity: 1,
    date: "",
    notes: "",
  });

  // Available cattle from localStorage (mapped to UI shape)
  const [availableCattle, setAvailableCattle] = useState([]);

  // Dynamic buyers and destinations from backend entities
  const [buyers, setBuyers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [entitiesError, setEntitiesError] = useState("");

  // Transactions state (riil dari backend)
  const [transactions, setTransactions] = useState([]);
  // EntityId Pasar Hewan (UUID dari backend, berbeda dengan userId)
  const [currentEntityId, setCurrentEntityId] = useState("");

  // Transfer sapi with OTP verification (to Jagal)
  const [newTransfer, setNewTransfer] = useState({
    cattleId: "",
    recipientId: "",
    recipientName: "",
    recipientType: "JAGAL",
    date: "",
    notes: "",
  });
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  // Auth submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const correctCode = "123456";
    if (authCode === correctCode) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError("");
      setAuthCode("");
      localStorage.setItem("transactionAuth", "true");
      processPageSetup();
    } else {
      setAuthError("Kode autentikasi tidak valid. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    const transactionAuth = localStorage.getItem("transactionAuth");
    if (transactionAuth === "true") {
      setIsAuthenticated(true);
    } else {
      const fromSidebar = localStorage.getItem("fromSidebar") === "true";
      const fromDashboard = localStorage.getItem("showTransactionFromDashboard") === "true";
      if (!fromSidebar && !fromDashboard) {
        setShowAuthModal(true);
        return;
      }
    }
    processPageSetup();
  }, []);

  const processPageSetup = () => {
    // Load entities for buyers/destinations
    (async () => {
      setEntitiesLoading(true);
      setEntitiesError("");
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const fetchList = async (path) => {
        try {
          const r = await fetch(`${API_BASE}${path}`, { headers });
          const j = await r.json();
          return Array.isArray(j) ? j : j?.data || [];
        } catch {
          return [];
        }
      };
      const sources = [
        { type: "PETERNAK", path: "/peternak" },
        // { type: 'PASAR_HEWAN', path: '/pasarHewan' },
        { type: "JAGAL", path: "/jagal" },
        { type: "RPH", path: "/rph" },
        { type: "DISTRIBUTOR", path: "/distributor" },
        { type: "HOREKA", path: "/horeka" },
      ];
      try {
        const results = await Promise.all(
          sources.map((s) =>
            fetchList(s.path).then((list) =>
              list.map((row) => ({
                type: s.type,
                // Use the actual database ID for transaction compatibility
                // For Jagal, RPH, DISTRIBUTOR, HOREKA - use row.id (primary key)
                // For PETERNAK - might need userId, but for Jagal transfer use row.id
                id: row.id || row.userId || row.kode || row.uuid || "",
                name: row.nama || row.namaUsaha || row.instansi || row.username || (row.id || row.userId ? `ID ${row.id || row.userId}` : s.type),
                originalData: row // Keep original data for debugging
              }))
            )
          )
        );
        // Only allow logical buyers for Pasar Hewan: JAGAL, RPH, DISTRIBUTOR, HOREKA
        const flat = results.flat().filter((x) => ["JAGAL", "RPH", "DISTRIBUTOR", "HOREKA"].includes(x.type) && x.id);
        console.log("Mapped entities for transfer:", flat);
        setBuyers(flat);
        setDestinations(results.flat().filter((x) => x.id));
      } catch (error) {
        setEntitiesError("Gagal memuat data entitas");
        console.error("Error loading entities:", error);
      } finally {
        setEntitiesLoading(false);
      }
    })();

    // Daftar sapi akan di-fetch dari backend pada efek terpisah

    const storedCattle = localStorage.getItem("selectedCattleForSale");
    if (storedCattle) {
      try {
        const data = JSON.parse(storedCattle);
        setNewTransaction((prev) => ({ ...prev, cattleId: data.id }));
        setShowTransactionForm(true);
        setActiveTab("sales");
        localStorage.removeItem("selectedCattleForSale");
      } catch (error) {
        console.error("Error parsing stored cattle data:", error);
      }
    }

    const showFromDashboard = localStorage.getItem("showTransactionFromDashboard");
    if (showFromDashboard === "true") {
      setActiveTab("sales");
      setShowTransactionForm(true);
      localStorage.removeItem("showTransactionFromDashboard");
    }

    localStorage.removeItem("fromSidebar");
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  // Fetch riil: sapi milik PASAR_HEWAN dan transaksi penjualan terkait
  useEffect(() => {
    const API_BASE = "http://localhost:3000";
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pasarHewanId = user?.entityId || user?.id;
    if (!pasarHewanId) {
      console.warn("Pasar Hewan ID tidak ditemukan");
      return;
    }

    // Set the current entity ID for use in other functions
    setCurrentEntityId(pasarHewanId);

    // Helper untuk nama entitas (local function inside useEffect)
    const resolveEntityNameLocal = (type, id) => {
      const foundBuyer = buyers.find((b) => b.type === type && String(b.id) === String(id));
      if (foundBuyer) return foundBuyer.name;
      const foundAny = destinations.find((d) => d.type === type && String(d.id) === String(id));
      return foundAny?.name || "-";
    };

    const fetchData = async () => {
      try {
        // 1) Ambil sapi milik PASAR_HEWAN
        const resSapi = await fetch(`${API_BASE}/sapi/entity/PASAR_HEWAN/${pasarHewanId}`, { headers });
        if (resSapi.ok) {
          const json = await resSapi.json();
          const list = Array.isArray(json) ? json : json?.data || [];
          const mapped = list.map((s) => ({
            id: s.id,
            type: s.jenis || "Sapi",
            weight: typeof s.beratSapi === "number" ? s.beratSapi : 0,
            availability: "available",
          }));
          setAvailableCattle(mapped);
          console.log("Sapi milik pasar hewan:", mapped);
        } else {
          console.warn("Gagal memuat sapi pasar hewan");
          setAvailableCattle([]);
        }

        // 2) Ambil transaksi INCOMING (dari peternak ke pasar hewan ini)
        const resIncoming = await fetch(`${API_BASE}/transaksiPenjualan/incoming/PASAR_HEWAN/${pasarHewanId}`, { headers });
        let incomingTx = [];
        if (resIncoming.ok) {
          const incomingData = await resIncoming.json();
          incomingTx = Array.isArray(incomingData?.data) ? incomingData.data : [];
          console.log("Incoming transactions:", incomingTx);
        } else {
          console.warn("Gagal memuat incoming transactions:", resIncoming.status);
          // Fallback: filter dari semua transaksi
          const resAll = await fetch(`${API_BASE}/transaksiPenjualan`, { headers });
          if (resAll.ok) {
            const allData = await resAll.json();
            const allList = Array.isArray(allData) ? allData : [];
            incomingTx = allList.filter((tx) => tx.pembeliType === "PASAR_HEWAN" && tx.pembeliId === pasarHewanId);
            console.log("Fallback incoming transactions:", incomingTx);
          }
        }

        // 3) Ambil transaksi OUTGOING (dari pasar hewan ini ke jagal/lainnya)
        const resOutgoing = await fetch(`${API_BASE}/transaksiPenjualan/outgoing/PASAR_HEWAN/${pasarHewanId}`, { headers });
        let outgoingTx = [];
        if (resOutgoing.ok) {
          const outgoingData = await resOutgoing.json();
          outgoingTx = Array.isArray(outgoingData?.data) ? outgoingData.data : [];
          console.log("Outgoing transactions:", outgoingTx);
        } else {
          console.warn("Gagal memuat outgoing transactions");
        }

        // 4) Gabungkan dan mapping ke format UI
        const allTransactions = [...incomingTx, ...outgoingTx];
        const mappedTx = allTransactions.map((t) => {
          const isIncoming = t.pembeliType === "PASAR_HEWAN" && t.pembeliId === pasarHewanId;
          const isOutgoing = t.penjualType === "PASAR_HEWAN" && t.penjualId === pasarHewanId;

          return {
            id: t.id,
            date: t.timestamp || new Date().toISOString(),
            buyerId: isIncoming ? t.penjualId : t.pembeliId,
            buyerName: isIncoming ? `Peternak: ${resolveEntityNameLocal("PETERNAK", t.penjualId) || "Dari Peternak"}` : `${t.pembeliType}: ${resolveEntityNameLocal(t.pembeliType, t.pembeliId)}`,
            buyerType: isIncoming ? t.penjualType : t.pembeliType,
            cattleId: t.sapiId || "-",
            quantity: t.jumlahQty || 1,
            status: t.verificationStatus === "VERIFIED" ? "verified" : t.verificationStatus === "REJECTED" ? "rejected" : "pending",
            verificationStatus: t.verificationStatus || "PENDING",
            verificationCode: t.verificationCode,
            blockchainHash: t.cid || "",
            cid: t.cid,
            verifikasiPenjual: !!t.verifikasiPenjual, // Add this field directly
            verifikasiPembeli: !!t.verifikasiPembeli, // Add this field directly
            verify: {
              sellerSigned: !!t.verifikasiPenjual,
              buyerSigned: !!t.verifikasiPembeli,
              code: t.verificationCode || "",
            },
            notes: "",
            isSeller: isOutgoing,
            isBuyer: isIncoming,
            direction: isIncoming ? "incoming" : "outgoing",
            raw: t, // Keep original data for debugging
          };
        });

        setTransactions(mappedTx);
        console.log("Mapped transactions:", mappedTx);
      } catch (err) {
        console.error("Error fetching data:", err);
        setAvailableCattle([]);
        setTransactions([]);
      }
    };

    // Jalankan setelah buyers siap agar nama pembeli dapat di-resolve
    fetchData();
  }, [buyers, destinations]); // Remove resolveEntityName from dependencies

  const handleNewTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const buyer = buyers.find((b) => b.id === newTransaction.buyerId);
      const pembeliType = buyer?.type || newTransaction.buyerType;
      // Payload konsisten seperti di PeternakTransaksi: gunakan penjualId & pembeliId
      const payload = {
        penjualType: "PASAR_HEWAN",
        penjualId: user?.entityId || user?.id,
        pembeliType,
        pembeliId: buyer?.id,
        sapiId: newTransaction.cattleId,
        jumlahQty: Number(newTransaction.quantity) || 1,
        type: "SAPI",
        timestamp: newTransaction.date ? new Date(newTransaction.date).toISOString() : new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/transaksiPenjualan`, { method: "POST", headers, body: JSON.stringify(payload) });
      let created = null;
      if (res.ok) {
        created = await res.json();
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn("Gagal kirim ke backend:", err?.error || res.statusText);
      }

      const txId = created?.data?.id || created?.id || `TXN${(transactions.length + 1).toString().padStart(3, "0")}`;
      setTransactions((prev) => [
        ...prev,
        {
          id: txId,
          date: newTransaction.date || new Date().toISOString().split("T")[0],
          buyerId: newTransaction.buyerId,
          buyerName: buyer?.name || "",
          buyerType: pembeliType,
          cattleId: newTransaction.cattleId,
          quantity: newTransaction.quantity,
          status: "pending",
          verificationStatus: "waiting_buyer",
          blockchainHash: "",
          cid: created?.data?.cid || created?.ipfsCid || "",
          verify: { sellerSigned: true, buyerSigned: false, code: "" },
          notes: newTransaction.notes,
          isSeller: true,
          isBuyer: false,
        },
      ]);

      setTransactionSuccess(true);
      setTimeout(() => {
        setShowTransactionForm(false);
        setTransactionSuccess(false);
        setNewTransaction({ buyerId: "", buyerName: "", buyerType: "", cattleId: "", quantity: 1, date: "", notes: "" });
      }, 1600);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Gagal membuat transaksi.");
    }
  };

  const handleBuyerChange = (e) => {
    const buyerId = e.target.value;
    const selected = buyers.find((b) => b.id === buyerId);
    setNewTransaction((prev) => ({ ...prev, buyerId, buyerName: selected?.name || "", buyerType: selected?.type || "" }));
  };

  const handleViewTransaction = (id) => {
    const tx = transactions.find((t) => t.id === id);
    setSelectedTransaction(tx || null);
    setShowDetailModal(!!tx);
  };

  const handleCancelTransaction = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan transaksi ini?")) return;
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
    alert("Transaksi berhasil dibatalkan");
  };

  // Add function to refresh transaction data
  const refreshTransactionData = async () => {
    const API_BASE = "http://localhost:3000";
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pasarHewanId = user?.entityId || user?.id;
    if (!pasarHewanId) return;

    try {
      // Re-fetch incoming transactions to get latest data
      const resIncoming = await fetch(`${API_BASE}/transaksiPenjualan/incoming/PASAR_HEWAN/${pasarHewanId}`, { headers });
      if (resIncoming.ok) {
        const incomingData = await resIncoming.json();
        const incomingTx = Array.isArray(incomingData?.data) ? incomingData.data : [];

        // Update transactions with fresh data
        setTransactions((prevTransactions) => {
          return prevTransactions.map((existingTx) => {
            const updatedTx = incomingTx.find((t) => t.id === existingTx.id);
            if (updatedTx && existingTx.direction === "incoming") {
              return {
                ...existingTx,
                verificationStatus: updatedTx.verificationStatus || "PENDING",
                verificationCode: updatedTx.verificationCode,
                verifikasiPenjual: !!updatedTx.verifikasiPenjual,
                verifikasiPembeli: !!updatedTx.verifikasiPembeli,
                cid: updatedTx.cid,
                status: updatedTx.verificationStatus === "VERIFIED" ? "verified" : updatedTx.verificationStatus === "REJECTED" ? "rejected" : "pending",
                raw: updatedTx,
              };
            }
            return existingTx;
          });
        });
      }
    } catch (err) {
      console.error("Error refreshing transaction data:", err);
    }
  };

  const handleConfirmBuyer = async () => {
    if (!verifyingTx) return;

    if (!verifyInputCode || verifyInputCode.length !== 6) {
      setVerifyError("Masukkan kode OTP 6 digit yang valid");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/transaksiPenjualan/${verifyingTx.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: verifyInputCode,
          verifierRole: "buyer", // pasar hewan sebagai pembeli dari peternak
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setVerifyError(json?.error || "Kode OTP tidak valid atau sudah kedaluwarsa");
        return;
      }

      const json = await res.json();
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === verifyingTx.id
            ? {
                ...t,
                verificationStatus: json?.data?.verificationStatus || "PENDING",
                status: json?.data?.verificationStatus === "VERIFIED" ? "verified" : "pending",
                cid: json?.cid || json?.data?.cid || t.cid,
                verifikasiPembeli: json?.data?.verifikasiPembeli || true,
                verifikasiPenjual: json?.data?.verifikasiPenjual || t.verifikasiPenjual, // Keep existing seller verification
              }
            : t
        )
      );

      if (json?.isCompleted) {
        setVerifySuccess("✅ Transaksi berhasil diverifikasi oleh kedua pihak dan tercatat di blockchain!");
      } else {
        setVerifySuccess("✅ Verifikasi Pasar Hewan berhasil. Menunggu verifikasi dari Peternak.");
      }
      setVerifyError("");

      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifyingTx(null);
        setVerifyInputCode("");
        setVerifySuccess("");
        // Refresh data after verification
        refreshTransactionData();
      }, 3000);
    } catch (err) {
      console.error(err);
      setVerifyError("Terjadi kesalahan saat verifikasi. Silakan coba lagi.");
    }
  };

  const handleRejectVerification = async () => {
    if (!verifyingTx) return;

    setVerifyError("");
    setVerifySuccess("");

    try {
      const res = await fetch(`http://localhost:3000/transaksiPenjualan/${verifyingTx.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode: verifyingTx.verificationCode,
          verifierRole: "buyer",
          action: "reject",
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setVerifyError(json?.error || "Gagal menolak verifikasi");
        return;
      }

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === verifyingTx.id
            ? {
                ...t,
                verificationStatus: "REJECTED",
                status: "rejected",
              }
            : t
        )
      );

      setVerifySuccess("❌ Transaksi berhasil ditolak");

      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifyingTx(null);
        setVerifyInputCode("");
        setVerifySuccess("");
        setVerifyError("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setVerifyError(err.message || "Gagal menolak verifikasi");
    }
  };

  const handleNewTransferSubmit = async (e) => {
    e.preventDefault();
    if (!newTransfer.cattleId || !newTransfer.recipientId) return;

    setTransferLoading(true);
    try {
      // Find the selected cattle details
      const selectedCattle = availableCattle.find((c) => c.id === newTransfer.cattleId);
      if (!selectedCattle) {
        throw new Error("Sapi tidak ditemukan");
      }

      // Get current user info
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const pasarHewanId = currentEntityId || user?.entityId || user?.id;

      console.log("Transfer Debug Info:", {
        selectedCattle: selectedCattle,
        recipientId: newTransfer.recipientId,
        pasarHewanId: pasarHewanId,
        cattleId: newTransfer.cattleId
      });

      // Submit transfer request to backend
      const response = await fetch(`${API_BASE}/transaksiPenjualan/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pasarHewanId,
          jagalId: newTransfer.recipientId,
          sapiId: newTransfer.cattleId,
          jumlahQty: 1, // Always 1 for individual cattle transfer
          notes: newTransfer.notes || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal membuat transfer");
      }

      const transferResult = await response.json();

      // Add the new transfer to transactions list
      const newTransferTx = {
        id: transferResult.data.id,
        date: new Date().toISOString().split("T")[0],
        buyerId: newTransfer.recipientId,
        buyerName: newTransfer.recipientName,
        buyerType: "JAGAL",
        cattleId: newTransfer.cattleId,
        quantity: 1,
        status: "pending",
        verificationStatus: "PENDING",
        blockchainHash: "",
        cid: transferResult.data.cid || "",
        verify: { sellerSigned: true, buyerSigned: false, code: transferResult.data.verificationCode || "" },
        notes: newTransfer.notes,
        isSeller: true,
        isBuyer: false,
        direction: "outgoing",
        verifikasiPenjual: true,
        verifikasiPembeli: false,
        verificationCode: transferResult.data.verificationCode,
      };
      setTransactions((prev) => [newTransferTx, ...prev]);

      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3000);

      // Reset form
      setNewTransfer({
        cattleId: "",
        recipientId: "",
        recipientName: "",
        recipientType: "JAGAL",
        date: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating transfer:", error);
      // You might want to add an error state and show error message to user
      alert("Gagal membuat transfer: " + error.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("id-ID");
  };

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
    switch (String(status)) {
      case "waiting_buyer":
      case "PENDING":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu Pembeli</span>;
      case "verified":
      case "VERIFIED":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Terverifikasi</span>;
      case "rejected":
      case "REJECTED":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  // Helper status verifikasi konsisten lintas enum/lowercase
  const isPendingStatus = (s) => {
    const val = String(s || "").toUpperCase();
    return val === "WAITING_BUYER".toUpperCase() || val === "PENDING";
  };
  const isVerifiedStatus = (s) => {
    const val = String(s || "").toUpperCase();
    return val === "VERIFIED" || val === "VERIFIED".toUpperCase();
  };
  const isRejectedStatus = (s) => {
    const val = String(s || "").toUpperCase();
    return val === "REJECTED" || val === "REJECTED".toUpperCase();
  };

  // Auto-refresh data every 30 seconds for better UX
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTransactionData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Transaksi Pasar Hewan" role="PASAR_HEWAN">
      <div className="mt-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 gap-2">
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "incoming" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("incoming")}
          >
            Transaksi Masuk
          </button>
          <button
            className={`py-3 px-5 text-left text-base font-semibold border-b-2 transition ${activeTab === "sales" ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"}`}
            onClick={() => handleTabChange("sales")}
          >
            Transaksi Keluar
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

        {/* INCOMING TAB - Transaksi dari Peternak */}
        {activeTab === "incoming" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                <i className="fas fa-arrow-down text-blue-500 mr-2"></i>
                Transaksi Masuk dari Peternak
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm" onClick={() => refreshTransactionData()}>
                <i className="fas fa-sync mr-1"></i> Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={transactionFilter.status}
                  onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value })}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2"
                  value={transactionFilter.search}
                  onChange={(e) => setTransactionFilter({ ...transactionFilter, search: e.target.value })}
                />
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <i className="fas fa-search mr-1"></i> Cari
                </button>
              </div>
            </div>

            {/* Incoming Transactions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peternak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter((t) => t.direction === "incoming") // Only incoming transactions
                    .filter((t) => transactionFilter.status === "all" || t.status === transactionFilter.status)
                    .filter(
                      (t) =>
                        transactionFilter.search === "" ||
                        t.id.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        t.buyerName.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        t.cattleId.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        (t.cid ? String(t.cid).toLowerCase().includes(transactionFilter.search.toLowerCase()) : false)
                    )
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <i className="fas fa-user mr-1"></i>
                            {transaction.buyerName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                          {transaction.cid ? (
                            <a className="text-blue-600 hover:underline" href={`https://ipfs.io/ipfs/${transaction.cid}`} target="_blank" rel="noreferrer" title={transaction.cid}>
                              {transaction.cid.length > 18 ? `${transaction.cid.slice(0, 8)}...${transaction.cid.slice(-8)}` : transaction.cid}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getTransactionStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(transaction.verificationStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                          <div className="flex items-center gap-3 justify-start">
                            <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>
                              <i className="fas fa-eye mr-1"></i>Detail
                            </button>
                            {transaction.status === "pending" && (
                              <>
                                {transaction.verifikasiPenjual && !transaction.verifikasiPembeli ? (
                                  <button
                                    className="px-3 py-1 rounded text-xs border border-green-400 text-green-600 bg-white hover:bg-green-50 transition-colors"
                                    onClick={() => {
                                      setVerifyingTx(transaction);
                                      setShowVerifyModal(true);
                                      setVerifySuccess("Penjual sudah verifikasi. Silakan masukkan kode OTP untuk verifikasi pembeli.");
                                      setVerifyError(""); // Clear any previous errors
                                    }}
                                  >
                                    <i className="fas fa-key mr-1"></i>Masukkan OTP
                                  </button>
                                ) : transaction.verifikasiPenjual === false && transaction.verifikasiPembeli === false ? (
                                  <button className="px-3 py-1 rounded text-xs border border-gray-400 text-gray-500 bg-gray-100 cursor-not-allowed" disabled title="Menunggu penjual memulai dan melakukan verifikasi">
                                    <i className="fas fa-clock mr-1"></i>Menunggu Penjual
                                  </button>
                                ) : (
                                  <button
                                    className="px-3 py-1 rounded text-xs border border-blue-400 text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                                    onClick={() => {
                                      refreshTransactionData(); // Refresh data first
                                    }}
                                  >
                                    <i className="fas fa-sync mr-1"></i>Refresh Status
                                  </button>
                                )}
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    if (window.confirm("Apakah Anda yakin ingin menolak transaksi ini?")) {
                                      handleCancelTransaction(transaction.id);
                                    }
                                  }}
                                >
                                  <i className="fas fa-times mr-1"></i>Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {transactions.filter((t) => t.direction === "incoming").length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-inbox text-3xl mb-2"></i>
                  <p>Belum ada transaksi masuk dari peternak</p>
                  <p className="text-sm">Transaksi dari peternak akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            {/* Transfer Sapi */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-truck text-primary"></i> Transfer Sapi ke Jagal UHUYYY
              </h2>
              <p className="text-sm text-gray-500 mb-4">Transfer sapi dari Pasar Hewan ke Jagal dengan verifikasi OTP kedua belah pihak.</p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {entitiesError && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-xs">{entitiesError}</div>}
                {transferSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                    <i className="fas fa-check-circle mr-1"></i> Transfer sapi ke Jagal berhasil dibuat! OTP telah dikirim untuk verifikasi.
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
                        {availableCattle.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id} - {c.type} ({c.weight}kg)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jagal Tujuan</label>
                      <select
                        value={newTransfer.recipientId}
                        onChange={(e) => {
                          const selectedJagal = buyers.find((b) => b.type === "JAGAL" && b.id === e.target.value);
                          setNewTransfer({
                            ...newTransfer,
                            recipientId: e.target.value,
                            recipientName: selectedJagal?.name || "",
                            recipientType: "JAGAL",
                          });
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Pilih Jagal</option>
                        {buyers
                          .filter((d) => d.type === "JAGAL")
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              Jagal - {d.name} ({d.id})
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
                    <button
                      type="submit"
                      disabled={transferLoading}
                      className={`w-full md:w-auto font-semibold px-5 py-3 rounded-md shadow-sm transition ${transferLoading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    >
                      {transferLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-truck mr-2"></i>
                          Ajukan Transfer ke Jagal
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Transaksi Masuk & Keluar</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm" onClick={() => setShowTransactionForm(!showTransactionForm)}>
                <i className="fas fa-plus mr-1"></i> {showTransactionForm ? "Tutup Form" : "Buat Transaksi Baru"}
              </button>
            </div>

            {showTransactionForm && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Form Transaksi</h3>
                <form onSubmit={handleNewTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pembeli</label>
                      <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={newTransaction.buyerId} onChange={handleBuyerChange} required>
                        <option value="" disabled>
                          -- Pilih Pembeli --
                        </option>
                        {entitiesLoading ? (
                          <option value="" disabled>
                            Memuat...
                          </option>
                        ) : (
                          buyers.map((buyer) => (
                            <option key={`${buyer.type}:${buyer.id}`} value={buyer.id}>
                              {buyer.type} - {buyer.name} ({buyer.id})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Entitas Pembeli</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100" value={newTransaction.buyerType.replace("_", " ")} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sapi</label>
                      <select
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newTransaction.cattleId}
                        onChange={(e) => setNewTransaction({ ...newTransaction, cattleId: e.target.value })}
                        required
                      >
                        <option value="" disabled>
                          -- Pilih Sapi --
                        </option>
                        {availableCattle.map((cattle) => (
                          <option key={cattle.id} value={cattle.id}>
                            {cattle.id} - {cattle.type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newTransaction.quantity}
                        onChange={(e) => setNewTransaction({ ...newTransaction, quantity: parseInt(e.target.value, 10) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                      <textarea
                        rows="2"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={newTransaction.notes}
                        onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm" onClick={() => setShowTransactionForm(false)}>
                      Batal
                    </button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition text-sm">
                      <i className="fas fa-save mr-1"></i> Simpan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {transactionSuccess && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <i className="fas fa-check-circle mr-2"></i>
                <span>Transaksi berhasil disimpan!</span>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={transactionFilter.status}
                  onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value })}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Verifikasi Pembeli</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm mr-2"
                  value={transactionFilter.search}
                  onChange={(e) => setTransactionFilter({ ...transactionFilter, search: e.target.value })}
                />
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <i className="fas fa-search mr-1"></i> Cari
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pihak Lain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter((t) => transactionFilter.status === "all" || t.status === transactionFilter.status)
                    .filter(
                      (t) =>
                        transactionFilter.search === "" ||
                        t.id.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        t.buyerName.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        t.cattleId.toLowerCase().includes(transactionFilter.search.toLowerCase()) ||
                        (t.cid ? String(t.cid).toLowerCase().includes(transactionFilter.search.toLowerCase()) : false)
                    )
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.buyerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                          {transaction.direction === "incoming" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <i className="fas fa-arrow-down mr-1"></i> Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className={`${transaction.raw?.type === "TRANSFER" ? "fas fa-truck" : "fas fa-arrow-up"} mr-1`}></i>
                              {transaction.raw?.type === "TRANSFER" ? "Transfer" : "Keluar"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                          {transaction.cid ? (
                            <a className="text-blue-600 hover:underline" href={`https://ipfs.io/ipfs/${transaction.cid}`} target="_blank" rel="noreferrer" title={transaction.cid}>
                              {transaction.cid.length > 18 ? `${transaction.cid.slice(0, 8)}...${transaction.cid.slice(-8)}` : transaction.cid}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getTransactionStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(transaction.verificationStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                          <div className="flex items-center gap-3 justify-start">
                            <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>
                              Detail
                            </button>
                            {transaction.status === "pending" && (
                              <button className="text-red-500 hover:text-red-700" onClick={() => handleCancelTransaction(transaction.id)}>
                                Batal
                              </button>
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

        {/* VERIFICATION TAB */}
        {activeTab === "verification" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Verifikasi Transaksi</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{transactions.filter((t) => isPendingStatus(t.verificationStatus)).length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Terverifikasi</p>
                <p className="text-2xl font-semibold text-green-600">{transactions.filter((t) => isVerifiedStatus(t.verificationStatus)).length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 text-center">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-semibold text-red-600">{transactions.filter((t) => isRejectedStatus(t.verificationStatus)).length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.buyerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{transaction.cattleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getVerificationBadge(transaction.verificationStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {transaction.blockchainHash ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tercatat</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Belum</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <div className="flex items-center gap-3 justify-start">
                          {isPendingStatus(transaction.verificationStatus) && (
                            <>
                              {transaction.verifikasiPenjual && !transaction.verifikasiPembeli ? (
                                <button
                                  className="px-3 py-1 rounded text-xs border border-green-400 text-green-600 bg-white hover:bg-green-50"
                                  onClick={() => {
                                    setVerifyingTx(transaction);
                                    setShowVerifyModal(true);
                                    setVerifySuccess("Penjual sudah verifikasi. Silakan masukkan kode OTP untuk verifikasi pembeli.");
                                    setVerifyError(""); // Clear any previous errors
                                  }}
                                >
                                  <i className="fas fa-key mr-1"></i>Masukkan OTP
                                </button>
                              ) : transaction.verifikasiPenjual === false && transaction.verifikasiPembeli === false ? (
                                <button className="px-3 py-1 rounded text-xs border border-gray-400 text-gray-500 bg-gray-100 cursor-not-allowed" disabled title="Menunggu penjual memulai dan melakukan verifikasi">
                                  Menunggu Penjual
                                </button>
                              ) : (
                                <button
                                  className="px-3 py-1 rounded text-xs border border-blue-400 text-blue-600 bg-white hover:bg-blue-50"
                                  onClick={() => {
                                    refreshTransactionData(); // Refresh data first
                                  }}
                                >
                                  <i className="fas fa-sync mr-1"></i>Refresh Status
                                </button>
                              )}
                              <button
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => {
                                  setVerifyingTx(transaction);
                                  setShowVerifyModal(true);
                                }}
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                  <option value="">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div>
                <input type="month" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <input type="text" placeholder="Cari pembeli..." className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primaryDark transition text-sm">
                  <i className="fas fa-download mr-1"></i> Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sapi</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter((t) => t.status === "completed" || t.status === "cancelled")
                    .map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.buyerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.cattleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">Rp 15.000.000</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{getTransactionStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                          <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewTransaction(transaction.id)}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Menampilkan 1-{transactions.length} dari {transactions.length} transaksi
          </p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-primary text-white">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">
                  Detail Transaksi <span className="text-primary">{selectedTransaction.id}</span>
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                    <p className="text-gray-800 font-semibold">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pembeli</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sapi</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.cattleId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jumlah</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.quantity}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">CID</p>
                    {selectedTransaction.cid ? (
                      <a className="text-blue-600 hover:underline break-all" href={`https://ipfs.io/ipfs/${selectedTransaction.cid}`} target="_blank" rel="noreferrer" title={selectedTransaction.cid}>
                        {selectedTransaction.cid.length > 24 ? `${selectedTransaction.cid.slice(0, 10)}...${selectedTransaction.cid.slice(-10)}` : selectedTransaction.cid}
                      </a>
                    ) : (
                      <p className="text-gray-500">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status Transaksi</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status Verifikasi</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.verificationStatus}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="text-gray-800 font-semibold">{selectedTransaction.notes}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inter-Entity Verification Modal */}
        {showVerifyModal && verifyingTx && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-handshake text-blue-500 mr-2"></i>
                  Verifikasi Transaksi
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyingTx(null);
                    setVerifyError("");
                    setVerifySuccess("");
                    setVerifyInputCode("");
                  }}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Transaction Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-800 mb-2">Detail Transaksi</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium ml-1">{verifyingTx.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sapi:</span>
                      <span className="font-medium ml-1">{verifyingTx.cattleId}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Peternak:</span>
                      <span className="font-medium ml-1">{verifyingTx.buyerName}</span>
                    </div>
                  </div>
                </div>

                {/* Email Notification Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="mb-3">
                      <i className="fas fa-envelope text-blue-500 text-2xl mb-2"></i>
                      <h4 className="font-medium text-blue-800">Kode OTP Verifikasi</h4>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <i className="fas fa-check-circle text-green-600 mr-2"></i>
                        <span className="text-green-700 font-medium">Kode OTP telah dikirim ke email admin saat transaksi dibuat!</span>
                      </div>
                      <p className="text-blue-700 text-sm">Silakan cek email Anda untuk mendapatkan kode verifikasi 6 digit.</p>
                    </div>
                  </div>
                </div>

                {/* Verification Input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-key mr-1"></i>
                      Masukkan Kode OTP dari Email
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={verifyInputCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setVerifyInputCode(value);
                        if (verifyError) setVerifyError("");
                      }}
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="000000"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">Masukkan 6 digit kode OTP yang dikirim ke email admin</p>
                  </div>

                  {/* Input length indicator only */}
                  {verifyInputCode.length > 0 && verifyInputCode.length < 6 && (
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">{verifyInputCode.length}/6 digit</div>
                    </div>
                  )}
                </div>

                {/* Success/Error Messages */}
                {verifyError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center text-red-700">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      <span className="text-sm">{verifyError}</span>
                    </div>
                  </div>
                )}

                {verifySuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-700">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span className="text-sm">{verifySuccess}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                <button
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => {
                    if (window.confirm("Apakah Anda yakin ingin menolak transaksi ini?")) {
                      handleRejectVerification();
                    }
                  }}
                >
                  <i className="fas fa-times mr-2"></i>Tolak Transaksi
                </button>

                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setVerifyingTx(null);
                      setVerifyError("");
                      setVerifySuccess("");
                      setVerifyInputCode("");
                    }}
                  >
                    Batal
                  </button>

                  <button
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${verifyInputCode.length === 6 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    onClick={handleConfirmBuyer}
                    disabled={verifyInputCode.length !== 6}
                  >
                    <i className="fas fa-handshake mr-2"></i>
                    Konfirmasi & Verifikasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-sm bg-transparent">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Autentikasi Diperlukan</h2>
              </div>
              <form onSubmit={handleAuthSubmit} className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">Untuk mengakses transaksi, masukkan kode autentikasi Anda:</p>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Autentikasi</label>
                  <input type="password" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" value={authCode} onChange={(e) => setAuthCode(e.target.value)} required />
                  {authError && <p className="text-red-500 text-sm mt-1">{authError}</p>}
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => navigate("/pasarhewan/dashboard")}>
                    Kembali
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Autentikasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PasarHewanTransfer;
