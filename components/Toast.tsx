import React, { useEffect } from 'react';
import { ToastMessage, ToastType } from '../contexts/ToastContext';
// FIX: Corrected import path for icons
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; bgClass: string }> = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-emerald-500" />,
    bgClass: 'bg-emerald-50 border-emerald-300',
  },
  error: {
    icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
    bgClass: 'bg-red-50 border-red-300',
  },
  info: {
    icon: <CheckCircleIcon className="h-6 w-6 text-sky-500" />,
    bgClass: 'bg-sky-50 border-sky-300',
  },
  warning: {
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />,
    bgClass: 'bg-amber-50 border-amber-300',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  const { icon, bgClass } = toastConfig[toast.type];

  return (
    <div
      className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden my-2 ${bgClass}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-900">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(toast.id)}
              className="inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
