'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Plus, Trash2, ChevronDown, ChevronUp, SkipForward } from 'lucide-react';

const GUARDIAN_RELATIONSHIPS = [
  'Father',
  'Mother',
  'Step-Father',
  'Step-Mother',
  'Guardian',
  'Uncle',
  'Aunt',
  'Grandparent',
  'Other',
];

export interface ParentGuardianEntry {
  id: string;
  firstName: string;
  lastName: string;
  surname: string;
  relationship: string;
  phoneNumber?: string;
}

interface Step5Props {
  defaultValues?: ParentGuardianEntry[];
  onNext: (data: ParentGuardianEntry[] | null) => void;
  onBack: () => void;
}

function ParentForm({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
  relationships,
}: {
  entry: ParentGuardianEntry;
  index: number;
  onUpdate: (id: string, data: Partial<ParentGuardianEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  relationships: string[];
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<Omit<ParentGuardianEntry, 'id'>>({
    defaultValues: {
      firstName: entry.firstName,
      lastName: entry.lastName,
      surname: entry.surname,
      relationship: entry.relationship,
      phoneNumber: entry.phoneNumber,
    },
  });

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      hasError ? 'border-red-400 bg-red-50' : 'border-border bg-white focus:border-primary'
    }`;

  const handleBlur = () => onUpdate(entry.id, getValues());

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/50 hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {entry.firstName && entry.lastName
                ? `${entry.firstName} ${entry.lastName}`
                : `Entry #${index + 1}`}
            </p>
            {entry.relationship && (
              <p className="text-xs text-muted-foreground">{entry.relationship}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.id);
              }}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John"
                {...register('firstName', { required: true })}
                onBlur={handleBlur}
                className={inputClass(!!errors.firstName)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mwangi"
                {...register('lastName', { required: true })}
                onBlur={handleBlur}
                className={inputClass(!!errors.lastName)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Surname{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kamau"
                {...register('surname')}
                onBlur={handleBlur}
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                {...register('relationship', { required: true })}
                onBlur={handleBlur}
                className={`${inputClass(!!errors.relationship)} bg-white`}
              >
                <option value="">— Select —</option>
                {relationships.map((r) => (
                  <option key={`pgrel-${r}`} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 0712345678"
                {...register('phoneNumber', { required: true })}
                onBlur={handleBlur}
                className={inputClass(!!errors.phoneNumber)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step5ParentGuardians({ defaultValues, onNext, onBack }: Step5Props) {
  const [entries, setEntries] = useState<ParentGuardianEntry[]>(
    defaultValues?.length
      ? defaultValues
      : [{ id: 'pg-1', firstName: '', lastName: '', surname: '', relationship: '', phoneNumber: '' }]
  );

  const addEntry = () =>
    setEntries((prev) => [
      ...prev,
      { id: `pg-${Date.now()}`, firstName: '', lastName: '', surname: '', relationship: '', phoneNumber: '' },
    ]);

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const updateEntry = (id: string, data: Partial<ParentGuardianEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));

  const handleNext = () => {
    const incomplete = entries.some((e) => !e.firstName || !e.lastName || !e.relationship);
    if (incomplete) return;
    onNext(entries);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Shield size={14} className="text-blue-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Parent / Guardian Details</h3>
            <p className="text-xs text-muted-foreground">
              Add your parents or guardians. This step is optional.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
          Optional Step
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {entries.map((entry, index) => (
          <ParentForm
            key={entry.id}
            entry={entry}
            index={index}
            onUpdate={updateEntry}
            onRemove={removeEntry}
            canRemove={entries.length > 1}
            relationships={GUARDIAN_RELATIONSHIPS}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-dashed px-4 py-2.5 rounded-xl w-full justify-center transition-all duration-150 mb-4"
      >
        <Plus size={16} /> Add Another Parent/Guardian
      </button>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-5 py-2.5 rounded-lg transition-all duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNext(null)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-4 py-2.5 rounded-lg transition-all duration-150"
          >
            <SkipForward size={14} /> Skip this Step
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
          >
            Continue to Parents-in-Law
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
