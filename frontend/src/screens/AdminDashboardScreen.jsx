import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  initialExceptionQueue,
  initialContinuations,
  initialEligibilityCriteria,
  initialOfficerAccounts,
  mockAdminOfficers
} from '../data/mockAdminData';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  X,
  RefreshCw,
  Sliders,
  Users,
  Layers,
  FileCheck,
  Check,
  Info,
  LogOut,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon,
  Globe,
  Bookmark,
  BarChart3,
  Menu,
  PieChart,
  CheckCheck,
  Activity
} from 'lucide-react';

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    language,
    languages,
    setLanguage
  } = useApp();

  // Scroll position tracking for fade mask on internal scroll container
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    const y = e.currentTarget.scrollTop || 0;
    const isPast = y > 6;
    if (isPast !== scrolled) {
      setScrolled(isPast);
    }
  };

  // Admin auth session: stored in localStorage or default to 'officer'
  const [adminRole, setAdminRole] = useState(() => {
    try {
      return localStorage.getItem('adisetu_admin_role') || 'officer';
    } catch (e) {
      return 'officer';
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      const val = localStorage.getItem('adisetu_admin_logged_in');
      return val === null ? true : val === 'true';
    } catch (e) {
      return true;
    }
  });

  // Collapsible Sidebar state persisted in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('adisetu_admin_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('adisetu_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Top level active section: 'applications' | 'bookmarks' | 'stats' | 'criteria' | 'officers'
  const [activeSection, setActiveSection] = useState('applications');

  // Sub-tab under Applications: 'exceptions' | 'continuations'
  const [applicationsSubTab, setApplicationsSubTab] = useState('exceptions');

  // Live state for data tables
  const [exceptions, setExceptions] = useState(initialExceptionQueue);
  const [continuations, setContinuations] = useState(initialContinuations);
  const [criteria, setCriteria] = useState(initialEligibilityCriteria);
  const [officers, setOfficers] = useState(initialOfficerAccounts);

  // Bookmarks state (pre-seeded with demo IDs)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('adisetu_admin_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['NSP2026-89211', 'SFMP-OD-2026-104', 'NSP2026-90422'];
  });

  const toggleBookmark = (id, studentName) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('adisetu_admin_bookmarks', JSON.stringify(next));
      } catch (e) {}
      showToast(exists ? `Removed ${studentName || id} from Bookmarks` : `Saved ${studentName || id} to Bookmarks`);
      return next;
    });
  };

  // Search & Filter state for Exceptions
  const [searchQuery, setSearchQuery] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('ALL');
  const [issueFilter, setIssueFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search for Bookmarks
  const [bookmarkSearch, setBookmarkSearch] = useState('');

  // Dropdown states
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const langDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Modal states
  const [selectedException, setSelectedException] = useState(null);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Officer form state
  const [newOfficerForm, setNewOfficerForm] = useState({
    name: '',
    email: '',
    roleTier: 'Institutional Verification Officer',
    institute: '',
    district: '',
    state: 'Jharkhand'
  });

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsAdminLoggedIn(false);
    localStorage.setItem('adisetu_admin_logged_in', 'false');
    navigate('/landing?mode=admin');
  };

  const currentOfficer = adminRole === 'superadmin' ? mockAdminOfficers[1] : mockAdminOfficers[0];
  const officerLoginId = useMemo(() => {
    try {
      const stored = localStorage.getItem('adisetu_admin_officer_id');
      if (stored) return stored;
    } catch (e) {}
    return currentOfficer.officerId || (adminRole === 'superadmin' ? 'OFF-1001' : 'OFF-2291');
  }, [adminRole, currentOfficer]);

  // Exception resolve action
  const handleResolveException = (excId) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === excId ? { ...e, status: 'Resolved' } : e))
    );
    const target = exceptions.find((e) => e.id === excId);
    setSelectedException(null);
    showToast(`Exception resolved: ${target ? target.studentName : 'Student'} DBT disbursal unblocked & authorized.`);
  };

  // Continuation confirm action
  const handleConfirmContinuation = (contId) => {
    setContinuations((prev) =>
      prev.map((c) => (c.id === contId ? { ...c, status: 'Confirmed' } : c))
    );
    const target = continuations.find((c) => c.id === contId);
    showToast(`Continuation sanctioned: ${target ? target.studentName : 'Student'} renewed for 2026-27.`);
  };

  // Continuation flag action
  const handleFlagContinuation = (contId) => {
    setContinuations((prev) =>
      prev.map((c) => (c.id === contId ? { ...c, status: 'Flagged' } : c))
    );
    const target = continuations.find((c) => c.id === contId);
    showToast(`Notice sent: ${target ? target.studentName : 'Student'} flagged for institutional review.`);
  };

  // Add officer action
  const handleAddOfficerSubmit = (e) => {
    e.preventDefault();
    if (!newOfficerForm.name || !newOfficerForm.institute) return;
    const newOfficer = {
      id: `off-${Date.now()}`,
      name: newOfficerForm.name,
      email: newOfficerForm.email || `${newOfficerForm.name.toLowerCase().replace(/\s+/g, '.')}@gov.in`,
      roleTier: newOfficerForm.roleTier,
      institute: newOfficerForm.institute,
      district: newOfficerForm.district || 'District Welfare Office',
      state: newOfficerForm.state,
      status: 'Active',
      verifiedCount: 0,
      lastActive: 'Just now'
    };
    setOfficers([newOfficer, ...officers]);
    setIsAddOfficerOpen(false);
    setNewOfficerForm({
      name: '',
      email: '',
      roleTier: 'Institutional Verification Officer',
      institute: '',
      district: '',
      state: 'Jharkhand'
    });
    showToast(`Nodal account created for ${newOfficer.name}. Credentials dispatched.`);
  };

  // Save criteria changes action
  const handleSaveCriteria = () => {
    showToast("Eligibility policy changes saved & synced across NSP, SFMP, and NOS middleware.");
  };

  // Filtered exceptions
  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchSearch =
        searchQuery === '' ||
        exc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.issueType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchScheme = schemeFilter === 'ALL' || exc.schemeId === schemeFilter;
      const matchIssue =
        issueFilter === 'ALL' ||
        (issueFilter === 'aadhaar' && exc.issueType.toLowerCase().includes('aadhaar')) ||
        (issueFilter === 'certificate' && exc.issueType.toLowerCase().includes('cert')) ||
        (issueFilter === 'ifsc' && exc.issueType.toLowerCase().includes('ifsc')) ||
        (issueFilter === 'income' && exc.issueType.toLowerCase().includes('income'));

      const matchStatus =
        statusFilter === 'ALL' || exc.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchScheme && matchIssue && matchStatus;
    });
  }, [exceptions, searchQuery, schemeFilter, issueFilter, statusFilter]);

  // Dynamic counts
  const pendingExceptionsCount = exceptions.filter((e) => e.status === 'Pending').length;
  const resolvedExceptionsCount = exceptions.filter((e) => e.status === 'Resolved').length;
  const pendingContinuationsCount = continuations.filter((c) => c.status === 'Pending').length;
  const totalPendingApplicationsCount = pendingExceptionsCount + pendingContinuationsCount;

  // Bookmarked combined items
  const bookmarkedItems = useMemo(() => {
    const list = [];
    exceptions.forEach((exc) => {
      if (bookmarkedIds.includes(exc.applicationId) || bookmarkedIds.includes(exc.id)) {
        list.push({ ...exc, itemType: 'exception' });
      }
    });
    continuations.forEach((cont) => {
      if (bookmarkedIds.includes(cont.id)) {
        list.push({ ...cont, itemType: 'continuation' });
      }
    });
    if (!bookmarkSearch) return list;
    return list.filter((item) =>
      item.studentName.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      (item.applicationId && item.applicationId.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
      item.schemeName.toLowerCase().includes(bookmarkSearch.toLowerCase())
    );
  }, [exceptions, continuations, bookmarkedIds, bookmarkSearch]);

  if (!isAdminLoggedIn) {
    return <Navigate to="/landing?mode=admin" replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FBFBF9] dark:bg-[#0A0A0A] text-text flex flex-col font-sans antialiased text-sm">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] px-4 py-3 rounded-xl shadow-card border border-border/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs font-semibold">
          <CheckCircle2 size={16} className="text-green flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-70 text-muted"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP BAR HEADER                                              */}
      {/* Left: AdiSetu wordmark lockup                                  */}
      {/* Right: Theme toggle -> Language dropdown -> Profile Avatar     */}
      {/* All three controls: borderless, consistent tap area & styling   */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 w-full h-16 bg-surface shadow-[0_2px_8px_rgba(20,20,15,0.06)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-colors flex-shrink-0">
        <div className="w-full h-full px-5 flex items-center justify-between">
          {/* Left: Wordmark lockup */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-extrabold tracking-tight text-accent notranslate" translate="no">
              AdiSetu
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-soft text-accent-dark uppercase tracking-wider">
              Admin
            </span>
          </div>

          {/* Right: EXACT ORDER: 1. Theme toggle -> 2. Language dropdown -> 3. Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* 1. Theme toggle: Icon-only circular button, no border, transparent default, subtle hover */}
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

            {/* 2. Language dropdown: Pill-shaped borderless treatment, full 19 languages */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                aria-label="Change language"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="h-8 px-3.5 flex items-center gap-1.5 rounded-full bg-[#ECEAE4] dark:bg-[#262626] hover:bg-[#E0DDD5] dark:hover:bg-[#323232] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out text-text select-none border-0 outline-none shadow-xs"
              >
                <Globe size={14} className="text-text/75" />
                <span className="font-mono text-xs font-semibold tracking-wider text-text">
                  {language.toUpperCase()}
                </span>
              </button>

              {showLangDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-surface rounded-card shadow-dropdown border border-border p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar thin-scroll notranslate"
                  role="menu"
                  translate="no"
                >
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
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
                        {isSelected && <Check size={14} className="text-accent flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Profile Avatar trigger: Borderless circular button matching other controls */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                aria-label="Open officer profile menu"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-soft text-accent-dark font-bold text-xs hover:bg-accent-soft/80 active:scale-95 transition-all duration-200 ease-out select-none border-0 outline-none shadow-xs"
              >
                {currentOfficer.avatar}
              </button>

              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-surface rounded-card shadow-dropdown border border-border p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-text"
                  role="menu"
                >
                  {/* Full Identity Block: Each field on its own line in exact spec order */}
                  <div className="space-y-1.5 px-1 py-0.5">
                    {/* 1. Full name */}
                    <div className="font-bold text-sm text-text leading-snug">
                      {currentOfficer.name}
                    </div>

                    {/* 2. Officer ID */}
                    <div className="font-mono text-xs text-muted">
                      {officerLoginId}
                    </div>

                    {/* 3. Position / Designation */}
                    <div className="text-xs font-semibold text-accent leading-snug">
                      {currentOfficer.role}
                    </div>

                    {/* 4. Institute / School / University */}
                    <div className="text-xs text-text leading-snug">
                      {currentOfficer.institute}
                    </div>

                    {/* 5. Location (district / state — separate from institute) */}
                    <div className="text-xs text-muted leading-snug">
                      {currentOfficer.location || currentOfficer.district}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border my-2.5" />

                  {/* Logout Trigger (Opens Confirmation Modal) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-rust hover:bg-rust-soft flex items-center gap-2 transition-colors active:scale-95"
                  >
                    <LogOut size={14} />
                    <span>Sign Out of Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN BODY (COLLAPSIBLE FIXED SIDEBAR + SCROLLABLE CONTENT)   */}
      {/* ============================================================== */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* PERSISTENT FIXED LEFT SIDEBAR */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
          } flex-shrink-0 h-full bg-surface border-r border-border/80 dark:border-border/40 flex flex-col p-3 z-20 overflow-y-auto custom-scrollbar thin-scroll transition-all duration-200 ease-in-out`}
        >
          {/* Sidebar Top: Hamburger Toggle only (space between toggle and nav items matches inter-item gap of 4px) */}
          <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'} px-1 mb-1`}>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors active:scale-95"
            >
              <Menu size={21} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
              {/* 1. Applications (Houses Exception Queue + Continuations) */}
              <button
                type="button"
                onClick={() => setActiveSection('applications')}
                title="Applications (Exceptions & Continuations)"
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'applications'
                    ? 'bg-accent-soft text-accent-dark shadow-xs'
                    : 'text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]'
                }`}
              >
                {isSidebarCollapsed ? (
                  <div className="relative flex items-center justify-center">
                    <Layers
                      size={19}
                      className={activeSection === 'applications' ? 'text-accent-dark' : 'text-muted'}
                    />
                    {totalPendingApplicationsCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono font-bold bg-rust text-white flex items-center justify-center leading-none shadow-xs">
                        {totalPendingApplicationsCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers
                        size={19}
                        className={`flex-shrink-0 ${activeSection === 'applications' ? 'text-accent-dark' : 'text-muted'}`}
                      />
                      <span className="truncate">Applications</span>
                    </div>
                    {totalPendingApplicationsCount > 0 && (
                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 ${
                          activeSection === 'applications'
                            ? 'bg-accent text-white'
                            : 'bg-rust-soft text-rust-dark'
                        }`}
                      >
                        {totalPendingApplicationsCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* 2. Bookmarks (Starred applications for quick follow-up) */}
              <button
                type="button"
                onClick={() => setActiveSection('bookmarks')}
                title="Saved Bookmarks"
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'bookmarks'
                    ? 'bg-accent-soft text-accent-dark shadow-xs'
                    : 'text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]'
                }`}
              >
                {isSidebarCollapsed ? (
                  <div className="relative flex items-center justify-center">
                    <Bookmark
                      size={19}
                      className={activeSection === 'bookmarks' ? 'text-accent-dark fill-accent-dark/20' : 'text-muted'}
                    />
                    {bookmarkedIds.length > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono font-bold bg-accent text-white flex items-center justify-center leading-none shadow-xs">
                        {bookmarkedIds.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Bookmark
                        size={19}
                        className={`flex-shrink-0 ${activeSection === 'bookmarks' ? 'text-accent-dark fill-accent-dark/20' : 'text-muted'}`}
                      />
                      <span className="truncate">Bookmarks</span>
                    </div>
                    {bookmarkedIds.length > 0 && (
                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 ${
                          activeSection === 'bookmarks'
                            ? 'bg-accent text-white'
                            : 'bg-[#ECECE7] dark:bg-[#2A2926] text-text'
                        }`}
                      >
                        {bookmarkedIds.length}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* 3. Stats (Operations velocity & distribution charts) */}
              <button
                type="button"
                onClick={() => setActiveSection('stats')}
                title="Operations & Disbursal Stats"
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } rounded-lg text-xs font-semibold transition-all ${
                  activeSection === 'stats'
                    ? 'bg-accent-soft text-accent-dark shadow-xs'
                    : 'text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]'
                }`}
              >
                {isSidebarCollapsed ? (
                  <div className="relative flex items-center justify-center">
                    <BarChart3
                      size={19}
                      className={activeSection === 'stats' ? 'text-accent-dark' : 'text-muted'}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BarChart3
                      size={19}
                      className={`flex-shrink-0 ${activeSection === 'stats' ? 'text-accent-dark' : 'text-muted'}`}
                    />
                    <span className="truncate">Stats & Analytics</span>
                  </div>
                )}
              </button>

              {/* Super Admin Sections */}
              {adminRole === 'superadmin' && (
                <div className="pt-3 space-y-1">
                  {/* Eligibility Criteria */}
                  <button
                    type="button"
                    onClick={() => setActiveSection('criteria')}
                    title="Eligibility Rules Management"
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                    } rounded-lg text-xs font-semibold transition-all ${
                      activeSection === 'criteria'
                        ? 'bg-accent-soft text-accent-dark shadow-xs'
                        : 'text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]'
                    }`}
                  >
                    {isSidebarCollapsed ? (
                      <div className="relative flex items-center justify-center">
                        <Sliders
                          size={19}
                          className={activeSection === 'criteria' ? 'text-accent-dark' : 'text-muted'}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sliders
                          size={19}
                          className={`flex-shrink-0 ${activeSection === 'criteria' ? 'text-accent-dark' : 'text-muted'}`}
                        />
                        <span className="truncate">Eligibility Rules</span>
                      </div>
                    )}
                  </button>

                  {/* Officer Accounts */}
                  <button
                    type="button"
                    onClick={() => setActiveSection('officers')}
                    title="Officer Accounts Directory"
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                    } rounded-lg text-xs font-semibold transition-all ${
                      activeSection === 'officers'
                        ? 'bg-accent-soft text-accent-dark shadow-xs'
                        : 'text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]'
                    }`}
                  >
                    {isSidebarCollapsed ? (
                      <div className="relative flex items-center justify-center">
                        <Users
                          size={19}
                          className={activeSection === 'officers' ? 'text-accent-dark' : 'text-muted'}
                        />
                        {officers.length > 0 && (
                          <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono font-bold bg-[#ECECE7] dark:bg-[#2A2926] text-text flex items-center justify-center leading-none shadow-xs">
                            {officers.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Users
                            size={19}
                            className={`flex-shrink-0 ${activeSection === 'officers' ? 'text-accent-dark' : 'text-muted'}`}
                          />
                          <span className="truncate">Officer Accounts</span>
                        </div>
                        {officers.length > 0 && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ECECE7] dark:bg-[#2A2926] text-text flex-shrink-0">
                            {officers.length}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              )}
            </nav>
        </aside>

        {/* MAIN SCROLLABLE CONTENT AREA */}
        <div
          onScroll={handleScroll}
          className="flex-1 h-full overflow-y-scroll page-scroll-wrapper flex flex-col relative min-w-0"
          id="admin-main-scroll"
        >
          {/* Top fade mask: Pure sticky overlay with 0 flow height, never pushes or pulls content */}
          <div className="sticky top-0 z-20 w-full h-0 pointer-events-none">
            <div
              className={`fade-mask ${scrolled ? 'visible' : ''} h-12 w-full bg-gradient-to-b from-[#FBFBF9] dark:from-[#0A0A0A] to-transparent transition-opacity duration-200`}
              aria-hidden="true"
            />
          </div>

          <main className="flex-1 px-[28px] pt-[28px] pb-16 max-w-7xl w-full mx-auto">
            {/* ============================================================== */}
            {/* SECTION 1: APPLICATIONS (EXCEPTION QUEUE & CONTINUATIONS)      */}
            {/* ============================================================== */}
            {activeSection === 'applications' && (
              <div>
                {/* Applications Header with shared page-title typography */}
                <div className="page-header">
                  <h1 className="page-title">
                    Applications & Exception Management
                  </h1>
                  <p className="page-subtitle">
                    Review incoming scholarship discrepancies and annual continuation confirmations.
                  </p>
                </div>

                {/* Clean In-Flow Sub-Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-[#ECEAE4] dark:bg-[#1E1E1E] p-1 rounded-xl w-fit mb-5">
                  <button
                    type="button"
                    onClick={() => setApplicationsSubTab('exceptions')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      applicationsSubTab === 'exceptions'
                        ? 'bg-surface text-text shadow-xs'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    <AlertTriangle size={13} className={applicationsSubTab === 'exceptions' ? 'text-accent' : 'text-muted'} />
                    <span>Exception Queue</span>
                    {pendingExceptionsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rust-soft text-rust-dark">
                        {pendingExceptionsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplicationsSubTab('continuations')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      applicationsSubTab === 'continuations'
                        ? 'bg-surface text-text shadow-xs'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    <RefreshCw size={13} className={applicationsSubTab === 'continuations' ? 'text-accent' : 'text-muted'} />
                    <span>Continuation Confirmations</span>
                    {pendingContinuationsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ECECE7] dark:bg-[#2A2926] text-text">
                        {pendingContinuationsCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* SUB-VIEW 1: EXCEPTION QUEUE */}
                {applicationsSubTab === 'exceptions' && (
                  <div className="space-y-6 pt-1">
                    {/* 4 Stat KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Open Exceptions
                        </div>
                        <div className="text-2xl font-bold text-text">
                          {pendingExceptionsCount}
                        </div>
                        <div className="text-[11px] text-rust flex items-center gap-1 font-medium">
                          <AlertCircle size={12} />
                          <span>{exceptions.filter(e => e.status === 'Pending' && e.issueSeverity === 'urgent').length} Urgent DBT blocks</span>
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Avg. Resolution Time
                        </div>
                        <div className="text-2xl font-bold text-text">
                          18 mins
                        </div>
                        <div className="text-[11px] text-green flex items-center gap-1 font-medium">
                          <TrendingUp size={12} />
                          <span>Down from 14 days on NSP</span>
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Resolved This Week
                        </div>
                        <div className="text-2xl font-bold text-text">
                          {42 + resolvedExceptionsCount}
                        </div>
                        <div className="text-[11px] text-muted font-medium">
                          +18% nodal officer throughput
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Auto-Matched Records
                        </div>
                        <div className="text-2xl font-bold text-text">
                          94.2%
                        </div>
                        <div className="text-[11px] text-green flex items-center gap-1 font-medium">
                          <CheckCircle2 size={12} />
                          <span>DigiLocker & e-Pramaan verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Filter & Search Controls */}
                    <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                        <div className="relative w-full max-w-sm">
                          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search student, application ID, or issue..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg border border-border/80 text-xs text-text placeholder-muted focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <select
                          value={schemeFilter}
                          onChange={(e) => setSchemeFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-bg border border-border/80 text-text font-medium focus:outline-none"
                        >
                          <option value="ALL">All Schemes</option>
                          <option value="pm">Post-Matric (NSP)</option>
                          <option value="pre">Pre-Matric</option>
                          <option value="tc">Top Class</option>
                          <option value="nfST">NFST Fellowship</option>
                          <option value="nos">NOS Portal</option>
                        </select>

                        <select
                          value={issueFilter}
                          onChange={(e) => setIssueFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-bg border border-border/80 text-text font-medium focus:outline-none"
                        >
                          <option value="ALL">All Issues</option>
                          <option value="aadhaar">Aadhaar / DBT Mismatch</option>
                          <option value="certificate">Expiring Certificate</option>
                          <option value="ifsc">IFSC Mismatch</option>
                          <option value="income">Income Proof Verification</option>
                        </select>

                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-bg border border-border/80 text-text font-medium focus:outline-none"
                        >
                          <option value="ALL">All Status</option>
                          <option value="pending">Pending Only</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    {/* Exception Queue Data Table with Star Bookmarks */}
                    <div className="bg-surface rounded-card shadow-card border-0 dark:border dark:border-border/40 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF9F5] dark:bg-[#181818] border-b border-border/80 text-[11px] font-mono uppercase tracking-wider text-muted">
                              <th className="py-3 px-3 min-w-[70px] text-center font-bold">Bookmark</th>
                              <th className="py-3 px-4 font-bold">Student Name</th>
                              <th className="py-3 px-4 font-bold">Application ID</th>
                              <th className="py-3 px-4 font-bold">Scheme</th>
                              <th className="py-3 px-4 font-bold">Issue Diagnosis</th>
                              <th className="py-3 px-4 font-bold">Days Pending</th>
                              <th className="py-3 px-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-xs">
                            {filteredExceptions.map((exc) => {
                              const isResolved = exc.status === 'Resolved';
                              const isPriya = exc.studentName === 'Priya Oraon';
                              const isBookmarked = bookmarkedIds.includes(exc.applicationId) || bookmarkedIds.includes(exc.id);

                              return (
                                <tr
                                  key={exc.id}
                                  className={`transition-colors ${
                                    isPriya ? 'bg-accent-soft/20 dark:bg-accent/10' : 'hover:bg-[#FAF9F5] dark:hover:bg-[#181818]'
                                  }`}
                                >
                                  {/* Bookmark Toggle */}
                                  <td className="py-3.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleBookmark(exc.applicationId, exc.studentName)}
                                      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                                      className="p-1 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                                    >
                                      <Bookmark
                                        size={16}
                                        className={isBookmarked ? "text-accent fill-accent" : "text-muted hover:text-accent"}
                                      />
                                    </button>
                                  </td>

                                  {/* Student Name */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-text flex items-center gap-1.5">
                                      <span>{exc.studentName}</span>
                                      {isPriya && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent text-white uppercase">
                                          Active Demo
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-muted">
                                      {exc.classGrade} · <span className="font-semibold text-text/80">{exc.subTribe}</span>
                                    </div>
                                  </td>

                                  {/* Application ID & Source */}
                                  <td className="py-3.5 px-4 font-mono text-[11px]">
                                    <div className="font-semibold text-text">{exc.applicationId}</div>
                                    <span
                                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        exc.source === 'NOS PORTAL'
                                          ? 'bg-[#DCEEF9] text-[#1F5A8C] dark:bg-[#1A334A] dark:text-[#DCEEF9]'
                                          : exc.source === 'SFMP'
                                          ? 'bg-[#F2E8C9] text-[#5E4A0F] dark:bg-[#302812] dark:text-[#F2E8C9]'
                                          : 'bg-[#FBECE8] text-[#9E3D24] dark:bg-[#361E18] dark:text-[#F6BBAA]'
                                      }`}
                                    >
                                      {exc.source}
                                    </span>
                                  </td>

                                  {/* Scheme */}
                                  <td className="py-3.5 px-4 max-w-[220px]">
                                    <div className="font-semibold text-text truncate" title={exc.schemeName}>
                                      {exc.schemeName}
                                    </div>
                                    <div className="text-[10px] text-muted truncate">
                                      {exc.institute}
                                    </div>
                                  </td>

                                  {/* Issue Type */}
                                  <td className="py-3.5 px-4 max-w-[280px]">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                          isResolved
                                            ? 'bg-green-soft text-green'
                                            : exc.issueSeverity === 'urgent'
                                            ? 'bg-rust-soft text-rust-dark font-bold'
                                            : 'bg-amber-soft text-amber font-bold'
                                        }`}
                                      >
                                        {isResolved ? (
                                          <Check size={11} />
                                        ) : (
                                          <AlertTriangle size={11} />
                                        )}
                                        <span>{isResolved ? 'Resolved' : exc.issueType}</span>
                                      </span>
                                    </div>
                                    <div className="text-[10.5px] text-muted truncate mt-1" title={exc.issueSummary}>
                                      {exc.issueSummary}
                                    </div>
                                  </td>

                                  {/* Days Pending */}
                                  <td className="py-3.5 px-4 font-mono text-xs">
                                    <span className={exc.daysPending >= 4 && !isResolved ? 'text-rust font-bold' : 'text-muted'}>
                                      {isResolved ? 'Completed' : `${exc.daysPending} days`}
                                    </span>
                                  </td>

                                  {/* Action */}
                                  <td className="py-3.5 px-4 text-right">
                                    {isResolved ? (
                                      <span className="inline-flex items-center gap-1 text-green font-semibold text-xs">
                                        <CheckCircle2 size={14} />
                                        <span>Cleared</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedException(exc)}
                                        className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 active:scale-95 shadow-xs transition-all inline-flex items-center gap-1"
                                      >
                                        <span>Resolve</span>
                                        <ArrowRight size={13} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {filteredExceptions.length === 0 && (
                        <div className="p-8 text-center text-muted text-xs">
                          No matching exceptions found in the verification queue.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: CONTINUATION CONFIRMATIONS */}
                {applicationsSubTab === 'continuations' && (
                  <div className="space-y-6 pt-1">
                    {/* Stat KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Pending Annual Continuations
                        </div>
                        <div className="text-2xl font-bold text-text">
                          {pendingContinuationsCount}
                        </div>
                        <div className="text-[11px] text-muted">
                          Awaiting institutional marksheet sign-off
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Auto-Approved Renewals
                        </div>
                        <div className="text-2xl font-bold text-text">
                          86
                        </div>
                        <div className="text-[11px] text-green flex items-center gap-1 font-medium">
                          <CheckCircle2 size={12} />
                          <span>Instant DigiLocker grade match</span>
                        </div>
                      </div>

                      <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                          Disbursal Cutoff Deadline
                        </div>
                        <div className="text-2xl font-bold text-text">
                          31 Oct 2026
                        </div>
                        <div className="text-[11px] text-amber flex items-center gap-1 font-medium">
                          <Clock size={12} />
                          <span>34 days remaining in cycle</span>
                        </div>
                      </div>
                    </div>

                    {/* Continuations Data Table */}
                    <div className="bg-surface rounded-card shadow-card border-0 dark:border dark:border-border/40 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF9F5] dark:bg-[#181818] border-b border-border/80 text-[11px] font-mono uppercase tracking-wider text-muted">
                              <th className="py-3 px-3 min-w-[70px] text-center font-bold">Bookmark</th>
                              <th className="py-3 px-4 font-bold">Student Name</th>
                              <th className="py-3 px-4 font-bold">Scheme</th>
                              <th className="py-3 px-4 font-bold">Academic Milestone</th>
                              <th className="py-3 px-4 font-bold">Verified Stats</th>
                              <th className="py-3 px-4 font-bold">Annual Disbursal</th>
                              <th className="py-3 px-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-xs">
                            {continuations.map((cont) => {
                              const isConfirmed = cont.status === 'Confirmed';
                              const isFlagged = cont.status === 'Flagged';
                              const isBookmarked = bookmarkedIds.includes(cont.id);

                              return (
                                <tr key={cont.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#181818] transition-colors">
                                  {/* Bookmark Toggle */}
                                  <td className="py-3.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleBookmark(cont.id, cont.studentName)}
                                      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                                      className="p-1 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                                    >
                                      <Bookmark
                                        size={16}
                                        className={isBookmarked ? "text-accent fill-accent" : "text-muted hover:text-accent"}
                                      />
                                    </button>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-text">{cont.studentName}</div>
                                    <div className="text-[11px] text-muted truncate max-w-[200px]">
                                      {cont.institute}
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-text">{cont.schemeName}</div>
                                    <div className="text-[10px] font-mono text-muted">
                                      Last confirmed: {cont.lastConfirmed}
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-text">{cont.classOrYear}</div>
                                  </td>

                                  <td className="py-3.5 px-4 max-w-[260px]">
                                    <div className="flex items-center gap-1.5 text-text font-medium">
                                      <FileCheck size={14} className="text-green flex-shrink-0" />
                                      <span className="truncate">{cont.verifiedStats}</span>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 font-mono font-semibold text-text">
                                    {cont.disbursalAmount}
                                  </td>

                                  <td className="py-3.5 px-4 text-right">
                                    {isConfirmed ? (
                                      <span className="inline-flex items-center gap-1 text-green font-semibold text-xs">
                                        <CheckCircle2 size={15} />
                                        <span>Confirmed</span>
                                      </span>
                                    ) : isFlagged ? (
                                      <span className="inline-flex items-center gap-1 text-rust font-semibold text-xs">
                                        <AlertTriangle size={15} />
                                        <span>Flagged</span>
                                      </span>
                                    ) : (
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleConfirmContinuation(cont.id)}
                                          className="px-3 py-1.5 rounded-full bg-green text-white text-xs font-bold hover:opacity-90 active:scale-95 shadow-xs transition-all flex items-center gap-1"
                                        >
                                          <Check size={13} />
                                          <span>Confirm</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleFlagContinuation(cont.id)}
                                          className="px-2.5 py-1.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-muted hover:text-rust text-xs font-semibold transition-colors"
                                        >
                                          Flag
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SECTION 2: BOOKMARKS (SAVED APPLICATIONS & EXCEPTIONS)         */}
            {/* ============================================================== */}
            {activeSection === 'bookmarks' && (
              <div>
                <div className="page-header flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="page-title flex items-center gap-2.5 !mb-0">
                        <Bookmark size={24} className="text-accent fill-accent flex-shrink-0" />
                        <span>Saved Application Bookmarks</span>
                      </h1>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-soft text-accent-dark">
                        {bookmarkedItems.length} saved
                      </span>
                    </div>
                    <p className="page-subtitle mt-[5px]">
                      Fast-access list for flagged student cases requiring multi-party verification or parent follow-up.
                    </p>
                  </div>

                  {/* Search inside bookmarks */}
                  <div className="relative w-full max-w-xs pt-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={bookmarkSearch}
                      onChange={(e) => setBookmarkSearch(e.target.value)}
                      placeholder="Search saved applications..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border/80 text-xs text-text placeholder-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {bookmarkedItems.length > 0 ? (
                  <div className="bg-surface rounded-card shadow-card border-0 dark:border dark:border-border/40 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F5] dark:bg-[#181818] border-b border-border/80 text-[11px] font-mono uppercase tracking-wider text-muted">
                            <th className="py-3 px-3 min-w-[70px] text-center font-bold">Bookmark</th>
                            <th className="py-3 px-4 font-bold">Student Name</th>
                            <th className="py-3 px-4 font-bold">Application / ID</th>
                            <th className="py-3 px-4 font-bold">Scheme</th>
                            <th className="py-3 px-4 font-bold">Issue / Status</th>
                            <th className="py-3 px-4 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                          {bookmarkedItems.map((item) => {
                            const isExc = item.itemType === 'exception';
                            return (
                              <tr key={item.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#181818] transition-colors">
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleBookmark(item.applicationId || item.id, item.studentName)}
                                    title="Remove from bookmarks"
                                    className="p-1 rounded hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                                  >
                                    <Bookmark size={16} className="text-accent fill-accent" />
                                  </button>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-text">
                                  <div>{item.studentName}</div>
                                  <div className="text-[11px] text-muted font-normal">{item.institute}</div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                  <div className="font-semibold text-text">{item.applicationId || item.id}</div>
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent-soft text-accent-dark uppercase">
                                    {isExc ? 'Exception Case' : 'Continuation'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 max-w-[200px] truncate text-text">
                                  {item.schemeName}
                                </td>
                                <td className="py-3.5 px-4 max-w-[240px]">
                                  {isExc ? (
                                    <div className="space-y-0.5">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.status === 'Resolved' ? 'bg-green-soft text-green' : 'bg-rust-soft text-rust-dark'
                                      }`}>
                                        {item.status === 'Resolved' ? 'Resolved' : item.issueType}
                                      </span>
                                      <p className="text-[10px] text-muted truncate">{item.issueSummary}</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECECE7] dark:bg-[#2A2926] text-text">
                                        {item.classOrYear}
                                      </span>
                                      <p className="text-[10px] text-muted truncate">{item.verifiedStats}</p>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  {isExc ? (
                                    item.status === 'Resolved' ? (
                                      <span className="text-green font-bold text-xs flex items-center justify-end gap-1">
                                        <CheckCircle2 size={14} /> Cleared
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedException(item)}
                                        className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 shadow-xs"
                                      >
                                        Resolve
                                      </button>
                                    )
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmContinuation(item.id)}
                                      className="px-3 py-1.5 rounded-full bg-green text-white text-xs font-bold hover:opacity-90 shadow-xs"
                                    >
                                      Confirm
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface rounded-card p-12 text-center space-y-3 shadow-card border-0 dark:border dark:border-border/40">
                    <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                      <Bookmark size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h3 className="text-sm font-bold text-text">No Bookmarked Applications</h3>
                      <p className="text-xs text-muted">
                        Click the bookmark icon next to any student row in the Exception Queue or Continuations list to save them here for quick access.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SECTION 3: STATS & OPERATIONS ANALYTICS                        */}
            {/* ============================================================== */}
            {activeSection === 'stats' && (
              <div>
                <div className="page-header">
                  <h1 className="page-title flex items-center gap-2.5">
                    <BarChart3 size={24} className="text-accent flex-shrink-0" />
                    <span>Disbursal Velocity & Verification Throughput</span>
                  </h1>
                  <p className="page-subtitle">
                    Live telemetry across automated DigiLocker verification, middleware handshakes, and institutional approvals.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 4 KPI Top Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                      Open Exceptions
                    </div>
                    <div className="text-2xl font-bold text-text">
                      {pendingExceptionsCount}
                    </div>
                    <div className="text-[11px] text-rust flex items-center gap-1 font-semibold">
                      <AlertCircle size={12} />
                      <span>{exceptions.filter(e => e.status === 'Pending' && e.issueSeverity === 'urgent').length} Urgent DBT blocks</span>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                      Avg. Resolution Time
                    </div>
                    <div className="text-2xl font-bold text-text">
                      18 mins
                    </div>
                    <div className="text-[11px] text-green flex items-center gap-1 font-semibold">
                      <TrendingUp size={12} />
                      <span>-99.2% vs manual NSP queue</span>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                      Weekly Resolved
                    </div>
                    <div className="text-2xl font-bold text-text">
                      {42 + resolvedExceptionsCount}
                    </div>
                    <div className="text-[11px] text-accent font-semibold flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>+18% higher officer velocity</span>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-card shadow-card border-0 dark:border dark:border-border/40 space-y-1">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                      Instant Auto-Match Rate
                    </div>
                    <div className="text-2xl font-bold text-text">
                      94.2%
                    </div>
                    <div className="text-[11px] text-green flex items-center gap-1 font-semibold">
                      <CheckCheck size={12} />
                      <span>Zero officer touch required</span>
                    </div>
                  </div>
                </div>

                {/* 2 Operations Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Weekly Resolution Velocity Bar Chart */}
                  <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                          <Activity size={16} className="text-accent" />
                          <span>Weekly Resolution & Disbursal Velocity</span>
                        </h3>
                        <p className="text-[11px] text-muted">Daily exceptions resolved vs target (Mon–Sun)</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-soft text-green">
                        +32% vs last cycle
                      </span>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="pt-4 pb-2">
                      <div className="grid grid-cols-7 gap-3 items-end h-44 border-b border-border/80 px-2 pb-2">
                        {[
                          { day: 'Mon', count: 18, height: '55%', target: 15 },
                          { day: 'Tue', count: 24, height: '75%', target: 15 },
                          { day: 'Wed', count: 31, height: '95%', target: 15 },
                          { day: 'Thu', count: 22, height: '68%', target: 15 },
                          { day: 'Fri', count: 29, height: '88%', target: 15 },
                          { day: 'Sat', count: 14, height: '42%', target: 10 },
                          { day: 'Sun', count: 8, height: '25%', target: 5 },
                        ].map((col) => (
                          <div key={col.day} className="flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                            <div className="text-[10px] font-mono font-bold text-muted group-hover:text-accent transition-colors">
                              {col.count}
                            </div>
                            <div
                              style={{ height: col.height }}
                              className="w-full max-w-[32px] rounded-t-lg bg-accent-soft hover:bg-accent group-hover:shadow-md transition-all duration-200 relative"
                            >
                              <div className="absolute inset-x-0 bottom-0 bg-accent rounded-t-lg h-2/3 group-hover:h-full transition-all"></div>
                            </div>
                            <div className="text-[10.5px] font-mono text-muted uppercase font-semibold">
                              {col.day}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-accent"></span>
                        <span>Authorized DBT Disbursals</span>
                      </span>
                      <span>Target: &gt;15 cases / day</span>
                    </div>
                  </div>

                  {/* Chart 2: Issue-Type Volume Breakdown */}
                  <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                          <PieChart size={16} className="text-accent" />
                          <span>Issue-Type Volume Breakdown</span>
                        </h3>
                        <p className="text-[11px] text-muted">Distribution of unblocked exception flags across portals</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-muted">
                        Total: 67 Cases
                      </span>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {[
                        { label: 'Aadhaar / NPCI DBT Unseeded', percentage: 42, count: 28, color: 'bg-rust', soft: 'bg-rust-soft' },
                        { label: 'Expiring Income & Caste Certificate', percentage: 28, count: 19, color: 'bg-amber', soft: 'bg-amber-soft' },
                        { label: 'Bank Branch Merger / IFSC Update', percentage: 18, count: 12, color: 'bg-[#1F5A8C]', soft: 'bg-[#DCEEF9]' },
                        { label: 'Academic Attendance / Milestone Review', percentage: 12, count: 8, color: 'bg-green', soft: 'bg-green-soft' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-text truncate max-w-[260px]">{item.label}</span>
                            <span className="font-mono text-[11px] text-muted font-bold">
                              {item.count} cases ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-bg overflow-hidden border border-border/40">
                            <div
                              style={{ width: `${item.percentage}%` }}
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-bg border border-border/60 text-xs text-muted flex items-start gap-2">
                      <Info size={15} className="text-accent flex-shrink-0 mt-0.5" />
                      <span>
                        92% of Aadhaar-bank unseeded flags are automatically resolved through student Umang/DigiLocker consent callbacks without manual bank branch visits.
                      </span>
                    </div>
                  </div>
                </div>

                {/* State & Regional Performance Table */}
                <div className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-3">
                  <h3 className="text-sm font-bold text-text">State & District Verification Efficiency</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF9F5] dark:bg-[#181818] border-b border-border/80 text-[11px] font-mono uppercase tracking-wider text-muted">
                          <th className="py-2.5 px-3 font-bold">Jurisdiction / State</th>
                          <th className="py-2.5 px-3 font-bold">Nodal Officers</th>
                          <th className="py-2.5 px-3 font-bold">Avg Response</th>
                          <th className="py-2.5 px-3 font-bold">On-Time Disbursal %</th>
                          <th className="py-2.5 px-3 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-text">Jharkhand (Ranchi, Khunti, Dumka)</td>
                          <td className="py-2.5 px-3 font-mono">14 active verifiers</td>
                          <td className="py-2.5 px-3 font-mono">12 mins</td>
                          <td className="py-2.5 px-3 font-mono text-green font-bold">96.4%</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-soft text-green">Optimal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-text">Odisha (Mayurbhanj, Sundargarh)</td>
                          <td className="py-2.5 px-3 font-mono">9 active verifiers</td>
                          <td className="py-2.5 px-3 font-mono">19 mins</td>
                          <td className="py-2.5 px-3 font-mono text-green font-bold">93.8%</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-soft text-green">Optimal</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-text">Madhya Pradesh (Mandla, Jhabua)</td>
                          <td className="py-2.5 px-3 font-mono">8 active verifiers</td>
                          <td className="py-2.5 px-3 font-mono">24 mins</td>
                          <td className="py-2.5 px-3 font-mono text-text font-bold">91.2%</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECECE7] dark:bg-[#2A2926] text-text">Normal</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* ============================================================== */}
            {/* SECTION 4: ELIGIBILITY CRITERIA (SUPER ADMIN ONLY)             */}
            {/* ============================================================== */}
            {activeSection === 'criteria' && adminRole === 'superadmin' && (
              <div>
                <div className="page-header flex items-start justify-between gap-4">
                  <div>
                    <h1 className="page-title">
                      Central Scheme Parameter Management
                    </h1>
                    <p className="page-subtitle">
                      Real-time eligibility rules enforced on student auto-matching engine.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCriteria}
                    className="px-4 py-2 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 active:scale-95 shadow-card transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save Policy Changes</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criteria.map((rule) => (
                    <div
                      key={rule.id}
                      className="bg-surface rounded-card p-5 shadow-card border-0 dark:border dark:border-border/40 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">
                            {rule.schemeCode} · {rule.source}
                          </div>
                          <h3 className="text-sm font-bold text-text mt-0.5">
                            {rule.name}
                          </h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-soft text-green uppercase">
                          {rule.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Annual Family Income Ceiling
                          </label>
                          <input
                            type="text"
                            defaultValue={rule.annualIncomeCap}
                            className="w-full bg-bg border border-border/80 rounded-lg px-3 py-1.5 text-xs text-text font-mono font-semibold focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Target Student Academic Eligibility
                          </label>
                          <input
                            type="text"
                            defaultValue={rule.targetClasses}
                            className="w-full bg-bg border border-border/80 rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Direct Benefit Disbursal Formula
                          </label>
                          <textarea
                            rows={2}
                            defaultValue={rule.benefitSummary}
                            className="w-full bg-bg border border-border/80 rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SECTION 5: OFFICER ACCOUNTS (SUPER ADMIN ONLY)                 */}
            {/* ============================================================== */}
            {activeSection === 'officers' && adminRole === 'superadmin' && (
              <div>
                <div className="page-header flex items-start justify-between gap-4">
                  <div>
                    <h1 className="page-title">
                      Authorized Nodal Officer Directory
                    </h1>
                    <p className="page-subtitle">
                      Manage institutional verifiers and state/district welfare liaisons across India.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddOfficerOpen(true)}
                    className="px-4 py-2 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 active:scale-95 shadow-card transition-all flex items-center gap-1.5"
                  >
                    <Users size={14} />
                    <span>+ Add Nodal Officer</span>
                  </button>
                </div>

                {/* Officers Table */}
                <div className="bg-surface rounded-card shadow-card border-0 dark:border dark:border-border/40 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F5] dark:bg-[#181818] border-b border-border/80 text-[11px] font-mono uppercase tracking-wider text-muted">
                          <th className="py-3 px-4 font-bold">Officer Name</th>
                          <th className="py-3 px-4 font-bold">Designation / Role Tier</th>
                          <th className="py-3 px-4 font-bold">Affiliated Institution</th>
                          <th className="py-3 px-4 font-bold">Jurisdiction / State</th>
                          <th className="py-3 px-4 font-bold">Verified</th>
                          <th className="py-3 px-4 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs">
                        {officers.map((off) => (
                          <tr key={off.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#181818] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-text">
                              <div>{off.name}</div>
                              <div className="text-[11px] text-muted font-normal">{off.email}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-text">{off.roleTier}</span>
                            </td>
                            <td className="py-3.5 px-4 text-text/90">
                              {off.institute}
                            </td>
                            <td className="py-3.5 px-4 text-muted font-mono">
                              {off.district}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-text">
                              {off.verifiedCount}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-green font-semibold text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-green"></span>
                                <span>{off.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. EXCEPTION RESOLUTION MODAL                                  */}
      {/* ============================================================== */}
      {selectedException && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-card p-6 shadow-card border-0 dark:border dark:border-border/40 max-w-xl w-full space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-border/60">
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted font-bold">
                  Exception Case #{selectedException.applicationId}
                </div>
                <h3 className="text-base font-bold text-text mt-0.5">
                  Resolve Scholarship Discrepancy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="p-1 rounded-lg text-muted hover:text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student & Bank Information */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-bg p-3.5 rounded-lg border border-border/60">
              <div>
                <span className="text-muted">Student:</span>
                <div className="font-bold text-text mt-0.5">{selectedException.studentName}</div>
                <div className="text-[11px] text-muted">{selectedException.classGrade} · {selectedException.subTribe}</div>
              </div>
              <div>
                <span className="text-muted">Target Scheme:</span>
                <div className="font-bold text-text mt-0.5 truncate">{selectedException.schemeName}</div>
                <div className="text-[11px] font-mono text-muted">{selectedException.source}</div>
              </div>
              <div className="col-span-2 pt-2 border-t border-border/40 flex justify-between">
                <div>
                  <span className="text-muted">Disbursal Account:</span>
                  <div className="font-mono font-semibold text-text">{selectedException.bankDetails.bankName} ({selectedException.bankDetails.accountNo})</div>
                </div>
                <div>
                  <span className="text-muted">IFSC Code:</span>
                  <div className="font-mono font-semibold text-text">{selectedException.bankDetails.ifsc}</div>
                </div>
              </div>
            </div>

            {/* Discrepancy Details & Automated Fix */}
            <div className="p-3.5 rounded-lg bg-rust-soft text-rust-dark space-y-1.5 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} />
                <span>Flagged Issue: {selectedException.issueType}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {selectedException.issueSummary}
              </p>
            </div>

            {/* DigiLocker Automated Sync Status */}
            <div className="p-3.5 rounded-lg bg-green-soft text-green space-y-1.5 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>DigiLocker / e-Pramaan Live Resolution</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {selectedException.digilockerStatus}
              </p>
            </div>

            {/* Action Buttons: 50/50 Equal Width */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="w-full py-3 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text hover:bg-border/80 active:scale-95 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolveException(selectedException.id)}
                className="w-full py-3 px-3 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 active:scale-95 shadow-card transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>Mark Resolved & Authorize DBT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. ADD OFFICER MODAL (SUPER ADMIN)                             */}
      {/* ============================================================== */}
      {isAddOfficerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-card p-6 shadow-card border-0 dark:border dark:border-border/40 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-text">
                  Register New Nodal Officer
                </h3>
                <p className="text-xs text-muted">
                  Issue credentials for an institutional or district verifier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOfficerOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-text hover:bg-[#ECECE7] dark:hover:bg-[#202020]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddOfficerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-text mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sushil Kumar Soren"
                  value={newOfficerForm.name}
                  onChange={(e) => setNewOfficerForm({ ...newOfficerForm, name: e.target.value })}
                  className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text mb-1">
                  Official Email ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.soren@ranchi.gov.in"
                  value={newOfficerForm.email}
                  onChange={(e) => setNewOfficerForm({ ...newOfficerForm, email: e.target.value })}
                  className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text mb-1">
                  Role Tier
                </label>
                <select
                  value={newOfficerForm.roleTier}
                  onChange={(e) => setNewOfficerForm({ ...newOfficerForm, roleTier: e.target.value })}
                  className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                >
                  <option value="Institutional Verification Officer">Institutional Verification Officer</option>
                  <option value="District Nodal Officer (DNO)">District Nodal Officer (DNO)</option>
                  <option value="State Liaison Officer (SLO)">State Liaison Officer (SLO)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text mb-1">
                  Institution or District Office
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ranchi College of Arts & Commerce"
                  value={newOfficerForm.institute}
                  onChange={(e) => setNewOfficerForm({ ...newOfficerForm, institute: e.target.value })}
                  className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ranchi"
                    value={newOfficerForm.district}
                    onChange={(e) => setNewOfficerForm({ ...newOfficerForm, district: e.target.value })}
                    className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    defaultValue="Jharkhand"
                    value={newOfficerForm.state}
                    onChange={(e) => setNewOfficerForm({ ...newOfficerForm, state: e.target.value })}
                    className="w-full bg-bg border border-border/80 rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerOpen(false)}
                  className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] text-xs font-semibold text-text hover:bg-border/80 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-bold hover:opacity-95 shadow-card transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ADMIN LOGOUT CONFIRMATION MODAL                             */}
      {/* ============================================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowLogoutModal(false)}
            aria-hidden="true"
          />

          <div className="w-full max-w-sm bg-surface rounded-card p-5 shadow-modal border border-border space-y-4 animate-in zoom-in-95 duration-150 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-rust-soft text-rust flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-text">
                    Log out of Admin Portal?
                  </div>
                  <div className="text-xs text-muted">
                    {currentOfficer.name} · {currentOfficer.roleTier || currentOfficer.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => setShowLogoutModal(false)}
                className="text-muted hover:text-text p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              You will need to sign in again to access verification queues, resolve exceptions, and authorize DBT disbursals.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 rounded-full bg-[#ECECE7] dark:bg-[#2A2926] shadow-xs text-xs font-semibold text-text hover:bg-border/80 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-full bg-rust text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
