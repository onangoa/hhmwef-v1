'use client';

import React from 'react';
import {
  Users,
  ClipboardCheck,
  UserCheck,
  UserPlus,
  CreditCard,
  UserX,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  large?: boolean;
}

function KpiCard({ title, value, subtitle, icon: Icon, trend, variant, large }: KpiCardProps) {
  const variantStyles = {
    default: {
      card: 'bg-white border-border',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-foreground',
      title: 'text-muted-foreground',
    },
    success: {
      card: 'bg-white border-green-100',
      icon: 'bg-green-100 text-green-700',
      value: 'text-green-700',
      title: 'text-muted-foreground',
    },
    warning: {
      card: 'bg-amber-50 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-800',
      title: 'text-amber-700',
    },
    danger: {
      card: 'bg-red-50 border-red-200',
      icon: 'bg-red-100 text-red-700',
      value: 'text-red-700',
      title: 'text-red-600',
    },
    info: {
      card: 'bg-blue-50 border-blue-200',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-700',
      title: 'text-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-xl border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 ${styles.card}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.icon}`}>
          <Icon size={20} />
        </div>
        {variant === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <p
        className={`tabular-nums font-bold mb-0.5 ${styles.value} ${
          large ? 'text-4xl' : 'text-2xl'
        }`}
      >
        {value}
      </p>
      <p className={`text-xs font-semibold uppercase tracking-wide ${styles.title}`}>{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

interface AdminKpiCardsProps {
  stats: any;
  loading: boolean;
}

export default function AdminKpiCards({ stats, loading }: AdminKpiCardsProps) {
  const safeStats = {
    totalMembers: stats?.totalMembers ?? 0,
    activeMembers: stats?.activeMembers ?? 0,
    pendingVerifications: stats?.pendingVerifications ?? 0,
    paymentConfirmed: stats?.paymentConfirmed ?? 0,
    todayRegistrations: stats?.todayRegistrations ?? 0,
    rejected: stats?.rejected ?? 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {/* Hero card — Total Members */}
      <div className="sm:col-span-2 lg:col-span-1 2xl:col-span-1">
        <KpiCard
          title="Total Members"
          value={safeStats.totalMembers.toLocaleString()}
          subtitle="All registrations ever submitted"
          icon={Users}
          trend={{ value: '+8.3% this month', positive: true }}
          variant="default"
          large
        />
      </div>

      <KpiCard
        title="Active Members"
        value={safeStats.activeMembers.toLocaleString()}
        subtitle="Fully verified and activated"
        icon={UserCheck}
        trend={{ value: '+5.1% vs last month', positive: true }}
        variant="success"
      />

      <KpiCard
        title="Pending Verifications"
        value={safeStats.pendingVerifications}
        subtitle="Awaiting admin review — action required"
        icon={ClipboardCheck}
        trend={{ value: '+7 since yesterday', positive: false }}
        variant="warning"
      />

      <KpiCard
        title="Payment Confirmed"
        value={safeStats.paymentConfirmed.toLocaleString()}
        subtitle="M-Pesa payments verified"
        icon={CreditCard}
        trend={{ value: '+12 this week', positive: true }}
        variant="info"
      />

      <KpiCard
        title="Today's Registrations"
        value={safeStats.todayRegistrations}
        subtitle="New submissions today"
        icon={UserPlus}
        trend={{ value: '+3 vs yesterday', positive: true }}
        variant="default"
      />

      <KpiCard
        title="Rejected / Incomplete"
        value={safeStats.rejected}
        subtitle="Flagged for review or rejected"
        icon={UserX}
        variant="danger"
      />
    </div>
  );
}
