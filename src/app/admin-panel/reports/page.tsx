'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  HeartHandshake,
  Calendar,
  Loader2,
  Filter,
  User,
} from 'lucide-react';
import ExportButton from '@/components/ui/ExportButton';
import StatusBadge from '@/components/ui/StatusBadge';

type ReportType = 'overview' | 'contributions' | 'welfare';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [year, setYear] = useState(new Date().getFullYear());
  const [memberId, setMemberId] = useState('all');
  const [contributionStatus, setContributionStatus] = useState('all');
  const [welfareStatus, setWelfareStatus] = useState('all');
  const [welfareType, setWelfareType] = useState('all');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [year, activeReport, memberId, contributionStatus, welfareStatus, welfareType]);

  const getStatusBadgeType = (status: string): any => {
    if (!status) return 'draft';
    const s = status.toLowerCase();
    if (['active', 'pending', 'verified', 'rejected', 'submitted', 'payment_pending', 'payment_verified'].includes(s)) {
      return s;
    }
    if (s === 'approved') return 'active';
    if (s === 'under_review') return 'pending';
    if (s === 'disbursed') return 'active';
    if (s === 'reconciled') return 'verified';
    return 'draft';
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch('/api/members?limit=1000');
      if (response.ok) {
        const result = await response.json();
        setMembers(result.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: year.toString(),
        memberId,
        contributionStatus,
        welfareStatus,
        welfareType,
      });
      const response = await fetch(`/api/reports/analytics?${params.toString()}`);
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const reportTabs = [
    { id: 'overview' as ReportType, label: 'Overview', icon: BarChart3 },
    { id: 'contributions' as ReportType, label: 'Contributions', icon: Wallet },
    { id: 'welfare' as ReportType, label: 'Welfare Cases', icon: HeartHandshake },
  ];

  const getContributionExportData = () => {
    if (!data?.contributions?.details) return { excel: [], pdf: [] };
    const excel = data.contributions.details.map((c: any) => ({
      Date: new Date(c.createdAt).toLocaleDateString(),
      Member: `${c.member.firstName} ${c.member.lastName}`,
      Amount: c.amount,
      Status: c.status,
      Month: c.month,
      Year: c.year,
    }));
    const pdf = data.contributions.details.map((c: any) => [
      new Date(c.createdAt).toLocaleDateString(),
      `${c.member.firstName} ${c.member.lastName}`,
      `KES ${Number(c.amount).toLocaleString()}`,
      c.status,
      `${c.month}/${c.year}`,
    ]);
    return { excel, pdf };
  };

  const getWelfareExportData = () => {
    if (!data?.welfareCases?.details) return { excel: [], pdf: [] };
    const excel = data.welfareCases.details.map((wc: any) => ({
      Date: new Date(wc.createdAt).toLocaleDateString(),
      Member: `${wc.member.firstName} ${wc.member.lastName}`,
      Type: wc.type,
      Status: wc.status,
      'Amount Requested': wc.amountRequested,
      'Amount Approved': wc.amountApproved,
    }));
    const pdf = data.welfareCases.details.map((wc: any) => [
      new Date(wc.createdAt).toLocaleDateString(),
      `${wc.member.firstName} ${wc.member.lastName}`,
      wc.type,
      wc.status,
      `KES ${Number(wc.amountRequested).toLocaleString()}`,
      `KES ${Number(wc.amountApproved).toLocaleString()}`,
    ]);
    return { excel, pdf };
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive insights into membership, contributions, and welfare
            </p>
          </div>
          
          <div className="flex gap-2">
            {activeReport === 'contributions' && data?.contributions?.details && (
              <ExportButton 
                data={getContributionExportData().excel}
                headers={['Date', 'Member', 'Amount', 'Status', 'Month/Year']}
                pdfData={getContributionExportData().pdf}
                fileName={`Contributions_Report_${year}`}
                title="Contributions Report"
              />
            )}
            {activeReport === 'welfare' && data?.welfareCases?.details && (
              <ExportButton 
                data={getWelfareExportData().excel}
                headers={['Date', 'Member', 'Type', 'Status', 'Requested', 'Approved']}
                pdfData={getWelfareExportData().pdf}
                fileName={`Welfare_Report_${year}`}
                title="Welfare Cases Report"
              />
            )}
          </div>
        </div>

        {/* Global Filters */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <label className="text-sm font-semibold text-foreground">Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/50"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <label className="text-sm font-semibold text-foreground">Member:</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/50 max-w-[200px]"
            >
              <option value="all">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          {activeReport === 'contributions' && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <label className="text-sm font-semibold text-foreground">Status:</label>
              <select
                value={contributionStatus}
                onChange={(e) => setContributionStatus(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/50"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="RECONCILED">Reconciled</option>
              </select>
            </div>
          )}

          {activeReport === 'welfare' && (
            <>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <label className="text-sm font-semibold text-foreground">Status:</label>
                <select
                  value={welfareStatus}
                  onChange={(e) => setWelfareStatus(e.target.value)}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/50"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DISBURSED">Disbursed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <label className="text-sm font-semibold text-foreground">Type:</label>
                <select
                  value={welfareType}
                  onChange={(e) => setWelfareType(e.target.value)}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/50"
                >
                  <option value="all">All Types</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="BEREAVEMENT">Bereavement</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeReport === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-border p-20 text-center">
            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Generating report data...</p>
          </div>
        ) : (
          <>
            {activeReport === 'overview' && data && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Members" 
                    value={data.members?.total || 0} 
                    icon={Users} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Active Members" 
                    value={data.members?.active || 0} 
                    icon={TrendingUp} 
                    color="green" 
                  />
                  <StatCard 
                    title="Total Contributions" 
                    value={`KES ${(data.contributions?.total || 0).toLocaleString()}`} 
                    icon={Wallet} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Pending Cases" 
                    value={data.welfareCases?.byStatus?.PENDING || 0} 
                    icon={HeartHandshake} 
                    color="pink" 
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Registrations This Year
                  </h3>
                  {data.registrations?.byMonth && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const count = data.registrations.byMonth[month - 1] || 0;
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return (
                          <div
                            key={month}
                            className={`p-4 rounded-xl border text-center transition-all ${
                              count > 0 ? 'border-blue-200 bg-blue-50/50' : 'border-border'
                            }`}
                          >
                            <span className="text-xs font-bold text-muted-foreground uppercase">{months[month - 1]}</span>
                            <p className={`text-xl font-bold mt-1 ${count > 0 ? 'text-blue-700' : 'text-foreground/40'}`}>
                              {count}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeReport === 'contributions' && data?.contributions && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                     <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Collected</p>
                      <p className="text-xl font-bold text-blue-700">
                        KES {(data.contributions.total || 0).toLocaleString()}
                      </p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                     <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Filtered Count</p>
                      <p className="text-xl font-bold text-foreground">
                        {data.contributions.details?.length || 0}
                      </p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                     <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Avg. Per Member</p>
                      <p className="text-xl font-bold text-green-600">
                        KES {(data.contributions.averagePerMember || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                   </div>
                 </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-lg">Detailed Contributions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Member</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Amount</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Month/Year</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.contributions.details?.map((c: any) => (
                          <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold">{c.member.firstName} {c.member.lastName}</p>
                            </td>
                             <td className="px-6 py-4 text-sm font-bold">KES {Number(c.amount).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{c.month}/{c.year}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={getStatusBadgeType(c.status)} />
                            </td>
                          </tr>
                        ))}
                        {(!data.contributions.details || data.contributions.details.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                              No contributions found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'welfare' && data?.welfareCases && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center">
                    <p className="text-sm font-bold text-amber-800 uppercase mb-1">Pending Cases</p>
                     <p className="text-xl font-bold text-amber-900">{data.welfareCases.byStatus.PENDING || 0}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
                    <p className="text-sm font-bold text-green-800 uppercase mb-1">Approved</p>
                     <p className="text-xl font-bold text-green-900">{data.welfareCases.byStatus.APPROVED || 0}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center">
                    <p className="text-sm font-bold text-blue-800 uppercase mb-1">Total Filtered</p>
                     <p className="text-xl font-bold text-blue-900">{data.welfareCases.details?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-bold text-foreground text-lg">Detailed Welfare Cases</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Member</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Type</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Requested</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Approved</th>
                          <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.welfareCases.details?.map((wc: any) => (
                          <tr key={wc.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{new Date(wc.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold">{wc.member.firstName} {wc.member.lastName}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">{wc.type}</td>
                            <td className="px-6 py-4 text-sm font-bold text-right">KES {Number(wc.amountRequested).toLocaleString()}</td>
                             <td className="px-6 py-4 text-sm font-bold text-right">KES {Number(wc.amountApproved).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={getStatusBadgeType(wc.status)} />
                            </td>
                          </tr>
                        ))}
                         {(!data.welfareCases.details || data.welfareCases.details.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                              No welfare cases found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colors: any = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${color}-500/20`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
