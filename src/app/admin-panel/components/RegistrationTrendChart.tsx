'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const WEEKLY_DATA = [
  { week: 'Week 1 Mar', registrations: 38, verified: 32 },
  { week: 'Week 2 Mar', registrations: 52, verified: 45 },
  { week: 'Week 3 Mar', registrations: 41, verified: 38 },
  { week: 'Week 4 Mar', registrations: 67, verified: 58 },
  { week: 'Week 1 Apr', registrations: 55, verified: 49 },
  { week: 'Week 2 Apr', registrations: 73, verified: 61 },
  { week: 'Week 3 Apr', registrations: 89, verified: 74 },
  { week: 'Week 4 Apr', registrations: 96, verified: 83 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-bold text-foreground tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegistrationTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp size={14} className="text-blue-700" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Registration Trend</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-9">
            Weekly new registrations vs. verified members — last 8 weeks
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-muted-foreground">Registrations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-muted-foreground">Verified</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRegistrations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="registrations"
            name="Registrations"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradRegistrations)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="verified"
            name="Verified"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradVerified)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
