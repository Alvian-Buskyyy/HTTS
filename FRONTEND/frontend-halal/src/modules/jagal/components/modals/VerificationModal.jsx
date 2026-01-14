import React from 'react';

const VerificationModal = ({
  showVerifyModal,
  verifyingTx,
  verifyInputCode,
  setVerifyInputCode,
  verifyError,
  verifySuccess,
  setShowVerifyModal,
  setVerifyingTx,
  handleCopyCode,
  handleRequestVerification,
  handleConfirmBuyer,
  handleRejectVerification,
}) => {
  if (!showVerifyModal || !verifyingTx) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-transparent">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Verifikasi Antar Entitas</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowVerifyModal(false);
              setVerifyingTx(null);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Transaksi:</span> {verifyingTx.id}
            </p>
            <p>
              <span className="font-medium">Pembeli:</span> {verifyingTx.buyerName} ({verifyingTx.buyerType})
            </p>
            <p>
              <span className="font-medium">Sapi:</span> {verifyingTx.cattleId}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800 mb-2">
              <i className="fas fa-shield-alt mr-2"></i>
              Kode verifikasi telah dikirimkan ke email Anda. Silakan cek email dan masukkan kode tersebut di bawah ini untuk verifikasi bersama.
            </p>
            {!verifyingTx.verificationCode && (
              <button
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleRequestVerification(verifyingTx.id)}
              >
                Buat Kode
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masukkan Kode dari Pembeli
            </label>
            <input
              value={verifyInputCode}
              onChange={(e) => setVerifyInputCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="6 digit"
            />
            {verifyError && <p className="text-sm text-red-600 mt-1">{verifyError}</p>}
            {verifySuccess && <p className="text-sm text-green-600 mt-1">{verifySuccess}</p>}
            {!verifyError && !verifySuccess && verifyInputCode && verifyInputCode.length < 6 && (
              <p className="text-xs text-gray-500 mt-1">Masukkan 6 digit kode</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            className="px-4 py-2 text-white bg-red-500 border border-red-500 rounded-md hover:bg-red-600"
            onClick={handleRejectVerification}
          >
            Tolak
          </button>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={() => {
                setShowVerifyModal(false);
                setVerifyingTx(null);
              }}
            >
              Batal
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white ${
                /^[\d]{6}$/.test(verifyInputCode)
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-green-300 cursor-not-allowed'
              }`}
              onClick={handleConfirmBuyer}
              disabled={!/^\d{6}$/.test(verifyInputCode)}
            >
              Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
