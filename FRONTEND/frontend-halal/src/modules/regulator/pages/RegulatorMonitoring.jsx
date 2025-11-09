import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';
import SupplyChainTracker from '../../peternak/components/SupplyChainTracker';

const API_BASE = 'http://localhost:3000';

const RegulatorMonitoring = () => {
  const [cattleOptions, setCattleOptions] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/sapi`);
        if (res.ok) {
          const list = await res.json();
          setCattleOptions((Array.isArray(list) ? list : (list?.data || [])).slice(0, 20).map(s => ({ id: s.id })));
        }
      } catch {}
    };
    load();
  }, []);
  return (
    <DashboardLayout role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="mt-2 p-4 md:p-6 space-y-8">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Monitoring Rantai Pasok</h1>
          <p className="text-sm text-gray-500">Pantau status supply chain halal secara realtime.</p>
        </div>
        <SupplyChainTracker cattleOptions={cattleOptions} />
      </div>
    </DashboardLayout>
  );
};

export default RegulatorMonitoring;
