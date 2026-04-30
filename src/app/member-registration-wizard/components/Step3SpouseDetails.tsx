'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Heart, SkipForward } from 'lucide-react';

export interface SpouseData {
  firstName: string;
  lastName: string;
  surname: string;
  address: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
}

interface Step3Props {
  defaultValues?: Partial<SpouseData>;
  onNext: (data: SpouseData | null) => void;
  onBack: () => void;
}

export default function Step3SpouseDetails({ defaultValues, onNext, onBack }: Step3Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpouseData>({ defaultValues: defaultValues || {} });

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:border-red-400'
        : 'border-border bg-white focus:border-primary'
    }`;

  const labelClass = 'block text-sm font-semibold text-foreground mb-1.5';
  const errorClass = 'mt-1 text-xs text-red-600 font-medium';

  const onSubmit = (data: SpouseData) => {
    onNext(data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
            <Heart size={14} className="text-pink-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Spouse Details</h3>
            <p className="text-xs text-muted-foreground">
              This step is optional. Skip if not applicable.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
          Optional Step
        </span>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Note:</span> If you do not have a spouse or prefer not to
          provide this information, click <strong>"Skip this Step"</strong> below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="sp-firstName" className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="sp-firstName"
              type="text"
              placeholder="e.g. Mary"
              {...register('firstName', { required: 'First name is required' })}
              className={inputClass(!!errors.firstName)}
            />
            {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
          </div>

          <div>
            <label htmlFor="sp-lastName" className={labelClass}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="sp-lastName"
              type="text"
              placeholder="e.g. Njeri"
              {...register('lastName', { required: 'Last name is required' })}
              className={inputClass(!!errors.lastName)}
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
          </div>

          <div>
            <label htmlFor="sp-surname" className={labelClass}>
              Surname <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="sp-surname"
              type="text"
              placeholder="e.g. Waweru"
              {...register('surname')}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label htmlFor="sp-idNumber" className={labelClass}>
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              id="sp-idNumber"
              type="text"
              placeholder="e.g. 34567890"
              {...register('idNumber', {
                required: 'ID number is required',
                pattern: { value: /^\d{7,8}$/, message: 'Must be 7–8 digits' },
              })}
              className={inputClass(!!errors.idNumber)}
            />
            {errors.idNumber && <p className={errorClass}>{errors.idNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="sp-phone" className={labelClass}>
              Phone Number{' '}
              <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="sp-phone"
              type="tel"
              placeholder="e.g. 0733 456 789"
              {...register('phoneNumber', {
                pattern: {
                  value: /^(\+254|0)[17]\d{8}$/,
                  message: 'Invalid phone number',
                },
              })}
              className={inputClass(!!errors.phoneNumber)}
            />
            {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="sp-email" className={labelClass}>
              Email Address{' '}
              <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="sp-email"
              type="email"
              placeholder="e.g. mary.njeri@email.com"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              className={inputClass(!!errors.email)}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="sp-address" className={labelClass}>
              Address <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="sp-address"
              type="text"
              placeholder="e.g. P.O. Box 9876-00300, Mombasa"
              {...register('address')}
              className={inputClass(false)}
            />
          </div>
        </div>

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
              <SkipForward size={14} />
              Skip this Step
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
            >
              Continue to Children Details
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
      </form>
    </div>
  );
}
