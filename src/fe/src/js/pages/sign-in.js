import '../main.js';
import { api } from '../api.js';
import { $, showAlert, hideAlert, errorMessage } from '../utils.js';

$('sign-in-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $('message');
  hideAlert(message);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  try {
    const user = await api.signIn({ email: $('email').value.trim(), password: $('password').value });
    location.href = user.role === 'operator' ? 'dashboard.html' : 'account.html';
  } catch (error) {
    showAlert(message, 'danger', errorMessage(error));
  }
});
