'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import WizardProgress from './WizardProgress';
import Step1PersonalInfo, { PersonalInfoData } from './Step1PersonalInfo';
import Step2NextOfKin, { NextOfKinEntry } from './Step2NextOfKin';
import Step3SpouseDetails, { SpouseData } from './Step3SpouseDetails';
import Step4ChildrenDetails, { ChildEntry } from './Step4ChildrenDetails';
import Step5ParentGuardians, { ParentGuardianEntry } from './Step5ParentGuardians';
import Step6ParentsInLaw, { ParentInLawEntry } from './Step6ParentsInLaw';
import Step7MpesaPayment, { PaymentData } from './Step7MpesaPayment';
import RegistrationSuccess from './RegistrationSuccess';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

const WIZARD_STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Next of Kin' },
  { id: 3, label: 'Spouse', optional: true },
  { id: 4, label: 'Children', optional: true },
  { id: 5, label: 'Parents/Guardians', optional: true },
  { id: 6, label: 'Parents-in-Law', optional: true },
  { id: 7, label: 'Payment' },
];

interface RegistrationFormData {
  personalInfo: PersonalInfoData | null;
  nextOfKin: NextOfKinEntry[];
  spouse: SpouseData | null;
  children: ChildEntry[] | null;
  parentGuardians: ParentGuardianEntry[] | null;
  parentsInLaw: ParentInLawEntry[] | null;
  payment: PaymentData | null;
}

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    personalInfo: null,
    nextOfKin: [],
    spouse: null,
    children: null,
    parentGuardians: null,
    parentsInLaw: null,
    payment: null,
  });

  const markStepComplete = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const handleStep1 = (data: PersonalInfoData) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }));
    markStepComplete(1);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2 = (data: NextOfKinEntry[]) => {
    setFormData((prev) => ({ ...prev, nextOfKin: data }));
    markStepComplete(2);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3 = (data: SpouseData | null) => {
    setFormData((prev) => ({ ...prev, spouse: data }));
    markStepComplete(3);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep4 = (data: ChildEntry[] | null) => {
    setFormData((prev) => ({ ...prev, children: data }));
    markStepComplete(4);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep5 = (data: ParentGuardianEntry[] | null) => {
    setFormData((prev) => ({ ...prev, parentGuardians: data }));
    markStepComplete(5);
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep6 = (data: ParentInLawEntry[] | null) => {
    setFormData((prev) => ({ ...prev, parentsInLaw: data }));
    markStepComplete(6);
    setCurrentStep(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Backend integration point: POST /api/members
  const handleStep7 = async (data: PaymentData) => {
    setIsSubmitting(true);
    setFormData((prev) => ({ ...prev, payment: data }));

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData.personalInfo,
          dateOfBirth: formData.personalInfo?.dateOfBirth,
          nextOfKins: formData.nextOfKin,
          spouse: formData.spouse,
          children: formData.children,
          parentGuardians: formData.parentGuardians,
          parentsInLaws: formData.parentsInLaw,
          mpesaConfirmation: data.mpesaConfirmation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      const result = await response.json();
      markStepComplete(7);
      setIsComplete(true);
      toast.success('Registration submitted successfully!', {
        description: 'Your membership will be activated after payment verification.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-border shadow-card sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={32} />
            <div>
              <span className="font-bold text-foreground text-lg tracking-tight">HHS Welfare</span>
              <p className="text-muted-foreground text-xs hidden sm:block">
                Harambee House Staff Welfare
              </p>
            </div>
          </div>
          <Link
            href="/login-screen"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-150"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Login</span>
          </Link>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isComplete ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card-hover border border-border p-8">
            <RegistrationSuccess
              memberName={`${formData.personalInfo?.firstName || ''} ${formData.personalInfo?.lastName || ''}`}
              email={formData.personalInfo?.email || ''}
            />
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Membership Registration
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Complete all required steps to register for group membership.
              </p>
            </div>

            {/* Progress */}
            <div className="max-w-4xl mx-auto mb-8">
              <WizardProgress
                steps={WIZARD_STEPS}
                currentStep={currentStep}
                completedSteps={completedSteps}
              />
            </div>

            {/* Step card */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-card-hover border border-border p-6 sm:p-8 animate-slide-up">
                {/* Step header */}
                <div className="mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      Step {currentStep} of {WIZARD_STEPS.length}
                    </span>
                    {WIZARD_STEPS.find((s) => s.id === currentStep)?.optional && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-2">
                    {currentStep === 1 && 'Personal Information'}
                    {currentStep === 2 && 'Next of Kin Details'}
                    {currentStep === 3 && 'Spouse Details'}
                    {currentStep === 4 && 'Children Details'}
                    {currentStep === 5 && 'Parent / Guardian Details'}
                    {currentStep === 6 && 'Parents-in-Law Details'}
                    {currentStep === 7 && 'M-Pesa Payment Confirmation'}
                  </h2>
                </div>

                {/* Step content */}
                {currentStep === 1 && (
                  <Step1PersonalInfo
                    defaultValues={formData.personalInfo || undefined}
                    onNext={handleStep1}
                  />
                )}
                {currentStep === 2 && (
                  <Step2NextOfKin
                    defaultValues={formData.nextOfKin}
                    onNext={handleStep2}
                    onBack={goBack}
                  />
                )}
                {currentStep === 3 && (
                  <Step3SpouseDetails
                    defaultValues={formData.spouse || undefined}
                    onNext={handleStep3}
                    onBack={goBack}
                  />
                )}
                {currentStep === 4 && (
                  <Step4ChildrenDetails
                    defaultValues={formData.children || undefined}
                    onNext={handleStep4}
                    onBack={goBack}
                  />
                )}
                {currentStep === 5 && (
                  <Step5ParentGuardians
                    defaultValues={formData.parentGuardians || undefined}
                    onNext={handleStep5}
                    onBack={goBack}
                  />
                )}
                {currentStep === 6 && (
                  <Step6ParentsInLaw
                    defaultValues={formData.parentsInLaw || undefined}
                    onNext={handleStep6}
                    onBack={goBack}
                  />
                )}
                {currentStep === 7 && (
                  <Step7MpesaPayment
                    onSubmit={handleStep7}
                    onBack={goBack}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>

              {/* Footer note */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                Your data is protected and used solely for membership purposes.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
