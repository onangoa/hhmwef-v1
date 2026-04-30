'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { WelfareCase, CaseType } from './welfareData';
import { CASE_TYPE_CONFIG } from './WelfareCaseCard';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newCase: any) => void;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  payrollNumber: string;
  ministry: string;
}

export default function NewCaseModal({ isOpen, onClose, onCreate }: NewCaseModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    memberId: '',
    type: 'medical' as CaseType,
    title: '',
    description: '',
    amountRequested: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const response = await fetch('/api/members?limit=100');
        const data = await response.json();
        if (data.members) {
          setMembers(data.members);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) fetchMembers();
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.id === form.memberId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.memberId) e.memberId = 'Please select a member';
    if (!form.title.trim()) e.title = 'Case title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.amountRequested || Number(form.amountRequested) <= 0)
      e.amountRequested = 'Enter a valid amount';
    return e;
  };

  const handleSubmit = () => {
    console.log('NewCaseModal handleSubmit called');
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const caseData = {
      memberId: form.memberId,
      type: form.type.toUpperCase(),
      title: form.title,
      description: form.description,
      amountRequested: Number(form.amountRequested),
      supportingDocs: [],
    };
    console.log('Creating case with data:', caseData);

    onCreate(caseData);

    console.log('onCreate called, resetting form and closing modal');
    setForm({ memberId: '', type: 'medical', title: '', description: '', amountRequested: '' });
    setErrors({});
    onClose();
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 text-sm bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors[field] ? 'border-red-400 bg-red-50' : 'border-border'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">New Welfare Case</h2>
            <p className="text-xs text-muted-foreground">Submit a new welfare support request</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Member */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Member *
            </label>
            <select
              className={inputClass('memberId')}
              value={form.memberId}
              onChange={(e) => {
                setForm({ ...form, memberId: e.target.value });
                setErrors({ ...errors, memberId: '' });
              }}
            >
              <option value="">Select a member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} — {m.payrollNumber}
                </option>
              ))}
            </select>
            {errors.memberId && <p className="text-xs text-red-500 mt-1">{errors.memberId}</p>}
            {selectedMember && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedMember.ministry.replace('Ministry of ', '')}
              </p>
            )}
          </div>

          {/* Case Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Case Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['medical', 'bereavement', 'emergency'] as CaseType[]).map((type) => {
                const config = CASE_TYPE_CONFIG[type];
                const TypeIcon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, type })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      form.type === type
                        ? `border-blue-500 ${config.bg}`
                        : 'border-border hover:border-blue-300 bg-muted/30'
                    }`}
                  >
                    <TypeIcon
                      size={18}
                      className={form.type === type ? config.color : 'text-muted-foreground'}
                    />
                    <span
                      className={`text-xs font-semibold ${form.type === type ? config.color : 'text-muted-foreground'}`}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Case Title *
            </label>
            <input
              className={inputClass('title')}
              placeholder="e.g. Cardiac Surgery — Kenyatta National Hospital"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setErrors({ ...errors, title: '' });
              }}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Description *
            </label>
            <textarea
              className={`${inputClass('description')} resize-none`}
              rows={3}
              placeholder="Describe the welfare need in detail..."
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setErrors({ ...errors, description: '' });
              }}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Amount Requested (Ksh) *
            </label>
            <input
              type="number"
              className={inputClass('amountRequested')}
              placeholder="e.g. 50000"
              value={form.amountRequested}
              onChange={(e) => {
                setForm({ ...form, amountRequested: e.target.value });
                setErrors({ ...errors, amountRequested: '' });
              }}
            />
            {errors.amountRequested && (
              <p className="text-xs text-red-500 mt-1">{errors.amountRequested}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Submit Case
          </button>
        </div>
      </div>
    </div>
  );
}
