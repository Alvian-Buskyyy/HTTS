import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import JagalSidebar from '../components/JagalSidebar';

const JagalDaftarTernak = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [jagalData, setJagalData] = useState(null);
  const [formData, setFormData] = useState({
    jenis: '',
    customJenis: '',
    kelamin: '',
    usia: '',
    berat: '',
    asalType: 'JAGAL',
    origin: 'lahir_sendiri',
    motherId: '',
    fatherId: '',
    healthStatus: 'sehat',
    tanggalLahir: '',
    availability: 'available',
  });
  const [availableCattle, setAvailableCattle] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch jagal data and available cattle for selection as parents
  useEffect(() => {
    // Simulate API call to get jagal data
    setTimeout(() => {
      const data = {
        id: 'jagal-123',
        nama: 'Jagal Nusantara',
      };
      setJagalData(data);

      // Fetch available cattle for parent selection
      const cattleData = [
        { id: 'SP001', jenis: 'Sapi Jantan', kelamin: 'Jantan' },
        { id: 'SP002', jenis: 'Sapi Betina', kelamin: 'Betina' },
        { id: 'SP003', jenis: 'Sapi Jantan', kelamin: 'Jantan' },
      ];
      setAvailableCattle(cattleData);
    }, 1000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jenis && formData.jenis !== 'other') {
      newErrors.jenis = 'Jenis ternak harus dipilih';
    }

    if (formData.jenis === 'other' && !formData.customJenis) {
      newErrors.customJenis = 'Jenis ternak harus diisi';
    }

    if (!formData.kelamin) {
      newErrors.kelamin = 'Jenis kelamin harus dipilih';
    }

    if (!formData.usia || isNaN(formData.usia) || formData.usia <= 0) {
      newErrors.usia = 'Usia harus berupa angka positif';
    }

    if (!formData.berat || isNaN(formData.berat) || formData.berat <= 0) {
      newErrors.berat = 'Berat harus berupa angka positif';
    }

    if (formData.origin === 'lahir_sendiri' && !formData.tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const finalJenis = formData.jenis === 'other' ? formData.customJenis : formData.jenis;
    const API_BASE = 'http://localhost:3000';
    const token = localStorage.getItem('token') || '';
    const userRaw = localStorage.getItem('user');
    let jagalId = '';
    try {
      const u = userRaw ? JSON.parse(userRaw) : null;
      jagalId = u?.entityId || u?.id || '';
    } catch {}

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const apiData = {
      jenis: finalJenis,
      kelamin: formData.kelamin,
      usia: parseInt(formData.usia),
      beratSapi: parseFloat(formData.berat),
      asalType: 'JAGAL',
      asalId: jagalId,
      jagalId: jagalId,
    };

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/sapi`, { method: 'POST', headers, body: JSON.stringify(apiData) });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Gagal mendaftarkan sapi');

        setLoading(false);
        setSuccess(true);

        setTimeout(() => {
          setSuccess(false);
          setFormData({
            jenis: '',
            customJenis: '',
            kelamin: '',
            usia: '',
            berat: '',
            asalType: 'JAGAL',
            origin: 'lahir_sendiri',
            motherId: '',
            fatherId: '',
            healthStatus: 'sehat',
            tanggalLahir: '',
            availability: 'available',
          });
          navigate('/jagal/sapi');
        }, 1800);
      } catch (error) {
        console.error('Error creating sapi:', error.message);
        setLoading(false);
        alert(error.message || 'Terjadi kesalahan saat mendaftar sapi');
      }
    })();
  };

  const motherOptions = availableCattle.filter(cattle => cattle.kelamin === 'Betina');
  const fatherOptions = availableCattle.filter(cattle => cattle.kelamin === 'Jantan');

  return (
    <DashboardLayout title="Daftarkan Ternak" role="JAGAL" customSidebar={<JagalSidebar /> }>
      <div className="mt-4 p-6">
        {success ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Berhasil!</p>
            <p>Ternak baru berhasil didaftarkan. ID ternak akan dikirimkan ke email Anda.</p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Pendaftaran Ternak</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Jenis Ternak <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleChange}
                  className={`w-full border ${errors.jenis ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">-- Pilih Jenis Ternak --</option>
                  <option value="Sapi Limosin">Sapi Limosin</option>
                  <option value="Sapi Simental">Sapi Simental</option>
                  <option value="Sapi Brahman">Sapi Brahman</option>
                  <option value="Sapi PO (Peranakan Ongole)">Sapi PO (Peranakan Ongole)</option>
                  <option value="Sapi Bali">Sapi Bali</option>
                  <option value="Sapi Madura">Sapi Madura</option>
                  <option value="Sapi Angus">Sapi Angus</option>
                  <option value="Sapi BX (Brahman Cross)">Sapi BX (Brahman Cross)</option>
                  <option value="other">Lainnya</option>
                </select>
                {errors.jenis && (
                  <p className="mt-1 text-xs text-red-500">{errors.jenis}</p>
                )}
              </div>

              {formData.jenis === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Jenis Ternak (Lainnya) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customJenis"
                    value={formData.customJenis}
                    onChange={handleChange}
                    placeholder="Masukkan jenis ternak"
                    className={`w-full border ${errors.customJenis ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.customJenis && (
                    <p className="mt-1 text-xs text-red-500">{errors.customJenis}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="kelamin"
                  value={formData.kelamin}
                  onChange={handleChange}
                  className={`w-full border ${errors.kelamin ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="Jantan">Jantan</option>
                  <option value="Betina">Betina</option>
                </select>
                {errors.kelamin && (
                  <p className="mt-1 text-xs text-red-500">{errors.kelamin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Usia (tahun) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="usia"
                  value={formData.usia}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`w-full border ${errors.usia ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {errors.usia && (
                  <p className="mt-1 text-xs text-red-500">{errors.usia}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Berat (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="berat"
                  value={formData.berat}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`w-full border ${errors.berat ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {errors.berat && (
                  <p className="mt-1 text-xs text-red-500">{errors.berat}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Asal Ternak <span className="text-red-500">*</span>
                </label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="lahir_sendiri">Lahir di Peternakan</option>
                  <option value="beli">Dibeli</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Status Kesehatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="sehat">Sehat</option>
                  <option value="perlu_periksa">Perlu Diperiksa</option>
                  <option value="sakit">Sakit</option>
                </select>
              </div>

              {formData.origin === 'lahir_sendiri' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      value={formData.tanggalLahir}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full border ${errors.tanggalLahir ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.tanggalLahir && (
                      <p className="mt-1 text-xs text-red-500">{errors.tanggalLahir}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Induk (ID Sapi Betina)
                    </label>
                    <select
                      name="motherId"
                      value={formData.motherId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Pilih Induk --</option>
                      {motherOptions.map(cattle => (
                        <option key={cattle.id} value={cattle.id}>
                          {cattle.id} - {cattle.jenis}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Pejantan (ID Sapi Jantan)
                    </label>
                    <select
                      name="fatherId"
                      value={formData.fatherId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Pilih Pejantan --</option>
                      {fatherOptions.map(cattle => (
                        <option key={cattle.id} value={cattle.id}>
                          {cattle.id} - {cattle.jenis}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/jagal/sapi')}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-md transition-all duration-200 disabled:opacity-70 border-2 border-blue-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    <span>Mendaftarkan...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    <i className="fas fa-save mr-2"></i>
                    <span>Daftarkan Ternak</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JagalDaftarTernak;
