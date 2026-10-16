import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { $, showAlert, hideAlert, errorMessage } from '../utils.js';

$('forgot-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $('message');
  hideAlert(message);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  try {
    await api.forgotPassword($('email').value.trim());
    showAlert(message, 'success', t('forgot.success'));
  } catch (error) {
    showAlert(message, 'danger', errorMessage(error));
  }
});
