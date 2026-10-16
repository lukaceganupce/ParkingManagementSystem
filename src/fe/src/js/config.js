// Base URL of the backend web server (reverse proxy to the Node.js app).
export const API_BASE = 'http://localhost:8081/api';

// true = API is simulated in the browser (localStorage), see mock-api.js.
// Set to false once the backend implements the endpoints used in api.js.
export const USE_MOCK = true;

export const CURRENCY = 'CZK';
export const DEFAULT_LANG = 'en';
