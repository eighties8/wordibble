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
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  return (
    <div
      className={[
        'fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm border',
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
