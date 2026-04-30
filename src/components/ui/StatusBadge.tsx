import React from 'react';

type StatusType =
  | 'active'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'draft'
  | 'submitted'
  | 'payment_pending'
  | 'payment_verified';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  verified: {
    label: 'Verified',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-50 text-gray-600 border border-gray-200',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  payment_pending: {
    label: 'Payment Pending',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  payment_verified: {
    label: 'Payment Verified',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      } ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}
