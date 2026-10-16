import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { $, esc, formatDateTime, formatMoney, showAlert, hideAlert, errorMessage } from '../utils.js';

const state = { parking: null, discountCode: null };
const modal = $('discount-modal');

const normalizePlate = (value) => value.toUpperCase().replace(/[\s-]/g, '');

function renderPayment() {
  const { parking, discountCode } = state;
  if (!parking) return;
  $('payment').hidden = false;
  $('pay-time-in').textContent = formatDateTime(parking.time_in);
  $('pay-time-out').textContent = formatDateTime(parking.time_out);
  $('pay-price').textContent = formatMoney(parking.final_price);
  const info = $('discount-info');
  info.hidden = !discountCode;
  if (discountCode) info.textContent = t('pay.discount.applied', { code: discountCode });
}

async function renderPrices() {
  const tariffs = await api.tariffs().catch(() => []);
  $('price-body').innerHTML = tariffs.length
    ? tariffs.map((tariff) => `
        <tr>
          <td>${esc(tariff.name)}</td>
          <td>${esc(formatDateTime(tariff.valid_from))}</td>
          <td>${esc(formatDateTime(tariff.valid_to))}</td>
          <td>${esc(formatMoney(tariff.price))}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" class="empty">${esc(t('common.empty'))}</td></tr>`;
}

$('plate-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = $('plate-error');
  hideAlert(error);
  const plate = normalizePlate($('plate').value);
  if (!plate) {
    $('plate').focus();
    return;
  }
  try {
    state.parking = await api.getActiveParking(plate);
    state.discountCode = null;
    $('pay-success').hidden = true;
    $('card-form').hidden = false;
    $('card-form').reset();
    hideAlert($('pay-error'));
    renderPayment();
    $('payment').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showAlert(error, 'danger', errorMessage(err));
  }
});

// Discount modal
$('discount-btn').addEventListener('click', async () => {
  hideAlert($('discount-error'));
  const mine = await api.myDiscounts().catch(() => []);
  $('discount-mine').hidden = mine.length === 0;
  $('discount-list').innerHTML = mine
    .map((d) => `<button type="button" class="btn btn--secondary" data-code="${esc(d.code)}">${esc(d.code)}</button>`)
    .join('');
  modal.open();
});

async function applyDiscount(code) {
  try {
    state.parking = await api.getActiveParking(state.parking.license_plate, code);
    state.discountCode = code;
    renderPayment();
    modal.close();
  } catch (err) {
    showAlert($('discount-error'), 'danger', errorMessage(err));
  }
}

$('discount-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-code]');
  if (button) applyDiscount(button.dataset.code);
});

$('discount-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const code = $('discount-code').value.trim();
  if (code) applyDiscount(code);
});

// Card form
$('card-number').addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
});
$('card-expiry').addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
  event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

$('card-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const error = $('pay-error');
  hideAlert(error);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  try {
    await api.pay({
      license_plate: state.parking.license_plate,
      discount_code: state.discountCode,
      card: { number: $('card-number').value, expiry: $('card-expiry').value, cvv: $('card-cvv').value },
    });
    form.hidden = true;
    $('discount-btn').hidden = true;
    showAlert($('pay-success'), 'success', t('pay.success'));
  } catch (err) {
    showAlert(error, 'danger', errorMessage(err));
  }
});

renderPrices();
document.addEventListener('langchange', () => {
  renderPayment();
  renderPrices();
  if (!$('pay-success').hidden) showAlert($('pay-success'), 'success', t('pay.success'));
});
