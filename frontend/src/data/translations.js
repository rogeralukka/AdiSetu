import hiDict from './locales/hi.js';
import orDict from './locales/or.js';
import satDict from './locales/sat.js';
import gonDict from './locales/gon.js';
import unrDict from './locales/unr.js';
import kruDict from './locales/kru.js';
import hocDict from './locales/hoc.js';
import bhbDict from './locales/bhb.js';

export const languages = [
  {
    "code": "en",
    "name": "English",
    "native": "English"
  },
  {
    "code": "hi",
    "name": "Hindi",
    "native": "हिन्दी"
  },
  {
    "code": "bn",
    "name": "Bengali",
    "native": "বাংলা"
  },
  {
    "code": "te",
    "name": "Telugu",
    "native": "తెలుగు"
  },
  {
    "code": "mr",
    "name": "Marathi",
    "native": "मराठी"
  },
  {
    "code": "ta",
    "name": "Tamil",
    "native": "தமிழ்"
  },
  {
    "code": "ur",
    "name": "Urdu",
    "native": "اردو"
  },
  {
    "code": "gu",
    "name": "Gujarati",
    "native": "ગુજરાતી"
  },
  {
    "code": "kn",
    "name": "Kannada",
    "native": "ಕನ್ನಡ"
  },
  {
    "code": "or",
    "name": "Odia",
    "native": "ଓଡ଼ିଆ"
  },
  {
    "code": "ml",
    "name": "Malayalam",
    "native": "മലയാളം"
  },
  {
    "code": "pa",
    "name": "Punjabi",
    "native": "ਪੰਜਾਬੀ"
  },
  {
    "code": "as",
    "name": "Assamese",
    "native": "অসমীয়া"
  },
  {
    "code": "sat",
    "name": "Santali (Ol Chiki)",
    "native": "ᱥᱟᱱᱛᱟᱲᱤ"
  },
  {
    "code": "gon",
    "name": "Gondi",
    "native": "ᱜᱳᱸᱰᱤ (Gondi)"
  },
  {
    "code": "unr",
    "name": "Mundari",
    "native": "ᱢᱩᱱᱰᱟᱨᱤ (Mundari)"
  },
  {
    "code": "kru",
    "name": "Kurukh (Oraon)",
    "native": "ᱠᱩᱲᱩᱠᱷ (Kurukh)"
  },
  {
    "code": "hoc",
    "name": "Ho",
    "native": "ᱦᱳ (Ho)"
  },
  {
    "code": "bhb",
    "name": "Bhili",
    "native": "भीली (Bhili)"
  }
];

export const enDict = {
  "tabDigiLocker": "DigiLocker",
  "tabPhoneNumber": "Phone Number",
  "labelDigiLockerId": "DigiLocker ID",
  "placeholderDigiLockerId": "Enter your DigiLocker ID or Aadhaar-linked mobile number",
  "labelPassword": "Password",
  "placeholderPassword": "Enter password",
  "login": "Login",
  "loggingIn": "Logging in...",
  "labelMobileNumber": "Mobile Number",
  "placeholderMobileNumber": "10-digit mobile number",
  "continue": "Continue",
  "sendingOtp": "Sending...",
  "adminPortalLink": "Nodal Officer / Admin? Continue to Verification Portal →",
  "unifiedServices": "Unified Middleware Services",
  "schemes": "Schemes",
  "updates": "Updates",
  "documents": "Documents",
  "profile": "Profile",
  "appName": "AdiSetu",
  "updatesTitle": "Updates",
  "documentsTitle": "Documents",
  "profileTitle": "Profile & Settings",
  "schemeDetailsTitle": "Scheme Details",
  "batchApplyTitle": "Batch Application",
  "applyTitle": "Scholarship Application",
  "recommendedForYou": "Recommended for you",
  "applicationsAndProgress": "Applications & Progress",
  "applications": "Applications & Progress",
  "alerts": "Alerts",
  "notifications": "Alerts",
  "alertsTab": "Alerts",
  "applicationsTab": "Applications & Progress",
  "documentWallet": "Document Wallet",
  "studentInformation": "Student Information",
  "bankDbtAccount": "Bank & DBT Account",
  "switchHouseholdProfile": "Switch Household Profile",
  "preferences": "Preferences",
  "eligibilityCriteria": "Eligibility Criteria",
  "walletAttachment": "Document Wallet Attachment",
  "submittedApps": "Submitted Application Details",
  "actionNeeded": "Action Needed",
  "urgentActionNeeded": "Urgent Action Required",
  "loginWithDigiLocker": "Login with DigiLocker",
  "loginWithMobile": "Login with Mobile Number",
  "enterMobile": "Enter Mobile Number",
  "enterOtp": "Enter 6-digit OTP",
  "getOtp": "Get 6-Digit OTP",
  "verifyAndLogin": "Verify & Continue",
  "resendOtp": "Resend OTP",
  "selectProfile": "Select Student Profile",
  "statusActionNeeded": "Action Needed",
  "statusActionRequired": "Action Required",
  "statusInProgress": "In Progress",
  "statusVerified": "Verified",
  "statusExpiringSoon": "Expiring soon",
  "statusExpired": "Expired",
  "statusDbtPending": "DBT Pending",
  "statusDbtActive": "DBT Active",
  "statusReused": "Reused",
  "statusSubmitted": "Submitted",
  "statusReady": "Ready",
  "statusAutoFilled": "Auto-filled",
  "stageSubmitted": "Submitted",
  "stageVerification": "Verification",
  "stageSanctioned": "Sanctioned",
  "stageDisbursed": "Disbursed",
  "metaDigiLockerSynced": "DigiLocker Synced",
  "metaSelfManaged": "Self Managed",
  "metaGuardianManaged": "Guardian Managed",
  "labelValidity": "Validity",
  "labelIssuer": "Issuer",
  "labelUsedIn": "Used in",
  "labelBankName": "Bank Name",
  "labelSubTribe": "Sub-Tribe",
  "labelDob": "Date of Birth",
  "labelIfsc": "IFSC Code",
  "labelAccountNo": "Account Number",
  "labelInstitution": "Institution",
  "labelPhone": "Phone",
  "labelAddress": "Permanent Address",
  "labelFinancialBenefit": "Financial Benefit",
  "labelDeadline": "Application Deadline",
  "searchPlaceholder": "Search schemes",
  "applyToSelected": "Apply to selected",
  "viewDetails": "View details",
  "applyForScholarship": "Apply for this Scholarship",
  "applicationSubmitted": "Application Already Submitted",
  "addDocumentToWallet": "Add document to wallet",
  "fixNow": "Fix now",
  "resolve": "Resolve",
  "renewViaEpramaan": "Renew via e-Pramaan",
  "switchProfileDesc": "Silent instant switch for siblings sharing device",
  "darkMode": "Dark Mode",
  "displayLanguage": "Display Language",
  "manageProfile": "Manage Full Profile & Security",
  "logout": "Log out",
  "logoutConfirmTitle": "Log out of AdiSetu?",
  "logoutConfirmBody": "Logging out will remove this account and its documents from this device. You'll need to sign in again to access them.",
  "cancel": "Cancel",
  "confirmLogout": "Log out",
  "reused": "Reused",
  "verified": "Verified",
  "autoFilled": "Auto-filled",
  "finalReview": "Final Review →",
  "navSchemes": "Schemes",
  "navUpdates": "Updates",
  "navDocuments": "Documents",
  "financialBenefit": "Financial Benefit",
  "applicationDeadline": "Application Deadline",
  "applyButton": "Apply for this Scholarship",
  "documentWalletAttachment": "Document Wallet Attachment",
  "tabAlerts": "Alerts",
  "tabApplications": "Applications & Progress",
  "actionRequired": "Action Required",
  "inProgress": "In Progress",
  "expiringSoon": "Expiring Soon",
  "expired": "Expired",
  "usedIn": "Used in",
  "validity": "Validity",
  "issuer": "Issuer",
  "saveToWallet": "Save to Wallet",
  "back": "Back",
  "manageFullProfileSecurity": "Manage Full Profile & Security",
  "logOut": "Log Out",
  "profileSettingsTitle": "Profile & Settings",
  "loginWithDigilocker": "Login with DigiLocker",
  "verifyContinue": "Verify & Continue",
  "submitApplication": "Submit Application",
  "submissionConfirmed": "Submission Confirmed",
  "done": "Done",
  "askAdisetu": "Ask AdiSetu",
  "selectStudentProfile": "Select Student Profile"
};

// Dynamic locale loaders for Vite code-splitting
export const localeLoaders = {
  hi: () => Promise.resolve(hiDict),
  bn: () => import('./locales/bn.js'),
  te: () => import('./locales/te.js'),
  mr: () => import('./locales/mr.js'),
  ta: () => import('./locales/ta.js'),
  ur: () => import('./locales/ur.js'),
  gu: () => import('./locales/gu.js'),
  kn: () => import('./locales/kn.js'),
  or: () => Promise.resolve(orDict),
  ml: () => import('./locales/ml.js'),
  pa: () => import('./locales/pa.js'),
  as: () => import('./locales/as.js'),
  sat: () => Promise.resolve(satDict),
  gon: () => Promise.resolve(gonDict),
  unr: () => Promise.resolve(unrDict),
  kru: () => Promise.resolve(kruDict),
  hoc: () => Promise.resolve(hocDict),
  bhb: () => Promise.resolve(bhbDict)
};

// In-memory cache for loaded locale dictionaries
const localeCache = {
  en: enDict,
  hi: hiDict,
  or: orDict,
  sat: satDict,
  gon: gonDict,
  unr: unrDict,
  kru: kruDict,
  hoc: hocDict,
  bhb: bhbDict,
};

/**
 * Loads a locale dictionary dynamically on demand.
 * English is synchronously available via enDict.
 */
export async function loadLocale(code) {
  if (!code || code === 'en') return enDict;
  if (localeCache[code]) return localeCache[code];
  if (!localeLoaders[code]) return enDict;

  try {
    const mod = await localeLoaders[code]();
    const dict = mod.default || mod;
    localeCache[code] = dict;
    return dict;
  } catch (err) {
    console.warn(`[AdiSetu i18n] Failed to load locale '${code}':`, err);
    return enDict;
  }
}

/**
 * Backward compatibility export
 */
export const hiFallbackDict = hiDict;

export const translations = {
  en: enDict,
  hi: hiDict,
  or: orDict,
  sat: satDict,
  gon: gonDict,
  unr: unrDict,
  kru: kruDict,
  hoc: hocDict,
  bhb: bhbDict,
};

export const getTranslatedStatus = (status, t) => {
  if (!status) return '';
  const s = String(status).toLowerCase().trim();
  if (s === 'action needed') return t('statusActionNeeded');
  if (s === 'action required') return t('statusActionRequired');
  if (s === 'in progress') return t('statusInProgress');
  if (s === 'verified' || s === 'auto-verified') return t('statusVerified');
  if (s === 'expiring soon' || s === 'expiring') return t('statusExpiringSoon');
  if (s === 'expired') return t('statusExpired');
  if (s === 'dbt pending') return t('statusDbtPending');
  if (s === 'dbt active') return t('statusDbtActive');
  if (s === 'reused') return t('statusReused');
  if (s === 'submitted') return t('statusSubmitted');
  if (s === 'ready') return t('statusReady');
  if (s === 'auto-filled') return t('statusAutoFilled');
  return status;
};

export const getTranslatedStage = (stage, t) => {
  if (!stage) return '';
  const s = String(stage).toLowerCase().trim();
  if (s.includes('submit')) return t('stageSubmitted');
  if (s.includes('verif')) return t('stageVerification');
  if (s.includes('sanct')) return t('stageSanctioned');
  if (s.includes('disburs')) return t('stageDisbursed');
  return stage;
};
