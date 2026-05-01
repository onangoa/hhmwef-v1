'use client';

import React, { useState, useEffect } from 'react';
import MemberLayout from '@/components/MemberLayout';
import { getUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  CreditCard,
  Calendar,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ContributionsPage() {
  const user = getUser();
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'MPESA',
    mpesaConfirmation: '',
    reference: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      if (user?.member?.id) {
        const response = await fetch(`/api/contributions?memberId=${user.member.id}&limit=10000`);
        if (response.ok) {
          const data = await response.json();
          setContributions(data.contributions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast.error('Failed to fetch contributions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.member?.id) return;

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          memberId: user.member.id,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        toast.success('Contribution submitted successfully');
        setShowAddModal(false);
        setFormData({
          amount: '',
          paymentMethod: 'MPESA',
          mpesaConfirmation: '',
          reference: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
        fetchContributions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit contribution');
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      toast.error('Failed to submit contribution');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contribution?')) return;

    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Contribution deleted successfully');
        fetchContributions();
      } else {
        toast.error('Failed to delete contribution');
      }
    } catch (error) {
      console.error('Error deleting contribution:', error);
      toast.error('Failed to delete contribution');
    }
  };

  const handleEditContribution = async (contribution: any) => {
    setSelectedContribution(contribution);
    setFormData({
      amount: contribution.amount.toString(),
      paymentMethod: contribution.paymentMethod,
      mpesaConfirmation: contribution.mpesaConfirmation || '',
      reference: contribution.reference || '',
      month: contribution.month,
      year: contribution.year,
    });
    setShowEditModal(true);
  };

  const handleUpdateContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedContribution) return;

      const response = await fetch(`/api/contributions/${selectedContribution.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        toast.success('Contribution updated successfully');
        setShowEditModal(false);
        setSelectedContribution(null);
        fetchContributions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update contribution');
      }
    } catch (error) {
      console.error('Error updating contribution:', error);
      toast.error('Failed to update contribution');
    }
  };

  const handleViewContribution = async (id: string) => {
    try {
      const response = await fetch(`/api/contributions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedContribution(data);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to fetch contribution details');
      }
    } catch (error) {
      console.error('Error fetching contribution details:', error);
      toast.error('Failed to fetch contribution details');
    }
  };

  const filteredContributions = contributions.filter((c) => {
    const matchesSearch =
      c.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.year}/${String(c.month).padStart(2, '0')}`.includes(searchTerm);
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTotalContributions = () => {
    return contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  };

  const getPendingAmount = () => {
    return contributions
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);
  };

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <MemberLayout>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View and manage your contribution history
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
          >
            <Plus size={16} />
            Add Contribution
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Total Contributions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KES {getTotalContributions().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Pending Verification
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KES {getPendingAmount().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Total Payments
                </p>
                <p className="text-2xl font-bold text-foreground">{contributions.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search contributions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="RECONCILED">Reconciled</option>
              </select>
            </div>
            <button
              onClick={fetchContributions}
              className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition-all"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Month/Year
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reference
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Payment Method
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={48} className="text-gray-300" />
                        <p className="text-sm text-muted-foreground">No contributions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((contribution) => (
                    <tr
                      key={contribution.id}
                      className="border-b border-border hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {getMonthName(contribution.month)} {contribution.year}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {contribution.reference || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-foreground">
                          KES {parseFloat(contribution.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {contribution.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={contribution.status.toLowerCase()} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(contribution.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewContribution(contribution.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {contribution.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleEditContribution(contribution)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit contribution"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteContribution(contribution.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete contribution"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Add Contribution</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddContribution} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Month
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Reference / Transaction Code
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                {formData.paymentMethod === 'MPESA' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      M-Pesa Confirmation Code
                    </label>
                    <input
                      type="text"
                      value={formData.mpesaConfirmation}
                      onChange={(e) =>
                        setFormData({ ...formData, mpesaConfirmation: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && selectedContribution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Contribution Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Month/Year</p>
                    <p className="text-sm font-semibold text-foreground">
                      {getMonthName(selectedContribution.month)} {selectedContribution.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-sm font-semibold text-foreground">
                      KES {parseFloat(selectedContribution.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reference</p>
                    <p className="text-sm text-foreground">
                      {selectedContribution.reference || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="text-sm text-foreground">{selectedContribution.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <StatusBadge status={selectedContribution.status.toLowerCase()} size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="text-sm text-foreground">
                      {new Date(selectedContribution.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                {selectedContribution.mpesaConfirmation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-900 font-semibold mb-2">M-Pesa Confirmation</p>
                    <p className="text-sm text-blue-800 font-mono">
                      {selectedContribution.mpesaConfirmation}
                    </p>
                  </div>
                )}
                {selectedContribution.verifiedBy && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-900 font-semibold mb-2">Verified By</p>
                    <p className="text-sm text-green-800">{selectedContribution.verifiedBy}</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                >
                  Close
                </button>
                </div>
              </div>
            </div>
        )}

        {showEditModal && selectedContribution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Edit Contribution</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContribution(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateContribution} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Month
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Reference / Transaction Code
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                {formData.paymentMethod === 'MPESA' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      M-Pesa Confirmation Code
                    </label>
                    <input
                      type="text"
                      value={formData.mpesaConfirmation}
                      onChange={(e) =>
                        setFormData({ ...formData, mpesaConfirmation: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedContribution(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
