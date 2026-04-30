'use client';

import React, { useState, useEffect } from 'react';
import MemberLayout from '@/components/MemberLayout';
import { getUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  FileText,
  HeartHandshake,
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  File,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react';

export default function WelfareCasesPage() {
  const user = getUser();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'MEDICAL',
    title: '',
    description: '',
    amountRequested: '',
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      if (user?.member?.id) {
        const response = await fetch(`/api/welfare-cases?memberId=${user.member.id}`);
        if (response.ok) {
          const data = await response.json();
          setCases(data.cases || []);
        }
      }
    } catch (error) {
      console.error('Error fetching welfare cases:', error);
      toast.error('Failed to fetch welfare cases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.member?.id) return;

      const response = await fetch('/api/welfare-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          memberId: user.member.id,
          amountRequested: parseFloat(formData.amountRequested),
        }),
      });

      if (response.ok) {
        toast.success('Welfare case submitted successfully');
        setShowAddModal(false);
        setFormData({
          type: 'MEDICAL',
          title: '',
          description: '',
          amountRequested: '',
        });
        fetchCases();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit welfare case');
      }
    } catch (error) {
      console.error('Error creating welfare case:', error);
      toast.error('Failed to submit welfare case');
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this welfare case?')) return;

    try {
      const response = await fetch(`/api/welfare-cases/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Welfare case deleted successfully');
        fetchCases();
      } else {
        toast.error('Failed to delete welfare case');
      }
    } catch (error) {
      console.error('Error deleting welfare case:', error);
      toast.error('Failed to delete welfare case');
    }
  };

  const handleEditCase = async (welfareCase: any) => {
    setSelectedCase(welfareCase);
    setFormData({
      type: welfareCase.type,
      title: welfareCase.title,
      description: welfareCase.description,
      amountRequested: welfareCase.amountRequested.toString(),
    });
    setShowEditModal(true);
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedCase) return;

      const response = await fetch(`/api/welfare-cases/${selectedCase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountRequested: parseFloat(formData.amountRequested),
        }),
      });

      if (response.ok) {
        toast.success('Welfare case updated successfully');
        setShowEditModal(false);
        setSelectedCase(null);
        fetchCases();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update welfare case');
      }
    } catch (error) {
      console.error('Error updating welfare case:', error);
      toast.error('Failed to update welfare case');
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} className="text-amber-600" />;
      case 'UNDER_REVIEW':
        return <Search size={16} className="text-blue-600" />;
      case 'APPROVED':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'DISBURSED':
        return <DollarSign size={16} className="text-green-700" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'DISBURSED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEDICAL':
        return <FileText size={16} className="text-blue-600" />;
      case 'BEREAVEMENT':
        return <HeartHandshake size={16} className="text-purple-600" />;
      case 'EMERGENCY':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTotalRequested = () => {
    return cases.reduce((sum, c) => sum + parseFloat(c.amountRequested), 0);
  };

  const getTotalApproved = () => {
    return cases
      .filter((c) => c.status === 'APPROVED' || c.status === 'DISBURSED')
      .reduce((sum, c) => sum + parseFloat(c.amountApproved || 0), 0);
  };

  const getDisbursedAmount = () => {
    return cases
      .filter((c) => c.status === 'DISBURSED')
      .reduce(
        (sum, c) =>
          sum + (c.disbursements?.reduce((ds: any, d: any) => ds + parseFloat(d.amount), 0) || 0),
        0
      );
  };

  return (
    <MemberLayout>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welfare Cases</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View and manage your welfare case applications
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
          >
            <Plus size={16} />
            New Case
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Total Requested
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KES {getTotalRequested().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Approved Amount
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KES {getTotalApproved().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Disbursed Amount
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KES {getDisbursedAmount().toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <HeartHandshake size={24} className="text-emerald-600" />
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
                placeholder="Search cases..."
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
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <button
              onClick={fetchCases}
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
                    Case Number
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Requested
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Approved
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
                    <td colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-sm text-muted-foreground">No welfare cases found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((welfareCase) => (
                    <tr
                      key={welfareCase.id}
                      className="border-b border-border hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">
                          {welfareCase.caseNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">
                          {welfareCase.title}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(welfareCase.type)}
                          <span className="text-sm text-foreground">{welfareCase.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-foreground">
                          KES {parseFloat(welfareCase.amountRequested).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-green-700">
                          KES {parseFloat(welfareCase.amountApproved || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(welfareCase.status)}`}
                        >
                          {getStatusIcon(welfareCase.status)}
                          <span className="text-xs font-semibold">{welfareCase.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(welfareCase.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {welfareCase.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleEditCase(welfareCase)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit case"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCase(welfareCase.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete case"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
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
                <h2 className="text-lg font-bold text-foreground">New Welfare Case</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleAddCase} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Case Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="MEDICAL">Medical</option>
                    <option value="BEREAVEMENT">Bereavement</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Brief title of the case"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[100px]"
                    placeholder="Describe the case in detail..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount Requested (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amountRequested}
                    onChange={(e) => setFormData({ ...formData, amountRequested: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Enter amount"
                  />
                </div>
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
                    Submit Case
                  </button>
                </div>
              </form>
              </div>
            </div>
        )}

        {showEditModal && selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Edit Welfare Case</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCase(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleUpdateCase} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Case Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="MEDICAL">Medical</option>
                    <option value="BEREAVEMENT">Bereavement</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Brief title of the case"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[100px]"
                    placeholder="Describe the case in detail..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Amount Requested (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amountRequested}
                    onChange={(e) => setFormData({ ...formData, amountRequested: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCase(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                  >
                    Update Case
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
