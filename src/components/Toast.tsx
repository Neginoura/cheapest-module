import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 shadow-xl backdrop-blur-md text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
        <span>{message}</span>
        <button
          onClick={onClose}
          className="mr-2 text-slate-400 hover:text-white dark:hover:text-slate-900"
        >
          ×
        </button>
      </div>
    </div>
  );
};
