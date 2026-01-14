import React from 'react';

const SlaughterVerificationModal = ({
  showVerifySlaughterModal,
  verifyingSlaughter,
  verifySlaughterInputCode,
  setVerifySlaughterInputCode,
  verifySlaughterError,
  verifySlaughterSuccess,
  setShowVerifySlaughterModal,
  setVerifyingSlaughter,
  handleCopySlaughterCode,
  handleRequestSlaughterVerification,
  handleConfirmSlaughter,
  handleRejectSlaughter,
}) => {
  if (!showVerifySlaughterModal || !verifyingSlaughter) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Verifikasi Penyembelihan</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowVerifySlaughterModal(false);
              setVerifyingSlaughter(null);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Transaksi:</span> {verifyingSlaughter.id}
            </p>
            <p>
              <span className="font-medium">RPH:</span> {verifyingSlaughter.rphId}
            </p>
            <p>
              <span className="font-medium">Sapi:</span> {verifyingSlaughter.sapiId}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800 mb-2">
              <i className="fas fa-shield-alt mr-2"></i>
              Kode verifikasi telah dikirimkan ke email Anda. Silakan cek email dan masukkan kode tersebut di bawah ini untuk verifikasi bersama.
            </p>
            {!verifyingSlaughter.verify?.code && (
              <button
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleRequestSlaughterVerification(verifyingSlaughter.id)}
              >
                Buat Kode
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masukkan Kode dari RPH
            </label>
            <input
              value={verifySlaughterInputCode}
              onChange={(e) => setVerifySlaughterInputCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="6 digit"
            />
            {verifySlaughterError && (
              <p className="text-sm text-red-600 mt-1">{verifySlaughterError}</p>
            )}
            {verifySlaughterSuccess && (
              <p className="text-sm text-green-600 mt-1">{verifySlaughterSuccess}</p>
            )}
            {!verifySlaughterError &&
              !verifySlaughterSuccess &&
              verifySlaughterInputCode &&
              verifySlaughterInputCode.length < 6 && (
                <p className="text-xs text-gray-500 mt-1">Masukkan 6 digit kode</p>
              )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            onClick={handleRejectSlaughter}
          >
            Tolak
          </button>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowVerifySlaughterModal(false);
                setVerifyingSlaughter(null);
              }}
            >
              Batal
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white ${
                /^[\d]{6}$/.test(verifySlaughterInputCode)
                  ? 'bg-primary hover:bg-primaryDark'
                  : 'bg-primary/60 cursor-not-allowed'
              }`}
              onClick={handleConfirmSlaughter}
              disabled={!/^\d{6}$/.test(verifySlaughterInputCode)}
            >
              Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlaughterVerificationModal;
