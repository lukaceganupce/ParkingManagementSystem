import { getLang, t } from './i18n.js';
import { CURRENCY } from './config.js';
import { api } from './api.js';

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const formatDateTime = (iso) => (iso
  ? new Intl.DateTimeFormat(getLang(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  : '–');

export const formatMoney = (amount) => (amount == null
  ? '–'
  : new Intl.NumberFormat(getLang(), { style: 'currency', currency: CURRENCY }).format(amount));

export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

export function showAlert(el, type, text) {
  el.className = `alert alert--${type}`;
  el.textContent = text;
  el.hidden = false;
}

export function hideAlert(el) {
  el.hidden = true;
  el.textContent = '';
}

export function errorMessage(error) {
  const key = `error.${error.code}`;
  const message = t(key);
  return message === key ? t('error.generic') : message;
}

export const statusBadge = (status) => {
  const type = { paid: 'success', pending: 'warning', failed: 'danger' }[status] ?? '';
  return `<span class="badge badge--${type}">${esc(t(`status.${status}`))}</span>`;
};

export const discountAmount = (d) => (d.unit === 'percent' ? `${d.discount} %` : formatMoney(d.discount));

// Redirects to the sign in page (or home when the role does not match). Returns the user or null.
export async function requireUser(role) {
  const user = await api.me();
  if (!user) {
    location.href = 'sign_in.html';
    return null;
  }
  if (role && user.role !== role) {
    location.href = 'home.html';
    return null;
  }
  return user;
}

export const $ = (id) => document.getElementById(id);
