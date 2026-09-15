import React from 'react';
import { Compass, Sliders, Music, TrendingUp, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WorkflowStepperProps {
  activeStep?: number;
  onStepClick: (step: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  activeStep = 1,
  onStepClick,
}) => {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      label: t.stepperStep1,
      icon: Compass,
      targetId: 'step-1-scanner',
    },
    {
      step: 2,
      label: t.stepperStep2,
      icon: Sliders,
      targetId: 'step-2-fixer',
    },
    {
      step: 3,
      label: t.stepperStep3,
      icon: Music,
      targetId: 'step-3-audition',
    },
    {
      step: 4,
      label: t.stepperStep4,
      icon: TrendingUp,
      targetId: 'step-4-visualizer',
    },
  ];

  return (
    <div className="w-full bg-studio-panel/90 border border-studio-border/80 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-1.5 px-1">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {t.stepperTitle}
        </span>
      </div>

      <nav
        className="flex items-center flex-1 justify-between gap-1 overflow-x-auto scrollbar-none py-0.5"
        aria-label="Workflow Navigation"
      >
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent = activeStep === item.step;
          return (
            <React.Fragment key={item.step}>
              <button
                type="button"
                onClick={() => onStepClick(item.step)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-studio-surface text-slate-300 hover:text-white border border-studio-border/70 hover:border-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
