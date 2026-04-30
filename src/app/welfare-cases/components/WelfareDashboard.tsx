'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Banknote,
  Users,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { WelfareCase, CaseType, CaseStatus, MOCK_WELFARE_CASES } from './welfareData';
import WelfareCaseCard, { CASE_TYPE_CONFIG, CASE_STATUS_CONFIG } from './WelfareCaseCard';
import WelfareCaseModal from './WelfareCaseModal';
import NewCaseModal from './NewCaseModal';

function transformWelfareCase(apiCase: any): WelfareCase {
  console.log('Transforming case:', apiCase);

  return {
    id: apiCase.id,
    caseNumber: apiCase.caseNumber,
    type: apiCase.type.toLowerCase() as CaseType,
    status: apiCase.status.toLowerCase() as CaseStatus,
    memberId: apiCase.memberId,
    memberName: apiCase.member
      ? `${apiCase.member.firstName} ${apiCase.member.lastName}`
      : 'Unknown',
    memberPayroll: apiCase.member ? apiCase.member.payrollNumber : 'N/A',
    ministry: apiCase.member ? apiCase.member.ministry : 'N/A',
    title: apiCase.title,
    description: apiCase.description,
    amountRequested: Number(apiCase.amountRequested),
    amountApproved: Number(apiCase.amountApproved),
    createdAt: new Date(apiCase.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    updatedAt: new Date(apiCase.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    committeeDecisions: (apiCase.committeeDecisions || []).map((d: any) => ({
      id: d.id,
      memberName: d.member ? `${d.member.firstName} ${d.member.lastName}` : 'Unknown',
      role: d.role || 'Unknown',
      decision: d.decision ? d.decision.toLowerCase() : 'pending',
      comment: d.comment || '',
      decidedAt: d.decidedAt
        ? new Date(d.decidedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'N/A',
    })),
    disbursements: (apiCase.disbursements || []).map((d: any) => ({
      id: d.id,
      amount: Number(d.amount),
      method: d.method,
      reference: d.reference,
      disbursedAt: new Date(d.disbursedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      disbursedBy: d.member ? `${d.member.firstName} ${d.member.lastName}` : 'Unknown',
    })),
    contributions: (apiCase.contributions || []).map((c: any) => ({
      id: c.id,
      memberId: c.contribution ? c.contribution.memberId : 'N/A',
      memberName:
        c.contribution && c.contribution.member
          ? `${c.contribution.member.firstName} ${c.contribution.member.lastName}`
          : 'Unknown',
      amount: Number(c.contribution?.amount || 0),
      contributedAt: new Date(c.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      method: c.contribution?.paymentMethod || 'N/A',
    })),
    supportingDocs: apiCase.supportingDocs
      ? Array.isArray(apiCase.supportingDocs)
        ? apiCase.supportingDocs
        : Object.keys(apiCase.supportingDocs || {})
      : [],
  };
}

const TYPE_FILTERS: { value: '' | CaseType; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'medical', label: 'Medical' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'emergency', label: 'Emergency' },
];

const STATUS_FILTERS: { value: '' | CaseStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'disbursed', label: 'Disbursed' },
];

export default function WelfareDashboard() {
  const [cases, setCases] = useState<WelfareCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | CaseType>('');
  const [statusFilter, setStatusFilter] = useState<'' | CaseStatus>('');
  const [selectedCase, setSelectedCase] = useState<WelfareCase | null>(null);
  const [showNewCase, setShowNewCase] = useState(false);

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch('/api/welfare-cases');
        const data = await response.json();
        if (data.cases) {
          const transformed = data.cases.map(transformWelfareCase);
          setCases(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch welfare cases:', error);
        setCases(MOCK_WELFARE_CASES);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  const filtered = useMemo(() => {
    let data = [...cases];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.memberName.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.ministry.toLowerCase().includes(q)
      );
    }
    if (typeFilter) data = data.filter((c) => c.type === typeFilter);
    if (statusFilter) data = data.filter((c) => c.status === statusFilter);
    return data;
  }, [cases, search, typeFilter, statusFilter]);

  const kpis = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter(
      (c) => c.status === 'pending' || c.status === 'under_review'
    ).length;
    const approved = cases.filter(
      (c) => c.status === 'approved' || c.status === 'disbursed'
    ).length;
    const totalDisbursed = cases.reduce(
      (s, c) => s + c.disbursements.reduce((ds, d) => ds + d.amount, 0),
      0
    );
    const totalContributions = cases.reduce(
      (s, c) => s + c.contributions.reduce((cs, con) => cs + con.amount, 0),
      0
    );
    return { total, pending, approved, totalDisbursed, totalContributions };
  }, [cases]);

  const handleUpdate = (updated: WelfareCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCase(updated);
  };

  const handleCreate = async (newCase: any) => {
    console.log('handleCreate called with:', newCase);

    try {
      const response = await fetch('/api/welfare-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      console.log('Fetch response received:', response.status, response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.status >= 200 && response.status < 300) {
        const caseData = data.case || data;
        console.log('Case data to transform:', caseData);

        const transformed = transformWelfareCase(caseData);
        console.log('Transformed case:', transformed);

        setCases((prev) => [transformed, ...prev]);
        setShowNewCase(false);
        toast.success('Welfare case created successfully!');
      } else {
        console.error('Response status error:', response.status);
        toast.error(data.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Failed to create case (caught):', error);
      toast.error(
        `Failed to create case: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welfare Cases</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage support requests, approvals, and disbursements
          </p>
        </div>
        <button
          onClick={() => setShowNewCase(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus size={16} />
          New Case
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{kpis.total}</p>
              <p className="text-xs text-muted-foreground">Total Cases</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={17} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-700">{kpis.pending}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-700">{kpis.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <Banknote size={17} className="text-teal-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-teal-700">
                Ksh {(kpis.totalDisbursed / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Disbursed</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp size={17} className="text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-700">
                Ksh {(kpis.totalContributions / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground">Contributions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl px-5 py-4 shadow-card mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by member, case no., title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as '' | CaseType)}
              className="text-sm bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {TYPE_FILTERS.map((f) => (
                <option key={f.value || 'all-types'} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as '' | CaseStatus)}
              className="text-sm bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value || 'all-statuses'} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} case{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center shadow-card">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">Loading welfare cases...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center shadow-card">
          <Search size={36} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">No cases match your filters</p>
          <button
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setStatusFilter('');
            }}
            className="mt-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <WelfareCaseCard key={c.id} welfareCase={c} onView={setSelectedCase} />
          ))}
        </div>
      )}

      {/* Modals */}
      <WelfareCaseModal
        welfareCase={selectedCase}
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdate={handleUpdate}
      />
      <NewCaseModal
        isOpen={showNewCase}
        onClose={() => setShowNewCase(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
