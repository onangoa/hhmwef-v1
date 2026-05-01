'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ContributionsTable from './ContributionsTable';
import AddContributionModal from './AddContributionModal';
import { getUser } from '@/lib/auth-client';

interface Contribution {
  id: string;
  amount: number;
  paymentMethod: string;
  mpesaConfirmation: string | null;
  reference: string | null;
  month: number;
  year: number;
  status: 'PENDING' | 'VERIFIED' | 'RECONCILED';
  arrears: number;
  penalty: number;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  member: {
    firstName: string;
    lastName: string;
    payrollNumber: string;
    ministry: string;
    email?: string;
    phoneNumber?: string;
  };
}

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '10000');

      const response = await fetch(`/api/contributions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContributions(data.contributions || []);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter]);

  const handleContributionAdded = () => {
    setIsAddModalOpen(false);
    fetchContributions();
  };

  const user = getUser();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Contributions Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, verify, and manage member contributions
          </p>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="RECONCILED">Reconciled</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Contribution
          </button>
        </div>

        <ContributionsTable
          contributions={contributions}
          loading={loading}
          onRefresh={fetchContributions}
        />

        {isAddModalOpen && (
          <AddContributionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onContributionAdded={handleContributionAdded}
            adminEmail={user?.email || 'admin'}
          />
        )}
      </div>
    </AdminLayout>
  );
}
