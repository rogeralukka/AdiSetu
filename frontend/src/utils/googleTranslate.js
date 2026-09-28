/**
 * Google Website Translator Headless Integration (Rev 104 v5)
 * Coordinates translation across 13 major Indian languages + Santali (Ol Chiki)
 * via Google's hidden select.goog-te-combo element without page reload or banner UI.
 * Unsupported tribal languages fall back to the internal manual dictionary.
 */

export const GOOGLE_ROUTED = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as', 'sat'
];
export const GOOGLE_TRANSLATE_LANGS = GOOGLE_ROUTED;

/**
 * Finds the hidden select.goog-te-combo inside #google_translate_element,
 * sets its value, and fires a real change event.
 * When switching back to English ('en'), clicks Google's native 'Show original'
 * button in the container iframe (if present) and resets combo to restore original text without reload.
 */
export function triggerGoogleTranslate(langCode) {
  if (typeof document === 'undefined') return false;

  const isEnglish = !langCode || langCode === 'en';

  if (isEnglish) {
    let restored = false;

    // 1. Google Translate's container iframe has a 'Show original' button that resets its state machine
    const iframe = document.querySelector('iframe.skiptranslate, iframe[id^=":"]');
    if (iframe) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const restoreBtn = doc.querySelector('#\\:1\\.restore, button[id*="restore"], a[id*="close"]');
        if (restoreBtn) {
          restoreBtn.click();
          restored = true;
        }
      } catch (e) {}
    }

    // 2. Also reset the combo element if present
    const combo = document.querySelector('#google_translate_element select.goog-te-combo');
    if (combo) {
      const enOption = combo.querySelector('option[value="en"]');
      combo.value = enOption ? 'en' : '';
      combo.dispatchEvent(new Event('change'));
      restored = true;
    }

    return restored;
  }

  const combo = document.querySelector('#google_translate_element select.goog-te-combo');
  if (!combo) return false; // widget script hasn't loaded yet — retry shortly after

  combo.value = langCode;
  combo.dispatchEvent(new Event('change'));
  return true;
}

/**
 * Applies Google Translation with asynchronous retry if the combo hasn't mounted yet.
 * Returns true if the language is handled by Google Translate, or false if falling back.
 */
export function applyGoogleTranslation(langCode, onFallback) {
  if (typeof document === 'undefined') return false;

  const isEnglish = !langCode || langCode === 'en';
  const isGoogleCandidate = GOOGLE_TRANSLATE_LANGS.includes(langCode);

  if (isEnglish) {
    triggerGoogleTranslate('en');
    return true;
  }

  if (!isGoogleCandidate) {
    // Unsupported tribal language (Gondi, Mundari, Kurukh, Ho, Bhili):
    // Reset Google Translate back to English first, then let manual dictionary render
    triggerGoogleTranslate('en');
    if (onFallback) onFallback(langCode);
    return false;
  }

  // Attempt immediate trigger
  if (triggerGoogleTranslate(langCode)) {
    return true;
  }

  // If combo isn't there yet on first try (script loads async), retry on a short interval until it appears
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (triggerGoogleTranslate(langCode) || attempts >= 20) {
      clearInterval(interval);
    }
  }, 150);

  return true;
}
