import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description?: string;
}

interface AuthStepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export const AuthStepper: React.FC<AuthStepperProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start justify-between w-full">
        {steps.map((step, index) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node (Circle + Label) */}
              <div className="flex flex-col items-center flex-shrink-0 w-20 sm:w-24">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 z-10 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-500/20'
                      : isActive
                      ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20'
                      : 'bg-card border-2 border-border text-muted-foreground shadow-sm'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium mt-2 text-center leading-tight transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : isDone
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Bar between Steps (Only between circles, no bleeding outside) */}
              {!isLast && (
                <div className="flex-1 mt-4 sm:mt-4.5 -mx-1 sm:-mx-2 h-0.5 bg-border relative overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
