import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';

export default function AdminPanelPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
