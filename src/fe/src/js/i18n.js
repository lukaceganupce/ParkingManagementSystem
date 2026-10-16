import { DEFAULT_LANG } from './config.js';
import en from './i18n/en.js';
import cs from './i18n/cs.js';

export const LANGUAGES = [
  { code: 'cs', label: 'Česky' },
  { code: 'en', label: 'English' },
];

const dictionaries = { en, cs };
let lang = DEFAULT_LANG;

export function initI18n() {
  const stored = localStorage.getItem('lang');
  const browser = navigator.language?.slice(0, 2);
  lang = dictionaries[stored] ? stored : dictionaries[browser] ? browser : DEFAULT_LANG;
  document.documentElement.lang = lang;
}

export const getLang = () => lang;

export function setLang(code) {
  if (!dictionaries[code] || code === lang) return;
  lang = code;
  localStorage.setItem('lang', code);
  document.documentElement.lang = code;
  document.dispatchEvent(new CustomEvent('langchange', { detail: code }));
}

export function t(key, params = {}) {
  const text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

// Elements: data-i18n (text), data-i18n-placeholder, data-i18n-aria-label
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
}

initI18n();
