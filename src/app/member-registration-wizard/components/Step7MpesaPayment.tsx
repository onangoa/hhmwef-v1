'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export interface PaymentData {
  mpesaConfirmation: string;
}

interface Step7Props {
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const MPESA_STEPS = [
  {
    id: 'mpesa-step-1',
    step: '1',
    title: 'Access M-Pesa Menu',
    detail: 'Dial *334# on your phone or open the M-Pesa app.',
  },
  {
    id: 'mpesa-step-2',
    step: '2',
    title: 'Select Pay Bill',
    detail: 'Choose "Lipa na M-Pesa" then select "Pay Bill" from the menu.',
  },
  {
    id: 'mpesa-step-3',
    step: '3',
    title: 'Enter Pay Bill Number',
    detail: 'Enter Pay Bill Number: 400200 (Co-op Bank deposits).',
  },
  {
    id: 'mpesa-step-4',
    step: '4',
    title: 'Enter Account Number',
    detail: 'Enter your personal account number as provided by the group administrator.',
  },
  {
    id: 'mpesa-step-5',
    step: '5',
    title: 'Enter Amount',
    detail: 'Input the membership registration amount as advised.',
  },
  {
    id: 'mpesa-step-6',
    step: '6',
    title: 'Enter Your M-Pesa PIN',
    detail: 'Enter your secret M-Pesa PIN when prompted to authorise the transaction.',
  },
  {
    id: 'mpesa-step-7',
    step: '7',
    title: 'Confirm Transaction',
    detail: 'Review the payment details carefully and confirm by pressing OK.',
  },
  {
    id: 'mpesa-step-8',
    step: '8',
    title: 'Receive Confirmation SMS',
    detail:
      'You will receive a confirmation SMS from M-Pesa and Co-op Bank. Copy and paste the full message below.',
  },
];

export default function Step7MpesaPayment({ onSubmit, onBack, isSubmitting }: Step7Props) {
  const [instructionsExpanded, setInstructionsExpanded] = useState(true);
  const [copiedPaybill, setCopiedPaybill] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentData>();

  const handleCopyPaybill = async () => {
    await navigator.clipboard.writeText('400200');
    setCopiedPaybill(true);
    setTimeout(() => setCopiedPaybill(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
            <Smartphone size={14} className="text-green-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">M-Pesa Payment Confirmation</h3>
            <p className="text-xs text-muted-foreground">
              Complete your payment via M-Pesa and paste the confirmation message below.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          Final Step
        </span>
      </div>

      {/* Pay Bill highlight card */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl text-white">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
          Co-op Bank Pay Bill Number
        </p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold tabular-nums tracking-wider">400200</span>
          <button
            type="button"
            onClick={handleCopyPaybill}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
          >
            {copiedPaybill ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-blue-200 text-xs mt-2">
          Use this number when paying via M-Pesa Pay Bill
        </p>
      </div>

      {/* M-Pesa Instructions Accordion */}
      <div className="mb-6 border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setInstructionsExpanded(!instructionsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-blue-700" />
            <span className="text-sm font-semibold text-blue-800">
              Step-by-Step M-Pesa Payment Instructions
            </span>
          </div>
          {instructionsExpanded ? (
            <ChevronUp size={16} className="text-blue-600" />
          ) : (
            <ChevronDown size={16} className="text-blue-600" />
          )}
        </button>

        {instructionsExpanded && (
          <div className="p-4 bg-white animate-slide-up">
            <div className="space-y-3">
              {MPESA_STEPS.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation message form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <label
            htmlFor="mpesaConfirmation"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            M-Pesa Confirmation Message <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Paste the full SMS confirmation message you received from M-Pesa and Co-op Bank after
            completing your payment.
          </p>
          <textarea
            id="mpesaConfirmation"
            rows={6}
            placeholder={`Example:\nXXXXXXXXXX Confirmed. Ksh500.00 sent to CO-OP BANK 400200 Account PR/2024/00123 on 24/4/26 at 9:15 AM. New M-PESA balance is Ksh1,234.00. Transaction cost, Ksh0.00.`}
            {...register('mpesaConfirmation', {
              required: 'Please paste your M-Pesa confirmation message to proceed',
              minLength: {
                value: 30,
                message: 'The confirmation message seems too short — please paste the full SMS',
              },
            })}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono ${
              errors.mpesaConfirmation
                ? 'border-red-400 bg-red-50 focus:border-red-400'
                : 'border-border bg-white focus:border-primary'
            }`}
          />
          {errors.mpesaConfirmation && (
            <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.mpesaConfirmation.message}
            </p>
          )}
        </div>

        {/* Important notice */}
        <div className="mb-6 flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Important</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your registration will be reviewed by the administrator. Your membership will be
              activated once payment is verified. This may take up to 2 working days.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-5 py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50"
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
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-8 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm min-w-[180px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Submit Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
