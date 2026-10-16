import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import {
  $, esc, requireUser, showAlert, hideAlert, errorMessage,
  formatDateTime, formatMoney, toLocalInput, fromLocalInput,
} from '../utils.js';
import { parkingRows, discountRows, actionButtons } from '../tables.js';

const tariffModal = $('tariff-modal');
const discountModal = $('discount-modal');
let tariffs = [];
let discounts = [];
let editingTariff = null;
let editingDiscount = null;

// Barrier
async function moveBarrier(action) {
  const message = $('barrier-message');
  hideAlert(message);
  try {
    await api.barrier(action);
    showAlert(message, 'success', t(action === 'open' ? 'dashboard.barrierOpened' : 'dashboard.barrierClosed'));
  } catch (error) {
    showAlert(message, 'danger', errorMessage(error));
  }
}
$('barrier-open').addEventListener('click', () => moveBarrier('open'));
$('barrier-close').addEventListener('click', () => moveBarrier('close'));

// Tariffs
function renderTariffs() {
  $('tariffs-body').innerHTML = tariffs.length
    ? tariffs.map((tariff) => `
        <tr>
          <td>${esc(tariff.name)}</td>
          <td>${esc(formatDateTime(tariff.valid_from))}</td>
          <td>${esc(formatDateTime(tariff.valid_to))}</td>
          <td>${esc(formatMoney(tariff.price))}</td>
          <td>${actionButtons('tariff', tariff.tariff_key)}</td>
        </tr>`).join('')
    : `<tr><td colspan="5" class="empty">${esc(t('common.empty'))}</td></tr>`;
}

async function loadTariffs() {
  tariffs = await api.tariffs();
  renderTariffs();
}

function openTariffForm(tariff) {
  editingTariff = tariff;
  hideAlert($('tariff-error'));
  $('tariff-form').reset();
  tariffModal.setHeading(tariff ? 'dashboard.editTariff' : 'dashboard.addTariff');
  if (tariff) {
    $('tariff-name').value = tariff.name;
    $('tariff-from').value = toLocalInput(tariff.valid_from);
    $('tariff-to').value = toLocalInput(tariff.valid_to);
    $('tariff-price').value = tariff.price;
  }
  tariffModal.open();
}

$('add-tariff-btn').addEventListener('click', () => openTariffForm(null));

$('tariffs-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const key = Number(button.dataset.key);
  if (button.dataset.action === 'edit-tariff') {
    openTariffForm(tariffs.find((tariff) => tariff.tariff_key === key));
  } else if (confirm(t('common.confirmDelete'))) {
    await api.deleteTariff(key);
    await loadTariffs();
  }
});

$('tariff-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const payload = {
    name: $('tariff-name').value.trim(),
    valid_from: fromLocalInput($('tariff-from').value),
    valid_to: fromLocalInput($('tariff-to').value),
    price: Number($('tariff-price').value),
  };
  try {
    await (editingTariff ? api.updateTariff(editingTariff.tariff_key, payload) : api.createTariff(payload));
    tariffModal.close();
    await loadTariffs();
  } catch (error) {
    showAlert($('tariff-error'), 'danger', errorMessage(error));
  }
});

// Discounts
function renderDiscounts() {
  $('discounts-body').innerHTML = discountRows(discounts, { actions: true });
}

async function loadDiscounts() {
  discounts = await api.discounts();
  renderDiscounts();
}

function openDiscountForm(discount) {
  editingDiscount = discount;
  hideAlert($('discount-error'));
  $('discount-form').reset();
  discountModal.setHeading(discount ? 'dashboard.editDiscount' : 'dashboard.addDiscount');
  if (discount) {
    $('discount-code').value = discount.code;
    $('discount-amount').value = discount.discount;
    $('discount-unit').value = discount.unit;
    $('discount-expiration').value = toLocalInput(discount.expiration_date);
  }
  discountModal.open();
}

$('add-discount-btn').addEventListener('click', () => openDiscountForm(null));

$('discounts-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const key = Number(button.dataset.key);
  if (button.dataset.action === 'edit-discount') {
    openDiscountForm(discounts.find((discount) => discount.discount_key === key));
  } else if (confirm(t('common.confirmDelete'))) {
    await api.deleteDiscount(key);
    await loadDiscounts();
  }
});

$('discount-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const payload = {
    code: $('discount-code').value.trim(),
    discount: Number($('discount-amount').value),
    unit: $('discount-unit').value,
    expiration_date: fromLocalInput($('discount-expiration').value),
  };
  try {
    await (editingDiscount ? api.updateDiscount(editingDiscount.discount_key, payload) : api.createDiscount(payload));
    discountModal.close();
    await loadDiscounts();
  } catch (error) {
    showAlert($('discount-error'), 'danger', errorMessage(error));
  }
});

// Parking history
async function loadHistory() {
  $('history-body').innerHTML = parkingRows(await api.allParking());
}

const user = await requireUser('operator');
if (user) {
  await Promise.all([loadTariffs(), loadDiscounts(), loadHistory()]);
  document.addEventListener('langchange', () => {
    renderTariffs();
    renderDiscounts();
    loadHistory();
  });
}
