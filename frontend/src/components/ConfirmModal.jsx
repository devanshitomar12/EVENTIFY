import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
  children
}) => {
  if (!isOpen) return null;

  const btnBg =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white border border-gray-200 p-6 shadow-xl space-y-4">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              confirmVariant === 'danger'
                ? 'bg-red-50 text-red-600'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {children && <div className="pt-2">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${btnBg} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
