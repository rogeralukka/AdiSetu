import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { UploadCloud, FileCheck, X, CheckCircle2, Shield } from 'lucide-react';

export default function AddDocModal({ isOpen, onClose }) {
  const { addDocument } = useApp();
  const [docType, setDocType] = useState('Income Certificate');
  const [docNumber, setDocNumber] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const docTypes = [
    "Income Certificate",
    "Caste Certificate",
    "Domicile Certificate",
    "Ration Card",
    "Bonafide Certificate",
    "Previous Marksheet",
    "Bank Passbook Mandate"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      addDocument({
        name: docType,
        docNumber: docNumber.trim() || `JH/DOC/${Math.floor(10000 + Math.random() * 90000)}`,
        issuer: "State Welfare Portal / DigiLocker",
      });
      setIsUploading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 700);
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
          <div>
            <div className="font-bold text-base text-text">
              Add to Document Wallet
            </div>
            <div className="text-xs text-muted">
              Auto-verified via DigiLocker or e-Pramaan
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
              Document Added & Verified!
            </div>
            <div className="text-xs text-muted">
              Now available for instant reuse across all scholarship applications.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
              >
                {docTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Certificate / Document Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. JH/ST/2026/09124"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-bg border border-border rounded-input px-3 py-2 text-xs text-text focus:outline-none focus:border-accent font-mono"
              />
            </div>

            {/* Mock File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Attach File (PDF, JPG up to 5MB)
              </label>
              <div 
                onClick={() => setFileSelected(!fileSelected)}
                className={`border-2 border-dashed rounded-card p-4 text-center cursor-pointer transition-colors ${
                  fileSelected
                    ? 'border-accent bg-accent-soft/30'
                    : 'border-border bg-bg hover:border-muted'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-surface border border-border mx-auto flex items-center justify-center text-accent mb-1.5">
                  {fileSelected ? <FileCheck size={18} /> : <UploadCloud size={18} />}
                </div>
                <div className="text-xs font-medium text-text">
                  {fileSelected ? "cert_tribal_doc.pdf (Ready)" : "Tap to browse or sync from DigiLocker"}
                </div>
                <div className="text-[10px] text-muted mt-0.5">
                  {fileSelected ? "Verified hash match" : "DigiLocker, State e-Pramaan, or Local Storage"}
                </div>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {isUploading ? "Verifying..." : "Save to Wallet"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
