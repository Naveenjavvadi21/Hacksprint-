import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIBadge = ({ text = "AI Assisted", size = "normal" }) => {
  const isSmall = size === "small";
  return (
    <span className={`inline-flex items-center gap-1.5 ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium'} rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-sm`}>
      <Sparkles className={isSmall ? "w-3 h-3 text-purple-600 animate-pulse" : "w-3.5 h-3.5 text-purple-600 animate-pulse"} />
      <span>{text}</span>
    </span>
  );
};

export const AISafetyDisclaimer = () => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-start gap-2 mt-4">
    <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
    <p>
      <span className="font-semibold text-slate-700">CareFlow AI Safety Notice:</span> Assists healthcare professionals with workflow coordination and documentation extraction. Does not diagnose patients or make autonomous clinical decisions.
    </p>
  </div>
);
