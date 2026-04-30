'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, MapPin, Briefcase, Hash } from 'lucide-react';

const MINISTRIES = [
  'Ministry of Finance & Economic Planning',
  'Ministry of Health',
  'Ministry of Education',
  'Ministry of Agriculture',
  'Ministry of Interior & National Administration',
  'Ministry of Foreign Affairs',
  'Ministry of Transport & Infrastructure',
  'Ministry of Energy & Petroleum',
  'Ministry of Environment & Forestry',
  'Ministry of Labour & Social Protection',
  'Ministry of Lands & Physical Planning',
  'Ministry of Water & Sanitation',
  'Ministry of Tourism & Wildlife',
  'Ministry of Mining & Blue Economy',
  'Ministry of ICT & Digital Economy',
];

const STATE_DEPARTMENTS: Record<string, string[]> = {
  'Ministry of Finance & Economic Planning': [
    'State Dept. of Economic Planning',
    'State Dept. of National Treasury',
    'State Dept. of Financial Services',
  ],
  'Ministry of Health': [
    'State Dept. of Medical Services',
    'State Dept. of Public Health',
    'State Dept. of Health Standards',
  ],
  'Ministry of Education': [
    'State Dept. of Basic Education',
    'State Dept. of Higher Education',
    'State Dept. of TVET',
  ],
  'Ministry of Agriculture': [
    'State Dept. of Crop Development',
    'State Dept. of Livestock',
    'State Dept. of Fisheries',
    'State Dept. of Irrigation',
  ],
  'Ministry of Interior & National Administration': [
    'State Dept. of Interior',
    'State Dept. of Correctional Services',
    'State Dept. of Immigration',
  ],
  'Ministry of Foreign Affairs': [
    'State Dept. of Foreign Affairs',
    'State Dept. of Diaspora Affairs',
  ],
  'Ministry of Transport & Infrastructure': [
    'State Dept. of Transport',
    'State Dept. of Infrastructure',
    'State Dept. of Public Works',
  ],
  'Ministry of Energy & Petroleum': ['State Dept. of Energy', 'State Dept. of Petroleum'],
  'Ministry of Environment & Forestry': ['State Dept. of Environment', 'State Dept. of Forestry'],
  'Ministry of Labour & Social Protection': [
    'State Dept. of Labour',
    'State Dept. of Social Protection',
  ],
  'Ministry of Lands & Physical Planning': [
    'State Dept. of Lands',
    'State Dept. of Physical Planning',
  ],
  'Ministry of Water & Sanitation': ['State Dept. of Water Services', 'State Dept. of Sanitation'],
  'Ministry of Tourism & Wildlife': ['State Dept. of Tourism', 'State Dept. of Wildlife'],
  'Ministry of Mining & Blue Economy': ['State Dept. of Mining', 'State Dept. of Blue Economy'],
  'Ministry of ICT & Digital Economy': [
    'State Dept. of ICT',
    'State Dept. of Digital Economy',
    'State Dept. of Broadcasting',
  ],
};

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  surname: string;
  idNumber: string;
  dateOfBirth: string;
  ministry: string;
  stateDepartment: string;
  payrollNumber: string;
  phoneNumber: string;
  alternativePhone: string;
  email: string;
  postalAddress: string;
  agreedToTerms: boolean;
}

interface Step1Props {
  defaultValues?: Partial<PersonalInfoData>;
  onNext: (data: PersonalInfoData) => void;
}

export default function Step1PersonalInfo({ defaultValues, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoData>({
    defaultValues: defaultValues || {},
  });

  const selectedMinistry = watch('ministry');
  const departments = selectedMinistry ? STATE_DEPARTMENTS[selectedMinistry] || [] : [];

  const onSubmit = (data: PersonalInfoData) => {
    onNext(data);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:border-red-400'
        : 'border-border bg-white focus:border-primary'
    }`;

  const labelClass = 'block text-sm font-semibold text-foreground mb-1.5';
  const errorClass = 'mt-1 text-xs text-red-600 font-medium';
  const helperClass = 'mt-1 text-xs text-muted-foreground';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Personal Details Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <User size={14} className="text-blue-700" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="e.g. James"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'Must be at least 2 characters' },
              })}
              className={inputClass(!!errors.firstName)}
            />
            {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="e.g. Mwangi"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Must be at least 2 characters' },
              })}
              className={inputClass(!!errors.lastName)}
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
          </div>

          {/* Surname */}
          <div>
            <label htmlFor="surname" className={labelClass}>
              Surname <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="surname"
              type="text"
              placeholder="e.g. Kamau"
              {...register('surname')}
              className={inputClass(false)}
            />
            <p className={helperClass}>Middle name or family name if applicable</p>
          </div>

          {/* ID Number */}
          <div>
            <label htmlFor="idNumber" className={labelClass}>
              ID Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="idNumber"
                type="text"
                placeholder="e.g. 12345678"
                {...register('idNumber', {
                  required: 'National ID number is required',
                  pattern: {
                    value: /^\d{7,8}$/,
                    message: 'ID number must be 7–8 digits',
                  },
                })}
                className={`${inputClass(!!errors.idNumber)} pl-9`}
              />
            </div>
            {errors.idNumber && <p className={errorClass}>{errors.idNumber.message}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth', {
                required: 'Date of birth is required',
                validate: (val) => {
                  const dob = new Date(val);
                  const today = new Date();
                  const age = today.getFullYear() - dob.getFullYear();
                  return age >= 18 || 'You must be at least 18 years old';
                },
              })}
              className={inputClass(!!errors.dateOfBirth)}
            />
            {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
          </div>
        </div>
      </div>

      {/* Employment Details Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Briefcase size={14} className="text-blue-700" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Employment Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ministry */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="ministry" className={labelClass}>
              Ministry <span className="text-red-500">*</span>
            </label>
            <select
              id="ministry"
              {...register('ministry', { required: 'Please select your ministry' })}
              className={`${inputClass(!!errors.ministry)} bg-white`}
            >
              <option value="">— Select Ministry —</option>
              {MINISTRIES.map((m) => (
                <option key={`ministry-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {errors.ministry && <p className={errorClass}>{errors.ministry.message}</p>}
          </div>

          {/* State Department */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="stateDepartment" className={labelClass}>
              State Department <span className="text-red-500">*</span>
            </label>
            <select
              id="stateDepartment"
              {...register('stateDepartment', { required: 'Please select your state department' })}
              className={`${inputClass(!!errors.stateDepartment)} bg-white`}
              disabled={!selectedMinistry}
            >
              <option value="">
                {selectedMinistry ? '— Select Department —' : '— Select Ministry first —'}
              </option>
              {departments.map((d) => (
                <option key={`dept-${d}`} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.stateDepartment && (
              <p className={errorClass}>{errors.stateDepartment.message}</p>
            )}
          </div>

          {/* Payroll Number */}
          <div>
            <label htmlFor="payrollNumber" className={labelClass}>
              Payroll Number <span className="text-red-500">*</span>
            </label>
            <input
              id="payrollNumber"
              type="text"
              placeholder="e.g. PR/2024/00123"
              {...register('payrollNumber', {
                required: 'Payroll number is required',
                pattern: {
                  value: /^[A-Z0-9/\-]+$/i,
                  message: 'Enter a valid payroll number',
                },
              })}
              className={inputClass(!!errors.payrollNumber)}
            />
            {errors.payrollNumber && <p className={errorClass}>{errors.payrollNumber.message}</p>}
            <p className={helperClass}>As shown on your payslip</p>
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Phone size={14} className="text-blue-700" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Contact Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className={labelClass}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. 0712 345 678"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+254|0)[17]\d{8}$/,
                    message: 'Enter a valid Kenyan phone number',
                  },
                })}
                className={`${inputClass(!!errors.phoneNumber)} pl-9`}
              />
            </div>
            {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber.message}</p>}
          </div>

          {/* Alternative Phone */}
          <div>
            <label htmlFor="alternativePhone" className={labelClass}>
              Alternative Phone{' '}
              <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="alternativePhone"
                type="tel"
                placeholder="e.g. 0723 456 789"
                {...register('alternativePhone', {
                  pattern: {
                    value: /^(\+254|0)[17]\d{8}$/,
                    message: 'Enter a valid Kenyan phone number',
                  },
                })}
                className={`${inputClass(!!errors.alternativePhone)} pl-9`}
              />
            </div>
            {errors.alternativePhone && (
              <p className={errorClass}>{errors.alternativePhone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="email"
                type="email"
                placeholder="e.g. james.mwangi@gov.go.ke"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                className={`${inputClass(!!errors.email)} pl-9`}
              />
            </div>
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* Postal Address */}
          <div>
            <label htmlFor="postalAddress" className={labelClass}>
              Postal Address{' '}
              <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="postalAddress"
                type="text"
                placeholder="e.g. P.O. Box 12345-00100, Nairobi"
                {...register('postalAddress')}
                className={`${inputClass(false)} pl-9`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register('agreedToTerms', {
              required: 'You must agree to the rules and constitution to proceed',
            })}
            className="mt-0.5 w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer flex-shrink-0"
          />
          <div>
            <span className="text-sm font-semibold text-blue-800 group-hover:text-blue-900 transition-colors">
              I swear to abide by the rules, regulations and Constitution of the Group.
            </span>
            <p className="text-xs text-blue-600 mt-1">
              By checking this box, you confirm that you have read, understood, and agree to comply
              with all the rules, regulations, and the Constitution governing this group membership.
            </p>
          </div>
        </label>
        {errors.agreedToTerms && (
          <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
            {errors.agreedToTerms.message}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm"
        >
          Continue to Next of Kin
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
    </form>
  );
}
