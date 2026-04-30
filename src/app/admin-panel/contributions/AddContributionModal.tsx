'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  payrollNumber: string;
  ministry: string;
}

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributionAdded: () => void;
  adminEmail: string;
}

export default function AddContributionModal({
  isOpen,
  onClose,
  onContributionAdded,
  adminEmail,
}: AddContributionModalProps) {
  const [memberSearch, setMemberSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'MPESA',
    mpesaConfirmation: '',
    reference: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (memberSearch.length >= 2) {
      searchMembers();
    } else {
      setMembers([]);
    }
  }, [memberSearch]);

  const searchMembers = async () => {
    try {
      setSearching(true);
      const response = await fetch(
        `/api/members?search=${encodeURIComponent(memberSearch)}&limit=10&status=ACTIVE`
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          mpesaConfirmation: formData.mpesaConfirmation || null,
          reference: formData.reference || null,
          month: formData.month,
          year: formData.year,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add contribution');
      }

      toast.success('Contribution added successfully');
      onContributionAdded();
      resetForm();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentMethod: 'MPESA',
      mpesaConfirmation: '',
      reference: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setSelectedMember(null);
    setMemberSearch('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Contribution</h2>
            <p className="text-sm text-muted-foreground mt-1">Record a new member contribution</p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Member <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or payroll number..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            {searching && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                Searching...
              </div>
            )}
            {members.length > 0 && (
              <div className="mt-2 border border-border rounded-lg max-h-40 overflow-y-auto">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberSearch(
                        `${member.firstName} ${member.lastName} - ${member.payrollNumber}`
                      );
                      setMembers([]);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.ministry}</p>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {member.payrollNumber}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedMember && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </p>
                    <p className="text-xs text-blue-700">{selectedMember.payrollNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMember(null);
                      setMemberSearch('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount (KES) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="MPESA">M-PESA</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          {formData.paymentMethod === 'MPESA' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                M-PESA Confirmation Code
              </label>
              <input
                type="text"
                value={formData.mpesaConfirmation}
                onChange={(e) => setFormData({ ...formData, mpesaConfirmation: e.target.value })}
                placeholder="Enter M-PESA confirmation code"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          )}

          {formData.paymentMethod !== 'MPESA' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Enter reference number"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMember}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Add Contribution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
