import '../main.js';
import { api } from '../api.js';
import { t } from '../i18n.js';
import { $, showAlert, hideAlert, errorMessage } from '../utils.js';

// The reset link from the e-mail is expected to carry the token: reset_password.html?token=...
const token = new URLSearchParams(location.search).get('token');

$('reset-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $('message');
  hideAlert(message);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  if ($('password').value !== $('confirm').value) {
    showAlert(message, 'danger', t('error.password_mismatch'));
    return;
  }
  try {
    await api.resetPassword({ email: $('email').value.trim(), password: $('password').value, token });
    form.reset();
    showAlert(message, 'success', t('reset.success'));
  } catch (error) {
    showAlert(message, 'danger', errorMessage(error));
  }
});
