'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, Banknote, Users, FileText, Plus } from 'lucide-react';
import {
  WelfareCase,
  CommitteeDecision,
  ApprovalDecision,
  Disbursement,
  CaseType,
  CaseStatus,
} from './welfareData';
import { CASE_TYPE_CONFIG, CASE_STATUS_CONFIG } from './WelfareCaseCard';

function transformWelfareCase(apiCase: any): WelfareCase {
  return {
    id: apiCase.id,
    caseNumber: apiCase.caseNumber,
    type: apiCase.type.toLowerCase() as CaseType,
    status: apiCase.status.toLowerCase() as CaseStatus,
    memberId: apiCase.memberId,
    memberName: `${apiCase.member.firstName} ${apiCase.member.lastName}`,
    memberPayroll: apiCase.member.payrollNumber,
    ministry: apiCase.member.ministry,
    title: apiCase.title,
    description: apiCase.description,
    amountRequested: Number(apiCase.amountRequested),
    amountApproved: Number(apiCase.amountApproved),
    createdAt: new Date(apiCase.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    updatedAt: new Date(apiCase.updatedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    committeeDecisions: apiCase.committeeDecisions.map((d: any) => ({
      id: d.id,
      memberName: `${d.member.firstName} ${d.member.lastName}`,
      role: d.role,
      decision: d.decision as any,
      comment: d.comment || '',
      decidedAt: new Date(d.decidedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    })),
    disbursements: apiCase.disbursements.map((d: any) => ({
      id: d.id,
      amount: Number(d.amount),
      method: d.method,
      reference: d.reference,
      disbursedAt: new Date(d.disbursedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      disbursedBy: `${d.member.firstName} ${d.member.lastName}`,
    })),
    contributions: apiCase.contributions.map((c: any) => ({
      id: c.id,
      memberId: c.contribution.memberId,
      memberName: `${c.contribution.member.firstName} ${c.contribution.member.lastName}`,
      amount: Number(c.contribution.amount),
      contributedAt: new Date(c.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      method: c.contribution.paymentMethod,
    })),
    supportingDocs: apiCase.supportingDocs
      ? Array.isArray(apiCase.supportingDocs)
        ? apiCase.supportingDocs
        : Object.keys(apiCase.supportingDocs || {})
      : [],
  };
}

interface WelfareCaseModalProps {
  welfareCase: WelfareCase | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: WelfareCase) => void;
}

const TABS = ['Overview', 'Committee', 'Disbursement', 'Contributions', 'History'] as const;
type Tab = (typeof TABS)[number];

const DECISION_CONFIG: Record<
  ApprovalDecision,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  APPROVED: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  DEFERRED: { label: 'Deferred', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
};

export default function WelfareCaseModal({
  welfareCase,
  isOpen,
  onClose,
  onUpdate,
}: WelfareCaseModalProps) {
  const [activeTab, setActiveTab] = useState<TABS[0]>('Overview');
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [showAddDisbursement, setShowAddDisbursement] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);
  const [newDecision, setNewDecision] = useState({
    memberId: '', // This will now store the Member ID, not User ID
    role: '',
    decision: 'APPROVED' as ApprovalDecision,
    comment: '',
  });
  const [newDisbursement, setNewDisbursement] = useState({
    memberId: '',
    amount: '',
    method: 'BANK_TRANSFER',
    reference: '',
  });

  // Fetch committee members
  useEffect(() => {
    const fetchCommitteeMembers = async () => {
      try {
        const response = await fetch('/api/users/committee-members');
        if (response.ok) {
          const members = await response.json();
          setCommitteeMembers(members);
        }
      } catch (error) {
        console.error('Error fetching committee members:', error);
      }
    };

    if (isOpen) {
      fetchCommitteeMembers();
    }
  }, [isOpen]);

  if (!isOpen || !welfareCase) return null;

  const typeConfig = CASE_TYPE_CONFIG[welfareCase.type];
  const statusConfig = CASE_STATUS_CONFIG[welfareCase.status];
  const TypeIcon = typeConfig.icon;

  const totalContributions = welfareCase.contributions.reduce((s, c) => s + c.amount, 0);
  const totalDisbursed = welfareCase.disbursements.reduce((s, d) => s + d.amount, 0);

  const handleAddDecision = async () => {
    if (!newDecision.memberId || !newDecision.role) {
      alert('Please select both a committee member and role');
      return;
    }
    
    console.log('Sending decision data:', newDecision);
    
    try {
      const response = await fetch(`/api/welfare-cases/${welfareCase.id}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDecision),
      });
      
      if (response.ok) {
        const data = await response.json();
        const decision: CommitteeDecision = {
          id: data.decision.id,
          memberName: `${data.decision.member.firstName} ${data.decision.member.lastName}`,
          role: data.decision.role,
          decision: data.decision.decision as ApprovalDecision,
          comment: data.decision.comment || '',
          decidedAt: new Date(data.decision.decidedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        };
        const updatedCase = await fetch(`/api/welfare-cases/${welfareCase.id}`);
        const updatedData = await updatedCase.json();
        if (updatedData.case) {
          onUpdate(transformWelfareCase(updatedData.case));
        } else {
          onUpdate({
            ...welfareCase,
            committeeDecisions: [...welfareCase.committeeDecisions, decision],
          });
        }
        setNewDecision({ memberId: '', role: '', decision: 'APPROVED', comment: '' });
        setShowAddDecision(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record decision');
      }
    } catch (error) {
      console.error('Failed to record decision:', error);
      alert('Failed to record decision');
    }
  };

  const handleAddDisbursement = async () => {
    if (!newDisbursement.memberId || !newDisbursement.amount || !newDisbursement.reference) {
      alert('Please fill in all required fields (Disbursed By, Amount, and Reference)');
      return;
    }
    try {
      const response = await fetch(`/api/welfare-cases/${welfareCase.id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDisbursement,
          amount: Number(newDisbursement.amount)
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const updatedCase = await fetch(`/api/welfare-cases/${welfareCase.id}`);
        const updatedData = await updatedCase.json();
        if (updatedData.case) {
          onUpdate(transformWelfareCase(updatedData.case));
        } else {
          const disbursement: Disbursement = {
            id: data.disbursement.id,
            amount: Number(data.disbursement.amount),
            method: data.disbursement.method,
            reference: data.disbursement.reference,
            disbursedAt: new Date(data.disbursement.disbursedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            disbursedBy: `${data.disbursement.member.firstName} ${data.disbursement.member.lastName}`,
          };
          onUpdate({
            ...welfareCase,
            disbursements: [...welfareCase.disbursements, disbursement],
            status: 'disbursed',
            updatedAt: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          });
        }
        setNewDisbursement({ memberId: '', amount: '', method: 'BANK_TRANSFER', reference: '' });
        setShowAddDisbursement(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record disbursement');
      }
    } catch (error) {
      console.error('Failed to record disbursement:', error);
      alert('Failed to record disbursement');
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}
            >
              <TypeIcon size={20} className={typeConfig.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  {welfareCase.caseNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                >
                  {welfareCase.status === 'disbursed' ? (
                    <Banknote size={10} />
                  ) : welfareCase.status === 'approved' ? (
                    <CheckCircle2 size={10} />
                  ) : welfareCase.status === 'rejected' ? (
                    <XCircle size={10} />
                  ) : (
                    <Clock size={10} />
                  )}
                  {statusConfig.label}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground leading-tight">
                {welfareCase.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 flex-shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Member</p>
                  <p className="text-sm font-semibold text-foreground">{welfareCase.memberName}</p>
                  <p className="text-xs text-muted-foreground">{welfareCase.memberPayroll}</p>
                  <p className="text-xs text-muted-foreground">
                    {welfareCase.ministry.replace('Ministry of ', '')}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Case Type</p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeConfig.bg} ${typeConfig.color}`}
                  >
                    <TypeIcon size={11} /> {typeConfig.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">
                    Filed: {welfareCase.createdAt}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated: {welfareCase.updatedAt}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-xl p-4">
                  {welfareCase.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600 mb-1">Requested</p>
                  <p className="text-lg font-bold text-blue-800">
                    Ksh {welfareCase.amountRequested.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-green-600 mb-1">Approved</p>
                  <p className="text-lg font-bold text-green-800">
                    Ksh {welfareCase.amountApproved.toLocaleString()}
                  </p>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-teal-600 mb-1">Disbursed</p>
                  <p className="text-lg font-bold text-teal-800">
                    Ksh {totalDisbursed.toLocaleString()}
                  </p>
                </div>
              </div>

              {welfareCase.supportingDocs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Supporting Documents
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {welfareCase.supportingDocs.map((doc, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg"
                      >
                        <FileText size={12} /> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMMITTEE */}
          {activeTab === 'Committee' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  Committee Decisions ({welfareCase.committeeDecisions.length})
                </p>
                {welfareCase.status !== 'rejected' && welfareCase.status !== 'disbursed' && (
                  <button
                    onClick={() => setShowAddDecision(!showAddDecision)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={13} /> Add Decision
                  </button>
                )}
              </div>

              {showAddDecision && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-blue-800">Record Committee Decision</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Committee Member
                      </label>
                      <select
                        className={inputClass}
                        value={newDecision.memberId}
                        onChange={(e) =>
                          setNewDecision({ ...newDecision, memberId: e.target.value })
                        }
                      >
                        <option value="">Select a committee member</option>
                        {committeeMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} ({member.user?.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Role
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Chairperson"
                        value={newDecision.role}
                        onChange={(e) => setNewDecision({ ...newDecision, role: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Decision
                    </label>
                    <select
                      className={inputClass}
                      value={newDecision.decision}
                      onChange={(e) =>
                        setNewDecision({
                          ...newDecision,
                          decision: e.target.value as ApprovalDecision,
                        })
                      }
                    >
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="DEFERRED">Deferred</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Comment
                    </label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      placeholder="Add a comment..."
                      value={newDecision.comment}
                      onChange={(e) => setNewDecision({ ...newDecision, comment: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddDecision}
                      className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      Save Decision
                    </button>
                    <button
                      onClick={() => setShowAddDecision(false)}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {welfareCase.committeeDecisions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No committee decisions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {welfareCase.committeeDecisions.map((d) => {
                    const dc = DECISION_CONFIG[d.decision.toUpperCase() as ApprovalDecision];
                    const DIcon = dc.icon;
                    return (
                      <div key={d.id} className="bg-white border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{d.memberName}</p>
                            <p className="text-xs text-muted-foreground">{d.role}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${dc.bg} ${dc.color}`}
                            >
                              <DIcon size={11} /> {dc.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{d.decidedAt}</span>
                          </div>
                        </div>
                        {d.comment && (
                          <p className="text-xs text-muted-foreground mt-2 bg-muted/40 rounded-lg px-3 py-2 italic">
                            "{d.comment}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vote summary */}
              {welfareCase.committeeDecisions.length > 0 && (
                <div className="bg-muted/40 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                  {(['APPROVED', 'REJECTED', 'DEFERRED'] as ApprovalDecision[]).map((d) => {
                    const count = welfareCase.committeeDecisions.filter(
                      (cd) => cd.decision === d
                    ).length;
                    const dc = DECISION_CONFIG[d];
                    return (
                      <div key={d}>
                        <p className={`text-xl font-bold ${dc.color}`}>{count}</p>
                        <p className="text-xs text-muted-foreground">{dc.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DISBURSEMENT */}
          {activeTab === 'Disbursement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  Disbursements ({welfareCase.disbursements.length})
                </p>
                {(welfareCase.status === 'approved' || welfareCase.status === 'disbursed') && (
                  <button
                    onClick={() => setShowAddDisbursement(!showAddDisbursement)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={13} /> Record Disbursement
                  </button>
                )}
              </div>

              {showAddDisbursement && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-teal-800">Record Disbursement</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Disbursed By
                      </label>
                      <select
                        className={inputClass}
                        value={newDisbursement.memberId}
                        onChange={(e) =>
                          setNewDisbursement({ ...newDisbursement, memberId: e.target.value })
                        }
                      >
                        <option value="">Select a committee member</option>
                        {committeeMembers.map((member) => (
                          <option key={`disb-${member.id}`} value={member.id}>
                            {member.firstName} {member.lastName} ({member.user?.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Amount (Ksh)
                      </label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="e.g. 50000"
                        value={newDisbursement.amount}
                        onChange={(e) =>
                          setNewDisbursement({ ...newDisbursement, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Method
                      </label>
                      <select
                        className={inputClass}
                        value={newDisbursement.method}
                        onChange={(e) =>
                          setNewDisbursement({ ...newDisbursement, method: e.target.value })
                        }
                      >
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="MPESA">M-Pesa</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Reference / Receipt No.
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. TR-98234"
                        value={newDisbursement.reference}
                        onChange={(e) =>
                          setNewDisbursement({ ...newDisbursement, reference: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddDisbursement}
                      className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddDisbursement(false)}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {welfareCase.status === 'pending' || welfareCase.status === 'under_review' ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Disbursement available after case is approved</p>
                </div>
              ) : welfareCase.disbursements.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Banknote size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No disbursements recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {welfareCase.disbursements.map((d) => (
                    <div key={d.id} className="bg-white border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Banknote size={16} className="text-teal-600" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-foreground">
                              Ksh {d.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {d.method} · {d.reference}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{d.disbursedAt}</p>
                          <p className="text-xs text-muted-foreground">by {d.disbursedBy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-teal-800">Total Disbursed</p>
                    <p className="text-lg font-bold text-teal-800">
                      Ksh {totalDisbursed.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTRIBUTIONS */}
          {activeTab === 'Contributions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  Member Contributions ({welfareCase.contributions.length})
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-blue-600">Total Collected</p>
                  <p className="text-sm font-bold text-blue-800">
                    Ksh {totalContributions.toLocaleString()}
                  </p>
                </div>
              </div>

              {welfareCase.contributions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No contributions recorded yet</p>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Member
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {welfareCase.contributions.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-foreground">
                            {c.memberName}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-700">
                            Ksh {c.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{c.method}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {c.contributedAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {activeTab === 'History' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground mb-4">Case Timeline</p>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

                <div className="relative">
                  <div className="absolute -left-4 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                  <div className="bg-white border border-border rounded-xl p-3">
                    <p className="text-xs font-semibold text-foreground">Case Filed</p>
                    <p className="text-xs text-muted-foreground">
                      Case {welfareCase.caseNumber} submitted by {welfareCase.memberName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{welfareCase.createdAt}</p>
                  </div>
                </div>

                {welfareCase.committeeDecisions.map((d, i) => {
                  const dc = DECISION_CONFIG[d.decision.toUpperCase() as ApprovalDecision];
                  return (
                    <div key={d.id} className="relative">
                      <div
                        className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${d.decision === 'APPROVED' ? 'bg-green-500' : d.decision === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}
                      />
                      <div className="bg-white border border-border rounded-xl p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Committee Decision — <span className={dc.color}>{dc.label}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.memberName} ({d.role})
                        </p>
                        {d.comment && (
                          <p className="text-xs text-muted-foreground italic mt-1">"{d.comment}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{d.decidedAt}</p>
                      </div>
                    </div>
                  );
                })}

                {welfareCase.disbursements.map((d) => (
                  <div key={d.id} className="relative">
                    <div className="absolute -left-4 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-sm" />
                    <div className="bg-white border border-border rounded-xl p-3">
                      <p className="text-xs font-semibold text-foreground">Disbursement Made</p>
                      <p className="text-xs text-muted-foreground">
                        Ksh {d.amount.toLocaleString()} via {d.method} · Ref: {d.reference}
                      </p>
                      <p className="text-xs text-muted-foreground">by {d.disbursedBy}</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.disbursedAt}</p>
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <div
                    className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${statusConfig.bg.replace('bg-', 'bg-').replace('-100', '-400')}`}
                  />
                  <div className="bg-muted/40 border border-border rounded-xl p-3">
                    <p className="text-xs font-semibold text-foreground">
                      Current Status:{' '}
                      <span className={statusConfig.color}>{statusConfig.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {welfareCase.updatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
