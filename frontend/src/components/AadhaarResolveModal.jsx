import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function AadhaarResolveModal({ isOpen, onClose }) {
  const { currentStudent, resolveRiskIssue } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleResolve = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      resolveRiskIssue();
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 800);
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
            <div className="w-9 h-9 rounded-full bg-rust-soft text-rust flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-text">
                DBT Aadhaar Seeding
              </div>
              <div className="text-xs text-muted">
                Check on NPCI's BASE portal
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="text-muted hover:text-text p-1"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-soft text-green mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div className="font-semibold text-sm text-text">
              Thanks for confirming
            </div>
            <div className="text-xs text-muted">
              Warning cleared. You can recheck on BASE anytime.
            </div>
          </div>
        ) : (
          <>
            <div className="bg-bg rounded-lg p-3 space-y-2 text-xs border border-border">
              <div className="flex justify-between">
                <span className="text-muted">Student:</span>
                <span className="font-medium text-text">{currentStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Bank Account:</span>
                <span className="font-medium text-text">{currentStudent.bankAccount.bankName} ({currentStudent.bankAccount.accountNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Aadhaar Status:</span>
                <span className="font-medium text-rust">Not confirmed</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Scholarship money is paid only into a bank account linked to your Aadhaar. Check or fix the link on NPCI's BASE portal (npci.org.in → Consumer → BASE) or at your bank branch, then confirm here.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Saving..." : "I've checked it"}
                {!isSubmitting && <ArrowRight size={14} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
