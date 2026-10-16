import { LANGUAGES, getLang, setLang, applyTranslations } from '../i18n.js';
import { renderIcons } from '../icons.js';
import { api } from '../api.js';
import { esc } from '../utils.js';

const link = (href, icon, key) =>
  `<li><a class="drawer__link" href="${href}"><span data-icon="${icon}"></span><span data-i18n="${key}"></span></a></li>`;

class AppHeader extends HTMLElement {
  async connectedCallback() {
    this.user = await api.me().catch(() => null);
    this.render();
    document.addEventListener('langchange', () => this.render());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.toggleDrawer(false);
    });
  }

  render() {
    const user = this.user;
    const items = [link('home.html', 'home', 'nav.home')];
    if (!user) {
      items.push(link('sign_up.html', 'user-plus', 'nav.signUp'), link('sign_in.html', 'log-in', 'nav.signIn'));
    } else {
      items.push(link('account.html', 'user', 'nav.account'));
      if (user.role === 'operator') items.push(link('dashboard.html', 'layout', 'nav.dashboard'));
      items.push(`<li><button type="button" class="drawer__link" data-action="sign-out"><span data-icon="log-out"></span><span data-i18n="nav.signOut"></span></button></li>`);
    }

    const languages = LANGUAGES.map((l) =>
      `<li><button type="button" class="btn ${l.code === getLang() ? '' : 'btn--secondary'}" data-lang="${l.code}" ${l.code === getLang() ? 'aria-current="true"' : ''}>${esc(l.label)}</button></li>`).join('');

    this.innerHTML = `
      <header class="app-header">
        <a class="brand" href="home.html">
          <img src="assets/img/logo.svg" alt="" width="32" height="32">
          <span class="brand__title">Parkoid</span>
        </a>
        <nav class="app-nav">
          <button type="button" class="btn btn--ghost btn--icon" data-action="language" data-i18n-aria-label="nav.language"><span data-icon="globe"></span></button>
          <button type="button" class="btn btn--ghost btn--icon" data-action="menu" aria-expanded="false" data-i18n-aria-label="nav.menu"><span data-icon="bars"></span></button>
        </nav>
      </header>
      <div class="drawer-backdrop" hidden></div>
      <aside class="drawer" data-open="false">
        <div class="drawer__header">
          <button type="button" class="btn btn--ghost btn--icon" data-action="close-menu" data-i18n-aria-label="common.close"><span data-icon="x"></span></button>
        </div>
        <ul class="drawer__list">${items.join('')}</ul>
      </aside>
      <app-modal heading-key="lang.title"><ul class="lang-list">${languages}</ul></app-modal>`;

    renderIcons(this);
    applyTranslations(this);
    this.bind();
  }

  bind() {
    const modal = this.querySelector('app-modal');
    this.querySelector('[data-action="language"]').addEventListener('click', () => modal.open());
    this.querySelector('[data-action="menu"]').addEventListener('click', () => this.toggleDrawer(true));
    this.querySelector('[data-action="close-menu"]').addEventListener('click', () => this.toggleDrawer(false));
    this.querySelector('.drawer-backdrop').addEventListener('click', () => this.toggleDrawer(false));
    this.querySelector('[data-action="sign-out"]')?.addEventListener('click', async () => {
      await api.signOut();
      location.href = 'home.html';
    });
    modal.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => {
      modal.close();
      setLang(button.dataset.lang);
    }));
  }

  toggleDrawer(open) {
    const drawer = this.querySelector('.drawer');
    if (!drawer) return;
    drawer.dataset.open = String(open);
    this.querySelector('.drawer-backdrop').hidden = !open;
    this.querySelector('[data-action="menu"]').setAttribute('aria-expanded', String(open));
  }
}

customElements.define('app-header', AppHeader);
