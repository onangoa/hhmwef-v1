'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import ContributionDetailModal from './ContributionDetailModal';
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

interface ContributionsTableProps {
  contributions: Contribution[];
  loading: boolean;
  onRefresh: () => void;
}

type SortField = 'amount' | 'month' | 'year' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-green-100 text-green-700',
  RECONCILED: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  RECONCILED: 'Reconciled',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function ContributionsTable({
  contributions,
  loading,
  onRefresh,
}: ContributionsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const user = getUser();

  const filtered = useMemo(() => {
    let data = [...contributions];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.member.firstName.toLowerCase().includes(q) ||
          c.member.lastName.toLowerCase().includes(q) ||
          c.member.payrollNumber.toLowerCase().includes(q) ||
          c.reference?.toLowerCase().includes(q) ||
          c.mpesaConfirmation?.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return data;
  }, [contributions, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedRows.length === paginated.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginated.map((c) => c.id));
    }
  };

  const handleVerify = async (contributionId: string, arrears: number = 0, penalty: number = 0) => {
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/contributions/${contributionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: user?.email || 'admin',
          arrears,
          penalty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify contribution');
      }

      toast.success('Contribution verified successfully');
      onRefresh();
    } catch (error) {
      console.error('Error verifying contribution:', error);
      toast.error('Failed to verify contribution');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedRows.length === 0) return;

    try {
      setIsVerifying(true);
      await Promise.all(
        selectedRows.map((id) =>
          fetch(`/api/contributions/${id}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verifiedBy: user?.email || 'admin',
            }),
          })
        )
      );
      toast.success(`${selectedRows.length} contributions verified successfully`);
      setSelectedRows([]);
      onRefresh();
    } catch (error) {
      console.error('Error bulk verifying contributions:', error);
      toast.error('Failed to verify some contributions');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-blue-600" />
    ) : (
      <ChevronDown size={12} className="text-blue-600" />
    );
  };

  const thClass =
    'px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-foreground select-none';

  const handleExportExcel = () => {
    try {
      const exportData = filtered.map((c) => ({
        'Amount': c.amount,
        'Payment Method': c.paymentMethod,
        'M-Pesa Confirmation': c.mpesaConfirmation || 'N/A',
        'Reference': c.reference || 'N/A',
        'Month': c.month,
        'Year': c.year,
        'Status': STATUS_LABELS[c.status],
        'Arrears': c.arrears,
        'Penalty': c.penalty,
        'Verified By': c.verifiedBy || 'N/A',
        'Verified At': c.verifiedAt ? formatDate(c.verifiedAt) : 'N/A',
        'Created At': formatDate(c.createdAt),
        'Member Name': `${c.member.firstName} ${c.member.lastName}`,
        'Payroll Number': c.member.payrollNumber,
        'Ministry': c.member.ministry,
        'Email': c.member.email || 'N/A',
        'Phone': c.member.phoneNumber || 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');

      XLSX.writeFile(workbook, 'contributions_export.xlsx');
      toast.success('Contributions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export contributions');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">All Contributions</h3>
            <p className="text-xs text-muted-foreground">
              {filtered.length} contribution{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export contributions to Excel file"
            >
              <Download size={13} />
              <span>Export to Excel</span>
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by member name, payroll, reference..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-4 animate-slide-up">
          <span className="text-sm font-semibold text-blue-800">
            {selectedRows.length} contribution{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkVerify}
              disabled={
                isVerifying ||
                selectedRows.some(
                  (id) => contributions.find((c) => c.id === id)?.status !== 'PENDING'
                )
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={12} />
              Bulk Verify
            </button>
          </div>
          <button
            onClick={() => setSelectedRows([])}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                />
              </th>
              <th className={thClass} onClick={() => toggleSort('amount')}>
                <div className="flex items-center gap-1">
                  Amount <SortIcon field="amount" />
                </div>
              </th>
              <th className={thClass} onClick={() => toggleSort('month')}>
                <div className="flex items-center gap-1">
                  Period <SortIcon field="month" />
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Member
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Payment Method
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Reference
              </th>
              <th className={thClass} onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">
                  Status <SortIcon field="status" />
                </div>
              </th>
              <th className={thClass} onClick={() => toggleSort('createdAt')}>
                <div className="flex items-center gap-1">
                  Date <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Loading contributions...
                    </p>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No contributions match your filters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search terms or clearing the filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((contribution) => (
                <tr
                  key={contribution.id}
                  className={`hover:bg-blue-50/30 transition-colors group ${
                    selectedRows.includes(contribution.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(contribution.id)}
                      onChange={() => toggleRow(contribution.id)}
                      className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-semibold text-foreground">
                      KES {contribution.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-foreground">
                      {new Date(contribution.year, contribution.month - 1).toLocaleDateString(
                        'en-GB',
                        { month: 'short', year: 'numeric' }
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {contribution.member.firstName} {contribution.member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contribution.member.payrollNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-foreground">{contribution.paymentMethod}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {contribution.mpesaConfirmation || contribution.reference || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[contribution.status]}`}
                    >
                      {STATUS_LABELS[contribution.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(contribution.createdAt)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedContribution(contribution)}
                        title="View contribution details"
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      {contribution.status === 'PENDING' && (
                        <button
                          onClick={() => handleVerify(contribution.id)}
                          title="Verify contribution"
                          disabled={isVerifying}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isVerifying ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm bg-muted border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={`ps-${s}`} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span>
            of <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
            contributions
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 text-sm font-semibold rounded-lg transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="text-muted-foreground text-sm px-1">...</span>}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectedContribution && (
        <ContributionDetailModal
          contribution={selectedContribution}
          isOpen={!!selectedContribution}
          onClose={() => setSelectedContribution(null)}
          onVerify={handleVerify}
          isVerifying={isVerifying}
        />
      )}
    </div>
  );
}
