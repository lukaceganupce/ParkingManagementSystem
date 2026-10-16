import { esc, formatDateTime, formatMoney, statusBadge, discountAmount } from './utils.js';
import { t } from './i18n.js';
import { icon } from './icons.js';

const emptyRow = (cols) => `<tr><td colspan="${cols}" class="empty">${esc(t('common.empty'))}</td></tr>`;

export const parkingRows = (items, emptyText = t('common.empty')) => (items.length
  ? items.map((p) => `
      <tr>
        <td>${esc(formatDateTime(p.time_in))}</td>
        <td>${esc(formatDateTime(p.time_out))}</td>
        <td>${esc(p.license_plate)}</td>
        <td>${esc(formatMoney(p.final_price))}</td>
        <td>${statusBadge(p.payment_status)}</td>
      </tr>`).join('')
  : `<tr><td colspan="5" class="empty">${esc(emptyText)}</td></tr>`);

export const discountRows = (items, { actions = false, emptyText = t('common.empty') } = {}) => (items.length
  ? items.map((d) => `
      <tr>
        <td>${esc(d.code)}</td>
        <td>${esc(discountAmount(d))}</td>
        <td>${esc(t(`unit.${d.unit}`))}</td>
        <td>${esc(formatDateTime(d.expiration_date))}</td>
        ${actions ? `<td>${actionButtons('discount', d.discount_key)}</td>` : ''}
      </tr>`).join('')
  : emptyRow(actions ? 5 : 4).replace(esc(t('common.empty')), esc(emptyText)));

export const actionButtons = (kind, key) => `
  <button type="button" class="btn btn--secondary btn--icon" data-action="edit-${kind}" data-key="${key}" aria-label="${esc(t('common.edit'))}">${icon('edit')}</button>
  <button type="button" class="btn btn--danger btn--icon" data-action="delete-${kind}" data-key="${key}" aria-label="${esc(t('common.delete'))}">${icon('trash')}</button>`;