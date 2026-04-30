'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const STATUS_DATA = [
  { name: 'Active', value: 1089, color: '#22c55e' },
  { name: 'Pending', value: 23, color: '#f59e0b' },
  { name: 'Payment Pending', value: 104, color: '#3b82f6' },
  { name: 'Rejected', value: 31, color: '#ef4444' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload, data }: { active?: boolean; payload?: any; data: any[] }) {
  if (!active || !payload?.length) return null;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="font-semibold text-foreground">{payload[0].name}</p>
      </div>
      <p className="text-foreground font-bold tabular-nums">
        {payload[0].value.toLocaleString()} members
      </p>
      <p className="text-muted-foreground text-xs">
        {total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0}% of total
      </p>
    </div>
  );
}

export default function MemberStatusPieChart({ stats }: { stats: any }) {
  const chartData = stats?.statusData || STATUS_DATA;
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <PieIcon size={14} className="text-blue-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Member Status Distribution</h3>
          <p className="text-xs text-muted-foreground">Breakdown by current membership status</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry: any) => (
              <Cell key={`pie-cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip data={chartData} />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
