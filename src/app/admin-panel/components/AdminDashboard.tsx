'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import AdminKpiCards from './AdminKpiCards';
import RegistrationTrendChart from './RegistrationTrendChart';
import RegistrationsByMinistryChart from './RegistrationsByMinistryChart';
import MemberStatusPieChart from './MemberStatusPieChart';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Membership Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of all member registrations and payment verifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-white border border-border px-3 py-1.5 rounded-lg shadow-card">
            <Calendar size={13} />
            <span>
              Last updated:{' '}
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        <AdminKpiCards stats={stats} loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <RegistrationTrendChart stats={stats} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <MemberStatusPieChart stats={stats} />
        </div>
      </div>

      {/* Ministry bar chart full width */}
      <div className="mb-6">
        <RegistrationsByMinistryChart stats={stats} />
      </div>
    </div>
  );
}
