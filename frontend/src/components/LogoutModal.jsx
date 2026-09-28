import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X, LogOut } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose }) {
  const { currentStudent, logout, t } = useApp();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    onClose();
    logout();
  };

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      {/* Backdrop click dismiss covering full viewport */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm bg-surface rounded-card p-5 shadow-modal border border-border space-y-4 animate-in zoom-in-95 duration-150 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-rust-soft text-rust flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-text">
                {t('logoutConfirmTitle')}
              </div>
              <div className="text-xs text-muted">
                {currentStudent.name} (Class {currentStudent.class})
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cancel"
            onClick={onClose}
            className="text-muted hover:text-text p-1"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          {t('logoutConfirmBody')}
        </p>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 transition-all"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="w-full py-2.5 rounded-full bg-rust text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} />
            <span>{t('confirmLogout')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
