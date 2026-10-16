import { API_BASE, USE_MOCK } from './config.js';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(method, path, body) {
  if (USE_MOCK) {
    const { handle } = await import('./mock-api.js');
    return handle(method, path, body);
  }
  const response = await fetch(API_BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.code ?? 'generic', data?.message ?? response.statusText);
  }
  return data;
}

const q = encodeURIComponent;

export const api = {
  // auth
  signUp: (data) => request('POST', '/auth/sign-up', data),
  signIn: (data) => request('POST', '/auth/sign-in', data),
  signOut: () => request('POST', '/auth/sign-out'),
  me: () => request('GET', '/auth/me').catch((error) => {
    if (error.status === 401) return null;
    throw error;
  }),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),
  resetPassword: (data) => request('POST', '/auth/reset-password', data),

  // parking and payment
  getActiveParking: (plate, discountCode) =>
    request('GET', `/parking/active?license_plate=${q(plate)}${discountCode ? `&discount_code=${q(discountCode)}` : ''}`),
  pay: (data) => request('POST', '/parking/pay', data),
  myParking: () => request('GET', '/me/parking'),
  allParking: () => request('GET', '/parking'),

  // user discounts
  myDiscounts: () => request('GET', '/me/discounts'),
  addMyDiscount: (code) => request('POST', '/me/discounts', { code }),

  // tariffs (operator)
  tariffs: () => request('GET', '/tariffs'),
  createTariff: (data) => request('POST', '/tariffs', data),
  updateTariff: (key, data) => request('PUT', `/tariffs/${key}`, data),
  deleteTariff: (key) => request('DELETE', `/tariffs/${key}`),

  // discounts (operator)
  discounts: () => request('GET', '/discounts'),
  createDiscount: (data) => request('POST', '/discounts', data),
  updateDiscount: (key, data) => request('PUT', `/discounts/${key}`, data),
  deleteDiscount: (key) => request('DELETE', `/discounts/${key}`),

  // barrier (operator)
  barrier: (action) => request('POST', `/barrier/${action}`),
};
