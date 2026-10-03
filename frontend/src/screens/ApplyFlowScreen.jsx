import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import {
  UserCheck,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Check,
  Layers
} from 'lucide-react';

export default function ApplyFlowScreen() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isBatchMode = location.pathname.includes('batch') || !id;

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

  // Determine which schemes we are applying to
  const targetSchemes = isBatchMode
    ? schemes.filter((s) => selectedSchemeIds.includes(s.id))
    : [schemes.find((s) => s.id === id) || schemes[0]];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (isBatchMode) {
        const apps = applyToBatch(selectedSchemeIds);
        setCreatedApps(apps);
      } else {
        const app = applyToScheme(targetSchemes[0].id);
        setCreatedApps([app]);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <TopBar
        title={isBatchMode ? t('batchApplyTitle') : t('applyTitle')}
        isWordmark={false}
        showBack={!isSuccess}
        backUrl={isBatchMode ? "/" : `/scheme/${targetSchemes[0]?.id}`}
      />

      <div className="page-scroll-wrapper page-scroll-wrapper-no-nav">
        <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
        {/* Step Indicator (3 steps) */}
        {!isSuccess && (
          <div className="bg-surface rounded-card p-3.5 shadow-card border border-border/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text">
                Step {currentStep} of 3
              </span>
              <span className="font-mono text-[11px] text-accent font-bold uppercase tracking-wider">
                {currentStep === 1 && "Personal Info"}
                {currentStep === 2 && "Document Wallet"}
                {currentStep === 3 && "Final Review"}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-border h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="bg-surface rounded-card p-6 shadow-card border border-border/40 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-green-soft text-green mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-text">
                {isBatchMode
                  ? `Batch Application Submitted!`
                  : `Application Submitted Successfully!`}
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Your application has been registered with the Ministry of Tribal Affairs and state nodal portals.
              </p>
            </div>

            {/* List of generated application tracking IDs */}
            <div className="bg-bg rounded-card p-3.5 text-left space-y-2 border border-border">
              <div className="section-label">
                {t('submittedApps')}
              </div>
              {targetSchemes.map((scheme, i) => (
                <div
                  key={scheme.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-border/60 last:border-0"
                >
                  <div>
                    <div className="font-semibold text-text">{scheme.shortName}</div>
                    <div className="text-[10px] text-muted">{scheme.source}</div>
                  </div>
                  <span className="font-mono font-semibold text-accent text-[11px]">
                    Submitted
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted">
              You can now track this application in your <span className="font-semibold text-text">Updates</span> feed.
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/updates')}
                className="w-full py-3.5 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>View in Updates Feed</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-full border border-border text-xs font-semibold text-text hover:bg-bg"
              >
                Return to Schemes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Auto-filled Personal Details */}
            {currentStep === 1 && (
              <div className="bg-surface rounded-card p-5 shadow-card border border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="section-label">
                    1. Auto-filled Student Details
                  </div>
                  <span className="text-[10px] text-muted">e-KYC Synced</span>
                </div>

                {isBatchMode && (
                  <div className="bg-accent-soft text-accent-dark rounded-lg p-2.5 text-xs flex items-center gap-2">
                    <Layers size={16} className="flex-shrink-0" />
                    <span>
                      Applying to <strong>{targetSchemes.length} schemes</strong> simultaneously. Personal details filled once for all.
                    </span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="bg-bg rounded-lg p-3 space-y-2 border border-border/60">
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
                      <span className="font-semibold text-text text-right max-w-[200px] truncate">{currentStudent.institution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Permanent Address:</span>
                      <span className="font-semibold text-text text-right max-w-[200px] truncate">{currentStudent.address}</span>
                    </div>
                  </div>

                  <div className="bg-bg rounded-lg p-3 space-y-2 border border-border/60">
                    <div className="section-label text-[10px]">
                      Disbursal Bank Details
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

            {/* Step 2: Confirm Attached Documents (Green Reused tags) */}
            {currentStep === 2 && (
              <div className="bg-surface rounded-card p-5 shadow-card border border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="section-label">
                    2. Document Wallet Verification
                  </div>
                  <span className="text-[10px] text-muted">No re-upload</span>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  The following documents are automatically linked from your verified wallet. No scans or physical copies are required.
                </p>

                <div className="space-y-2.5">
                  {documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-bg rounded-lg p-3 flex items-center justify-between border border-border/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-accent">
                          <FileCheck size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text">
                            {doc.name}
                          </div>
                          <div className="text-[10px] font-mono text-muted">
                            {doc.docNumber}
                          </div>
                        </div>
                      </div>

                      {/* Green Reused Tag */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-tag bg-green-soft text-green text-[10px] font-mono font-bold uppercase tracking-wider">
                        <CheckCircle2 size={11} />
                        {t('reused')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Final Review</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="bg-surface rounded-card p-5 shadow-card border border-border/40 space-y-4">
                <div className="section-label">
                  3. Review & Submit
                </div>

                {/* Target schemes list */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-text">
                    Applying to {targetSchemes.length} Scheme{targetSchemes.length > 1 ? 's' : ''}:
                  </div>
                  {targetSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="bg-bg rounded-lg p-3 border border-border/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-text">
                          {scheme.shortName}
                        </div>
                        <div className="text-[11px] text-muted">
                          {scheme.source} · {scheme.financialAssistance.split('+')[0]}
                        </div>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-surface text-muted text-[10px] font-mono">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>

                {/* Declaration Checkbox */}
                <div className="bg-bg rounded-lg p-3 text-xs text-muted leading-relaxed border border-border">
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

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
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
      </main>
      </div>
    </div>
  );
}
