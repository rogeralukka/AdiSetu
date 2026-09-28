import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LogoutModal from './LogoutModal';
import { 
  User, 
  Users, 
  Moon, 
  Sun, 
  Globe, 
  Check, 
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
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

  const [showLangMenu, setShowLangMenu] = useState(false);
  const langListRef = useRef(null);
  const popoverRef = useRef(null);

  // Rev 112 (v13): Full scroll takeover directly on language list (langListRef)
  useEffect(() => {
    const listEl = langListRef.current;
    if (!listEl || !showLangMenu) return;
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      listEl.scrollTop += e.deltaY;
    };
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const y = e.touches[0].clientY;
      listEl.scrollTop += (touchStartY - y);
      touchStartY = y;
    };
    listEl.addEventListener('wheel', handleWheel, { passive: false });
    listEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    listEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      listEl.removeEventListener('wheel', handleWheel);
      listEl.removeEventListener('touchstart', handleTouchStart);
      listEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [showLangMenu, isOpen]);

  // Full scroll ownership on outer popover as well
  useEffect(() => {
    const popoverEl = popoverRef.current;
    if (!popoverEl) return;

    const handleWheel = (e) => {
      if (langListRef.current && langListRef.current.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      popoverEl.scrollTop += e.deltaY;
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (langListRef.current && langListRef.current.contains(e.target)) return;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (langListRef.current && langListRef.current.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const touchY = e.touches[0].clientY;
      popoverEl.scrollTop += (touchStartY - touchY);
      touchStartY = touchY;
    };

    popoverEl.addEventListener('wheel', handleWheel, { passive: false });
    popoverEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    popoverEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      popoverEl.removeEventListener('wheel', handleWheel);
      popoverEl.removeEventListener('touchstart', handleTouchStart);
      popoverEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  const backdropRef = useRef(null);

  // Rev 111 (v12): Backdrop blocks wheel and touchmove on background
  useEffect(() => {
    if (!isOpen) return;
    const el = backdropRef.current;
    if (!el) return;
    const block = (e) => { e.preventDefault(); e.stopPropagation(); };
    el.addEventListener('wheel', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });
    return () => {
      el.removeEventListener('wheel', block);
      el.removeEventListener('touchmove', block);
    };
  }, [isOpen]);


  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSwitch = (id) => {
    switchStudent(id);
    setIsOpen(false);
  };

  const handleOpenLogout = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Avatar Button */}
        <button
          type="button"
          data-testid="profile-dropdown-trigger"
          aria-label="Open profile and settings menu"
          translate="no"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-bold text-sm tracking-wider border border-border hover:opacity-90 active:scale-95 transition-transform notranslate"
        >
          {currentStudent.initials}
        </button>

        {/* Rev 111 (v12): Full-viewport backdrop element as a sibling of the popover panel */}
        {isOpen && (
          <div
            ref={backdropRef}
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowLangMenu(false);
            }}
          />
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            ref={popoverRef}
            className="absolute right-0 mt-2 w-72 bg-surface rounded-card shadow-dropdown border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overscroll-contain max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar"
            style={{ overscrollBehavior: 'contain' }}
            role="menu"
            aria-orientation="vertical"
          >
            {/* Profile Summary Row */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full px-4 py-3 text-left hover:bg-bg/60 transition-colors flex items-center justify-between border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark font-bold text-sm flex items-center justify-center border border-border">
                  {currentStudent.initials}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-sm text-text truncate">
                    {currentStudent.name}
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <span>Class {currentStudent.class}</span>
                    <span>•</span>
                    <span>{currentStudent.category}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted flex-shrink-0" />
            </button>

            {/* Sibling / Account Switching (Gmail style) */}
            <div className="px-4 pt-2.5 pb-1">
              <div className="section-label mb-1.5 flex items-center gap-1.5">
                <Users size={12} />
                <span>{t('switchHouseholdProfile')}</span>
              </div>
              <div className="space-y-1">
                {students.map((student) => {
                  const isCurrent = student.id === currentStudent.id;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSwitch(student.id)}
                      className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-accent-soft text-accent-dark font-medium'
                          : 'text-text hover:bg-bg'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-border text-text font-bold text-[10px] flex items-center justify-center">
                          {student.initials}
                        </div>
                        <div className="truncate text-left">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-muted ml-1 text-[11px]">(Class {student.class})</span>
                        </div>
                      </div>
                      {isCurrent && <Check size={14} className="text-accent flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted mt-1">
                {t('switchProfileDesc')}
              </p>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Theme Toggle */}
            <div className="px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-text font-medium">
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

            {/* Language Switcher - 19 languages scrollable */}
            <div className="px-4 py-1.5">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center justify-between text-xs text-text font-medium py-1 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe size={16} className="text-muted" />
                  <span>{t('displayLanguage')} ({currentLangObj.native})</span>
                </div>
                <ChevronRight size={14} className={`text-muted transition-transform ${showLangMenu ? 'rotate-90' : ''}`} />
              </button>

              {showLangMenu && (
                <div 
                  ref={langListRef}
                  className="mt-1 pl-3 max-h-64 overflow-y-auto space-y-1 border-l-2 border-accent-soft my-1 pr-1 custom-scrollbar notranslate overscroll-contain" 
                  style={{ scrollbarWidth: 'thin', overscrollBehavior: 'contain' }}
                  translate="no"
                >
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        data-lang-code={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left py-1 px-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'text-accent font-semibold bg-accent-soft/40' : 'text-muted hover:text-text hover:bg-bg'
                        }`}
                      >
                        <span className="truncate">
                          {lang.native} <span className="text-[10px] opacity-75">({lang.name})</span>
                        </span>
                        {isSelected && <Check size={13} className="text-accent flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-px bg-border my-2" />

            {/* View Full Profile Link */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-left text-xs font-medium text-accent hover:bg-accent-soft/30 transition-colors flex items-center gap-2"
            >
              <User size={15} />
              <span>{t('manageProfile')}</span>
            </button>

            {/* Logout Row in rust/destructive color */}
            <button
              type="button"
              onClick={handleOpenLogout}
              className="w-full px-4 py-2 text-left text-xs font-medium text-rust hover:bg-rust-soft/40 transition-colors flex items-center gap-2"
            >
              <LogOut size={15} />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Shared Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
