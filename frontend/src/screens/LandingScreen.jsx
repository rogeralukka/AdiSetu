import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useScrolled } from '../hooks/useScrolled';
import { 
  ArrowRight, 
  ArrowLeft,
  Users,
  Sun,
  Moon,
  Globe,
  Check,
  ChevronDown
} from 'lucide-react';

export default function LandingScreen() {
  const navigate = useNavigate();
  const { 
    login, 
    students, 
    language, 
    languages, 
    setLanguage, 
    theme, 
    toggleTheme, 
    t 
  } = useApp();
  const scrolled = useScrolled(6);
  
  // Stages: 'LOGIN' | 'MOBILE_INPUT' | 'MOBILE_OTP' | 'PROFILE_CHOOSER'
  const [authStage, setAuthStage] = useState('LOGIN');
  const [activeTab, setActiveTab] = useState('digilocker'); // 'digilocker' | 'phone'
  const [digiLockerId, setDigiLockerId] = useState('');
  const [digiLockerPassword, setDigiLockerPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('98765 43210');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef(null);
  const langListScrollRef = useRef(null);
  const inputRefs = useRef([]);
  const [loginMode, setLoginMode] = useState('student');
  const [officerId, setOfficerId] = useState('');
  const [adminRole, setAdminRole] = useState('officer');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Rev 112 (v13): Full scroll takeover directly on landing language list
  useEffect(() => {
    const listEl = langListScrollRef.current;
    if (!listEl || !showLangDropdown) return;
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
  }, [showLangDropdown]);

  const langBackdropRef = useRef(null);

  // Rev 111 (v12): Backdrop blocks wheel and touchmove on background
  useEffect(() => {
    if (!showLangDropdown) return;
    const el = langBackdropRef.current;
    if (!el) return;
    const block = (e) => { e.preventDefault(); e.stopPropagation(); };
    el.addEventListener('wheel', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });
    return () => {
      el.removeEventListener('wheel', block);
      el.removeEventListener('touchmove', block);
    };
  }, [showLangDropdown]);


  // Close language dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOtpChange = (index, value) => {
    const rawVal = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    if (rawVal.length > 1) {
      const chars = rawVal.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (index + i < 6) newOtp[index + i] = c;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    newOtp[index] = rawVal.slice(-1);
    setOtpDigits(newOtp);
    if (rawVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = [...otpDigits];
    paste.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtpDigits(newOtp);
    const focusIdx = Math.min(paste.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleLoginSuccess = (targetStudentId) => {
    if (!targetStudentId && students.length > 1) {
      setAuthStage('PROFILE_CHOOSER');
    } else {
      const chosenId = targetStudentId || students[0]?.id || "student-1";
      login(chosenId);
      navigate('/');
    }
  };

  const handleDigiLockerLogin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handleLoginSuccess();
    }, 600);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsAdminProcessing(true);
    setTimeout(() => {
      localStorage.setItem('adisetu_admin_role', adminRole);
      localStorage.setItem('adisetu_admin_officer_id', officerId || (adminRole === 'superadmin' ? 'OFF-1001' : 'OFF-2291'));
      localStorage.setItem('adisetu_admin_logged_in', 'true');
      setIsAdminProcessing(false);
      navigate('/admin');
    }, 400);
  };

  const handleGetOtp = (e) => {
    e?.preventDefault();
    if (!mobileNumber.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAuthStage('MOBILE_OTP');
    }, 500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handleLoginSuccess();
    }, 600);
  };

  const handleSelectProfile = (studentId) => {
    login(studentId);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col transition-colors">
      {/* 1. Full-Width Fixed/Sticky Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-surface shadow-[0_2px_8px_rgba(20,20,15,0.06)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-colors">
        <div className="w-full h-full px-5 flex items-center justify-between">
          {/* Left: AdiSetu wordmark lockup matching in-app top bar */}
          <div className="text-2xl font-extrabold tracking-tight text-accent select-none notranslate" translate="no">
            AdiSetu
          </div>

          {/* Right: Theme toggle & Language dropdown (~16px gap, 20px right padding) */}
          <div className="flex items-center gap-3.5">
            {/* Theme toggle: AEGIS icon-only circular button, transparent by default, subtle hover tint */}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all duration-200 ease-out select-none border-0 outline-none"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-text hover:text-white transition-colors" />
              ) : (
                <Moon size={17} className="text-text hover:text-black transition-colors" />
              )}
            </button>

            {/* Language dropdown trigger: AEGIS capsule pill with soft filled background, no border, gentle scale hover */}
            <div className="relative notranslate" ref={langDropdownRef} translate="no">
              <button
                type="button"
                data-testid="lang-dropdown-trigger"
                aria-label="Change display language"
                translate="no"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="h-8 px-3.5 flex items-center gap-1.5 rounded-full bg-[#ECEAE4] dark:bg-[#262626] hover:bg-[#E0DDD5] dark:hover:bg-[#323232] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out text-text select-none border-0 outline-none notranslate"
              >
                <Globe size={14} className="text-text/75" />
                <span className="font-mono text-xs font-semibold tracking-wider text-text notranslate" translate="no">{language.toUpperCase()}</span>
              </button>

              {showLangDropdown && (
                <div
                  ref={langBackdropRef}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangDropdown(false)}
                />
              )}

              {showLangDropdown && (
                <div 
                  ref={langListScrollRef}
                  className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-surface rounded-card shadow-dropdown border border-border p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar notranslate overscroll-contain"
                  style={{ scrollbarWidth: 'thin', overscrollBehavior: 'contain' }}
                  role="menu"
                  translate="no"
                >
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        data-lang-code={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'text-accent font-semibold bg-accent-soft/40'
                            : 'text-text hover:bg-bg'
                        }`}
                      >
                        <span className="truncate">
                          {lang.native} <span className="text-[10px] text-muted ml-1">({lang.name})</span>
                        </span>
                        {isSelected && <Check size={14} className="text-accent flex-shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pinned top gradient fade mask directly under nav */}
      <div 
        className={`fade-mask ${scrolled ? 'visible' : ''} fixed top-16 left-0 right-0 z-20 w-full h-10 pointer-events-none bg-gradient-to-b from-bg to-transparent`} 
        aria-hidden="true" 
      />

      {/* Main Page Content */}
      <div className="page-scroll-wrapper page-scroll-wrapper-no-nav">
        <main className="max-w-md mx-auto w-full px-4 pb-8 flex-1 flex flex-col">
        {/* 2. Top Branding / Hero Section */}
        <div className="pt-6 space-y-2 text-center">
          <div className="section-label">
            Ministry of Tribal Affairs · SIH26238
          </div>
          <h1 className="text-3xl font-extrabold text-accent tracking-tight">
            AdiSetu
          </h1>
          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            Unified scholarship middleware connecting NSP, SFMP, and NOS Portal for tribal students across India.
          </p>
        </div>

        {/* VIEW 1: Initial Login Card + Admin Link */}
        {authStage === 'LOGIN' && (
          <div className="space-y-4">
            {/* 3. Centered Login Card (max-w-[440px], p-7, rounded-xl, soft static shadow) */}
            <div className="w-full max-w-[440px] mx-auto bg-surface border border-border rounded-xl p-7 shadow-card mt-5">
              {loginMode === 'student' ? (
                <>
                  {/* Tab Strip: DigiLocker vs Phone Number (equal width, ~44px tall, neutral active underline) */}
                  <div className="grid grid-cols-2 border-b border-border mb-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab('digilocker')}
                      className={`h-11 flex items-center justify-center text-sm transition-colors relative ${
                        activeTab === 'digilocker'
                          ? 'text-text font-bold'
                          : 'text-muted font-normal hover:text-text'
                      }`}
                    >
                      <span>{t('tabDigiLocker')}</span>
                      {activeTab === 'digilocker' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-text" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('phone')}
                      className={`h-11 flex items-center justify-center text-sm transition-colors relative ${
                        activeTab === 'phone'
                          ? 'text-text font-bold'
                          : 'text-muted font-normal hover:text-text'
                      }`}
                    >
                      <span>{t('tabPhoneNumber')}</span>
                      {activeTab === 'phone' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-text" />
                      )}
                    </button>
                  </div>

                  {/* DigiLocker Tab Content */}
                  {activeTab === 'digilocker' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleDigiLockerLogin(); }}>
                      <div>
                        <label className="block text-xs font-semibold text-text mb-1.5">
                          {t('labelDigiLockerId')}
                        </label>
                        <input
                          type="text"
                          value={digiLockerId}
                          onChange={(e) => setDigiLockerId(e.target.value)}
                          placeholder={t('placeholderDigiLockerId')}
                          className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-text transition-colors placeholder-muted"
                        />
                      </div>

                      <div className="mt-3.5">
                        <label className="block text-xs font-semibold text-text mb-1.5">
                          {t('labelPassword')}
                        </label>
                        <input
                          type="password"
                          value={digiLockerPassword}
                          onChange={(e) => setDigiLockerPassword(e.target.value)}
                          placeholder={t('placeholderPassword')}
                          className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-text transition-colors placeholder-muted"
                        />
                      </div>

                      <div className="mt-5">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-12 bg-accent hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-card transition-all flex items-center justify-center gap-2"
                        >
                          <span>{isProcessing ? t('loggingIn') : t('login')}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Phone Number Tab Content */}
                  {activeTab === 'phone' && (
                    <form onSubmit={handleGetOtp}>
                      <div>
                        <label className="block text-xs font-semibold text-text mb-1.5">
                          {t('labelMobileNumber')}
                        </label>
                        <div className="flex items-center h-11 bg-bg border border-border rounded-lg px-3 focus-within:border-text transition-colors">
                          <span className="text-xs font-semibold text-muted pr-2.5 border-r border-border mr-2.5 select-none font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder={t('placeholderMobileNumber')}
                            className="w-full bg-transparent text-xs text-text font-mono focus:outline-none placeholder-muted"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-12 bg-accent hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-card transition-all flex items-center justify-center gap-2"
                        >
                          <span>{isProcessing ? t('sendingOtp') : t('continue')}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Inside Card Link for Student Mode */}
                  <div className="text-center mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginMode('admin')}
                      className="text-xs text-muted hover:text-text hover:underline transition-colors font-medium"
                    >
                      {t('adminPortalLink')}
                    </button>
                  </div>
                </>
              ) : (
                /* Admin / Officer Login Mode */
                <div>
                  <div className="border-b border-border pb-3 mb-6">
                    <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted block mb-0.5">
                      Verification Portal
                    </span>
                    <h2 className="text-base font-bold text-text">
                      Admin / Officer Login
                    </h2>
                  </div>

                  <form onSubmit={handleAdminLogin}>
                    {/* 1. Officer ID first */}
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1.5">
                        Officer ID
                      </label>
                      <input
                        type="text"
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder="e.g. OFF-88219"
                        className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-text transition-colors placeholder-muted font-mono"
                      />
                    </div>

                    {/* 2. Role (dropdown) second */}
                    <div className="mt-3.5">
                      <label className="block text-xs font-semibold text-text mb-1.5">
                        Role
                      </label>
                      <div className="relative">
                        <select
                          value={adminRole}
                          onChange={(e) => setAdminRole(e.target.value)}
                          className="w-full h-11 px-3 pr-9 bg-bg border border-border rounded-lg text-xs text-text appearance-none focus:outline-none focus:border-text transition-colors cursor-pointer"
                        >
                          <option value="officer">Verification Officer</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* 3. Password third */}
                    <div className="mt-3.5">
                      <label className="block text-xs font-semibold text-text mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-xs text-text focus:outline-none focus:border-text transition-colors placeholder-muted"
                      />
                    </div>

                    {/* 4. Login button */}
                    <div className="mt-5">
                      <button
                        type="submit"
                        disabled={isAdminProcessing}
                        className="w-full h-12 bg-accent hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-card transition-all flex items-center justify-center gap-2"
                      >
                        <span>{isAdminProcessing ? 'Logging in...' : 'Login'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Inside Card Link for Admin Mode */}
                  <div className="text-center mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginMode('student')}
                      className="text-xs text-muted hover:text-text hover:underline transition-colors font-medium inline-flex items-center gap-1"
                    >
                      ← Return to Student Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Mobile Number Input (Fallback compatibility stage) */}
        {authStage === 'MOBILE_INPUT' && (
          <div className="my-5 bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text">
                {t('loginWithMobile')}
              </h2>
              <span className="text-[10px] font-mono text-muted">Step 1 of 2</span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Enter your 10-digit registered mobile number. We will send an OTP for instant Aadhaar / DigiLocker profile matching.
            </p>

            <form onSubmit={handleGetOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  {t('enterMobile')}
                </label>
                <div className="flex items-center bg-bg border border-border/80 rounded-input px-3 py-2.5">
                  <span className="text-xs font-semibold text-muted pr-2 border-r border-border/80 mr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-transparent text-xs text-text font-mono focus:outline-none placeholder-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthStage('LOGIN'); setActiveTab('phone'); }}
                  className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text shadow-xs hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isProcessing ? t('sendingOtp') : t('getOtp')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: OTP Verification (Step 2 of 2) */}
        {authStage === 'MOBILE_OTP' && (
          <div className="my-5 bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text">
                {t('enterOtp')}
              </h2>
              <span className="text-[10px] font-mono text-muted">Step 2 of 2</span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Enter the 6-digit OTP sent to <strong className="text-text font-mono">+91 {mobileNumber}</strong>. (Mock verification: any 6 digits accepted).
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center justify-between gap-2 max-w-[280px] mx-auto py-1" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-bg border border-border/80 rounded-lg text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={() => setOtpDigits(['6', '5', '4', '3', '2', '1'])}
                  className="text-accent font-semibold hover:underline"
                >
                  {t('resendOtp')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthStage('LOGIN'); setActiveTab('phone'); }}
                  className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text shadow-xs hover:bg-border/80 active:scale-95 flex items-center justify-center gap-1 transition-all"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isProcessing ? "Verifying..." : t('verifyAndLogin')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 4: Profile Picker (Only shows AFTER login IF device has >1 profile) */}
        {authStage === 'PROFILE_CHOOSER' && (
          <div className="my-5 bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark mx-auto flex items-center justify-center font-bold text-sm">
                <Users size={18} />
              </div>
              <h2 className="text-base font-bold text-text">
                {t('selectProfile')}
              </h2>
              <p className="text-xs text-muted">
                2 student records linked to your DigiLocker / Aadhaar account:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {students.map((student, idx) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectProfile(student.id)}
                  className={`w-full p-3.5 rounded-card flex items-center justify-between text-left transition-all ${
                    idx === 0
                      ? 'bg-accent text-white shadow-card hover:opacity-95 active:scale-95'
                      : 'bg-[#ECECE7] dark:bg-[#2A2926] text-text shadow-xs hover:bg-[#DFDFD9] dark:hover:bg-[#343330] active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs notranslate ${
                      idx === 0 ? 'bg-white/20 text-white' : 'bg-surface text-text'
                    }`} translate="no">
                      {student.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {student.name}
                      </div>
                      <div className={`text-[11px] ${idx === 0 ? 'text-white/80' : 'text-muted'}`}>
                        Class {student.class} · {student.guardianManaged ? t('metaGuardianManaged') : t('metaSelfManaged')}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} className={idx === 0 ? 'text-white' : 'text-muted'} />
                </button>
              ))}
            </div>

            <p className="text-[11px] text-muted text-center pt-1">
              You can instantly switch between profiles anytime from the top-right profile avatar.
            </p>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
