'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const MINISTRY_DATA = [
  { name: 'Finance', count: 187, short: 'Finance' },
  { name: 'Health', count: 234, short: 'Health' },
  { name: 'Education', count: 198, short: 'Education' },
  { name: 'Agriculture', count: 143, short: 'Agriculture' },
  { name: 'Interior', count: 112, short: 'Interior' },
  { name: 'Transport', count: 89, short: 'Transport' },
  { name: 'Energy', count: 76, short: 'Energy' },
  { name: 'ICT', count: 104, short: 'ICT' },
  { name: 'Labour', count: 68, short: 'Labour' },
  { name: 'Lands', count: 36, short: 'Lands' },
];

const BAR_COLORS = [
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#1e40af',
  '#1e3a8a',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal p-3 text-sm">
      <p className="font-semibold text-foreground">{payload[0].payload.name}</p>
      <p className="text-blue-700 font-bold tabular-nums">{payload[0].value} members</p>
    </div>
  );
}

export default function RegistrationsByMinistryChart() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <BarChart3 size={14} className="text-blue-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Members by Ministry</h3>
          <p className="text-xs text-muted-foreground">
            Distribution of registered members across ministries
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={MINISTRY_DATA}
          margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="short"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {MINISTRY_DATA.map((entry, index) => (
              <Cell key={`bar-cell-${entry.name}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
