import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  optional?: boolean;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export default function WizardProgress({
  steps,
  currentStep,
  completedSteps,
}: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-blue-100 z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={`step-${step.id}`} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 shadow-md'
                      : 'bg-white border-blue-200 text-blue-300'
                }`}
              >
                {isCompleted ? <Check size={14} /> : step.id}
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent
                      ? 'text-blue-700'
                      : isCompleted
                        ? 'text-blue-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                {step.optional && <p className="text-[10px] text-muted-foreground">Optional</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact progress */}
      <div className="md:hidden flex items-center gap-3">
        <div className="flex items-center gap-1">
          {steps.map((step) => (
            <div
              key={`mob-step-${step.id}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step.id < currentStep
                  ? 'bg-blue-600 w-6'
                  : step.id === currentStep
                    ? 'bg-blue-600 w-8'
                    : 'bg-blue-100 w-4'
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-foreground">
          Step {currentStep} of {steps.length}:{' '}
          <span className="text-blue-700">{steps.find((s) => s.id === currentStep)?.label}</span>
        </p>
      </div>
    </div>
  );
}
