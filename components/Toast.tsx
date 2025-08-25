import React, { useEffect } from 'react';
import { Toast as ToastType } from '../lib/types';

interface Props {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getToastStyles = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      className={[
        'fixed top-4 right-4 px-4 py-1 rounded-lg shadow-lg z-50 max-w-sm border',
        getToastStyles(toast.type)
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-3 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
