'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  Copy,
  MoreVertical,
  Check,
  X,
  Search,
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  Ban,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/ui/StatusBadge';
import MemberDetailModal, { MemberRecord } from './MemberDetailModal';
import { getUser } from '@/lib/auth-client';

interface MembersTableProps {
  members: MemberRecord[];
  loading: boolean;
  onRefresh: () => void;
}

type SortField = 'registrationNo' | 'firstName' | 'ministry' | 'status' | 'registeredAt';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const MINISTRY_OPTIONS = [
  { value: '', label: 'All Ministries' },
  { value: 'Ministry of Health', label: 'Health' },
  { value: 'Ministry of Education', label: 'Education' },
  { value: 'Ministry of Finance & Economic Planning', label: 'Finance' },
  { value: 'Ministry of Agriculture', label: 'Agriculture' },
  { value: 'Ministry of Interior & National Administration', label: 'Interior' },
  { value: 'Ministry of Transport & Infrastructure', label: 'Transport' },
  { value: 'Ministry of Energy & Petroleum', label: 'Energy' },
  { value: 'Ministry of ICT & Digital Economy', label: 'ICT' },
  { value: 'Ministry of Labour & Social Protection', label: 'Labour' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function MembersTable({ members, loading, onRefresh }: MembersTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [localMembers, setLocalMembers] = useState<MemberRecord[]>(members);
  const [isUpdating, setIsUpdating] = useState(false);
  const user = getUser();

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const filtered = useMemo(() => {
    let data = [...localMembers];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.idNumber.includes(q) ||
          m.registrationNo.toLowerCase().includes(q) ||
          m.payrollNumber.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((m) => m.status === statusFilter);
    if (ministryFilter) data = data.filter((m) => m.ministry === ministryFilter);

    data.sort((a, b) => {
      const aVal = a[sortField] as string;
      const bVal = b[sortField] as string;
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return data;
  }, [localMembers, search, statusFilter, ministryFilter, sortField, sortDir]);

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
      setSelectedRows(paginated.map((m) => m.id));
    }
  };

  const handleStatusChange = async (id: string, status: MemberRecord['status']) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/members/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: user?.email || 'admin',
          role: 'MEMBER',
        }),
      });

      if (status === 'rejected') {
        const patchResponse = await fetch(`/api/members/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberStatus: 'SUSPENDED' }),
        });
        if (!patchResponse.ok) throw new Error('Failed to update status');
      } else if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Member status updated successfully');
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update member status');
    } finally {
      setIsUpdating(false);
    }
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

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">All Members</h3>
            <p className="text-xs text-muted-foreground">
              {filtered.length} member{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-3 py-1.5 rounded-lg transition-all duration-150">
              <Download size={13} />
              Export
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by name, ID, payroll, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={`status-opt-${o.value}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={ministryFilter}
              onChange={(e) => {
                setMinistryFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {MINISTRY_OPTIONS.map((o) => (
                <option key={`ministry-opt-${o.value || 'all'}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-4 animate-slide-up">
          <span className="text-sm font-semibold text-blue-800">
            {selectedRows.length} member{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors">
              <CheckCircle2 size={12} />
              Bulk Verify
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
              <XCircle size={12} />
              Bulk Reject
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

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
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
              <th className={thClass} onClick={() => toggleSort('registrationNo')}>
                <div className="flex items-center gap-1">
                  Reg No. <SortIcon field="registrationNo" />
                </div>
              </th>
              <th className={thClass} onClick={() => toggleSort('firstName')}>
                <div className="flex items-center gap-1">
                  Member Name <SortIcon field="firstName" />
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                ID Number
              </th>
              <th className={thClass} onClick={() => toggleSort('ministry')}>
                <div className="flex items-center gap-1">
                  Ministry <SortIcon field="ministry" />
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Payroll No.
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Phone
              </th>
              <th className={thClass} onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">
                  Status <SortIcon field="status" />
                </div>
              </th>
              <th className={thClass} onClick={() => toggleSort('registeredAt')}>
                <div className="flex items-center gap-1">
                  Registered <SortIcon field="registeredAt" />
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
                <td colSpan={10} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Loading members...
                    </p>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No members match your filters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search terms or clearing the filters
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('');
                        setMinistryFilter('');
                      }}
                      className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((member) => (
                <tr
                  key={member.id}
                  className={`hover:bg-blue-50/30 transition-colors group ${
                    selectedRows.includes(member.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(member.id)}
                      onChange={() => toggleRow(member.id)}
                      className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {member.registrationNo}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {member.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-mono text-foreground">{member.idNumber}</span>
                  </td>
                  <td className="px-3 py-3">
                    <p
                      className="text-sm text-foreground truncate max-w-[160px]"
                      title={member.ministry}
                    >
                      {member.ministry.replace('Ministry of ', '')}
                    </p>
                    <p
                      className="text-xs text-muted-foreground truncate max-w-[160px]"
                      title={member.department}
                    >
                      {member.department.replace('State Dept. of ', '')}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-mono text-muted-foreground">
                      {member.payrollNumber}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-foreground">{member.phone}</span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {member.registeredAt}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedMember(member)}
                        title="View member details"
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <a
                        href={`/admin-panel/members/edit/${member.id}`}
                        title="Edit member details"
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </a>
                      {(member.status === 'pending' ||
                        member.status === 'submitted' ||
                        member.status === 'payment_pending') && (
                        <>
                          <button
                            onClick={() => handleStatusChange(member.id, 'active')}
                            title="Verify payment and activate member"
                            disabled={isUpdating}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusChange(member.id, 'rejected')}
                            title="Reject this registration"
                            disabled={isUpdating}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <XCircle size={15} />
                            )}
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

      {/* Pagination */}
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
            of <span className="font-semibold text-foreground">{filtered.length}</span> members
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

      {/* Member detail modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
