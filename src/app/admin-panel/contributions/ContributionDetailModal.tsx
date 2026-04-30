'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  Calendar,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface Contribution {
  id: string;
  amount: number;
  paymentMethod: string;
  mpesaConfirmation: string | null;
  reference: string | null;
  month: number;
  year: number;
  status: 'PENDING' | 'VERIFIED' | 'RECONCILED';
  arrears: number;
  penalty: number;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  member: {
    firstName: string;
    lastName: string;
    payrollNumber: string;
    ministry: string;
    email?: string;
    phoneNumber?: string;
  };
}

interface ContributionDetailModalProps {
  contribution: Contribution;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string, arrears?: number, penalty?: number) => void;
  isVerifying: boolean;
}

export default function ContributionDetailModal({
  contribution,
  isOpen,
  onClose,
  onVerify,
  isVerifying,
}: ContributionDetailModalProps) {
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [arrears, setArrears] = useState(0);
  const [penalty, setPenalty] = useState(0);

  const handleVerify = () => {
    onVerify(contribution.id, arrears, penalty);
    setShowVerifyForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    VERIFIED: 'bg-green-100 text-green-700 border-green-200',
    RECONCILED: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const STATUS_LABELS = {
    PENDING: 'Pending Verification',
    VERIFIED: 'Verified',
    RECONCILED: 'Reconciled',
  };

  if (!isOpen) return null;

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contribution Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Review contribution information</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div
            className={`px-4 py-3 rounded-lg border ${STATUS_COLORS[contribution.status]} flex items-center justify-between`}
          >
            <span className="font-semibold">{STATUS_LABELS[contribution.status]}</span>
            {contribution.status === 'PENDING' && (
              <button
                onClick={() => setShowVerifyForm(!showVerifyForm)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-opacity-90 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle2 size={16} />
                Verify Now
              </button>
            )}
          </div>

          {showVerifyForm && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
              <h3 className="font-semibold text-blue-900">Verify Contribution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Arrears (KES)
                  </label>
                  <input
                    type="number"
                    value={arrears}
                    onChange={(e) => setArrears(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Penalty (KES)
                  </label>
                  <input
                    type="number"
                    value={penalty}
                    onChange={(e) => setPenalty(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyForm(false)}
                  className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Amount
                </label>
                <div className="text-2xl font-bold text-foreground">
                  KES {contribution.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Period
                </label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>
                    {months[contribution.month - 1]} {contribution.year}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Payment Method
                </label>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CreditCard size={16} className="text-muted-foreground" />
                  <span>{contribution.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Reference
                </label>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-muted-foreground" />
                  <span className="text-sm font-mono text-foreground">
                    {contribution.mpesaConfirmation || contribution.reference || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Submitted On
                </label>
                <div className="text-sm text-foreground">{formatDate(contribution.createdAt)}</div>
              </div>

              {contribution.verifiedAt && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Verified By
                  </label>
                  <div className="text-sm text-foreground">{contribution.verifiedBy}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(contribution.verifiedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(contribution.arrears > 0 || contribution.penalty > 0) && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Adjustments Applied</h4>
                  <div className="mt-2 space-y-1">
                    {contribution.arrears > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700">Arrears:</span>
                        <span className="font-semibold text-orange-900">
                          KES {contribution.arrears.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {contribution.penalty > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700">Penalty:</span>
                        <span className="font-semibold text-orange-900">
                          KES {contribution.penalty.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Member Information</h3>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {contribution.member.firstName} {contribution.member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{contribution.member.ministry}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-foreground">
                    {contribution.member.payrollNumber}
                  </p>
                </div>
              </div>
              {contribution.member.email && (
                <p className="text-xs text-muted-foreground">Email: {contribution.member.email}</p>
              )}
              {contribution.member.phoneNumber && (
                <p className="text-xs text-muted-foreground">
                  Phone: {contribution.member.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Close
            </button>
            {contribution.status === 'PENDING' && (
              <button
                onClick={() => setShowVerifyForm(true)}
                disabled={isVerifying}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                Verify
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
