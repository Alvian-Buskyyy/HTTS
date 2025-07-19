import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';

const PeternakDaftarTernak = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [peternakData, setPeternakData] = useState(null);
  const [formData, setFormData] = useState({
    jenis: '',
    customJenis: '',
    kelamin: '',
    usia: '',
    berat: '',
    asalType: 'PETERNAK',
    origin: 'lahir_sendiri',
    motherId: '',
    fatherId: '',
    healthStatus: 'sehat',
    tanggalLahir: '',
    availability: 'available',
  });
  const [availableCattle, setAvailableCattle] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch peternak data and available cattle for selection as parents
  useEffect(() => {
    // Simulate API call to get peternak data
    setTimeout(() => {
      const data = {
        id: 'peternak-123',
        nama: 'Peternakan Sejahtera',
      };
      setPeternakData(data);

      // Fetch available cattle for parent selection
      const cattleData = [
        {
          id: 'SP001',
          jenis: 'Sapi Jantan',
          kelamin: 'Jantan',
        },
        {
          id: 'SP002',
          jenis: 'Sapi Betina',
          kelamin: 'Betina',
        },
        {
          id: 'SP003',
          jenis: 'Sapi Jantan',
          kelamin: 'Jantan',
        }
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

    // Clear errors when field is edited
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Prepare data for API
    const finalJenis = formData.jenis === 'other' ? formData.customJenis : formData.jenis;
    const apiData = {
      jenis: finalJenis,
      kelamin: formData.kelamin,
      usia: parseInt(formData.usia),
      berat: parseFloat(formData.berat),
      asalType: formData.asalType,
      asalId: peternakData.id,
      peternakId: peternakData.id,
      healthStatus: formData.healthStatus,
      availability: formData.availability,
      tanggalLahir: formData.tanggalLahir || new Date().toISOString().split('T')[0],
      origin: formData.origin,
      motherId: formData.origin === 'lahir_sendiri' ? formData.motherId : null,
      fatherId: formData.origin === 'lahir_sendiri' ? formData.fatherId : null,
    };

    console.log('Data to be sent to API:', apiData);

    // Simulate API call to register cattle
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Generate a unique ID for the new cattle
      const newCattleId = `SP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create the new cattle object with ID
      const newCattle = {
        ...apiData,
        id: newCattleId,
      };

      // Save to localStorage - get existing cattle first, then add the new one
      try {
        const existingCattleJSON = localStorage.getItem('cattleList');
        const existingCattle = existingCattleJSON ? JSON.parse(existingCattleJSON) : [];
        const updatedCattleList = [...existingCattle, newCattle];
        localStorage.setItem('cattleList', JSON.stringify(updatedCattleList));
      } catch (error) {
        console.error('Error saving cattle to localStorage:', error);
      }

      // Reset form after success and navigate to cattle list
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          jenis: '',
          customJenis: '',
          kelamin: '',
          usia: '',
          berat: '',
          asalType: 'PETERNAK',
          origin: 'lahir_sendiri',
          motherId: '',
          fatherId: '',
          healthStatus: 'sehat',
          tanggalLahir: '',
          availability: 'available',
        });
        
        // Navigate to the cattle list page
        navigate('/peternak/sapi');
      }, 3000);
    }, 1500);
  };

  // Filter cattle by gender for parent selection
  const motherOptions = availableCattle.filter(cattle => cattle.kelamin === 'Betina');
  const fatherOptions = availableCattle.filter(cattle => cattle.kelamin === 'Jantan');

  return (
    <DashboardLayout title="Daftar Ternak Baru" role="PETERNAK">
      <div className="mt-16 p-6">
        <h1 className="text-2xl font-semibold text-blue-600 mb-6">Daftarkan Ternak Baru</h1>

        {success ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p className="font-bold">Berhasil!</p>
            <p>Ternak baru berhasil didaftarkan. ID ternak akan dikirimkan ke email Anda.</p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-sm p-6">
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
                onClick={() => navigate('/peternak/sapi')}
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

export default PeternakDaftarTernak;
