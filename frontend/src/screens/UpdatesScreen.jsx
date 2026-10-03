import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTranslatedStatus, getTranslatedStage } from '../data/translations';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ChatSheet from '../components/ChatSheet';
import AadhaarResolveModal from '../components/AadhaarResolveModal';
import {
  AlertTriangle,
  Check,
  Bell,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function UpdatesScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    applications,
    notifications,
    currentStudent,
    riskBannerDismissed,
    renewDocument,
    withdrawApplication,
    setHasUnreadUpdates,
    t
  } = useApp();

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [renewingDocId, setRenewingDocId] = useState(null);

  // Clear unread updates badge once on this screen
  useEffect(() => {
    setHasUnreadUpdates(false);
  }, [setHasUnreadUpdates]);

  const showRiskBanner = !currentStudent.bankAccount.dbtSeeded && !riskBannerDismissed;
  const hasUrgentAlerts = showRiskBanner || notifications.some((n) => n.kind === 'alert');

  // Filter applications by current student
  const studentApps = applications.filter((app) => !app.studentId || app.studentId === currentStudent?.id);

  // Driven by mock data counts
  const alertsCount = (showRiskBanner ? 1 : 0) + notifications.length;
  const applicationsCount = studentApps.length;

  // Default to location state tab if provided, otherwise alerts if urgent, otherwise applications
  const [activeTab, setActiveTab] = useState(() => (location.state?.tab || (hasUrgentAlerts ? 'alerts' : 'applications')));

  const handleRenew = (docId) => {
    setRenewingDocId(docId);
    setTimeout(() => {
      renewDocument(docId);
      setRenewingDocId(null);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top bar with constant AdiSetu wordmark */}
      <TopBar isWordmark={true} />

      <div className="page-scroll-wrapper page-scroll-wrapper-with-nav">
        <main className="max-w-md mx-auto px-4 pt-3 pb-28 space-y-4">
        {/* Segmented Tab Control directly under the header */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              activeTab === 'alerts'
                ? 'bg-accent text-white font-semibold shadow-xs'
                : 'bg-[#ECECE7] dark:bg-[#2A2926] text-text hover:bg-border/80 font-medium'
            }`}
          >
            {t('alertsTab')} ({alertsCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              activeTab === 'applications'
                ? 'bg-accent text-white font-semibold shadow-xs'
                : 'bg-[#ECECE7] dark:bg-[#2A2926] text-text hover:bg-border/80 font-medium'
            }`}
          >
            {t('applicationsTab')} ({applicationsCount})
          </button>
        </div>

        {/* Tab Content 1: ALERTS (Risk banner + notifications merged in consistent styling) */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="bg-surface rounded-card border-0 dark:border dark:border-border/60 overflow-hidden shadow-card">
              {/* Urgent Risk Item (Aadhaar DBT Seeding) */}
              {showRiskBanner && (
                <div className="p-4 flex items-start gap-3.5 bg-rust-soft/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rust-soft text-rust flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <AlertTriangle size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10.5px] font-bold text-rust uppercase tracking-wider">
                        {t('actionNeeded')} · DBT Aadhaar
                      </span>
                      <span className="text-[10px] font-mono text-muted whitespace-nowrap">
                        {getTranslatedStatus('Action Required', t)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-text mt-0.5">
                      Aadhaar–bank link not confirmed
                    </h4>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                      Scholarship money is paid only into an Aadhaar-linked bank account. Check yours on NPCI's BASE portal.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsResolveModalOpen(true)}
                      className="mt-2 text-xs font-bold text-accent hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <span>{t('fixNow')}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications and Lifecycle Alerts */}
              {notifications.map((notif, index) => {
                const isAlert = notif.kind === 'alert';
                const isCasteAlert = notif.relatedDocId === 'doc-caste';
                const isCurrentlyRenewing = renewingDocId === 'doc-caste';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 flex items-start gap-3.5 transition-colors hover:bg-bg/40 ${
                      index !== 0 || showRiskBanner ? 'border-t border-border/60' : ''
                    }`}
                  >
                    {/* 32px rounded icon-wrap with consistent soft tones */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${
                        isAlert
                          ? 'bg-amber-soft text-amber'
                          : 'bg-accent-soft text-accent-dark'
                      }`}
                    >
                      {isAlert ? <AlertTriangle size={15} /> : <Sparkles size={15} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-xs font-bold text-text truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-muted whitespace-nowrap flex-shrink-0">
                          {notif.time}
                        </span>
                      </div>

                      <p className="text-xs text-muted mt-0.5 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Inline Action for document renewal if applicable */}
                      {isCasteAlert && (
                        <button
                          type="button"
                          onClick={() => handleRenew('doc-caste')}
                          disabled={isCurrentlyRenewing}
                          className="mt-2 text-xs font-bold text-accent hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          {isCurrentlyRenewing ? (
                            <span className="flex items-center gap-1">
                              <RefreshCw size={12} className="animate-spin" />
                              Syncing e-Pramaan...
                            </span>
                          ) : (
                            <>
                              <span>{t('renewViaEpramaan')}</span>
                              <span>→</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {alertsCount === 0 && (
                <div className="text-center py-8 p-5">
                  <p className="text-xs text-muted">
                    No active alerts. All certificates and bank accounts are in good standing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content 2: APPLICATIONS & PROGRESS (Application cards with steppers) */}
        {activeTab === 'applications' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {studentApps.map((app) => {
              const isActionNeeded = app.statusLabel === "Action Needed";
              const isDisbursed = app.statusLabel === "Disbursed";
              const isInProgress = app.statusLabel === "In Progress";

              return (
                <div
                  key={app.id}
                  className="bg-surface rounded-card p-4 sm:p-4.5 shadow-card border-0 dark:border dark:border-border/40 space-y-4 transition-all"
                >
                  {/* Header: Name + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-text">
                      {app.name}
                    </h3>

                    {/* Status Pill */}
                    <span
                      className={`status-pill ${
                        isActionNeeded
                          ? 'bg-amber-soft text-amber'
                          : isDisbursed
                          ? 'bg-green-soft text-green'
                          : 'bg-accent-soft text-accent-dark'
                      }`}
                    >
                      {getTranslatedStatus(app.statusLabel, t)}
                    </span>
                  </div>

                  {/* 4-Stage Stepper: Submitted -> Verification -> Sanctioned -> Disbursed */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between relative">
                      {/* Stepper connecting lines */}
                      <div className="absolute top-[11px] left-[11px] right-[11px] h-[2px] -z-0">
                        <div className="w-full h-full flex">
                          {app.steps.slice(0, 3).map((st, i) => {
                            const isLineGreen = st === 'done';
                            return (
                              <div
                                key={i}
                                className={`flex-1 h-full transition-colors ${
                                  isLineGreen ? 'bg-green' : 'bg-border'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Stepper circles */}
                      {app.steps.map((stepState, idx) => {
                        const stageTitle = app.stageNames
                          ? app.stageNames[idx]
                          : ["Submitted", "Verification", "Sanctioned", "Disbursed"][idx];

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center z-10"
                          >
                            {/* 22px circle according to status */}
                            {stepState === 'done' && (
                              <div className="w-[22px] h-[22px] rounded-full bg-green text-white flex items-center justify-center shadow-sm">
                                <Check size={13} strokeWidth={3} />
                              </div>
                            )}

                            {stepState === 'current' && (
                              <div className="w-[22px] h-[22px] rounded-full bg-surface border-[3px] border-accent flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              </div>
                            )}

                            {stepState === 'blocked' && (
                              <div className="w-[22px] h-[22px] rounded-full bg-surface border-[3px] border-amber flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber" />
                              </div>
                            )}

                            {stepState === 'pending' && (
                              <div className="w-[22px] h-[22px] rounded-full bg-surface border border-border" />
                            )}

                            {/* Label */}
                            <span className="text-[10px] text-muted font-medium mt-1.5 text-center leading-tight">
                              {getTranslatedStage(stageTitle, t)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Blocked Note Callout */}
                  {app.note && (
                    <div className="bg-rust-soft rounded-[12px] p-3 flex items-start gap-2.5">
                      <div className="text-rust mt-0.5 flex-shrink-0">
                        <AlertTriangle size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-rust-dark leading-relaxed">
                          {app.note.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsResolveModalOpen(true)}
                          className="mt-1 text-xs font-bold text-accent hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <span>{app.note.actionText || t('resolve')}</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recurring Continuation Tag (NFST style) */}
                  {app.tag && (
                    <div className="pt-1">
                      <span className="inline-block px-2.5 py-1 rounded bg-bg text-muted font-mono text-[10px] font-semibold tracking-wider">
                        {app.tag}
                      </span>
                    </div>
                  )}

                  {/* Footer: Date + Withdraw button */}
                  <div className="pt-2 flex items-center justify-between border-t border-border/50 text-[11px] text-muted">
                    <span>Applied: {app.appliedDate || 'Recent'}</span>
                    <button
                      type="button"
                      onClick={() => withdrawApplication(app.id)}
                      className="text-muted hover:text-rust underline text-[11px] font-medium transition-colors"
                      data-testid={`withdraw-app-${app.id}`}
                    >
                      Withdraw application
                    </button>
                  </div>
                </div>
              );
            })}

            {studentApps.length === 0 && (
              <div className="text-center py-8 bg-surface rounded-card p-5 border border-border">
                <p className="text-xs text-muted">
                  No active applications yet. Browse recommended scholarships on the Schemes tab.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-3 text-xs font-bold text-accent hover:underline"
                >
                  Browse Schemes →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* Aadhaar Resolution Modal */}
      <AadhaarResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
      />

      {/* Floating Ask AdiSetu Chat Button */}
      <ChatSheet />

      {/* Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}
