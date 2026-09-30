import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialStudents,
  initialSchemes,
  initialApplications,
  initialDocuments,
  initialNotifications,
} from '../data/mockData';
import { translations, languages } from '../data/translations';
import { conflictWith } from '../data/schemeRules';
import { 
  applyGoogleTranslation, 
  triggerGoogleTranslate, 
  GOOGLE_ROUTED, 
  GOOGLE_TRANSLATE_LANGS 
} from '../utils/googleTranslate';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [students, setStudents] = useState(initialStudents);
  
  // Persistent profile ID in localStorage
  const [currentStudentId, setCurrentStudentId] = useState(() => {
    try {
      const saved = localStorage.getItem('adisetu_active_profile_id');
      if (saved && initialStudents.some((s) => s.id === saved)) {
        return saved;
      }
    } catch (e) {}
    return "student-1";
  });

  // Persistent login session in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('adisetu_is_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persistent theme & language
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('adisetu_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('adisetu_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const [googleTranslateActive, setGoogleTranslateActive] = useState(() => {
    try {
      const saved = localStorage.getItem('adisetu_language') || 'en';
      return saved !== 'en' && GOOGLE_ROUTED.includes(saved);
    } catch (e) {
      return false;
    }
  });

  // Synchronize Google Translate on mount and when ready
  useEffect(() => {
    if (GOOGLE_ROUTED.includes(language) && language !== 'en') {
      applyGoogleTranslation(language, () => {
        setGoogleTranslateActive(false);
      });
    } else if (!GOOGLE_ROUTED.includes(language)) {
      setGoogleTranslateActive(false);
      triggerGoogleTranslate('en');
    }

    const handleReady = () => {
      if (GOOGLE_ROUTED.includes(language) && language !== 'en') {
        applyGoogleTranslation(language, () => {
          setGoogleTranslateActive(false);
        });
      }
    };

    window.addEventListener('google-translate-ready', handleReady);
    return () => window.removeEventListener('google-translate-ready', handleReady);
  }, []);

  const [schemes, setSchemes] = useState(initialSchemes);
  const [selectedSchemeIds, setSelectedSchemeIds] = useState([]);
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('adisetu_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialApplications;
  });

  // Sync applications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adisetu_applications', JSON.stringify(applications));
    } catch (e) {}
  }, [applications]);

  const [documents, setDocuments] = useState(initialDocuments);
  const [notifications, setNotifications] = useState(initialNotifications);
  
  // Unread indicator for Updates tab
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(true);
  
  // Risk banner state (cross-cutting urgent DBT Aadhaar issue)
  const [riskBannerDismissed, setRiskBannerDismissed] = useState(false);

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  // Translation function:
  // When Google Translate is actively translating the page for a supported language,
  // keep base text in English so Google Translate can translate from pageLanguage: 'en'.
  // For tribal languages (Gondi, Mundari, Kurukh, Ho, Bhili):
  // Return tribal dictionary text with fallback to Hindi (hiFallback) and then English.
  const t = (key) => {
    if (googleTranslateActive && GOOGLE_ROUTED.includes(language) && language !== 'en') {
      return translations.en[key] || key;
    }
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Hindi fallback for tribal languages or missing keys
    if (translations.hi && translations.hi[key]) {
      return translations.hi[key];
    }
    return translations.en[key] || key;
  };

  const toggleSchemeSelection = (id) => {
    setSelectedSchemeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSchemeSelection = () => {
    setSelectedSchemeIds([]);
  };

  const selectAllEligible = () => {
    const allIds = schemes.map((s) => s.id);
    setSelectedSchemeIds(allIds);
  };

  // Add single application. A student can avail only one scholarship/fellowship scheme at a time
  // (add-on grants may be held alongside a scholarship) - enforced here, not only in the batch UI,
  // so there is exactly one place applications are created and exactly one place the rule is checked.
  const applyToScheme = (schemeId, replaceConflict = false) => {
    const scheme = schemes.find((s) => s.id === schemeId);
    if (!scheme) return null;

    // Check if already applied by current student
    const existing = applications.find((a) => a.schemeId === schemeId && a.studentId === currentStudent?.id);
    if (existing) return existing;

    const appliedIds = applications.filter((a) => a.studentId === currentStudent?.id).map((a) => a.schemeId);
    const blocked = conflictWith(appliedIds, schemeId, schemes);
    if (blocked) {
      if (replaceConflict) {
        // Automatically withdraw the conflicting application and proceed
        setApplications((prev) => prev.filter((a) => !(a.studentId === currentStudent?.id && a.schemeId === blocked.blockerId)));
      } else {
        const blockerScheme = schemes.find((s) => s.id === blocked.blockerId);
        return { conflict: { ...blocked, blockerName: blockerScheme?.shortName || blockerScheme?.name || blocked.blockerId } };
      }
    }

    const newAppId = `app-${Date.now()}`;
    const newApplication = {
      id: newAppId,
      studentId: currentStudent?.id,
      schemeId: scheme.id,
      name: scheme.shortName || scheme.name,
      source: scheme.source,
      applicationNumber: `${scheme.source}2026-${Math.floor(10000 + Math.random() * 90000)}`,
      statusLabel: "Submitted",
      appliedDate: "Today (27 Sep 2026)",
      lastUpdated: "Just now",
      steps: ["done", "pending", "pending", "pending"],
      stageNames: ["Submitted", "Verification", "Sanctioned", "Disbursed"],
      note: null,
      tag: null,
      amount: scheme.category === "NFST" ? "₹37,000/month" : scheme.financialAssistance?.split('+')[0] || "₹13,500/year",
    };

    setApplications((prev) => [
      newApplication,
      ...(replaceConflict && blocked
        ? prev.filter((a) => !(a.studentId === currentStudent?.id && a.schemeId === blocked.blockerId))
        : prev),
    ]);
    setHasUnreadUpdates(true);

    // Update document usage references
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.status === "Verified") {
          return {
            ...doc,
            usedInApplicationIds: [...new Set([...doc.usedInApplicationIds, newAppId])],
            usedInNames: [...new Set([...doc.usedInNames, scheme.shortName || scheme.name])],
          };
        }
        return doc;
      })
    );

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      kind: "scheme",
      title: `Application Submitted — ${scheme.shortName || scheme.name}`,
      body: `Your application has been registered under ${scheme.source} and forwarded to Institutional Verification.`,
      time: "Just now",
      relatedSchemeId: scheme.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newApplication;
  };

  // Withdraw an application by ID or schemeId
  const withdrawApplication = (appIdOrSchemeId) => {
    setApplications((prev) => prev.filter((a) => a.id !== appIdOrSchemeId && a.schemeId !== appIdOrSchemeId));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        kind: "scheme",
        title: "Application Withdrawn",
        body: "Your previous application has been withdrawn. You can now apply for other schemes.",
        time: "Just now",
      },
      ...prev,
    ]);
  };

  // Reset applications to default state
  const resetApplications = () => {
    setApplications(initialApplications);
    clearSchemeSelection();
    try {
      localStorage.removeItem('adisetu_applications');
    } catch (e) {}
  };

  // Batch apply to multiple schemes. Same one-scheme-at-a-time rule as applyToScheme, checked against
  // both existing applications and the other schemes already accepted earlier in this same batch.
  const applyToBatch = (schemeIds) => {
    const createdApps = [];
    const targetSchemes = schemes.filter((s) => schemeIds.includes(s.id));
    const existingAppliedIds = applications.filter((a) => a.studentId === currentStudent?.id).map((a) => a.schemeId);
    const acceptedIds = [];

    targetSchemes.forEach((scheme) => {
      const existing = applications.find((a) => a.schemeId === scheme.id);
      const blocked = !existing && conflictWith([...existingAppliedIds, ...acceptedIds], scheme.id, schemes);
      if (!existing && !blocked) {
        acceptedIds.push(scheme.id);
        const newAppId = `app-${Date.now()}-${scheme.id}`;
        const newApp = {
          id: newAppId,
          studentId: currentStudent?.id,
          schemeId: scheme.id,
          name: scheme.shortName,
          source: scheme.source,
          applicationNumber: `${scheme.source}2026-${Math.floor(10000 + Math.random() * 90000)}`,
          statusLabel: "Submitted",
          appliedDate: "Today (27 Sep 2026)",
          lastUpdated: "Just now",
          steps: ["done", "pending", "pending", "pending"],
          stageNames: ["Submitted", "Verification", "Sanctioned", "Disbursed"],
          note: null,
          tag: null,
          amount: scheme.category === "NFST" ? "₹37,000/month" : "₹13,500/year",
        };
        createdApps.push(newApp);
      }
    });

    if (createdApps.length > 0) {
      setApplications((prev) => [...createdApps, ...prev]);
      setHasUnreadUpdates(true);
      clearSchemeSelection();

      // Update document references
      const appNames = createdApps.map((a) => a.name);
      const appIds = createdApps.map((a) => a.id);
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.status === "Verified") {
            return {
              ...doc,
              usedInApplicationIds: [...new Set([...doc.usedInApplicationIds, ...appIds])],
              usedInNames: [...new Set([...doc.usedInNames, ...appNames])],
            };
          }
          return doc;
        })
      );

      // Notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        kind: "scheme",
        title: `Batch Application Submitted (${createdApps.length} Schemes)`,
        body: `Applied to ${appNames.join(', ')} with your verified document wallet.`,
        time: "Just now",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return createdApps;
  };

  // Renew document (updates Caste Certificate or Domicile)
  const renewDocument = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: "Verified",
            tone: "green",
            expiresOn: "Valid till 27 Sep 2029 (Renewed)",
            expiryDays: 1095,
            canRenew: false,
          };
        }
        return doc;
      })
    );

    // If it was caste cert, clear the notification or mark resolved
    if (docId === "doc-caste") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.relatedDocId === "doc-caste"
            ? { ...n, title: "Caste Certificate Renewed & Verified", body: "New certificate valid for 3 years attached to your wallet." }
            : n
        )
      );
    }
  };

  // Add new document
  const addDocument = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docData.name,
      docNumber: docData.docNumber || `JH/NEW/${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Verified",
      tone: "green",
      expiresOn: "Valid till 2028",
      expiryDays: 730,
      issuer: docData.issuer || "Competent District Authority",
      issuedOn: "Sep 2026",
      verifiedBy: "DigiLocker / Instant e-KYC",
      usedInApplicationIds: [],
      usedInNames: [],
      canRenew: false,
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Switch student profile (Gmail-style silent switch)
  const switchStudent = (studentId) => {
    setCurrentStudentId(studentId);
    clearSchemeSelection();
    try {
      localStorage.setItem('adisetu_active_profile_id', studentId);
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('adisetu_theme', nextTheme);
      } catch (e) {}
      return nextTheme;
    });
  };

  const setLanguage = (langCode) => {
    // Checkmark/persisted state — always runs regardless
    setLanguageState(langCode);
    try {
      localStorage.setItem('adisetu_language', langCode);
    } catch (e) {}

    if (GOOGLE_ROUTED.includes(langCode)) {
      if (langCode === 'en') {
        setGoogleTranslateActive(false);
        triggerGoogleTranslate('en');
      } else {
        setGoogleTranslateActive(true);
        applyGoogleTranslation(langCode, () => {
          setGoogleTranslateActive(false);
        });
      }
    } else {
      // Gondi, Mundari, Kurukh, Ho, Bhili (and Santali if fallback)
      triggerGoogleTranslate('en'); // reset any prior Google translation first
      setGoogleTranslateActive(false); // switches i18n context to the manual hiFallback dictionary
    }
  };

  const resolveRiskIssue = () => {
    // Mark Aadhaar linked
    setStudents((prev) =>
      prev.map((s) =>
        s.id === currentStudentId
          ? {
              ...s,
              bankAccount: {
                ...s.bankAccount,
                dbtSeeded: true,
              },
            }
          : s
      )
    );

    // Unblock the Post-Matric application
    setApplications((prev) =>
      prev.map((app) =>
        app.id === "app-1"
          ? {
              ...app,
              statusLabel: "In Progress",
              steps: ["done", "current", "pending", "pending"],
              note: null,
            }
          : app
      )
    );

    setRiskBannerDismissed(true);

    // Add confirmation notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      kind: "alert",
      title: "Bank DBT Seeding Verified",
      body: "Aadhaar successfully linked with SBI account. Verification stage resumed for Post-Matric.",
      time: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const login = (studentId) => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('adisetu_is_logged_in', 'true');
      if (studentId) {
        setCurrentStudentId(studentId);
        localStorage.setItem('adisetu_active_profile_id', studentId);
      } else {
        localStorage.setItem('adisetu_active_profile_id', currentStudentId);
      }
    } catch (e) {}
  };

  const logout = () => {
    setIsLoggedIn(false);
    clearSchemeSelection();
    try {
      localStorage.removeItem('adisetu_is_logged_in');
      localStorage.removeItem('adisetu_active_profile_id');
    } catch (e) {}
  };

  return (
    <AppContext.Provider
      value={{
        students,
        currentStudent,
        currentStudentId,
        isLoggedIn,
        theme,
        language,
        languages,
        t,
        schemes,
        selectedSchemeIds,
        applications,
        documents,
        notifications,
        hasUnreadUpdates,
        riskBannerDismissed,
        toggleSchemeSelection,
        clearSchemeSelection,
        selectAllEligible,
        applyToScheme,
        applyToBatch,
        renewDocument,
        addDocument,
        switchStudent,
        withdrawApplication,
        resetApplications,
        toggleTheme,
        setLanguage,
        setHasUnreadUpdates,
        resolveRiskIssue,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
