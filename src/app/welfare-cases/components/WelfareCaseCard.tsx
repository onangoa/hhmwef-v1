'use client';

import React from 'react';
import {
  Heart,
  AlertTriangle,
  Cross,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { WelfareCase, CaseType, CaseStatus } from './welfareData';

interface WelfareCaseCardProps {
  welfareCase: WelfareCase;
  onView: (c: WelfareCase) => void;
}

export const CASE_TYPE_CONFIG: Record<
  CaseType,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  medical: { label: 'Medical', color: 'text-blue-700', bg: 'bg-blue-100', icon: Cross },
  bereavement: { label: 'Bereavement', color: 'text-purple-700', bg: 'bg-purple-100', icon: Heart },
  emergency: {
    label: 'Emergency',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: AlertTriangle,
  },
};

export const CASE_STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-700', bg: 'bg-blue-100', icon: Eye },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  disbursed: { label: 'Disbursed', color: 'text-teal-700', bg: 'bg-teal-100', icon: Banknote },
};

export default function WelfareCaseCard({ welfareCase, onView }: WelfareCaseCardProps) {
  const typeConfig = CASE_TYPE_CONFIG[welfareCase.type];
  const statusConfig = CASE_STATUS_CONFIG[welfareCase.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const approvedCount = welfareCase.committeeDecisions.filter(
    (d) => d.decision === 'approved'
  ).length;
  const totalDecisions = welfareCase.committeeDecisions.length;

  return (
    <div
      className="bg-white border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
      onClick={() => onView(welfareCase)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}
          >
            <TypeIcon size={18} className={typeConfig.color} />
          </div>
          <div>
            <p className="text-xs font-mono font-semibold text-muted-foreground">
              {welfareCase.caseNumber}
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {welfareCase.title}
            </p>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-muted-foreground/40 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
        />
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{welfareCase.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Member</p>
          <p className="text-sm font-semibold text-foreground">{welfareCase.memberName}</p>
          <p className="text-xs text-muted-foreground">
            {welfareCase.ministry.replace('Ministry of ', '')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Requested</p>
          <p className="text-base font-bold text-foreground">
            Ksh {welfareCase.amountRequested.toLocaleString()}
          </p>
          {welfareCase.amountApproved > 0 && (
            <p className="text-xs text-green-600 font-semibold">
              Approved: Ksh {welfareCase.amountApproved.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeConfig.bg} ${typeConfig.color}`}
          >
            <TypeIcon size={11} />
            {typeConfig.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
          >
            <StatusIcon size={11} />
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {totalDecisions > 0 && (
            <span>
              {approvedCount}/{totalDecisions} votes
            </span>
          )}
          <span>{welfareCase.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
