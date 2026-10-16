import { t } from '../i18n.js';

class AppFooter extends HTMLElement {
  connectedCallback() {
    this.render();
    document.addEventListener('langchange', () => this.render());
  }

  render() {
    this.innerHTML = `
      <footer class="app-footer">
        <div class="container footer__inner">
          <span>${t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <a href="#terms">${t('footer.terms')}</a>
        </div>
      </footer>`;
  }
}

customElements.define('app-footer', AppFooter);
