import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { $, requireUser, showAlert, hideAlert, errorMessage } from '../utils.js';
import { parkingRows, discountRows } from '../tables.js';

const modal = $('discount-modal');
let user;

async function renderInfo() {
  $('info-email').textContent = user.email;
  $('info-username').textContent = user.username;
  $('info-role').textContent = t(`role.${user.role}`);
}

async function renderHistory() {
  $('history-body').innerHTML = parkingRows(await api.myParking(), t('account.noHistory'));
}

async function renderDiscounts() {
  $('discounts-body').innerHTML = discountRows(await api.myDiscounts(), { emptyText: t('account.noDiscounts') });
}

const renderAll = () => Promise.all([renderInfo(), renderHistory(), renderDiscounts()]);

$('add-discount-btn').addEventListener('click', () => {
  hideAlert($('discount-error'));
  $('discount-form').reset();
  modal.open();
});

$('discount-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = $('discount-error');
  hideAlert(error);
  const code = $('discount-code').value.trim();
  if (!code) return;
  try {
    await api.addMyDiscount(code);
    modal.close();
    await renderDiscounts();
  } catch (err) {
    showAlert(error, 'danger', errorMessage(err));
  }
});

user = await requireUser();
if (user) {
  await renderAll();
  document.addEventListener('langchange', renderAll);
}
