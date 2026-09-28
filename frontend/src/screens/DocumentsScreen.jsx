import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslatedStatus } from '../data/translations';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ChatSheet from '../components/ChatSheet';
import AddDocModal from '../components/AddDocModal';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function DocumentsScreen() {
  const { documents, renewDocument, t } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [renewingDocId, setRenewingDocId] = useState(null);

  const totalDocs = documents.length;
  const expiringDocs = documents.filter((d) => d.status === 'Expiring soon').length;
  const expiredDocs = documents.filter((d) => d.status === 'Expired').length;

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
        <main className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-4">
        {/* Short strip at top: plain text, no card */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span className="font-medium">
            {totalDocs} documents in wallet
            {expiringDocs > 0 && ` · ${expiringDocs} expiring soon`}
            {expiredDocs > 0 && ` · ${expiredDocs} expired`}
          </span>

          <span className="section-label text-[10px]">
            {t('metaDigiLockerSynced')}
          </span>
        </div>

        {/* Add Document Primary Action Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3 px-4 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('addDocumentToWallet')}</span>
        </button>

        {/* Documents List */}
        <div className="space-y-3.5 pt-1">
          {documents.map((doc) => {
            const isVerified = doc.status === 'Verified';
            const isExpiring = doc.status === 'Expiring soon';
            const isExpired = doc.status === 'Expired';
            const isCurrentlyRenewing = renewingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-surface rounded-card p-4 sm:p-4.5 shadow-card border-0 dark:border dark:border-border/40 space-y-3"
              >
                {/* Header: Document Name + Status Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[15px] font-bold text-text">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] font-mono text-muted mt-0.5">
                      {doc.docNumber}
                    </p>
                  </div>

                  {/* Status Pill (Green ONLY for Verified) */}
                  <span
                    className={`status-pill ${
                      isVerified
                        ? 'bg-green-soft text-green'
                        : isExpiring
                        ? 'bg-amber-soft text-amber'
                        : 'bg-rust-soft text-rust'
                    }`}
                  >
                    {getTranslatedStatus(doc.status, t)}
                  </span>
                </div>

                {/* Expiry & Authority Details */}
                <div className="text-xs text-muted space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{t('labelValidity')}:</span>
                    <span className="font-medium text-text">{doc.expiresOn}</span>
                  </div>
                  {doc.issuer && (
                    <div className="flex items-center justify-between">
                      <span>{t('labelIssuer')}:</span>
                      <span className="text-muted text-[11px] truncate max-w-[200px]">{doc.issuer}</span>
                    </div>
                  )}
                </div>

                {/* Used In cross-reference */}
                <div className="pt-1 border-t border-border/60">
                  <div className="text-[11px] text-muted">
                    {doc.usedInNames && doc.usedInNames.length > 0 ? (
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-text flex-shrink-0">{t('labelUsedIn')}:</span>
                        <span className="text-accent font-medium">
                          {doc.usedInNames.join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted italic">
                        Not attached to active applications yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Expiring / Expired Renew Callout (Without left-border per Fix 3) */}
                {(isExpiring || isExpired) && doc.canRenew && (
                  <div
                    className={`rounded-[12px] p-3 flex items-start gap-2.5 ${
                      isExpiring
                        ? 'bg-amber-soft/80 text-amber'
                        : 'bg-rust-soft text-rust-dark'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <AlertTriangle size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">
                        {isExpiring
                          ? "Renew now to prevent application verification halts."
                          : "Certificate expired. Update with latest Revenue Authority issue."}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRenew(doc.id)}
                        disabled={isCurrentlyRenewing}
                        className="mt-1 text-xs font-bold text-accent hover:underline flex items-center gap-1 active:scale-95 transition-transform"
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      </div>

      {/* Add Document Upload Modal */}
      <AddDocModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Floating Ask AdiSetu Chat Button */}
      <ChatSheet />

      {/* Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}
