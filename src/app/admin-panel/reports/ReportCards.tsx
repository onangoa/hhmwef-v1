'use client';

import React, { useState, useEffect } from 'react';
import { Users, Wallet, HeartHandshake, TrendingUp, Loader2 } from 'lucide-react';

interface ReportCardsProps {
  year: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function ReportCards({ year, loading, setLoading }: ReportCardsProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/analytics?year=${year}`);
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Members',
      value: data?.members?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: `${data?.members?.total || 0} registered`,
    },
    {
      title: 'Active Members',
      value: data?.members?.active || 0,
      icon: Users,
      color: 'bg-green-500',
      trend: 'Currently active',
    },
    {
      title: 'Pending Approvals',
      value: data?.members?.inactive || 0,
      icon: Users,
      color: 'bg-yellow-500',
      trend: 'Awaiting approval',
    },
    {
      title: 'Total Contributions',
      value: `KES ${(data?.contributions?.total || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'bg-purple-500',
      trend: `KES ${(data?.contributions?.averagePerMember || 0).toFixed(2)}/member avg`,
    },
    {
      title: 'Welfare Cases',
      value: data?.welfareCases?.byStatus?.PENDING || 0,
      icon: HeartHandshake,
      color: 'bg-pink-500',
      trend: `${data?.welfareCases?.byStatus?.APPROVED || 0} approved`,
    },
    {
      title: 'Monthly Registrations',
      value: data?.registrations?.byMonth?.reduce((a: number, b: number) => a + b, 0) || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: 'This year',
    },
  ];

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-card p-6 flex items-center justify-center min-h-[140px]"
          >
            <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon size={24} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
