'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Baby, Plus, Trash2, ChevronDown, ChevronUp, SkipForward } from 'lucide-react';

export interface ChildEntry {
  id: string;
  firstName: string;
  lastName: string;
  surname: string;
  phoneNumber: string;
  dateOfBirth: string;
  birthCertNo: string;
  idNumber: string;
}

interface Step4Props {
  defaultValues?: ChildEntry[];
  onNext: (data: ChildEntry[] | null) => void;
  onBack: () => void;
}

function ChildForm({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  entry: ChildEntry;
  index: number;
  onUpdate: (id: string, data: Partial<ChildEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<Omit<ChildEntry, 'id'>>({
    defaultValues: {
      firstName: entry.firstName,
      lastName: entry.lastName,
      surname: entry.surname,
      phoneNumber: entry.phoneNumber,
      dateOfBirth: entry.dateOfBirth,
      birthCertNo: entry.birthCertNo,
      idNumber: entry.idNumber,
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
                : `Child #${index + 1}`}
            </p>
            {entry.dateOfBirth && (
              <p className="text-xs text-muted-foreground">DOB: {entry.dateOfBirth}</p>
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
                placeholder="e.g. Brian"
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
                placeholder="e.g. James"
                {...register('surname')}
                onBlur={handleBlur}
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('dateOfBirth', { required: true })}
                onBlur={handleBlur}
                className={inputClass(!!errors.dateOfBirth)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Birth Certificate No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BC/2015/012345"
                {...register('birthCertNo', { required: true })}
                onBlur={handleBlur}
                className={inputClass(!!errors.birthCertNo)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                ID Number{' '}
                <span className="text-muted-foreground text-xs font-normal">
                  (Optional — if 18+)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. 45678901"
                {...register('idNumber')}
                onBlur={handleBlur}
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Phone Number{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 0756 789 012"
                {...register('phoneNumber')}
                onBlur={handleBlur}
                className={inputClass(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step4ChildrenDetails({ defaultValues, onNext, onBack }: Step4Props) {
  const [children, setChildren] = useState<ChildEntry[]>(
    defaultValues?.length
      ? defaultValues
      : [
          {
            id: 'child-1',
            firstName: '',
            lastName: '',
            surname: '',
            phoneNumber: '',
            dateOfBirth: '',
            birthCertNo: '',
            idNumber: '',
          },
        ]
  );

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        id: `child-${Date.now()}`,
        firstName: '',
        lastName: '',
        surname: '',
        phoneNumber: '',
        dateOfBirth: '',
        birthCertNo: '',
        idNumber: '',
      },
    ]);
  };

  const removeChild = (id: string) => setChildren((prev) => prev.filter((c) => c.id !== id));
  const updateChild = (id: string, data: Partial<ChildEntry>) =>
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

  const handleNext = () => {
    const incomplete = children.some(
      (c) => !c.firstName || !c.lastName || !c.dateOfBirth || !c.birthCertNo
    );
    if (incomplete) return;
    onNext(children);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Baby size={14} className="text-blue-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Children Details</h3>
            <p className="text-xs text-muted-foreground">
              Add details of all your children. Optional step.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
          Optional Step
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {children.map((child, index) => (
          <ChildForm
            key={child.id}
            entry={child}
            index={index}
            onUpdate={updateChild}
            onRemove={removeChild}
            canRemove={children.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addChild}
        className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-dashed px-4 py-2.5 rounded-xl w-full justify-center transition-all duration-150 mb-4"
      >
        <Plus size={16} /> Add Another Child
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
            Continue to Parent/Guardian Details
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
