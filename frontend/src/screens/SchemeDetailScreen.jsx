import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslatedStatus } from '../data/translations';
import { conflictWith } from '../data/schemeRules';
import TopBar from '../components/TopBar';
import ChatSheet from '../components/ChatSheet';
import ApplyModal from '../components/ApplyModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileCheck, 
  Sparkles, 
  Building2, 
  Calendar, 
  IndianRupee, 
  ShieldCheck
} from 'lucide-react';

export default function SchemeDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { schemes, applications, documents, t, currentStudent } = useApp();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const scheme = schemes.find((s) => s.id === id) || schemes[0];
  const alreadyApplied = applications.some((a) => a.schemeId === scheme.id && a.studentId === currentStudent?.id);

  // A student can avail only one scholarship/fellowship scheme at a time (add-on grants may be
  // held alongside one scholarship). Check this BEFORE opening the apply flow, so the student
  // never walks through 3 steps only to be blocked at the end.
  const appliedSchemeIds = applications.filter((a) => a.studentId === currentStudent?.id).map((a) => a.schemeId);
  const blockedByExisting = !alreadyApplied ? conflictWith(appliedSchemeIds, scheme.id, schemes) : null;
  const blockerScheme = blockedByExisting ? schemes.find((s) => s.id === blockedByExisting.blockerId) : null;

  // Source-tag pill color styling (NOS Portal -> Light Blue #DCEEF9 / #1F5A8C, SFMP -> Gold #F2E8C9 / #5E4A0F, NSP -> Terracotta #FBECE8 / #9E3D24)
  const getSourcePillClass = (source) => {
    const s = source?.toUpperCase() || '';
    if (s.includes('NOS')) return 'bg-[#DCEEF9] text-[#1F5A8C] dark:bg-[#1A334A] dark:text-[#DCEEF9]';
    if (s.includes('SFMP')) return 'bg-[#F2E8C9] text-[#5E4A0F] dark:bg-[#302812] dark:text-[#F2E8C9]';
    return 'bg-[#FBECE8] text-[#9E3D24] dark:bg-[#361E18] dark:text-[#F6BBAA]';
  };

  // Check document status to determine state-colored apply button (Fix 3)
  const docsNeedingAttention = scheme.requiredDocuments.filter((d) => {
    if (d.status === 'Needs Confirmation' || d.status === 'Pending') {
      return true;
    }
    const matchingWalletDoc = documents.find((w) => w.id === d.id);
    if (matchingWalletDoc && matchingWalletDoc.status === 'Expired') {
      return true;
    }
    return false;
  });

  const isAllDocsReady = docsNeedingAttention.length === 0;
  const attentionCount = docsNeedingAttention.length;

  const handleApplyClick = () => {
    setIsApplyModalOpen(true);
  };

  const sourcePillClass = getSourcePillClass(scheme.source);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top Bar with responsive back button */}
      <TopBar title={t('schemeDetailsTitle')} isWordmark={false} showBack={true} backUrl="/" />

      <div className="page-scroll-wrapper page-scroll-wrapper-no-nav">
        <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-5">
        {/* Main Card: Scheme Info */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4">
          {/* Header Row: Source pill & category */}
          <div className="flex items-center justify-between">
            <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider ${sourcePillClass}`}>
              {scheme.source}
            </span>

            <span className="text-xs text-muted font-medium">
              {scheme.category}
            </span>
          </div>

          {/* Scheme Full Title */}
          <div>
            <h2 className="text-lg font-bold text-text leading-snug">
              {scheme.name}
            </h2>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              {scheme.desc}
            </p>
          </div>

          {/* Key Facts: Financial Benefit wrapped to two lines without clipping (Fix 6b) */}
          <div className="space-y-2.5 pt-2 border-t border-border/60">
            <div className="bg-bg rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted text-[11px]">
                <IndianRupee size={13} />
                <span>{t('labelFinancialBenefit')}</span>
              </div>
              <div className="text-xs font-bold text-text leading-relaxed">
                {scheme.financialAssistance}
              </div>
            </div>

            <div className="bg-bg rounded-lg p-2.5 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted text-[11px]">
                <Calendar size={13} />
                <span>{t('labelDeadline')}</span>
              </div>
              <div className="text-xs font-bold text-text">
                {scheme.deadline}
              </div>
            </div>
          </div>

          {/* Blocker Callout if exists */}
          {scheme.eligibilityFlag && (
            <div className="bg-amber-soft rounded-[12px] p-3 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs text-amber-dark">
                <span className="font-semibold">{getTranslatedStatus(scheme.eligibilityFlag.label, t)}:</span> Please ensure your latest income certificate from the competent Revenue Authority is attached during review.
              </div>
            </div>
          )}

          {/* Conflict Callout: this scheme can't be held with an already-applied scholarship */}
          {blockedByExisting && (
            <div className="bg-amber-soft rounded-[12px] p-3 flex items-start gap-2.5" data-testid="detail-conflict-note">
              <AlertTriangle size={16} className="text-amber mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs text-amber-dark leading-relaxed">
                <span className="font-semibold">Can't apply — </span>
                you've already applied to <span className="font-semibold">{blockerScheme?.shortName || blockerScheme?.name}</span>.{' '}
                {blockedByExisting.rule.text} Check the AdiSetu Advisor on the Schemes tab to see your best option.
              </div>
            </div>
          )}

          {/* State-Colored Apply Button / Submitted Status Pill (Fix 3) */}
          {alreadyApplied ? (
            <div className="w-full py-3.5 px-4 rounded-full text-xs font-bold bg-green-soft text-green flex items-center justify-center gap-2 cursor-default">
              <CheckCircle2 size={16} />
              <span>{t('applicationSubmitted')}</span>
            </div>
          ) : blockedByExisting ? (
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full py-3.5 px-4 rounded-full text-xs font-bold bg-amber text-white shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              data-testid="detail-apply-switch-btn"
            >
              <span>Switch to this Scheme (Withdraw {blockerScheme?.shortName || blockerScheme?.name})</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyClick}
              className={`w-full py-3.5 px-4 rounded-full text-xs font-bold shadow-card transition-all flex items-center justify-center gap-1.5 ${
                isAllDocsReady
                  ? 'bg-green text-white hover:opacity-95 active:scale-95'
                  : 'bg-amber text-white hover:opacity-95 active:scale-95'
              }`}
            >
              <span>
                {isAllDocsReady
                  ? `${t('applyForScholarship')}`
                  : `Apply — ${attentionCount} document${attentionCount > 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} attention`}
              </span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Eligibility Criteria Section */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
          <div className="section-label">
            {t('eligibilityCriteria')}
          </div>

          <ul className="space-y-2.5">
            {scheme.criteria.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auto-Attached Documents from Wallet (Document Reuse Concrete Demonstration) */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">
              {t('walletAttachment')}
            </div>
            <span className="text-[10px] text-muted">
              {t('autoFilled')}
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            AdiSetu links verified documents directly from your student wallet without requiring physical scans or re-uploads.
          </p>

          <div className="space-y-2 pt-1">
            {scheme.requiredDocuments.map((doc, idx) => {
              const needsAttention = doc.status === 'Needs Confirmation' || doc.status === 'Pending';

              return (
                <div
                  key={idx}
                  className="bg-bg rounded-lg p-3 flex items-center justify-between border border-border/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-accent">
                      <FileCheck size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-muted">
                        {doc.reused ? "Pre-verified from student wallet" : "Attached from e-KYC record"}
                      </div>
                    </div>
                  </div>

                  {/* Reused Green Tag or Status */}
                  {doc.reused ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-tag bg-green-soft text-green text-[10px] font-mono font-bold tracking-wider uppercase">
                      <CheckCircle2 size={11} />
                      {t('reused')}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-tag text-[10px] font-mono font-semibold ${
                      needsAttention ? 'bg-amber-soft text-amber' : 'bg-surface text-muted'
                    }`}>
                      {getTranslatedStatus(doc.status, t)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      </div>

      {/* Floating Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        schemeId={scheme.id}
      />

      <ChatSheet />
    </div>
  );
}
