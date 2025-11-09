import React from 'react';

/**
 * SupplyChainTracker
 * A horizontal stepper that shows current supply chain stage for a selected cattle ID.
 * Polls periodically to update status. If backend API is unavailable, falls back to mock data.
 * Expected API: GET /api/trace/cattle/:id/status -> { currentStage, timestamps?, actors? }
 * - actors is an object keyed by stage (e.g., { PETERNAK: "Peternak A", RPH: "RPH X" })
 * Or provide history: { history: [{ stage, actorName }] } which will be mapped to actors.
 */
const steps = [
  { key: 'PETERNAK', label: 'Peternak', icon: 'fas fa-cow' },
  { key: 'JAGAL', label: 'Jagal', icon: 'fas fa-user' },
  { key: 'PASAR_HEWAN', label: 'Pasar Hewan', icon: 'fas fa-store' },
  { key: 'RPH', label: 'RPH', icon: 'fas fa-cut' },
  { key: 'DISTRIBUTOR', label: 'Distributor', icon: 'fas fa-truck' },
  { key: 'HORECA', label: 'Horeca', icon: 'fas fa-utensils' },
  { key: 'END_CUSTOMER', label: 'Konsumen', icon: 'fas fa-user' }
];

const stageIndex = (stageKey) => {
  const idx = steps.findIndex(s => s.key === stageKey);
  return idx === -1 ? 0 : idx;
};

const SupplyChainTracker = ({ cattleOptions = [], defaultId }) => {
  const [selectedId, setSelectedId] = React.useState(defaultId || (cattleOptions[0]?.id ?? ''));
  const [status, setStatus] = React.useState({ currentStage: 'PETERNAK', timestamps: {}, actors: {} });
  const [loading, setLoading] = React.useState(false);

  const fetchStatus = React.useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      // Try backend endpoint (adjust if exists). Expected to return { currentStage, timestamps }
      const res = await fetch(`/api/trace/cattle/${encodeURIComponent(id)}/status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.currentStage) {
          let actors = data.actors || {};
          if ((!actors || Object.keys(actors).length === 0) && Array.isArray(data.history)) {
            actors = {};
            data.history.forEach(h => {
              const stage = h.stage || h.status || h.phase;
              const actor = h.actorName || h.actor || h.userName || h.name;
              if (stage && actor) actors[stage] = actor;
            });
          }
          setStatus({ currentStage: data.currentStage, timestamps: data.timestamps || {}, actors });
        } else {
          throw new Error('Invalid payload');
        }
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (e) {
      // Fallback mock: cycle stages based on time to simulate realtime
      const now = Date.now();
      const cycle = Math.floor((now / 10000)) % steps.length; // advance every 10s
      const idx = cycle;
      setStatus({ currentStage: steps[idx].key, timestamps: {}, actors: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!selectedId) return;
    fetchStatus(selectedId);
    const t = setInterval(() => fetchStatus(selectedId), 10000);
    return () => clearInterval(t);
  }, [selectedId, fetchStatus]);

  const currentIdx = stageIndex(status.currentStage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-route text-blue-600"></i>
          Rantai Pasok Ternak (Realtime)
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Pilih ID</label>
          <select
            className="border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {cattleOptions.length === 0 && <option value="">Tidak ada data</option>}
            {cattleOptions.map(c => (
              <option key={c.id} value={c.id}>{c.id}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedId ? (
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-1/2 left-5 right-5 -translate-y-1/2 h-0.5 bg-gray-200"></div>
          <div className="flex items-center justify-between relative">
            {steps.map((s, i) => {
              const reached = i <= currentIdx;
              const actor = status.actors?.[s.key];
              return (
                <div key={s.key} className="flex flex-col items-center text-center w-full">
                  <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${reached ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}
                       title={`${s.label}${actor ? ' - ' + actor : ''}`}>
                    <i className={`${s.icon}`}></i>
                  </div>
                  <div className={`mt-2 text-xs ${reached ? 'text-blue-600' : 'text-gray-500'}`}>{s.label}</div>
                  <div className={`mt-0.5 text-[10px] ${reached ? 'text-gray-600' : 'text-gray-400'} max-w-[8rem] truncate`}>{actor || '—'}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-left text-gray-500">
            <span className="inline-flex items-center gap-1 mr-4"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Tercapai</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Belum</span>
            {loading && <span className="ml-4 text-blue-600"><i className="fas fa-sync fa-spin mr-1"></i>Mengambil status…</span>}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Pilih sapi untuk melihat rantai pasok.</div>
      )}
    </div>
  );
};

export default SupplyChainTracker;
