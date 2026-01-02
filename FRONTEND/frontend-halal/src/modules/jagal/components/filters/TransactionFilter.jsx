import React from 'react';

const TransactionFilter = ({ transactionFilter, setTransactionFilter }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cari transaksi..."
            value={transactionFilter.search}
            onChange={(e) =>
              setTransactionFilter({ ...transactionFilter, search: e.target.value })
            }
          />
        </div>

        {/* Status Filter */}
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={transactionFilter.status}
            onChange={(e) =>
              setTransactionFilter({ ...transactionFilter, status: e.target.value })
            }
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {/* Verification Status Filter */}
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verifikasi
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={transactionFilter.verificationStatus}
            onChange={(e) =>
              setTransactionFilter({
                ...transactionFilter,
                verificationStatus: e.target.value,
              })
            }
          >
            <option value="all">Semua Verifikasi</option>
            <option value="waiting_buyer">Menunggu Pembeli</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;
