import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ChatSheet from '../components/ChatSheet';
import LogoutModal from '../components/LogoutModal';
import {
  ArrowLeft,
  User,
  Users,
  Moon,
  Sun,
  Globe,
  Check,
  LogOut,
  Shield,
  CreditCard,
  AlertTriangle,
  FileText,
  Lock
} from 'lucide-react';

export default function ProfileScreen() {
  const {
    currentStudent,
    students,
    switchStudent,
    theme,
    toggleTheme,
    language,
    languages,
    setLanguage,
    t
  } = useApp();

  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top Bar with constant AdiSetu wordmark & profile avatar unchanged */}
      <TopBar isWordmark={true} />

      <div className="page-scroll-wrapper page-scroll-wrapper-with-nav">
        <main className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-4">
        {/* Navigation Row: "← Back" on the left, "Profile & Settings" as label */}
        <div className="flex items-center gap-3 py-0.5">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/'))}
            className="h-8 px-3 rounded-full bg-[#ECEAE4] dark:bg-[#262626] hover:bg-[#E0DDD5] dark:hover:bg-[#323232] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out text-text flex items-center gap-1.5 border-0 outline-none select-none shadow-xs"
          >
            <ArrowLeft size={13} className="text-text/80" />
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">BACK</span>
          </button>
          <h1 className="text-base font-bold text-text tracking-tight">
            {t('profileTitle')}
          </h1>
        </div>
        {/* Profile Header Card */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent-soft text-accent-dark font-bold text-lg flex items-center justify-center border border-border flex-shrink-0 notranslate" translate="no">
            {currentStudent.initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-text truncate">
              {currentStudent.name}
            </h2>
            <p className="text-xs text-muted">
              Class {currentStudent.class} • {currentStudent.category} Category
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-block px-2 py-0.5 rounded bg-bg text-muted font-mono text-[10px] font-semibold">
                {currentStudent.guardianManaged ? t('metaGuardianManaged') : t('metaSelfManaged')}
              </span>
            </div>
          </div>
        </div>

        {/* Student Academic & Personal Info */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
          <div className="section-label">
            {t('studentInformation')}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelSubTribe')}:</span>
              <span className="font-semibold text-text">{currentStudent.subTribe}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelDob')}:</span>
              <span className="font-semibold text-text">{currentStudent.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelInstitution')}:</span>
              <span className="font-semibold text-text text-right max-w-[200px] truncate">{currentStudent.institution}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelPhone')}:</span>
              <span className="font-semibold text-text">{currentStudent.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">{t('labelAddress')}:</span>
              <span className="font-semibold text-text text-right max-w-[200px] truncate">{currentStudent.address}</span>
            </div>
          </div>
        </div>

        {/* Bank & DBT Account Info */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">
              {t('bankDbtAccount')}
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
              currentStudent.bankAccount.dbtSeeded
                ? 'bg-green-soft text-green'
                : 'bg-rust-soft text-rust'
            }`}>
              {currentStudent.bankAccount.dbtSeeded ? t('statusDbtActive') : t('statusDbtPending')}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelBankName')}:</span>
              <span className="font-semibold text-text">{currentStudent.bankAccount.bankName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted">{t('labelAccountNo')}:</span>
              <span className="font-mono font-semibold text-text">{currentStudent.bankAccount.accountNo}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">{t('labelIfsc')}:</span>
              <span className="font-mono font-semibold text-text">{currentStudent.bankAccount.ifsc}</span>
            </div>
          </div>
        </div>

        {/* Switch Household Profile (Siblings sharing device) */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
          <div className="section-label flex items-center gap-1.5">
            <Users size={14} />
            <span>{t('switchHouseholdProfile')}</span>
          </div>

          <div className="space-y-2">
            {students.map((student) => {
              const isCurrent = student.id === currentStudent.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => switchStudent(student.id)}
                  className={`w-full p-3 rounded-lg flex items-center justify-between text-xs transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-accent-soft text-accent-dark font-medium'
                      : 'bg-bg text-text hover:bg-[#ECECE7] dark:hover:bg-[#2A2926]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface shadow-xs text-text font-bold text-xs flex items-center justify-center notranslate" translate="no">
                      {student.initials}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-text">{student.name}</div>
                      <div className="text-[11px] text-muted">Class {student.class} • {student.institution.split(',')[0]}</div>
                    </div>
                  </div>

                  {isCurrent && <Check size={16} className="text-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* App Preferences: Language & Theme */}
        <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4">
          <div className="section-label">
            {t('preferences')}
          </div>

          {/* Theme switcher */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              {theme === 'dark' ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-amber" />}
              <span>{t('darkMode')}</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                theme === 'dark' ? 'bg-accent' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Full Language Selector (19 languages) */}
          <div className="pt-2 border-t border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Globe size={16} className="text-muted" />
              <span>{t('displayLanguage')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 notranslate" translate="no">
              {languages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`p-2.5 rounded-lg text-xs text-left transition-colors flex items-center justify-between shadow-xs ${
                      isSelected
                        ? 'bg-accent text-white font-semibold shadow-sm'
                        : 'bg-bg text-text hover:bg-[#ECECE7] dark:hover:bg-[#2A2926]'
                    }`}
                  >
                    <div className="truncate">
                      <div>{l.native}</div>
                      <div className={`text-[10px] ${isSelected ? 'opacity-90' : 'text-muted'}`}>{l.name}</div>
                    </div>
                    {isSelected && <Check size={14} className="flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Logout Action (opens shared LogoutModal) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3.5 rounded-full bg-rust-soft/50 text-rust-dark font-bold text-xs shadow-xs hover:bg-rust-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
          <p className="text-[10px] text-muted text-center mt-1.5">
            Destructive action: clears cached credentials on this device
          </p>
        </div>
      </main>
      </div>

      {/* Shared Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Floating Ask AdiSetu Chat Button */}
      <ChatSheet />

      {/* Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}
