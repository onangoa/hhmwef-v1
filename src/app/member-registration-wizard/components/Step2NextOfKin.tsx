'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Cousin',
  'Uncle',
  'Aunt',
  'Nephew',
  'Niece',
  'Friend',
  'Colleague',
  'Other',
];

export interface NextOfKinEntry {
  id: string;
  firstName: string;
  lastName: string;
  surname: string;
  address: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  relationship: string;
}

interface Step2Props {
  defaultValues?: NextOfKinEntry[];
  onNext: (data: NextOfKinEntry[]) => void;
  onBack: () => void;
}

interface KinFormData {
  firstName: string;
  lastName: string;
  surname: string;
  address: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  relationship: string;
}

function NextOfKinForm({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  entry: NextOfKinEntry;
  index: number;
  onUpdate: (id: string, data: Partial<NextOfKinEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<KinFormData>({
    defaultValues: {
      firstName: entry.firstName,
      lastName: entry.lastName,
      surname: entry.surname,
      address: entry.address,
      idNumber: entry.idNumber,
      phoneNumber: entry.phoneNumber,
      email: entry.email,
      relationship: entry.relationship,
    },
  });

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:border-red-400'
        : 'border-border bg-white focus:border-primary'
    }`;

  const handleBlur = () => {
    const vals = getValues();
    onUpdate(entry.id, vals);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-card">
      {/* Accordion Header */}
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
                : `Next of Kin #${index + 1}`}
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
              title="Remove this next of kin"
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

      {/* Accordion Body */}
      {expanded && (
        <div className="p-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Grace"
                {...register('firstName', { required: 'First name is required' })}
                onBlur={handleBlur}
                className={inputClass(!!errors.firstName)}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wanjiru"
                {...register('lastName', { required: 'Last name is required' })}
                onBlur={handleBlur}
                className={inputClass(!!errors.lastName)}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
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
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 23456789"
                {...register('idNumber', {
                  required: 'ID number is required',
                  pattern: { value: /^\d{7,8}$/, message: 'Must be 7–8 digits' },
                })}
                onBlur={handleBlur}
                className={inputClass(!!errors.idNumber)}
              />
              {errors.idNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.idNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                {...register('relationship', { required: 'Relationship is required' })}
                onBlur={handleBlur}
                className={`${inputClass(!!errors.relationship)} bg-white`}
              >
                <option value="">— Select Relationship —</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={`rel-${r}`} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.relationship && (
                <p className="mt-1 text-xs text-red-600">{errors.relationship.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Phone Number{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 0712 345 678"
                {...register('phoneNumber', {
                  pattern: {
                    value: /^(\+254|0)[17]\d{8}$/,
                    message: 'Invalid phone number',
                  },
                })}
                onBlur={handleBlur}
                className={inputClass(!!errors.phoneNumber)}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="e.g. grace.wanjiru@email.com"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
                onBlur={handleBlur}
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Address{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. P.O. Box 5678-00200, Nairobi"
                {...register('address')}
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

export default function Step2NextOfKin({ defaultValues, onNext, onBack }: Step2Props) {
  const [kinList, setKinList] = useState<NextOfKinEntry[]>(
    defaultValues?.length
      ? defaultValues
      : [
          {
            id: 'kin-1',
            firstName: '',
            lastName: '',
            surname: '',
            address: '',
            idNumber: '',
            phoneNumber: '',
            email: '',
            relationship: '',
          },
        ]
  );
  const [validationError, setValidationError] = useState('');

  const addKin = () => {
    const newId = `kin-${Date.now()}`;
    setKinList((prev) => [
      ...prev,
      {
        id: newId,
        firstName: '',
        lastName: '',
        surname: '',
        address: '',
        idNumber: '',
        phoneNumber: '',
        email: '',
        relationship: '',
      },
    ]);
  };

  const removeKin = (id: string) => {
    setKinList((prev) => prev.filter((k) => k.id !== id));
  };

  const updateKin = (id: string, data: Partial<NextOfKinEntry>) => {
    setKinList((prev) => prev.map((k) => (k.id === id ? { ...k, ...data } : k)));
  };

  const handleNext = () => {
    const incomplete = kinList.some(
      (k) => !k.firstName || !k.lastName || !k.idNumber || !k.relationship
    );
    if (incomplete) {
      setValidationError(
        'Please fill in the required fields (First Name, Last Name, ID Number, Relationship) for all next of kin entries.'
      );
      return;
    }
    setValidationError('');
    onNext(kinList);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
          <Users size={14} className="text-blue-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Next of Kin Details</h3>
          <p className="text-xs text-muted-foreground">
            Add at least one next of kin. You can add multiple.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {kinList.map((entry, index) => (
          <NextOfKinForm
            key={entry.id}
            entry={entry}
            index={index}
            onUpdate={updateKin}
            onRemove={removeKin}
            canRemove={kinList.length > 1}
          />
        ))}
      </div>

      {/* Add another */}
      <button
        type="button"
        onClick={addKin}
        className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-dashed px-4 py-2.5 rounded-xl w-full justify-center transition-all duration-150"
      >
        <Plus size={16} />
        Add Another Next of Kin
      </button>

      {validationError && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
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
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
        >
          Continue to Spouse Details
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
  );
}
