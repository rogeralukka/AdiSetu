import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import {
  X,
  UserCheck,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Sparkles,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function ApplyModal({
  isOpen,
  onClose,
  schemeId = null,
  isBatch = false,
  onSuccessDone
}) {
  const navigate = useNavigate();
  const {
    schemes,
    selectedSchemeIds,
    currentStudent,
    documents,
    applyToScheme,
    applyToBatch,
    t
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1); // 1: Personal Details, 2: Documents, 3: Review & Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdApps, setCreatedApps] = useState([]);
  const [conflictInfo, setConflictInfo] = useState(null);

  // Reset state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsSubmitting(false);
      setIsSuccess(false);
      setCreatedApps([]);
      setConflictInfo(null);
    }
  }, [isOpen, schemeId, isBatch]);

  if (!isOpen) return null;

  // Target schemes determination
  const targetSchemes = isBatch
    ? schemes.filter((s) => selectedSchemeIds.includes(s.id))
    : [schemes.find((s) => s.id === schemeId) || schemes[0]];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (isBatch) {
        // applyToBatch silently skips any scheme that conflicts with an existing application or
        // with another scheme earlier in this same batch (the checkbox UI already prevents picking
        // conflicting schemes, so this is a defensive backstop, not the primary check).
        const apps = applyToBatch(selectedSchemeIds);
        setCreatedApps(apps);
        setIsSubmitting(false);
        setIsSuccess(true);
      } else {
        const result = applyToScheme(targetSchemes[0].id);
        if (result?.conflict) {
          setIsSubmitting(false);
          setConflictInfo(result.conflict);
          return;
        }
        setCreatedApps([result]);
        setIsSubmitting(false);
        setIsSuccess(true);
      }
    }, 700);
  };

  const handleViewUpdates = () => {
    onClose();
    if (onSuccessDone) onSuccessDone();
    navigate('/updates', { state: { tab: 'applications' } });
  };

  const handleDone = () => {
    onClose();
    if (onSuccessDone) onSuccessDone();
  };

  const modalTitle = isSuccess
    ? "Submission Confirmed"
    : isBatch
    ? `Batch Application (${targetSchemes.length} Schemes)`
    : `Apply · ${targetSchemes[0]?.shortName || targetSchemes[0]?.name}`;

  const modalSubtitle = !isSuccess
    ? `Step ${currentStep} of 3 · ${currentStep === 1 ? 'Personal Info' : currentStep === 2 ? 'Document Wallet' : 'Final Review'}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="max-w-lg"
    >
      <div className="overflow-y-auto p-5 space-y-4">
          {conflictInfo ? (
            /* Blocked: this scheme can't be held with an application the student already has */
            <div className="text-center space-y-4 py-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-amber-soft text-amber mx-auto flex items-center justify-center shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Can't submit this application</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed max-w-sm mx-auto">
                  You've already applied to <span className="font-semibold text-text">{conflictInfo.blockerName}</span>.{' '}
                  {conflictInfo.rule.text} Withdraw that application first, or check the AdiSetu Advisor on the Schemes
                  tab to see your best option.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const result = applyToScheme(targetSchemes[0].id, true);
                    if (result && !result.conflict) {
                      setConflictInfo(null);
                      setCreatedApps([result]);
                      setIsSuccess(true);
                    }
                  }}
                  className="w-full py-3.5 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all"
                  data-testid="modal-switch-apply-btn"
                >
                  Switch &amp; Apply (Withdraw {conflictInfo.blockerName})
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-text text-xs font-semibold hover:bg-border/80 active:scale-95 transition-all"
                >
                  Keep {conflictInfo.blockerName} &amp; Cancel
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success confirmation screen inside modal */
            <div className="text-center space-y-4 py-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-green-soft text-green mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-text">
                  {isBatch
                    ? `Batch Application Submitted!`
                    : `Application Submitted Successfully!`}
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed max-w-sm mx-auto">
                  Your details and verified documents have been forwarded to the respective portal authorities.
                </p>
              </div>

              {/* Submitted Scheme Details */}
              <div className="bg-bg rounded-lg p-3.5 text-left space-y-2 border border-border/60">
                <div className="section-label text-[10px]">
                  {t('submittedApps')}
                </div>
                {targetSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/40 last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-text">{scheme.shortName || scheme.name}</div>
                      <div className="text-[10px] text-muted">{scheme.source} · {scheme.financialAssistance.split('+')[0]}</div>
                    </div>
                    <span className="font-mono font-bold text-green text-[11px] bg-green-soft px-2 py-0.5 rounded">
                      {t('statusSubmitted')}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted">
                You can monitor live verification stages anytime in the <span className="font-semibold text-text">Updates</span> feed.
              </p>

              {/* Action Buttons (Filled/Shadowed styling) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleViewUpdates}
                  className="w-full py-3.5 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View in Updates Feed</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-text text-xs font-semibold shadow-xs hover:bg-border/80 active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step Progress Bar */}
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>

              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {isBatch && (
                    <div className="bg-accent-soft text-accent-dark rounded-lg p-2.5 text-xs flex items-center gap-2">
                      <Layers size={16} className="flex-shrink-0" />
                      <span>
                        Applying to <strong>{targetSchemes.length} scholarships</strong> in one single submission.
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="bg-bg rounded-lg p-3.5 space-y-2 border border-border/60">
                      <div className="section-label text-[10px]">
                        Student Profile (DigiLocker Synced)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Full Name:</span>
                        <span className="font-semibold text-text">{currentStudent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Social Category:</span>
                        <span className="font-semibold text-text">{currentStudent.category} ({currentStudent.subTribe})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Current Class:</span>
                        <span className="font-semibold text-text">Class {currentStudent.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Institution:</span>
                        <span className="font-semibold text-text text-right max-w-[220px] truncate">{currentStudent.institution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Address:</span>
                        <span className="font-semibold text-text text-right max-w-[220px] truncate">{currentStudent.address}</span>
                      </div>
                    </div>

                    <div className="bg-bg rounded-lg p-3.5 space-y-2 border border-border/60">
                      <div className="section-label text-[10px]">
                        Disbursal Bank Account (DBT Mandated)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Bank Name:</span>
                        <span className="font-semibold text-text">{currentStudent.bankAccount.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Account Number:</span>
                        <span className="font-mono font-semibold text-text">{currentStudent.bankAccount.accountNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">IFSC Code:</span>
                        <span className="font-mono font-semibold text-text">{currentStudent.bankAccount.ifsc}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Confirm & Proceed to Documents</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* STEP 2: Document Wallet Verification */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-xs text-muted leading-relaxed">
                    Verified certificates from your student wallet are automatically linked with zero re-upload or physical attestations.
                  </div>

                  <div className="space-y-2.5">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-bg rounded-lg p-3 flex items-center justify-between border border-border/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-accent flex-shrink-0">
                            <FileCheck size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-text truncate">
                              {doc.name}
                            </div>
                            <div className="text-[10px] font-mono text-muted truncate">
                              {doc.docNumber}
                            </div>
                          </div>
                        </div>

                        {/* Green Reused Tag */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-tag bg-green-soft text-green text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0">
                          <CheckCircle2 size={11} />
                          {t('reused')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons (50/50 Equal Width Grid with 12px gap) */}
                  <div className="pt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text shadow-xs hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{t('finalReview')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-text">
                      Applying to {targetSchemes.length} Scholarship{targetSchemes.length > 1 ? 's' : ''}:
                    </div>
                    {targetSchemes.map((scheme) => (
                      <div
                        key={scheme.id}
                        className="bg-bg rounded-lg p-3 border border-border/60 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="text-xs font-bold text-text truncate">
                            {scheme.shortName || scheme.name}
                          </div>
                          <div className="text-[11px] text-muted truncate">
                            {scheme.source} · {scheme.financialAssistance.split('+')[0]}
                          </div>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded bg-surface text-muted text-[10px] font-mono font-semibold flex-shrink-0">
                          {t('statusReady')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Self Declaration Checkbox */}
                  <div className="bg-bg rounded-lg p-3 text-xs text-muted leading-relaxed border border-border/60">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 mt-0.5 accent-accent rounded"
                      />
                      <span className="text-[11px] text-text">
                        I certify that all details retrieved via DigiLocker and e-Pramaan are accurate, and I am eligible under the Ministry of Tribal Affairs guidelines.
                      </span>
                    </label>
                  </div>

                  {/* Navigation Buttons (50/50 Equal Width Grid with 12px gap) */}
                  <div className="pt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text shadow-xs hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit Application{targetSchemes.length > 1 ? 's' : ''}</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
    </Modal>
  );
}
