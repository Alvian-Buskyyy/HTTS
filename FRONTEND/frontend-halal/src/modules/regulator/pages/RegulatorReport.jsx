import React, { useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const API_BASE = 'http://localhost:3000';

const RegulatorReport = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const downloadReport = async () => {
    setDownloading(true); setError('');
    try {
      // Backend endpoint: /report/monthly?month=YYYY-MM
      const res = await fetch(`${API_BASE}/report/monthly?month=${month}`);
      if (!res.ok) throw new Error('Gagal mengunduh laporan');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-halal-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardLayout role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="mt-2 p-4 md:p-6 max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Monthly Report</h1>
        <p className="text-gray-500 mb-4">Unduh laporan bulanan rantai pasok halal (format Excel). Data diambil dari transaksi dan supply chain bulan terpilih.</p>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-600">Pilih Bulan:</label>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
          <button onClick={downloadReport} disabled={downloading} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-60">
            {downloading ? 'Mengunduh...' : 'Download'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      </div>
    </DashboardLayout>
  );
};

export default RegulatorReport;
