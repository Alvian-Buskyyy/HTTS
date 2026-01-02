import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';
import ChecklistForm from '../components/ChecklistForm';
import ChecklistTable from '../components/ChecklistTable';
import ChecklistInfoCard from '../components/ChecklistInfoCard';

const API_BASE = 'http://localhost:3000';

const RegulatorChecklist = () => {
  const [tab, setTab] = useState('PRA_PENYEMBELIHAN');
  const [checklistPra, setChecklistPra] = useState([]);
  const [checklistPasca, setChecklistPasca] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    pertanyaan: '',
    tipe: 'PRA_PENYEMBELIHAN',
    kategori: '',
    urutan: 0,
  });

  // Fetch checklist items
  const loadChecklist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/checklist-halal`, { headers });
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data || [];
        
        setChecklistPra(items.filter(item => item.tipe === 'PRA_PENYEMBELIHAN'));
        setChecklistPasca(items.filter(item => item.tipe === 'PASCA_PENYEMBELIHAN'));
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  // Handle form submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pertanyaan.trim()) {
      alert('Pertanyaan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const payload = {
        ...formData,
        tipe: tab, // Sesuaikan dengan tab aktif
        urutan: parseInt(formData.urutan) || 0,
      };

      let res;
      if (editingId) {
        // Update
        res = await fetch(`${API_BASE}/transaksiPenyembelihan/checklist-halal/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch(`${API_BASE}/transaksiPenyembelihan/checklist-halal`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan checklist');
      }

      alert(editingId ? 'Checklist berhasil diupdate!' : 'Checklist berhasil ditambahkan!');
      closeForm();
      await loadChecklist();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setFormData({
      pertanyaan: item.pertanyaan,
      tipe: item.tipe,
      kategori: item.kategori || '',
      urutan: item.urutan,
    });
    setEditingId(item.id);
    setShowForm(true);
    setTab(item.tipe);
  };

  // Handle delete (soft delete)
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan checklist ini?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(`${API_BASE}/transaksiPenyembelihan/checklist-halal/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus checklist');
      }

      alert('Checklist berhasil dinonaktifkan!');
      await loadChecklist();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pertanyaan: '',
      tipe: tab,
      kategori: '',
      urutan: 0,
    });
    setEditingId(null);
    // TIDAK set showForm di sini, biarkan diatur oleh button/cancel
  };

  // Close form and reset
  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <DashboardLayout title="Checklist Halal Penyembelihan" role="REGULATOR" customSidebar={<RegulatorSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-white"></i>
                </div>
                Kelola Checklist Halal
              </h2>
              <p className="text-sm text-gray-600 mt-2 ml-13">
                Checklist ini akan digunakan RPH untuk memverifikasi proses penyembelihan halal sesuai standar syariah
              </p>
            </div>
            <button
              onClick={() => {
                console.log('Button clicked! Current showForm:', showForm);
                const newState = !showForm;
                setShowForm(newState);
                if (newState) {
                  // Saat membuka form, reset data
                  resetForm();
                }
                console.log('showForm akan menjadi:', newState);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>
              {showForm ? 'Tutup Form' : 'Tambah Checklist'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-6 border-2 border-green-500">
              <ChecklistForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={closeForm}
                loading={loading}
                editingId={editingId}
                currentTab={tab}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setTab('PRA_PENYEMBELIHAN')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
                tab === 'PRA_PENYEMBELIHAN'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-clipboard-list mr-2"></i>
              Pra-Penyembelihan ({checklistPra.length})
            </button>
            <button
              onClick={() => setTab('PASCA_PENYEMBELIHAN')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
                tab === 'PASCA_PENYEMBELIHAN'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-clipboard-check mr-2"></i>
              Pasca-Penyembelihan ({checklistPasca.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <ChecklistTable
            items={tab === 'PRA_PENYEMBELIHAN' ? checklistPra : checklistPasca}
            tipe={tab}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>

        {/* Info Cards */}
        <ChecklistInfoCard />
      </div>
    </DashboardLayout>
  );
};

export default RegulatorChecklist;
