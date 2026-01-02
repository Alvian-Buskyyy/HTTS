export const filterTransactions = (transactions, filter) => {
  return transactions.filter((t) => {
    // Status filter
    if (filter.status !== 'all' && t.status !== filter.status) {
      return false;
    }

    // Verification status filter
    if (
      filter.verificationStatus !== 'all' &&
      t.verificationStatus !== filter.verificationStatus
    ) {
      return false;
    }

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesBuyer = t.buyerName?.toLowerCase().includes(searchLower);
      const matchesSeller = t.sellerName?.toLowerCase().includes(searchLower);
      const matchesCattle = t.cattleId?.toLowerCase().includes(searchLower);
      const matchesId = t.id?.toLowerCase().includes(searchLower);

      if (!matchesBuyer && !matchesSeller && !matchesCattle && !matchesId) {
        return false;
      }
    }

    return true;
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'verified':
      return 'Terverifikasi';
    case 'rejected':
      return 'Ditolak';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

export const getVerificationStatusText = (verificationStatus) => {
  switch (verificationStatus) {
    case 'verified':
      return 'Terverifikasi';
    case 'rejected':
      return 'Ditolak';
    case 'waiting_buyer':
      return 'Menunggu Pembeli';
    case 'PENDING':
      return 'Pending';
    case 'VERIFIED':
      return 'Terverifikasi';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return verificationStatus || '-';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
