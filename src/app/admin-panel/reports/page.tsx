'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  HeartHandshake,
  Download,
  Calendar,
  RefreshCw,
  Loader2,
} from 'lucide-react';

type ReportType = 'overview' | 'contributions' | 'welfare';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [year, activeReport]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/analytics?year=${year}`);
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View comprehensive reports and analytics
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Year {year}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeReport === tab.id
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <Loader2 size={40} className="text-blue-600 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Loading reports...</p>
          </div>
        ) : (
          <>
            {activeReport === 'overview' && data && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-card p-6">
                    <div
                      className={`w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {data.members?.total || 0}
                      </p>
                      <p className="text-sm font-medium text-foreground">Total Members</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-card p-6">
                    <div
                      className={`w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3`}
                    >
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {data.members?.active || 0}
                      </p>
                      <p className="text-sm font-medium text-foreground">Active Members</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-card p-6">
                    <div
                      className={`w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Wallet size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        KES {(data.contributions?.total || 0).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-foreground">Total Contributions</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-card p-6">
                    <div
                      className={`w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-3`}
                    >
                      <HeartHandshake size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {data.welfareCases?.byStatus?.PENDING || 0}
                      </p>
                      <p className="text-sm font-medium text-foreground">Pending Cases</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Registrations This Year
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    New member registrations by month for {year}
                  </p>
                  {data.registrations?.byMonth && (
                    <div className="space-y-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const count = data.registrations.byMonth[month - 1] || 0;
                        const months = [
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec',
                        ];
                        return (
                          <div
                            key={month}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              count > 0 ? 'border-blue-200 bg-blue-50' : 'border-border'
                            }`}
                          >
                            <span className="text-sm font-medium">{months[month - 1]}</span>
                            <span
                              className={`text-lg font-bold ${count > 0 ? 'text-blue-900' : 'text-foreground'}`}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeReport === 'contributions' && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Contributions Report</h3>
                  <p className="text-sm text-muted-foreground">Year {year}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total collected:{' '}
                  <span className="font-bold text-foreground">
                    KES {(data.contributions?.total || 0).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Average per member:{' '}
                  <span className="font-bold text-foreground">
                    KES {(data.contributions?.averagePerMember || 0).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {activeReport === 'welfare' && data?.welfareCases && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Welfare Cases Report</h3>
                  <p className="text-sm text-muted-foreground">Year {year}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {data.welfareCases.byStatus.PENDING || 0}
                    </p>
                    <p className="text-xs text-yellow-700">Awaiting review</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-900">
                      {data.welfareCases.byStatus.APPROVED || 0}
                    </p>
                    <p className="text-xs text-green-700">Ready for disbursement</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900 font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-900">
                      {data.welfareCases.byStatus.REJECTED || 0}
                    </p>
                    <p className="text-xs text-red-700">Applications declined</p>
                  </div>
                </div>

                {data.welfareCases.byType && (
                  <div className="mt-6 border-t border-border pt-6">
                    <h3 className="text-base font-bold text-foreground mb-4">Cases by Type</h3>
                    <div className="space-y-3">
                      {Object.entries(data.welfareCases.byType).map(
                        ([type, info]: [string, any]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">{type}</p>
                              <p className="text-xs text-muted-foreground">
                                {info?.count || 0} cases
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-foreground">
                                KES {(Number(info?.amountRequested) || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-green-600">
                                KES {(Number(info?.amountApproved) || 0).toLocaleString()} approved
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
