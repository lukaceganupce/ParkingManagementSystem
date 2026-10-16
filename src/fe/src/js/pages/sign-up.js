import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { $, showAlert, hideAlert, errorMessage } from '../utils.js';

$('sign-up-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $('message');
  hideAlert(message);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  try {
    await api.signUp({ email: $('email').value.trim(), username: $('username').value.trim(), password: $('password').value });
    form.reset();
    showAlert(message, 'success', t('signUp.success'));
  } catch (error) {
    showAlert(message, 'danger', errorMessage(error));
  }
});
