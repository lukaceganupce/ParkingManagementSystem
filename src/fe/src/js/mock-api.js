// In-browser fake backend (localStorage) so the frontend can be developed before the real API exists.
// Demo accounts: operator@parkoid.local / operator123 (operator), driver@parkoid.local / driver123 (driver).
// Passwords are stored in plain text here – acceptable only for this mock.
import { ApiError } from './api.js';

const KEY = 'parkoid_mock_db';
const HOUR = 3600000;

const fail = (status, code) => { throw new ApiError(status, code, code); };
const nextKey = (rows, key) => rows.reduce((max, row) => Math.max(max, row[key]), 0) + 1;
const publicUser = ({ password, ...user }) => user;

function seed() {
  const now = new Date().toISOString();
  return {
    session: null,
    users: [
      { user_key: 1, username: 'operator', password: 'operator123', email: 'operator@parkoid.local', role: 'operator', created_at: now, updated_at: now },
      { user_key: 2, username: 'driver', password: 'driver123', email: 'driver@parkoid.local', role: 'driver', created_at: now, updated_at: now },
    ],
    tariffs: [
      { tariff_key: 1, name: 'Standard', valid_from: '2026-01-01T00:00:00.000Z', valid_to: null, price: 40 },
    ],
    discounts: [
      { discount_key: 1, code: 'WELCOME10', discount: 10, unit: 'percent', expiration_date: '2030-12-31T23:59:00.000Z' },
      { discount_key: 2, code: 'MINUS20', discount: 20, unit: 'fixed', expiration_date: '2030-12-31T23:59:00.000Z' },
    ],
    user_discounts: [{ user_discount_key: 1, user_key: 2, discount_key: 1 }],
    parking: [],
    parking_discounts: [],
  };
}

function load() {
  let db = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  if (!db) {
    db = seed();
    save(db);
  }
  return db;
}

const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));

function currentUser(db) {
  const user = db.users.find((u) => u.user_key === db.session);
  return user ?? fail(401, 'unauthorized');
}

function requireOperator(db) {
  if (currentUser(db).role !== 'operator') fail(403, 'forbidden');
}

function activeTariff(db) {
  const now = Date.now();
  return db.tariffs.find((t) => new Date(t.valid_from) <= now && (!t.valid_to || new Date(t.valid_to) >= now)) ?? db.tariffs[0];
}

function findDiscount(db, code) {
  const discount = db.discounts.find((d) => d.code.toLowerCase() === String(code).trim().toLowerCase());
  if (!discount || (discount.expiration_date && new Date(discount.expiration_date) < Date.now())) fail(400, 'invalid_discount');
  return discount;
}

function computePrice(tariff, timeIn, discount) {
  const hours = Math.max(1, Math.ceil((Date.now() - new Date(timeIn)) / HOUR));
  let total = (tariff?.price ?? 0) * hours;
  if (discount) total = discount.unit === 'percent' ? total * (1 - discount.discount / 100) : total - discount.discount;
  return Math.max(0, Math.round(total * 100) / 100);
}

// A plate without an open session is treated as scanned by the entrance camera 90 minutes ago.
function openSession(db, plate) {
  let parking = db.parking.find((p) => p.license_plate === plate && p.payment_status === 'pending');
  if (!parking) {
    parking = {
      parking_key: nextKey(db.parking, 'parking_key'),
      time_in: new Date(Date.now() - 90 * 60000).toISOString(),
      time_out: null,
      license_plate: plate,
      user_key: null,
      tariff_key: activeTariff(db)?.tariff_key ?? null,
      final_price: null,
      payment_status: 'pending',
    };
    db.parking.push(parking);
  }
  return parking;
}

function validCard(card = {}) {
  const number = String(card.number ?? '').replace(/\s/g, '');
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(card.expiry ?? '');
  const notExpired = match && new Date(2000 + Number(match[2]), Number(match[1]), 1) > new Date();
  return /^\d{13,19}$/.test(number) && notExpired && /^\d{3,4}$/.test(card.cvv ?? '');
}

function tariffPayload(body) {
  if (!body?.name || body.price === '' || body.price == null || !body.valid_from) fail(400, 'generic');
  return { name: String(body.name), valid_from: body.valid_from, valid_to: body.valid_to ?? null, price: Number(body.price) };
}

function discountPayload(db, body, ownKey) {
  if (!body?.code || body.discount == null || !['percent', 'fixed'].includes(body.unit)) fail(400, 'generic');
  const code = String(body.code).trim().toUpperCase();
  if (db.discounts.some((d) => d.code.toUpperCase() === code && d.discount_key !== ownKey)) fail(409, 'code_exists');
  return { code, discount: Number(body.discount), unit: body.unit, expiration_date: body.expiration_date ?? null };
}

const routes = [
  ['POST', /^\/auth\/sign-up$/, (db, body) => {
    const { email = '', username = '', password = '' } = body ?? {};
    if (!email || !username || !password) fail(400, 'generic');
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase())) fail(409, 'user_exists');
    const now = new Date().toISOString();
    const user = { user_key: nextKey(db.users, 'user_key'), username, password, email, role: 'driver', created_at: now, updated_at: now };
    db.users.push(user);
    return publicUser(user);
  }],
  ['POST', /^\/auth\/sign-in$/, (db, body) => {
    const user = db.users.find((u) => u.email.toLowerCase() === String(body?.email).toLowerCase() && u.password === body?.password);
    if (!user) fail(401, 'invalid_credentials');
    db.session = user.user_key;
    return publicUser(user);
  }],
  ['POST', /^\/auth\/sign-out$/, (db) => { db.session = null; return null; }],
  ['GET', /^\/auth\/me$/, (db) => publicUser(currentUser(db))],
  ['POST', /^\/auth\/forgot-password$/, () => null],
  ['POST', /^\/auth\/reset-password$/, (db, body) => {
    const user = db.users.find((u) => u.email.toLowerCase() === String(body?.email).toLowerCase());
    if (user) {
      user.password = body.password;
      user.updated_at = new Date().toISOString();
    }
    return null;
  }],

  ['GET', /^\/parking\/active$/, (db, body, query) => {
    const plate = query.get('license_plate');
    if (!plate) fail(400, 'generic');
    const code = query.get('discount_code');
    const discount = code ? findDiscount(db, code) : null;
    const parking = openSession(db, plate);
    return {
      ...parking,
      time_out: new Date().toISOString(),
      final_price: computePrice(db.tariffs.find((t) => t.tariff_key === parking.tariff_key), parking.time_in, discount),
      discount_code: discount?.code ?? null,
    };
  }],
  ['POST', /^\/parking\/pay$/, (db, body) => {
    if (!validCard(body?.card)) fail(400, 'invalid_card');
    const discount = body.discount_code ? findDiscount(db, body.discount_code) : null;
    const parking = openSession(db, body.license_plate);
    parking.time_out = new Date().toISOString();
    parking.final_price = computePrice(db.tariffs.find((t) => t.tariff_key === parking.tariff_key), parking.time_in, discount);
    parking.payment_status = 'paid';
    parking.user_key = db.session;
    if (discount) {
      db.parking_discounts.push({ parking_discount_key: nextKey(db.parking_discounts, 'parking_discount_key'), parking_key: parking.parking_key, discount_key: discount.discount_key });
    }
    return parking;
  }],
  ['GET', /^\/me\/parking$/, (db) => {
    const user = currentUser(db);
    return db.parking.filter((p) => p.user_key === user.user_key).sort((a, b) => b.time_in.localeCompare(a.time_in));
  }],
  ['GET', /^\/parking$/, (db) => {
    requireOperator(db);
    return [...db.parking].sort((a, b) => b.time_in.localeCompare(a.time_in));
  }],

  ['GET', /^\/me\/discounts$/, (db) => {
    const user = currentUser(db);
    return db.user_discounts
      .filter((ud) => ud.user_key === user.user_key)
      .map((ud) => db.discounts.find((d) => d.discount_key === ud.discount_key))
      .filter(Boolean);
  }],
  ['POST', /^\/me\/discounts$/, (db, body) => {
    const user = currentUser(db);
    const discount = findDiscount(db, body?.code);
    if (!db.user_discounts.some((ud) => ud.user_key === user.user_key && ud.discount_key === discount.discount_key)) {
      db.user_discounts.push({ user_discount_key: nextKey(db.user_discounts, 'user_discount_key'), user_key: user.user_key, discount_key: discount.discount_key });
    }
    return discount;
  }],

  ['GET', /^\/tariffs$/, (db) => db.tariffs],
  ['POST', /^\/tariffs$/, (db, body) => {
    requireOperator(db);
    const tariff = { tariff_key: nextKey(db.tariffs, 'tariff_key'), ...tariffPayload(body) };
    db.tariffs.push(tariff);
    return tariff;
  }],
  ['PUT', /^\/tariffs\/(\d+)$/, (db, body, query, [key]) => {
    requireOperator(db);
    const tariff = db.tariffs.find((t) => t.tariff_key === Number(key)) ?? fail(404, 'not_found');
    Object.assign(tariff, tariffPayload(body));
    return tariff;
  }],
  ['DELETE', /^\/tariffs\/(\d+)$/, (db, body, query, [key]) => {
    requireOperator(db);
    db.tariffs = db.tariffs.filter((t) => t.tariff_key !== Number(key));
    return null;
  }],

  ['GET', /^\/discounts$/, (db) => { requireOperator(db); return db.discounts; }],
  ['POST', /^\/discounts$/, (db, body) => {
    requireOperator(db);
    const discount = { discount_key: nextKey(db.discounts, 'discount_key'), ...discountPayload(db, body) };
    db.discounts.push(discount);
    return discount;
  }],
  ['PUT', /^\/discounts\/(\d+)$/, (db, body, query, [key]) => {
    requireOperator(db);
    const discount = db.discounts.find((d) => d.discount_key === Number(key)) ?? fail(404, 'not_found');
    Object.assign(discount, discountPayload(db, body, discount.discount_key));
    return discount;
  }],
  ['DELETE', /^\/discounts\/(\d+)$/, (db, body, query, [key]) => {
    requireOperator(db);
    const id = Number(key);
    db.discounts = db.discounts.filter((d) => d.discount_key !== id);
    db.user_discounts = db.user_discounts.filter((ud) => ud.discount_key !== id);
    return null;
  }],

  ['POST', /^\/barrier\/(open|close)$/, (db) => { requireOperator(db); return null; }],
];

export async function handle(method, path, body) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const url = new URL(path, 'http://mock');
  const db = load();
  for (const [routeMethod, pattern, handler] of routes) {
    const match = routeMethod === method && pattern.exec(url.pathname);
    if (match) {
      const result = handler(db, body, url.searchParams, match.slice(1));
      save(db);
      return structuredClone(result);
    }
  }
  return fail(404, 'not_found');
}
