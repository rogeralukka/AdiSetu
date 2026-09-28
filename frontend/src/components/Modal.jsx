import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerExtra,
  maxWidth = 'max-w-lg',
  headerBorder = true,
  headerShadow = false,
  children,
}) {
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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`w-full ${maxWidth} bg-surface rounded-card max-h-[90vh] flex flex-col shadow-modal border border-border overflow-hidden animate-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className={`px-5 py-3.5 flex items-center justify-between bg-surface sticky top-0 z-20 transition-shadow ${
            headerBorder ? 'border-b border-border/80' : ''
          } ${
            headerShadow ? 'shadow-[0_2px_10px_rgba(20,20,15,0.06),0_1px_3px_rgba(20,20,15,0.03)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)]' : ''
          }`}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {title && (
                  <h2 className="text-base font-bold text-text truncate">
                    {title}
                  </h2>
                )}
                {headerExtra}
              </div>
              {subtitle && (
                <p className="text-[11px] font-mono text-muted truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-[#ECECE7] dark:hover:bg-[#2A2926] transition-colors ml-2 flex-shrink-0"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body & Footer */}
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
