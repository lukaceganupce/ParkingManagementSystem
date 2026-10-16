import { applyTranslations } from '../i18n.js';
import { renderIcons } from '../icons.js';

let counter = 0;

// <app-modal heading-key="i18n.key"> ...content... </app-modal>   API: open(), close()
class AppModal extends HTMLElement {
  connectedCallback() {
    if (this.built) return;
    this.built = true;
    const content = [...this.childNodes];
    const titleId = `modal-title-${++counter}`;
    this.hidden = true;
    this.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
          <div class="modal__header">
            <h2 class="modal__title" id="${titleId}"></h2>
            <button type="button" class="btn btn--ghost btn--icon" data-close data-i18n-aria-label="common.close">
              <span data-icon="x"></span>
            </button>
          </div>
          <div class="modal__body"></div>
        </div>
      </div>`;
    this.querySelector('.modal__body').append(...content);
    this.setHeading(this.getAttribute('heading-key'));

    this.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]') || event.target.classList.contains('modal-backdrop')) this.close();
    });
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
    renderIcons(this);
    applyTranslations(this);
  }

  setHeading(key) {
    const title = this.querySelector('.modal__title');
    title.dataset.i18n = key;
    applyTranslations(title.parentElement);
  }

  open() {
    this.hidden = false;
    this.querySelector('input, select, button:not([data-close])')?.focus();
  }

  close() {
    this.hidden = true;
    this.dispatchEvent(new CustomEvent('modalclose'));
  }
}

customElements.define('app-modal', AppModal);
