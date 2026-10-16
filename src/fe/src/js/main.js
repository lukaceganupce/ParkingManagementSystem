import './components/app-modal.js';
import './components/app-header.js';
import './components/app-footer.js';
import { applyTranslations } from './i18n.js';
import { renderIcons } from './icons.js';

renderIcons();
applyTranslations();
document.addEventListener('langchange', () => applyTranslations());
