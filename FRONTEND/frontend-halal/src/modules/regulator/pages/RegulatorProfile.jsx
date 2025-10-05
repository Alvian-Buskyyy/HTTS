import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RegulatorSidebar from '../components/RegulatorSidebar';

const RegulatorProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <DashboardLayout role="REGULATOR" customSidebar={<RegulatorSidebar /> }>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Profil Regulator</h2>
        <div className="space-y-3 text-sm">
          <div><span className="text-gray-500">Username:</span> <span className="font-medium">{user.username || '-'}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user.email || '-'}</span></div>
          <div><span className="text-gray-500">Role:</span> <span className="font-medium">{user.role || 'REGULATOR'}</span></div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegulatorProfile;
