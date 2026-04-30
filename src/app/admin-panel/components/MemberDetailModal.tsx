'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Hash,
  Users,
  Heart,
  Baby,
  Shield,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

export interface MemberRecord {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth?: string;
  ministry: string;
  department: string;
  payrollNumber: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  postalAddress?: string;
  employmentStatus: string;
  memberStatus: string;
  status: 'active' | 'pending' | 'payment_pending' | 'payment_verified' | 'rejected' | 'submitted';
  registeredAt: string;
  approvalDate?: string;
  approvedBy?: string;
  mpesaConfirmation?: string;
  nextOfKinCount: number;
  nextOfKins?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phoneNumber?: string;
    email?: string;
  }>;
  hasSpouse: boolean;
  spouse?: {
    firstName: string;
    lastName: string;
    idNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
  childrenCount: number;
  children?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
  }>;
  parentGuardians?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phoneNumber?: string;
    email?: string;
  }>;
  parentsInLaw?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phoneNumber?: string;
  }>;
}

interface MemberDetailModalProps {
  member: MemberRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: MemberRecord['status']) => void;
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={13} className="text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function MemberDetailModal({
  member,
  isOpen,
  onClose,
  onStatusChange,
}: MemberDetailModalProps) {
  const [mpesaExpanded, setMpesaExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !member) return null;

  // Backend integration point: PATCH /api/admin/members/:id/status
  const handleVerifyPayment = async () => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onStatusChange(member.id, 'active');
    toast.success(`Payment verified for ${member.firstName} ${member.lastName}`, {
      description: 'Member status updated to Active.',
    });
    setIsUpdating(false);
    onClose();
  };

  // Backend integration point: PATCH /api/admin/members/:id/status
  const handleReject = async () => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onStatusChange(member.id, 'rejected');
    toast.error(`Registration rejected for ${member.firstName} ${member.lastName}`);
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-lg shadow-modal flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-blue-700 to-blue-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-blue-200 text-sm">
              {member.registrationNo} · Registered {member.registeredAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 bg-blue-50 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status:
            </span>
            <StatusBadge status={member.status} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{member.registeredAt}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-5">
          {/* Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-blue-700" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Personal Information
              </h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow label="Full Name" value={`${member.firstName} ${member.lastName}`} icon={User} />
                <InfoRow label="National ID" value={member.idNumber} icon={Hash} />
                <InfoRow label="Date of Birth" value={member.dateOfBirth} icon={Calendar} />
                <InfoRow label="Phone Number" value={member.phone} icon={Phone} />
                <InfoRow label="Email" value={member.email} icon={Mail} />
              </div>
              {member.alternativePhone && (
                <InfoRow label="Alternative Phone" value={member.alternativePhone} icon={Phone} />
              )}
              <InfoRow label="Postal Address" value={member.postalAddress || 'Not provided'} icon={MapPin} />
              <InfoRow label="Employment Status" value={member.employmentStatus} icon={Briefcase} />
              <InfoRow label="Member Status" value={member.memberStatus} icon={Shield} />
              {member.approvalDate && (
                <InfoRow label="Approval Date" value={member.approvalDate} icon={CheckCircle2} />
              )}
              {member.approvedBy && (
                <InfoRow label="Approved By" value={member.approvedBy} icon={User} />
              )}
            </div>
          </div>

          {/* Employment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={14} className="text-blue-700" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Employment Details
              </h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <InfoRow label="Ministry" value={member.ministry} icon={Briefcase} />
              <InfoRow label="State Department" value={member.department} icon={MapPin} />
              <InfoRow label="Payroll Number" value={member.payrollNumber} icon={Hash} />
            </div>
          </div>

           {/* Family Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-blue-700" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Family Summary
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <Heart size={16} className="text-pink-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {member.hasSpouse ? '1' : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Spouse</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <Baby size={16} className="text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {member.childrenCount}
                </p>
                <p className="text-xs text-muted-foreground">Children</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <Shield size={16} className="text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {member.nextOfKinCount}
                </p>
                <p className="text-xs text-muted-foreground">Next of Kin</p>
              </div>
            </div>
           </div>

          {/* Spouse Details */}
          {member.spouse && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} className="text-pink-700" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Spouse Details
                </h3>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow label="Full Name" value={`${member.spouse.firstName} ${member.spouse.lastName}`} icon={User} />
                  {member.spouse.idNumber && <InfoRow label="National ID" value={member.spouse.idNumber} icon={Hash} />}
                  {member.spouse.phoneNumber && <InfoRow label="Phone Number" value={member.spouse.phoneNumber} icon={Phone} />}
                  {member.spouse.email && <InfoRow label="Email" value={member.spouse.email} icon={Mail} />}
                </div>
              </div>
            </div>
          )}

          {/* Children Details */}
          {member.children && member.children.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Baby size={14} className="text-blue-700" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Children Details
                </h3>
              </div>
              <div className="space-y-2">
                {member.children.map((child, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow label="Full Name" value={`${child.firstName} ${child.lastName}`} icon={User} />
                      {child.dateOfBirth && <InfoRow label="Date of Birth" value={child.dateOfBirth} icon={Calendar} />}
                      {child.gender && <InfoRow label="Gender" value={child.gender} icon={Shield} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next of Kin Details */}
          {member.nextOfKins && member.nextOfKins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-green-700" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Next of Kin Details
                </h3>
              </div>
              <div className="space-y-2">
                {member.nextOfKins.map((kin, index) => (
                  <div key={index} className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow label="Name" value={`${kin.firstName} ${kin.lastName}`} icon={User} />
                      <InfoRow label="Relationship" value={kin.relationship} icon={Users} />
                      {kin.phoneNumber && <InfoRow label="Phone" value={kin.phoneNumber} icon={Phone} />}
                      {kin.email && <InfoRow label="Email" value={kin.email} icon={Mail} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parents/Guardians */}
          {member.parentGuardians && member.parentGuardians.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-purple-700" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Parents / Guardians
                </h3>
              </div>
              <div className="space-y-2">
                {member.parentGuardians.map((parent, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow label="Name" value={`${parent.firstName} ${parent.lastName}`} icon={User} />
                      <InfoRow label="Relationship" value={parent.relationship} icon={Users} />
                      {parent.phoneNumber && <InfoRow label="Phone" value={parent.phoneNumber} icon={Phone} />}
                      {parent.email && <InfoRow label="Email" value={parent.email} icon={Mail} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parents In Law */}
          {member.parentsInLaw && member.parentsInLaw.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={14} className="text-red-700" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Parents In Law
                </h3>
              </div>
              <div className="space-y-2">
                {member.parentsInLaw.map((parent, index) => (
                  <div key={index} className="bg-red-50 rounded-xl p-3">
                    <InfoRow label="Name" value={`${parent.firstName} ${parent.lastName}`} icon={User} />
                    <InfoRow label="Relationship" value={parent.relationship} icon={Heart} />
                    {parent.phoneNumber && <InfoRow label="Phone" value={parent.phoneNumber} icon={Phone} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* M-Pesa Confirmation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={14} className="text-blue-700" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Payment Confirmation
              </h3>
            </div>
            {member.mpesaConfirmation ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMpesaExpanded(!mpesaExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      M-Pesa SMS Received
                    </span>
                  </div>
                  {mpesaExpanded ? (
                    <ChevronUp size={14} className="text-green-600" />
                  ) : (
                    <ChevronDown size={14} className="text-green-600" />
                  )}
                </button>
                {mpesaExpanded && (
                  <div className="p-4 bg-white animate-slide-up">
                    <p className="text-xs font-mono text-foreground leading-relaxed bg-gray-50 p-3 rounded-lg border border-border">
                      {member.mpesaConfirmation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock size={14} className="text-amber-600" />
                <p className="text-sm text-amber-800">
                  No M-Pesa confirmation message submitted yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action footer */}
        {(member.status === 'pending' ||
          member.status === 'submitted' ||
          member.status === 'payment_pending') && (
          <div className="px-6 py-4 border-t border-border bg-white flex-shrink-0 flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={isUpdating}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50"
            >
              <XCircle size={15} />
              Reject
            </button>
            <button
              onClick={handleVerifyPayment}
              disabled={isUpdating || !member.mpesaConfirmation}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 px-4 py-2.5 rounded-lg transition-all duration-150"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Verify Payment & Activate
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
